import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Asset } from "@shared/schema";
import {
  Dashboard,
  DashboardSidebar,
  DashboardSidebarHeader,
  DashboardSidebarNav,
  DashboardSidebarNavItem,
  DashboardMain,
  DashboardHeader,
  DashboardContent,
  DashboardTable,
  DashboardTableHeader,
  DashboardTableTitle,
  DashboardTableContent,
  DashboardTableFooter,
} from "@/components/ui/dashboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAssetSchema } from "@shared/schema";

// Estenda o esquema para validação do formulário
const assetFormSchema = insertAssetSchema.extend({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  file: z.instanceof(File, {
    message: "Por favor, selecione um arquivo para upload.",
  }).optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

export default function AdminAssets() {
  const { t } = useTranslation();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("assets");
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      type: "",
      path: "",
      url: "",
      size: 0,
      metadata: null,
    },
  });

  useEffect(() => {
    // Verificar se o usuário tem permissão de administrador
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: t("admin.unauthorized"),
        description: t("admin.unauthorized_desc"),
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, isAdmin, setLocation, toast, t]);

  useEffect(() => {
    // Carregar assets
    const loadAssets = async () => {
      try {
        const { data, error } = await supabase
          .from("assets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao carregar assets:", error);
          return;
        }

        setAssets(data || []);
      } catch (error) {
        console.error("Erro inesperado ao carregar assets:", error);
      }
    };

    if (isAuthenticated && isAdmin) {
      loadAssets();
    }
  }, [isAuthenticated, isAdmin]);

  const onUploadAsset = async (data: AssetFormValues) => {
    if (!data.file) {
      toast({
        title: t("admin.error"),
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Fazer upload do arquivo para o storage do Supabase
      const file = data.file;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${fileExt}`;
      const filePath = `assets/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("fovdark")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Erro ao fazer upload do arquivo:", uploadError);
        toast({
          title: t("admin.error"),
          description: uploadError.message,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Obter a URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from("fovdark")
        .getPublicUrl(filePath);

      // Salvar os dados do asset no banco de dados
      const assetData = {
        name: data.name,
        type: file.type,
        url: publicUrlData.publicUrl,
        size: file.size,
      };

      const { data: newAsset, error } = await supabase
        .from("assets")
        .insert([assetData])
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar asset:", error);
        toast({
          title: t("admin.error"),
          description: error.message,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      setAssets([newAsset, ...assets]);
      toast({
        title: t("admin.success"),
        description: "Arquivo enviado com sucesso!",
      });
      setIsUploadDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Erro inesperado ao fazer upload:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao fazer upload do arquivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDeleteAsset = async () => {
    if (!currentAsset) return;

    try {
      // Remover o arquivo do storage, extraindo o caminho da URL
      const url = new URL(currentAsset.url);
      const pathname = url.pathname;
      const pathParts = pathname.split("/");
      const storageKey = pathParts.slice(pathParts.indexOf("fovdark") + 1).join("/");

      // Primeiro excluir da storage
      const { error: storageError } = await supabase.storage
        .from("fovdark")
        .remove([storageKey]);

      if (storageError) {
        console.error("Erro ao excluir arquivo do storage:", storageError);
        // Continuar mesmo com erro para remover da base de dados
      }

      // Depois excluir do banco de dados
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", currentAsset.id);

      if (error) {
        console.error("Erro ao excluir asset:", error);
        toast({
          title: t("admin.error"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAssets(assets.filter(asset => asset.id !== currentAsset.id));
      toast({
        title: t("admin.success"),
        description: t("admin.deleted"),
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro inesperado ao excluir asset:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao excluir o arquivo",
        variant: "destructive",
      });
    }
  };

  const prepareDeleteAsset = (asset: Asset) => {
    setCurrentAsset(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file);
      
      // Sugerir um nome baseado no nome do arquivo
      if (!form.getValues("name")) {
        const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
        form.setValue("name", nameWithoutExt);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (type: string): React.ReactNode => {
    if (type.includes("image")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    } else if (type.includes("audio")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3" />
          <polyline points="14 2 14 8 20 8" />
          <circle cx="8.5" cy="17" r="1.5" />
          <path d="M10 15v-3.5A1.5 1.5 0 0 0 8.5 10 1.5 1.5 0 0 0 7 11.5V18" />
          <path d="M12.5 15a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3Z" />
          <path d="M14 13.5V18" />
        </svg>
      );
    } else if (type.includes("video")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m10 7 5 3-5 3Z" />
          <rect width="20" height="14" x="2" y="5" rx="2" />
        </svg>
      );
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-full bg-primary/20"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{t("admin.assets")} | FovDark</title>
        <meta name="description" content={t("admin.dashboard_desc")} />
      </Helmet>

      <Dashboard>
        <DashboardSidebar collapsed={collapsed}>
          <DashboardSidebarHeader collapsed={collapsed}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
                <span className="font-cyber font-bold text-primary text-sm">F</span>
              </div>
              {!collapsed && (
                <h2 className="font-cyber font-bold text-base text-white">
                  <span className="text-primary neon-text">ADMIN</span>
                </h2>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className={!collapsed ? "flex" : "hidden"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H9" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </Button>
            {collapsed && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12h10" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </Button>
            )}
          </DashboardSidebarHeader>
          <DashboardSidebarNav collapsed={collapsed}>
            <DashboardSidebarNavItem
              href="/admin"
              isActive={activeSection === "dashboard"}
              collapsed={collapsed}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
              }
            >
              {t("admin.dashboard")}
            </DashboardSidebarNavItem>
            <DashboardSidebarNavItem
              href="/admin/products"
              isActive={activeSection === "products"}
              collapsed={collapsed}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z" />
                  <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z" />
                  <line x1="12" x2="12" y1="22" y2="13" />
                  <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5" />
                </svg>
              }
            >
              {t("admin.products")}
            </DashboardSidebarNavItem>
            <DashboardSidebarNavItem
              href="/admin/orders"
              isActive={activeSection === "orders"}
              collapsed={collapsed}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                  <path d="M9 15h12" />
                  <path d="M15 9h6" />
                  <path d="M15 21h6" />
                </svg>
              }
            >
              {t("admin.orders")}
            </DashboardSidebarNavItem>
            <DashboardSidebarNavItem
              href="/admin/users"
              isActive={activeSection === "users"}
              collapsed={collapsed}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            >
              {t("admin.users")}
            </DashboardSidebarNavItem>
            <DashboardSidebarNavItem
              href="/admin/themes"
              isActive={activeSection === "themes"}
              collapsed={collapsed}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 4.24 4.24" />
                  <path d="m14.83 9.17 4.24-4.24" />
                  <path d="m14.83 14.83 4.24 4.24" />
                  <path d="m9.17 14.83-4.24 4.24" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              }
            >
              {t("admin.themes")}
            </DashboardSidebarNavItem>
            <DashboardSidebarNavItem
              href="/admin/assets"
              isActive={activeSection === "assets"}
              collapsed={collapsed}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4 0 1.1.9 2 2 2h16a2 2 0 0 0 2-2z" />
                  <path d="M10 17.9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v6z" />
                  <path d="M22 17.9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v6z" />
                </svg>
              }
            >
              {t("admin.assets")}
            </DashboardSidebarNavItem>
            <DashboardSidebarNavItem
              href="/admin/settings"
              isActive={activeSection === "settings"}
              collapsed={collapsed}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
            >
              {t("admin.settings")}
            </DashboardSidebarNavItem>
          </DashboardSidebarNav>
        </DashboardSidebar>
        <DashboardMain>
          <DashboardHeader>
            <h1 className="text-xl font-cyber">{t("admin.assets")}</h1>
            <div className="ml-auto flex items-center gap-4">
              <Button 
                onClick={() => setIsUploadDialogOpen(true)}
                className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                  <path d="M16 5h6v6" />
                  <path d="M8 12 18 2" />
                </svg>
                {t("admin.upload_asset")}
              </Button>
            </div>
          </DashboardHeader>
          <DashboardContent>
            <DashboardTable>
              <DashboardTableHeader>
                <DashboardTableTitle>{t("admin.assets")}</DashboardTableTitle>
              </DashboardTableHeader>
              <DashboardTableContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b border-muted/30">
                      <tr className="border-b border-muted/20 transition-colors">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.asset_name")}
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.asset_type")}
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.asset_size")}
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.created_at")}
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/20">
                      {assets.length === 0 ? (
                        <tr className="border-b border-muted/20 transition-colors">
                          <td className="p-4 align-middle" colSpan={5}>
                            <div className="text-center py-4 text-muted-foreground">
                              {t("admin.no_data")}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        assets.map((asset) => (
                          <tr
                            key={asset.id}
                            className="border-b border-muted/20 transition-colors hover:bg-muted/10"
                          >
                            <td className="p-4 align-middle font-medium">
                              <div className="flex items-center gap-2">
                                {asset.type.includes("image") ? (
                                  <img 
                                    src={asset.url} 
                                    alt={asset.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-8 h-8 flex items-center justify-center bg-muted/20 rounded">
                                    {getFileTypeIcon(asset.type)}
                                  </div>
                                )}
                                <span className="truncate max-w-[200px]">{asset.name}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                {getFileTypeIcon(asset.type)}
                                <span className="text-xs text-muted-foreground">
                                  {asset.type.split('/')[1]?.toUpperCase() || asset.type}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              {formatFileSize(asset.size)}
                            </td>
                            <td className="p-4 align-middle">
                              <span className="text-xs text-muted-foreground">
                                {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 
                                 asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : "-"}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(asset.url, '_blank')}
                                  className="h-8 px-2 text-blue-400 hover:text-blue-500 hover:bg-blue-500/10"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" x2="21" y1="14" y2="3" />
                                  </svg>
                                  Ver
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => prepareDeleteAsset(asset)}
                                  className="h-8 px-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    <line x1="10" x2="10" y1="11" y2="17" />
                                    <line x1="14" x2="14" y1="11" y2="17" />
                                  </svg>
                                  {t("admin.delete_product")}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </DashboardTableContent>
              <DashboardTableFooter>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={assets.length <= 10}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={assets.length <= 10}
                  >
                    Próximo
                  </Button>
                </div>
              </DashboardTableFooter>
            </DashboardTable>
          </DashboardContent>
        </DashboardMain>
      </Dashboard>

      {/* Dialog para upload de arquivo */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("admin.upload_asset")}</DialogTitle>
            <DialogDescription>
              Faça upload de imagens, áudios e outros arquivos para usar no site.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUploadAsset)} className="space-y-6">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Arquivo</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted/50 rounded-md p-6 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/*,audio/*,video/*,application/pdf"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground mb-2"
                        >
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                          <path d="M16 5h6v6" />
                          <path d="M8 12 18 2" />
                        </svg>
                        <div className="text-sm text-muted-foreground text-center">
                          <span className="font-medium text-primary">
                            Clique para selecionar
                          </span>{" "}
                          ou arraste e solte um arquivo
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Suporta imagens, áudios, vídeos e PDFs
                        </p>
                        {form.getValues("file") && (
                          <div className="mt-2 px-3 py-1 bg-muted/20 rounded text-sm">
                            {form.getValues("file").name} ({formatFileSize(form.getValues("file").size)})
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.asset_name")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do arquivo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Um nome descritivo para identificar o arquivo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  {t("admin.cancel")}
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 mr-2 rounded-full border-2 border-transparent border-t-white animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    t("admin.upload_asset")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{t("admin.confirm_delete")}</DialogTitle>
            <DialogDescription>
              {t("admin.confirm_delete_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Você está prestes a excluir o arquivo <strong>{currentAsset?.name}</strong>.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("admin.cancel")}
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={onDeleteAsset}
            >
              {t("admin.delete_product")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
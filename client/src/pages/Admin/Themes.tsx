import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Theme } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertThemeSchema } from "@shared/schema";

// Estenda o esquema para validação do formulário
const themeFormSchema = insertThemeSchema.extend({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Cor inválida. Use formato hexadecimal (ex: #ff00ff).",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Cor inválida. Use formato hexadecimal (ex: #ff00ff).",
  }),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Cor inválida. Use formato hexadecimal (ex: #ff00ff).",
  }),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Cor inválida. Use formato hexadecimal (ex: #ff00ff).",
  }),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Cor inválida. Use formato hexadecimal (ex: #ff00ff).",
  }),
  fontFamily: z.string().min(3, {
    message: "A família de fonte deve ter pelo menos 3 caracteres.",
  }),
  cssOverrides: z.string().optional(),
});

type ThemeFormValues = z.infer<typeof themeFormSchema>;

export default function AdminThemes() {
  const { t } = useTranslation();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("themes");
  
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<number | null>(null);

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      name: "",
      primaryColor: "#00f0ff",
      secondaryColor: "#7000ff",
      accentColor: "#ff00ff",
      backgroundColor: "#080510",
      textColor: "#ffffff",
      fontFamily: "Rajdhani, sans-serif",
      cssOverrides: "",
      isActive: false,
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
    // Carregar temas
    const loadThemes = async () => {
      try {
        const { data, error } = await supabase
          .from("themes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao carregar temas:", error);
          return;
        }

        setThemes(data || []);
        
        // Encontrar tema ativo
        const activeTheme = data?.find(theme => theme.isActive);
        if (activeTheme) {
          setActiveThemeId(activeTheme.id);
        }
      } catch (error) {
        console.error("Erro inesperado ao carregar temas:", error);
      }
    };

    if (isAuthenticated && isAdmin) {
      loadThemes();
    }
  }, [isAuthenticated, isAdmin]);

  const onCreateTheme = async (data: ThemeFormValues) => {
    try {
      const { data: newTheme, error } = await supabase
        .from("themes")
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar tema:", error);
        toast({
          title: t("admin.error"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setThemes([newTheme, ...themes]);
      toast({
        title: t("admin.success"),
        description: t("admin.theme_saved"),
      });
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Erro inesperado ao criar tema:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao criar o tema",
        variant: "destructive",
      });
    }
  };

  const onEditTheme = async (data: ThemeFormValues) => {
    if (!currentTheme) return;

    try {
      const { data: updatedTheme, error } = await supabase
        .from("themes")
        .update(data)
        .eq("id", currentTheme.id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar tema:", error);
        toast({
          title: t("admin.error"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setThemes(themes.map(theme => 
        theme.id === currentTheme.id ? updatedTheme : theme
      ));
      toast({
        title: t("admin.success"),
        description: t("admin.updated"),
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erro inesperado ao atualizar tema:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao atualizar o tema",
        variant: "destructive",
      });
    }
  };

  const onDeleteTheme = async () => {
    if (!currentTheme) return;

    try {
      const { error } = await supabase
        .from("themes")
        .delete()
        .eq("id", currentTheme.id);

      if (error) {
        console.error("Erro ao excluir tema:", error);
        toast({
          title: t("admin.error"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setThemes(themes.filter(theme => theme.id !== currentTheme.id));
      toast({
        title: t("admin.success"),
        description: t("admin.deleted"),
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro inesperado ao excluir tema:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao excluir o tema",
        variant: "destructive",
      });
    }
  };

  const activateTheme = async (themeId: number) => {
    try {
      // Primeiro desativar todos os temas
      await supabase
        .from("themes")
        .update({ isActive: false })
        .neq("id", 0); // Um truque para atualizar todos

      // Depois ativar o tema selecionado
      const { error } = await supabase
        .from("themes")
        .update({ isActive: true })
        .eq("id", themeId);

      if (error) {
        console.error("Erro ao ativar tema:", error);
        toast({
          title: t("admin.error"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setActiveThemeId(themeId);
      setThemes(themes.map(theme => ({
        ...theme,
        isActive: theme.id === themeId
      })));
      
      toast({
        title: t("admin.success"),
        description: t("admin.theme_activated"),
      });
    } catch (error) {
      console.error("Erro inesperado ao ativar tema:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao ativar o tema",
        variant: "destructive",
      });
    }
  };

  const editTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    form.reset({
      name: theme.name,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      fontFamily: theme.fontFamily,
      cssOverrides: theme.cssOverrides || "",
      isActive: theme.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const prepareDeleteTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    setIsDeleteDialogOpen(true);
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
        <title>{t("admin.themes")} | FovDark</title>
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
            <h1 className="text-xl font-cyber">{t("admin.themes")}</h1>
            <div className="ml-auto flex items-center gap-4">
              <Button 
                onClick={() => {
                  form.reset({
                    name: "",
                    primaryColor: "#00f0ff",
                    secondaryColor: "#7000ff",
                    accentColor: "#ff00ff",
                    backgroundColor: "#080510",
                    textColor: "#ffffff",
                    fontFamily: "Rajdhani, sans-serif",
                    cssOverrides: "",
                    isActive: false,
                  });
                  setIsCreateDialogOpen(true);
                }}
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
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                {t("admin.new_theme")}
              </Button>
            </div>
          </DashboardHeader>
          <DashboardContent>
            <DashboardTable>
              <DashboardTableHeader>
                <DashboardTableTitle>{t("admin.themes")}</DashboardTableTitle>
              </DashboardTableHeader>
              <DashboardTableContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b border-muted/30">
                      <tr className="border-b border-muted/20 transition-colors">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.theme_name")}
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.primary_color")}
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.font_family")}
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.status")}
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {t("admin.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/20">
                      {themes.length === 0 ? (
                        <tr className="border-b border-muted/20 transition-colors">
                          <td className="p-4 align-middle" colSpan={5}>
                            <div className="text-center py-4 text-muted-foreground">
                              {t("admin.no_data")}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        themes.map((theme) => (
                          <tr
                            key={theme.id}
                            className="border-b border-muted/20 transition-colors hover:bg-muted/10"
                          >
                            <td className="p-4 align-middle font-medium">
                              {theme.name}
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full border border-white/20"
                                  style={{ backgroundColor: theme.primaryColor }}
                                ></div>
                                {theme.primaryColor}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              {theme.fontFamily}
                            </td>
                            <td className="p-4 align-middle">
                              {theme.isActive ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                                  Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
                                  Inativo
                                </span>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editTheme(theme)}
                                  className="h-8 px-2 text-indigo-400 hover:text-indigo-500 hover:bg-indigo-500/10"
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
                                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
                                  </svg>
                                  {t("admin.edit_theme")}
                                </Button>
                                {!theme.isActive && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => activateTheme(theme.id)}
                                    className="h-8 px-2 text-green-400 hover:text-green-500 hover:bg-green-500/10"
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
                                      <path d="m5 12 5 5 9-9" />
                                    </svg>
                                    {t("admin.activate_theme")}
                                  </Button>
                                )}
                                {!theme.isActive && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => prepareDeleteTheme(theme)}
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
                                )}
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
                    disabled={themes.length <= 10}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={themes.length <= 10}
                  >
                    Próximo
                  </Button>
                </div>
              </DashboardTableFooter>
            </DashboardTable>
          </DashboardContent>
        </DashboardMain>
      </Dashboard>

      {/* Dialog para criar tema */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("admin.new_theme")}</DialogTitle>
            <DialogDescription>
              Crie um novo tema visual para o site.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateTheme)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.theme_name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Cyberpunk Neon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fontFamily"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.font_family")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Rajdhani, sans-serif" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.primary_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.secondary_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.accent_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.background_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.text_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cssOverrides"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.css_overrides")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder=".neon-text { text-shadow: 0 0 10px currentColor; }" 
                        className="h-32 font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      CSS personalizado para ajustar a aparência do tema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  {t("admin.cancel")}
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                >
                  {t("admin.save_settings")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar tema */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("admin.edit_theme")}</DialogTitle>
            <DialogDescription>
              Edite as configurações do tema.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditTheme)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.theme_name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Cyberpunk Neon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fontFamily"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.font_family")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Rajdhani, sans-serif" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.primary_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.secondary_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.accent_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.background_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.text_color")}</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border border-white/20" 
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cssOverrides"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.css_overrides")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder=".neon-text { text-shadow: 0 0 10px currentColor; }" 
                        className="h-32 font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      CSS personalizado para ajustar a aparência do tema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("admin.cancel")}
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                >
                  {t("admin.save_settings")}
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
              Você está prestes a excluir o tema <strong>{currentTheme?.name}</strong>.
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
              onClick={onDeleteTheme}
            >
              {t("admin.delete_product")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { HwidLog, User, Product } from "@shared/schema";
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
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Schema para o formulário de adicionar HWID
const addHwidSchema = z.object({
  userId: z.string().min(1, "Selecione um usuário"),
  productId: z.number().min(1, "Selecione um produto"),
  hwid: z.string().min(1, "O HWID é obrigatório"),
  status: z.string().min(1, "O status é obrigatório"),
});

type AddHwidFormValues = z.infer<typeof addHwidSchema>;

export default function AdminHwidManager() {
  const { t } = useTranslation();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("hwid");
  const [activeTab, setActiveTab] = useState("logs");
  
  const [hwidLogs, setHwidLogs] = useState<(HwidLog & { user: User; product: Product })[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<(HwidLog & { user: User; product: Product }) | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddHwidFormValues>({
    resolver: zodResolver(addHwidSchema),
    defaultValues: {
      userId: "",
      productId: undefined,
      hwid: "",
      status: "active",
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

  // Carregar logs de HWID
  useEffect(() => {
    const loadHwidLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("hwid_logs")
          .select(`
            *,
            user: users(*),
            product: products(*)
          `)
          .order("createdAt", { ascending: false });

        if (error) {
          console.error("Erro ao carregar logs de HWID:", error);
          return;
        }

        setHwidLogs(data || []);
      } catch (error) {
        console.error("Erro inesperado ao carregar logs de HWID:", error);
      }
    };

    if (isAuthenticated && isAdmin) {
      loadHwidLogs();
    }
  }, [isAuthenticated, isAdmin]);

  // Carregar usuários
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("email");

        if (error) {
          console.error("Erro ao carregar usuários:", error);
          return;
        }

        setUsers(data || []);
      } catch (error) {
        console.error("Erro inesperado ao carregar usuários:", error);
      }
    };

    if (isAuthenticated && isAdmin) {
      loadUsers();
    }
  }, [isAuthenticated, isAdmin]);

  // Carregar produtos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("name");

        if (error) {
          console.error("Erro ao carregar produtos:", error);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error("Erro inesperado ao carregar produtos:", error);
      }
    };

    if (isAuthenticated && isAdmin) {
      loadProducts();
    }
  }, [isAuthenticated, isAdmin]);

  const onAddHwid = async (data: AddHwidFormValues) => {
    setIsSubmitting(true);

    try {
      const { data: newLog, error } = await supabase
        .from("hwid_logs")
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error("Erro ao adicionar HWID:", error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Buscar o usuário e o produto para exibir os detalhes
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", newLog.userId)
        .single();

      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("id", newLog.productId)
        .single();

      const newLogWithDetails = {
        ...newLog,
        user: userData,
        product: productData,
      };

      setHwidLogs([newLogWithDetails, ...hwidLogs]);
      toast({
        title: "Sucesso",
        description: "HWID adicionado com sucesso!",
      });
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Erro inesperado ao adicionar HWID:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o HWID",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteHwid = async () => {
    if (!currentLog) return;

    try {
      const { error } = await supabase
        .from("hwid_logs")
        .delete()
        .eq("id", currentLog.id);

      if (error) {
        console.error("Erro ao excluir HWID:", error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setHwidLogs(hwidLogs.filter((log) => log.id !== currentLog.id));
      toast({
        title: "Sucesso",
        description: "HWID excluído com sucesso!",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro inesperado ao excluir HWID:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o HWID",
        variant: "destructive",
      });
    }
  };

  const prepareDeleteHwid = (log: (HwidLog & { user: User; product: Product })) => {
    setCurrentLog(log);
    setIsDeleteDialogOpen(true);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Estatísticas de HWID
  const hwidStats = {
    total: hwidLogs.length,
    active: hwidLogs.filter((log) => log.status === "active").length,
    blocked: hwidLogs.filter((log) => log.status === "blocked").length,
    pending: hwidLogs.filter((log) => log.status === "pending").length,
  };

  // Filtrar logs
  const filteredLogs = hwidLogs.filter((log) => {
    // Verificar se o termo de busca existe no email do usuário, HWID ou status
    return (
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hwid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case "blocked":
        return <Badge className="bg-red-500 hover:bg-red-600">Bloqueado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <title>Gerenciamento de HWID | FovDark</title>
        <meta name="description" content="Gerenciar identificadores de hardware (HWID) dos usuários" />
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
              href="/admin/hwid"
              isActive={activeSection === "hwid"}
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
                  <path d="M12 22a7 7 0 0 0 7-7h-1.5a5.5 5.5 0 1 1-11 0H5a7 7 0 0 0 7 7z" />
                  <path d="M21 10a9 9 0 0 0-18 0h18z" />
                  <path d="M21 10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4" />
                  <path d="M12 2v2" />
                  <path d="m4.93 5.93 1.41 1.41" />
                  <path d="m18.66 7.34-1.41-1.41" />
                </svg>
              }
            >
              HWID
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
            <h1 className="text-xl font-cyber">Gerenciamento de HWID</h1>
            <div className="ml-auto flex items-center gap-4">
              <Button 
                onClick={() => {
                  form.reset({
                    userId: "",
                    productId: undefined,
                    hwid: "",
                    status: "active",
                  });
                  setIsAddDialogOpen(true);
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
                Adicionar HWID
              </Button>
            </div>
          </DashboardHeader>
          <DashboardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle>{hwidStats.total}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Total de HWIDs
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-green-400">{hwidStats.active}</DashboardCardTitle>
                    <DashboardCardDescription>
                      HWIDs Ativos
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-red-400">{hwidStats.blocked}</DashboardCardTitle>
                    <DashboardCardDescription>
                      HWIDs Bloqueados
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-yellow-400">{hwidStats.pending}</DashboardCardTitle>
                    <DashboardCardDescription>
                      HWIDs Pendentes
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
            </div>

            <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="logs">Logs de HWID</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="logs">
                <div className="mb-6">
                  <Input
                    placeholder="Buscar por usuário, HWID, status ou produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <DashboardTable>
                  <DashboardTableHeader>
                    <DashboardTableTitle>
                      Ativações e Logs de HWID
                    </DashboardTableTitle>
                  </DashboardTableHeader>
                  <DashboardTableContent>
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="border-b border-muted/30">
                          <tr className="border-b border-muted/20 transition-colors">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Usuário
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Produto
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              HWID
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Data
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/20">
                          {filteredLogs.length === 0 ? (
                            <tr className="border-b border-muted/20 transition-colors">
                              <td className="p-4 align-middle" colSpan={6}>
                                <div className="text-center py-4 text-muted-foreground">
                                  {searchTerm
                                    ? "Nenhum log encontrado para esta busca."
                                    : "Nenhum log de HWID registrado."}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredLogs.map((log) => (
                              <tr
                                key={log.id}
                                className="border-b border-muted/20 transition-colors hover:bg-muted/10"
                              >
                                <td className="p-4 align-middle font-medium">
                                  <div className="flex items-center gap-2">
                                    {log.user?.profileImageUrl ? (
                                      <img
                                        src={log.user.profileImageUrl}
                                        alt={log.user.email}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-primary font-bold">
                                          {log.user?.email?.charAt(0)?.toUpperCase() || "U"}
                                        </span>
                                      </div>
                                    )}
                                    <span>{log.user?.email}</span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    {log.product?.name || "Produto Desconhecido"}
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="font-mono text-xs bg-black/30 p-1 rounded max-w-[200px] truncate">
                                    {log.hwid}
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  {getStatusBadge(log.status)}
                                </td>
                                <td className="p-4 align-middle">
                                  <span className="text-xs text-muted-foreground">
                                    {log.createdAt && new Date(log.createdAt).toLocaleString()}
                                  </span>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => prepareDeleteHwid(log)}
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
                                      Excluir
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
                        disabled={filteredLogs.length <= 10}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filteredLogs.length <= 10}
                      >
                        Próximo
                      </Button>
                    </div>
                  </DashboardTableFooter>
                </DashboardTable>
              </TabsContent>
              
              <TabsContent value="stats">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DashboardCard>
                    <DashboardCardHeader>
                      <DashboardCardTitle>Distribuição por Status</DashboardCardTitle>
                      <DashboardCardDescription>
                        Distribuição dos HWIDs por status
                      </DashboardCardDescription>
                    </DashboardCardHeader>
                    <DashboardCardContent>
                      <div className="h-[240px] flex items-center justify-center">
                        <div className="flex flex-col gap-2 w-full max-w-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>Ativos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{hwidStats.active}</span>
                              <span className="text-sm text-muted-foreground">
                                ({Math.round((hwidStats.active / hwidStats.total) * 100) || 0}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(hwidStats.active / hwidStats.total) * 100}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span>Bloqueados</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{hwidStats.blocked}</span>
                              <span className="text-sm text-muted-foreground">
                                ({Math.round((hwidStats.blocked / hwidStats.total) * 100) || 0}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${(hwidStats.blocked / hwidStats.total) * 100}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span>Pendentes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{hwidStats.pending}</span>
                              <span className="text-sm text-muted-foreground">
                                ({Math.round((hwidStats.pending / hwidStats.total) * 100) || 0}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${(hwidStats.pending / hwidStats.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>

                  <DashboardCard>
                    <DashboardCardHeader>
                      <DashboardCardTitle>Registros Recentes</DashboardCardTitle>
                      <DashboardCardDescription>
                        Últimos HWIDs registrados
                      </DashboardCardDescription>
                    </DashboardCardHeader>
                    <DashboardCardContent>
                      <div className="space-y-2">
                        {hwidLogs.slice(0, 5).map((log) => (
                          <div
                            key={log.id}
                            className={cn(
                              "flex justify-between items-center p-2 rounded",
                              "hover:bg-muted/10"
                            )}
                          >
                            <div>
                              <div className="font-medium">
                                {log.user?.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.product?.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(log.status)}
                              <div className="text-xs text-muted-foreground">
                                {log.createdAt && new Date(log.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        {hwidLogs.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground">
                            Nenhum registro de HWID encontrado.
                          </div>
                        )}
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>
                </div>
              </TabsContent>
            </Tabs>
          </DashboardContent>
        </DashboardMain>
      </Dashboard>

      {/* Dialog para adicionar HWID */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar HWID</DialogTitle>
            <DialogDescription>
              Adicione um novo HWID para um usuário.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddHwid)} className="space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(value ? value : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem 
                            key={user.id} 
                            value={user.id.toString()}
                          >
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem 
                            key={product.id} 
                            value={product.id.toString()}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hwid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HWID</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o HWID completo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador único de hardware.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 rounded-full border-2 border-transparent border-t-white animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    'Adicionar HWID'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              Você está prestes a excluir o HWID <strong>{currentLog?.hwid?.substring(0, 15)}...</strong> associado ao usuário <strong>{currentLog?.user?.email}</strong>.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={onDeleteHwid}
            >
              Excluir HWID
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
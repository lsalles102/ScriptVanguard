import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { User, UpsertUser } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Schema para o formulário de adicionar usuário
const userFormSchema = z.object({
  email: z.string().email({
    message: "E-mail inválido",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().default("user"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminUsers() {
  const { t } = useTranslation();
  const { user: currentUser, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("users");
  const [activeTab, setActiveTab] = useState("all");
  
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser2, setCurrentUser2] = useState<User | null>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "user",
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

  const onCreateUser = async (data: UserFormValues) => {
    setIsSubmitting(true);

    try {
      // 1. Criar conta no Supabase Auth
      let authUserId;

      if (data.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
            },
          }
        });

        if (authError) {
          console.error("Erro ao criar usuário:", authError);
          toast({
            title: "Erro",
            description: authError.message,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        authUserId = authData.user?.id;
      } else {
        // Sem senha - gerar um link mágico (magic link)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.email,
          email_confirm: true,
          user_metadata: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
          }
        });

        if (authError) {
          console.error("Erro ao criar usuário:", authError);
          toast({
            title: "Erro",
            description: authError.message,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        authUserId = authData.user.id;
      }

      // 2. Atualizar nosso banco de dados próprio
      if (authUserId) {
        const { data: newUser, error } = await supabase
          .from("users")
          .upsert({
            id: authUserId,
            email: data.email,
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            role: data.role,
          })
          .select()
          .single();

        if (error) {
          console.error("Erro ao salvar usuário no banco de dados:", error);
          toast({
            title: "Atenção",
            description: "Usuário criado na autenticação, mas houve um erro ao salvar os dados no perfil",
            variant: "default",
          });
        } else {
          setUsers([newUser, ...users]);
        }
      }

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Erro inesperado ao criar usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o usuário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditUser = async (data: UserFormValues) => {
    if (!currentUser2) return;
    
    setIsSubmitting(true);

    try {
      // 1. Atualizar metadados no Supabase Auth
      if (data.password) {
        // Admin redefinindo senha
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          currentUser2.id,
          { password: data.password }
        );

        if (passwordError) {
          console.error("Erro ao atualizar senha:", passwordError);
          toast({
            title: "Erro",
            description: passwordError.message,
            variant: "destructive",
          });
        }
      }

      // Atualizar metadados
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        currentUser2.id,
        {
          user_metadata: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
          }
        }
      );

      if (metadataError) {
        console.error("Erro ao atualizar metadados:", metadataError);
        toast({
          title: "Erro",
          description: metadataError.message,
          variant: "destructive",
        });
      }

      // 2. Atualizar nosso banco de dados próprio
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          role: data.role,
        })
        .eq("id", currentUser2.id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar usuário:", error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Atualizar a lista de usuários
      setUsers(
        users.map((usr) =>
          usr.id === currentUser2.id ? updatedUser : usr
        )
      );

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erro inesperado ao atualizar usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o usuário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteUser = async () => {
    if (!currentUser2) return;

    try {
      // 1. Excluir o usuário no Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        currentUser2.id
      );

      if (authError) {
        console.error("Erro ao excluir conta de autenticação:", authError);
        toast({
          title: "Erro",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      // 2. Excluir do nosso banco de dados (isso normalmente seria feito por triggers do banco)
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", currentUser2.id);

      if (error) {
        console.error("Erro ao excluir usuário do banco:", error);
        toast({
          title: "Aviso",
          description: "O usuário foi excluído do sistema de autenticação, mas houve um erro ao excluir do banco de dados",
          variant: "default",
        });
      }

      setUsers(users.filter((usr) => usr.id !== currentUser2.id));
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro inesperado ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o usuário",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, isEnabled: boolean) => {
    try {
      // Ativar/desativar usuário no Supabase Auth
      const action = isEnabled ? 'ban' : 'unban';
      
      if (action === 'ban') {
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          { ban_duration: '87600h' } // 10 anos
        );
        
        if (error) {
          console.error("Erro ao desativar usuário:", error);
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      } else {
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          { ban_duration: null }
        );
        
        if (error) {
          console.error("Erro ao ativar usuário:", error);
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Atualizar a lista de usuários
      setUsers(
        users.map((usr) =>
          usr.id === userId ? { ...usr, active: !isEnabled } : usr
        )
      );

      toast({
        title: "Sucesso",
        description: isEnabled ? "Usuário desativado com sucesso!" : "Usuário ativado com sucesso!",
      });
    } catch (error) {
      console.error("Erro inesperado ao alterar status do usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status do usuário",
        variant: "destructive",
      });
    }
  };

  const prepareEditUser = (user: User) => {
    setCurrentUser2(user);
    
    form.reset({
      email: user.email || "",
      password: "", // Não mostrar senha atual
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role || "user",
    });
    
    setIsEditDialogOpen(true);
  };

  const prepareDeleteUser = (user: User) => {
    setCurrentUser2(user);
    setIsDeleteDialogOpen(true);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Adicionando campo active ao tipo User
  const usersWithActive = users.map(usr => ({
    ...usr,
    active: usr.role !== 'banned' // Considerando usuário ativo se não estiver banido
  }));

  // Estatísticas de usuários
  const userStats = {
    total: users.length,
    admins: users.filter((usr) => usr.role === "admin").length,
    active: users.filter((usr) => usr.role !== "banned").length,
    inactive: users.filter((usr) => usr.role === "banned").length,
  };

  // Filtrar usuários
  const filteredUsers = users.filter((usr) => {
    const matchesSearch = 
      (usr.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usr.firstName ? usr.firstName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (usr.lastName ? usr.lastName.toLowerCase().includes(searchTerm.toLowerCase()) : false));
    
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "admins" && usr.role === "admin") ||
      (activeTab === "active" && usr.role !== "banned") ||
      (activeTab === "inactive" && usr.role === "banned");
    
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
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
        <title>{t("admin.users")} | FovDark</title>
        <meta name="description" content="Gerenciar usuários do FovDark" />
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
            <h1 className="text-xl font-cyber">{t("admin.users")}</h1>
            <div className="ml-auto flex items-center gap-4">
              <Button 
                onClick={() => {
                  form.reset({
                    email: "",
                    password: "",
                    firstName: "",
                    lastName: "",
                    role: "user",
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
                {t("admin.add_user")}
              </Button>
            </div>
          </DashboardHeader>
          <DashboardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle>{userStats.total}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Total de Usuários
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-purple-400">{userStats.admins}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Administradores
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-green-400">{userStats.active}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Usuários Ativos
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-red-400">{userStats.inactive}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Usuários Inativos
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="admins">Admins</TabsTrigger>
                  <TabsTrigger value="active">Ativos</TabsTrigger>
                  <TabsTrigger value="inactive">Inativos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <DashboardTable>
              <DashboardTableHeader>
                <DashboardTableTitle>
                  {filteredUsers.length} Usuários
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
                          Função
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          HWID
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Data de Criação
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/20">
                      {filteredUsers.length === 0 ? (
                        <tr className="border-b border-muted/20 transition-colors">
                          <td className="p-4 align-middle" colSpan={6}>
                            <div className="text-center py-4 text-muted-foreground">
                              {searchTerm || activeTab !== "all"
                                ? "Nenhum usuário encontrado para esta busca."
                                : "Nenhum usuário cadastrado."}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((usr) => (
                          <tr
                            key={usr.id}
                            className="border-b border-muted/20 transition-colors hover:bg-muted/10"
                          >
                            <td className="p-4 align-middle font-medium">
                              <div className="flex items-center gap-2">
                                {usr.profileImageUrl ? (
                                  <img
                                    src={usr.profileImageUrl}
                                    alt={usr.email || ""}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-primary font-bold">
                                      {usr.email?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <div>{usr.email}</div>
                                  {(usr.firstName || usr.lastName) && (
                                    <div className="text-xs text-muted-foreground">
                                      {[usr.firstName, usr.lastName].filter(Boolean).join(" ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              {usr.role === "admin" ? (
                                <Badge className="bg-purple-500 hover:bg-purple-600">
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Usuário
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {usr.active === false ? (
                                <Badge variant="outline" className="border-red-500/50 text-red-400">
                                  Inativo
                                </Badge>
                              ) : (
                                <Badge className="bg-green-500/80 hover:bg-green-600">
                                  Ativo
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {usr.hwid ? (
                                <div className="font-mono text-xs truncate max-w-[100px]" title={usr.hwid}>
                                  {usr.hwid}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Não registrado
                                </span>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(usr.createdAt)}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => prepareEditUser(usr)}
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
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleUserStatus(usr.id, usr.active !== false)}
                                  className={`h-8 px-2 ${
                                    usr.active === false
                                      ? "text-green-400 hover:text-green-500 hover:bg-green-500/10"
                                      : "text-yellow-400 hover:text-yellow-500 hover:bg-yellow-500/10"
                                  }`}
                                >
                                  {usr.active === false ? (
                                    <>
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
                                      Ativar
                                    </>
                                  ) : (
                                    <>
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
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                      </svg>
                                      Desativar
                                    </>
                                  )}
                                </Button>
                                {usr.id !== currentUser?.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => prepareDeleteUser(usr)}
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
                    disabled={filteredUsers.length <= 10}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filteredUsers.length <= 10}
                  >
                    Próximo
                  </Button>
                </div>
              </DashboardTableFooter>
            </DashboardTable>
          </DashboardContent>
        </DashboardMain>
      </Dashboard>

      {/* Dialog para criar usuário */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("admin.add_user")}</DialogTitle>
            <DialogDescription>
              Adicione um novo usuário ao sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateUser)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.user_email")}</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={isPasswordOpen ? "text" : "password"} 
                          placeholder="Senha (opcional)" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                        >
                          {isPasswordOpen ? (
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
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                              <line x1="2" x2="22" y1="2" y2="22" />
                            </svg>
                          ) : (
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
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Deixe em branco para enviar um link de senha por e-mail.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Sobrenome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.user_role")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
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
                  onClick={() => setIsCreateDialogOpen(false)}
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
                      Criando...
                    </>
                  ) : (
                    'Criar Usuário'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuário */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("admin.edit_user")}</DialogTitle>
            <DialogDescription>
              Edite as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditUser)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.user_email")}</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@exemplo.com" {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      O e-mail não pode ser alterado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={isPasswordOpen ? "text" : "password"} 
                          placeholder="Nova senha (opcional)" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                        >
                          {isPasswordOpen ? (
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
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                              <line x1="2" x2="22" y1="2" y2="22" />
                            </svg>
                          ) : (
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
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Deixe em branco para manter a senha atual.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Sobrenome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.user_role")}</FormLabel>
                    <Select
                      value={field.value || "user"}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
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
                  onClick={() => setIsEditDialogOpen(false)}
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
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
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
              Você está prestes a excluir permanentemente o usuário <strong>{currentUser2?.email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Todos os dados associados a este usuário, incluindo compras, ativações HWID e informações de perfil serão excluídos.
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
              onClick={onDeleteUser}
            >
              Excluir Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Order, OrderItem, User, Product } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

export default function AdminOrders() {
  const { t } = useTranslation();
  const { user: currentUser, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("orders");
  const [activeTab, setActiveTab] = useState("all");
  
  const [orders, setOrders] = useState<(Order & { user: User, items: (OrderItem & { product: Product })[] })[]>([]);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<(Order & { user: User, items: (OrderItem & { product: Product })[] }) | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Carregar pedidos
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            user: users(*),
            items: order_items(
              *,
              product: products(*)
            )
          `)
          .order("createdAt", { ascending: false });

        if (error) {
          console.error("Erro ao carregar pedidos:", error);
          return;
        }

        setOrders(data || []);
      } catch (error) {
        console.error("Erro inesperado ao carregar pedidos:", error);
      }
    };

    if (isAuthenticated && isAdmin) {
      loadOrders();
    }
  }, [isAuthenticated, isAdmin]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select(`
          *,
          user: users(*),
          items: order_items(
            *,
            product: products(*)
          )
        `)
        .single();

      if (error) {
        console.error("Erro ao atualizar status do pedido:", error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        setIsUpdating(false);
        return;
      }

      // Atualizar a lista de pedidos
      setOrders(
        orders.map((order) =>
          order.id === orderId ? data : order
        )
      );

      // Se o pedido atual estiver aberto, atualize-o também
      if (currentOrder?.id === orderId) {
        setCurrentOrder(data);
      }

      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro inesperado ao atualizar status do pedido:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do pedido",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const showOrderDetails = (order: (Order & { user: User, items: (OrderItem & { product: Product })[] })) => {
    setCurrentOrder(order);
    setIsDetailDialogOpen(true);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Estatísticas de pedidos
  const orderStats = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    completed: orders.filter((order) => order.status === "completed").length,
    canceled: orders.filter((order) => order.status === "canceled").length,
    revenue: orders
      .filter((order) => order.status !== "canceled")
      .reduce((sum, order) => sum + order.total, 0),
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter((order) => {
    // Verifique se o termo de busca existe no ID, e-mail do usuário ou método de pagamento
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      (order.user?.email ? order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (order.paymentMethod ? order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    // Verifique se o pedido corresponde à aba ativa
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && order.status === "pending") ||
      (activeTab === "completed" && order.status === "completed") ||
      (activeTab === "canceled" && order.status === "canceled");
    
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Pendente
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            Processando
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Concluído
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
        <title>{t("admin.orders")} | FovDark</title>
        <meta name="description" content="Gerenciar pedidos do FovDark" />
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
            <h1 className="text-xl font-cyber">{t("admin.orders")}</h1>
          </DashboardHeader>
          <DashboardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle>{orderStats.total}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Total de Pedidos
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-yellow-400">{orderStats.pending}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Pedidos Pendentes
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-green-400">{orderStats.completed}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Pedidos Concluídos
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader>
                  <div className="flex flex-col">
                    <DashboardCardTitle className="text-primary">{formatPrice(orderStats.revenue)}</DashboardCardTitle>
                    <DashboardCardDescription>
                      Receita Total
                    </DashboardCardDescription>
                  </div>
                </DashboardCardHeader>
              </DashboardCard>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar pedidos..."
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
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="completed">Concluídos</TabsTrigger>
                  <TabsTrigger value="canceled">Cancelados</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <DashboardTable>
              <DashboardTableHeader>
                <DashboardTableTitle>
                  {filteredOrders.length} Pedidos
                </DashboardTableTitle>
              </DashboardTableHeader>
              <DashboardTableContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b border-muted/30">
                      <tr className="border-b border-muted/20 transition-colors">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          ID
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Usuário
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Total
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
                      {filteredOrders.length === 0 ? (
                        <tr className="border-b border-muted/20 transition-colors">
                          <td className="p-4 align-middle" colSpan={6}>
                            <div className="text-center py-4 text-muted-foreground">
                              {searchTerm || activeTab !== "all"
                                ? "Nenhum pedido encontrado para esta busca."
                                : "Nenhum pedido registrado."}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-muted/20 transition-colors hover:bg-muted/10"
                          >
                            <td className="p-4 align-middle font-medium">
                              #{order.id}
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                {order.user?.profileImageUrl ? (
                                  <img
                                    src={order.user.profileImageUrl}
                                    alt={order.user?.email || ""}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-primary font-bold text-xs">
                                      {order.user?.email?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                  </div>
                                )}
                                <span>{order.user?.email || "Usuário desconhecido"}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle font-medium text-primary">
                              {formatPrice(order.total)}
                            </td>
                            <td className="p-4 align-middle">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="p-4 align-middle">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(order.createdAt)}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => showOrderDetails(order)}
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
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4" />
                                    <path d="M12 8h.01" />
                                  </svg>
                                  Detalhes
                                </Button>
                                
                                {order.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, "completed")}
                                    disabled={isUpdating}
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
                                      <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                    Aprovar
                                  </Button>
                                )}
                                
                                {(order.status === "pending" || order.status === "processing") && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, "canceled")}
                                    disabled={isUpdating}
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
                                      <path d="M18 6 6 18" />
                                      <path d="m6 6 12 12" />
                                    </svg>
                                    Cancelar
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
                    disabled={filteredOrders.length <= 10}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filteredOrders.length <= 10}
                  >
                    Próximo
                  </Button>
                </div>
              </DashboardTableFooter>
            </DashboardTable>
          </DashboardContent>
        </DashboardMain>
      </Dashboard>

      {/* Dialog para detalhes do pedido */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{currentOrder?.id}</DialogTitle>
            <DialogDescription>
              Informações completas sobre o pedido.
            </DialogDescription>
          </DialogHeader>
          
          {currentOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Informações do Cliente
                  </h3>
                  <div className="bg-muted/10 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      {currentOrder.user?.profileImageUrl ? (
                        <img
                          src={currentOrder.user.profileImageUrl}
                          alt={currentOrder.user?.email || ""}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold">
                            {currentOrder.user?.email?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {currentOrder.user?.email || "Email não disponível"}
                        </div>
                        {(currentOrder.user?.firstName || currentOrder.user?.lastName) && (
                          <div className="text-xs text-muted-foreground">
                            {[currentOrder.user?.firstName, currentOrder.user?.lastName].filter(Boolean).join(" ")}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {currentOrder.user?.hwid && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">HWID:</span>
                        <div className="font-mono bg-black/30 p-1 rounded mt-1 overflow-x-auto">
                          {currentOrder.user.hwid}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Informações do Pedido
                  </h3>
                  <div className="bg-muted/10 p-3 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>{getStatusBadge(currentOrder.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span>{formatDate(currentOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pagamento:</span>
                      <span>
                        {currentOrder.paymentMethod || "Não especificado"}
                        {currentOrder.paymentId && (
                          <div className="text-xs text-muted-foreground">
                            ID: {currentOrder.paymentId}
                          </div>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="text-primary">{formatPrice(currentOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Itens do Pedido
                </h3>
                <div className="bg-muted/10 p-3 rounded-md">
                  <div className="space-y-3">
                    {currentOrder.items && currentOrder.items.length > 0 ? (
                      currentOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center border-b border-muted/20 pb-3 last:pb-0 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted/20 flex items-center justify-center">
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
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {item.product.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Quantidade: {item.quantity}
                              </div>
                            </div>
                          </div>
                          <div className="text-primary font-medium">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhum item encontrado para este pedido.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />
              
              {currentOrder.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => updateOrderStatus(currentOrder.id, "canceled")}
                    disabled={isUpdating}
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-500"
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
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    Cancelar Pedido
                  </Button>
                  
                  <Button
                    onClick={() => updateOrderStatus(currentOrder.id, "completed")}
                    disabled={isUpdating}
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
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Aprovar Pedido
                  </Button>
                </div>
              )}
              
              {currentOrder.status === "completed" && (
                <div className="p-4 bg-green-500/10 rounded-md">
                  <div className="flex items-center text-green-500">
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
                      className="mr-2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                    <span className="font-medium">Pedido concluído com sucesso</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este pedido foi processado e concluído. O cliente já tem acesso aos produtos.
                  </p>
                </div>
              )}
              
              {currentOrder.status === "canceled" && (
                <div className="p-4 bg-red-500/10 rounded-md">
                  <div className="flex items-center text-red-500">
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
                      className="mr-2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                    <span className="font-medium">Pedido cancelado</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este pedido foi cancelado e o cliente não tem acesso aos produtos.
                  </p>
                </div>
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SiteSetting } from "@shared/schema";
import {
  Dashboard,
  DashboardSidebar,
  DashboardSidebarHeader,
  DashboardSidebarNav,
  DashboardSidebarNavItem,
  DashboardMain,
  DashboardHeader,
  DashboardContent,
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Schema para formulário de configurações gerais
const generalSettingsSchema = z.object({
  siteName: z.string().min(3, {
    message: "O nome do site deve ter pelo menos 3 caracteres",
  }),
  siteDescription: z.string().min(10, {
    message: "A descrição do site deve ter pelo menos 10 caracteres",
  }),
  siteKeywords: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  contactEmail: z.string().email({
    message: "Por favor, insira um e-mail válido",
  }),
  showHeroSection: z.boolean().default(true),
  showFeaturesSection: z.boolean().default(true),
  showProductsSection: z.boolean().default(true),
  showReviewsSection: z.boolean().default(true),
  showGuideSection: z.boolean().default(true),
  showFaqSection: z.boolean().default(true),
  showFooterLinks: z.boolean().default(true),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

// Schema para configurações de SEO
const seoSettingsSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  metaTitle: z.string().min(5, {
    message: "O título meta deve ter pelo menos 5 caracteres",
  }),
  metaDescription: z.string().min(10, {
    message: "A descrição meta deve ter pelo menos 10 caracteres",
  }),
  ogImage: z.string().optional(),
  twitterHandle: z.string().optional(),
  structuredData: z.boolean().default(false),
  sitemapEnabled: z.boolean().default(true),
  robotsTxtEnabled: z.boolean().default(true),
});

type SeoSettingsValues = z.infer<typeof seoSettingsSchema>;

// Schema para configurações de pagamento
const paymentSettingsSchema = z.object({
  currency: z.string().min(1, {
    message: "Por favor, selecione uma moeda",
  }),
  pixEnabled: z.boolean().default(true),
  pixKey: z.string().optional(),
  pixKeyType: z.string().optional(),
  bankTransferEnabled: z.boolean().default(false),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankBranch: z.string().optional(),
  cryptoEnabled: z.boolean().default(false),
  bitcoinAddress: z.string().optional(),
  ethereumAddress: z.string().optional(),
});

type PaymentSettingsValues = z.infer<typeof paymentSettingsSchema>;

export default function AdminSettings() {
  const { t } = useTranslation();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("settings");
  const [activeTab, setActiveTab] = useState("general");
  
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Formulário para configurações gerais
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "FovDark",
      siteDescription: "Scripts e cheats para jogos, com foco em Blood Strike",
      siteKeywords: "blood strike, cheats, scripts, hacks, gaming",
      logoUrl: "",
      faviconUrl: "",
      contactEmail: "contato@fovdark.com",
      showHeroSection: true,
      showFeaturesSection: true,
      showProductsSection: true,
      showReviewsSection: true,
      showGuideSection: true,
      showFaqSection: true,
      showFooterLinks: true,
    },
  });

  // Formulário para configurações de SEO
  const seoForm = useForm<SeoSettingsValues>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      googleAnalyticsId: "",
      metaTitle: "FovDark - Scripts e Cheats para Blood Strike",
      metaDescription: "Os melhores scripts e cheats para Blood Strike e outros jogos. Produtos seguros e com suporte garantido.",
      ogImage: "",
      twitterHandle: "",
      structuredData: false,
      sitemapEnabled: true,
      robotsTxtEnabled: true,
    },
  });

  // Formulário para configurações de pagamento
  const paymentForm = useForm<PaymentSettingsValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      currency: "BRL",
      pixEnabled: true,
      pixKey: "",
      pixKeyType: "email",
      bankTransferEnabled: false,
      bankName: "",
      bankAccount: "",
      bankBranch: "",
      cryptoEnabled: false,
      bitcoinAddress: "",
      ethereumAddress: "",
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
    // Carregar configurações do site
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*");

        if (error) {
          console.error("Erro ao carregar configurações:", error);
          return;
        }

        setSettings(data || []);

        // Preencher formulários com valores do banco de dados
        if (data && data.length > 0) {
          // Configurações gerais
          const generalSettings = data.find(s => s.name === "general");
          if (generalSettings && generalSettings.value) {
            generalForm.reset(generalSettings.value as any);
          }

          // Configurações de SEO
          const seoSettings = data.find(s => s.name === "seo");
          if (seoSettings && seoSettings.value) {
            seoForm.reset(seoSettings.value as any);
          }

          // Configurações de pagamento
          const paymentSettings = data.find(s => s.name === "payment");
          if (paymentSettings && paymentSettings.value) {
            paymentForm.reset(paymentSettings.value as any);
          }
        }
      } catch (error) {
        console.error("Erro inesperado ao carregar configurações:", error);
      }
    };

    if (isAuthenticated && isAdmin) {
      loadSettings();
    }
  }, [isAuthenticated, isAdmin, generalForm, seoForm, paymentForm]);

  const onSaveGeneralSettings = async (data: GeneralSettingsValues) => {
    setIsSaving(true);
    try {
      const existingSetting = settings.find(s => s.name === "general");
      
      if (existingSetting) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from("site_settings")
          .update({
            value: data,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.id,
          })
          .eq("id", existingSetting.id);

        if (error) {
          console.error("Erro ao atualizar configurações gerais:", error);
          toast({
            title: t("admin.error"),
            description: error.message,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from("site_settings")
          .insert([{
            name: "general",
            value: data,
            updatedBy: user?.id,
          }]);

        if (error) {
          console.error("Erro ao criar configurações gerais:", error);
          toast({
            title: t("admin.error"),
            description: error.message,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      toast({
        title: t("admin.success"),
        description: t("admin.settings_saved"),
      });
    } catch (error) {
      console.error("Erro inesperado ao salvar configurações gerais:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao salvar as configurações gerais",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveSeoSettings = async (data: SeoSettingsValues) => {
    setIsSaving(true);
    try {
      const existingSetting = settings.find(s => s.name === "seo");
      
      if (existingSetting) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from("site_settings")
          .update({
            value: data,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.id,
          })
          .eq("id", existingSetting.id);

        if (error) {
          console.error("Erro ao atualizar configurações de SEO:", error);
          toast({
            title: t("admin.error"),
            description: error.message,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from("site_settings")
          .insert([{
            name: "seo",
            value: data,
            updatedBy: user?.id,
          }]);

        if (error) {
          console.error("Erro ao criar configurações de SEO:", error);
          toast({
            title: t("admin.error"),
            description: error.message,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      toast({
        title: t("admin.success"),
        description: t("admin.settings_saved"),
      });
    } catch (error) {
      console.error("Erro inesperado ao salvar configurações de SEO:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao salvar as configurações de SEO",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSavePaymentSettings = async (data: PaymentSettingsValues) => {
    setIsSaving(true);
    try {
      const existingSetting = settings.find(s => s.name === "payment");
      
      if (existingSetting) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from("site_settings")
          .update({
            value: data,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.id,
          })
          .eq("id", existingSetting.id);

        if (error) {
          console.error("Erro ao atualizar configurações de pagamento:", error);
          toast({
            title: t("admin.error"),
            description: error.message,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from("site_settings")
          .insert([{
            name: "payment",
            value: data,
            updatedBy: user?.id,
          }]);

        if (error) {
          console.error("Erro ao criar configurações de pagamento:", error);
          toast({
            title: t("admin.error"),
            description: error.message,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      toast({
        title: t("admin.success"),
        description: t("admin.settings_saved"),
      });
    } catch (error) {
      console.error("Erro inesperado ao salvar configurações de pagamento:", error);
      toast({
        title: t("admin.error"),
        description: "Ocorreu um erro ao salvar as configurações de pagamento",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
        <title>{t("admin.settings")} | FovDark</title>
        <meta name="description" content="Configurações do site FovDark" />
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
            <h1 className="text-xl font-cyber">{t("admin.settings")}</h1>
          </DashboardHeader>
          <DashboardContent>
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="payment">Pagamento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <DashboardCard>
                  <DashboardCardHeader>
                    <DashboardCardTitle>Configurações Gerais</DashboardCardTitle>
                    <DashboardCardDescription>
                      Configure as informações básicas do site.
                    </DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    <Form {...generalForm}>
                      <form onSubmit={generalForm.handleSubmit(onSaveGeneralSettings)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={generalForm.control}
                            name="siteName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Site</FormLabel>
                                <FormControl>
                                  <Input placeholder="FovDark" {...field} />
                                </FormControl>
                                <FormDescription>
                                  O nome principal do seu site.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="contactEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-mail de Contato</FormLabel>
                                <FormControl>
                                  <Input placeholder="contato@fovdark.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  E-mail principal para contato.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={generalForm.control}
                          name="siteDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição do Site</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Scripts e cheats para jogos, com foco em Blood Strike" 
                                  {...field} 
                                  className="min-h-[80px]"
                                />
                              </FormControl>
                              <FormDescription>
                                Uma breve descrição do seu site e serviços.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="siteKeywords"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Palavras-chave</FormLabel>
                              <FormControl>
                                <Input placeholder="blood strike, cheats, scripts, hacks" {...field} />
                              </FormControl>
                              <FormDescription>
                                Palavras-chave separadas por vírgula.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={generalForm.control}
                            name="logoUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL do Logo</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://exemplo.com/logo.png" {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL para a imagem do logo.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="faviconUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL do Favicon</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://exemplo.com/favicon.ico" {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL para o ícone do site (favicon).
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator className="my-6" />

                        <h3 className="font-medium text-lg mb-4">Visibilidade das Seções</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={generalForm.control}
                            name="showHeroSection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Seção Hero</FormLabel>
                                  <FormDescription>
                                    Mostrar banner principal na página inicial.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="showFeaturesSection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Seção Recursos</FormLabel>
                                  <FormDescription>
                                    Mostrar recursos/vantagens na página inicial.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="showProductsSection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Seção Produtos</FormLabel>
                                  <FormDescription>
                                    Mostrar produtos em destaque na página inicial.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="showReviewsSection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Seção Avaliações</FormLabel>
                                  <FormDescription>
                                    Mostrar avaliações de clientes na página inicial.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="showGuideSection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Seção Guia</FormLabel>
                                  <FormDescription>
                                    Mostrar seção de guia na página inicial.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="showFaqSection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Seção FAQ</FormLabel>
                                  <FormDescription>
                                    Mostrar perguntas frequentes na página inicial.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="showFooterLinks"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Links no Rodapé</FormLabel>
                                  <FormDescription>
                                    Mostrar links de navegação no rodapé.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="submit"
                            className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <div className="h-4 w-4 mr-2 rounded-full border-2 border-transparent border-t-white animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar Configurações'
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DashboardCardContent>
                </DashboardCard>
              </TabsContent>
              
              <TabsContent value="seo">
                <DashboardCard>
                  <DashboardCardHeader>
                    <DashboardCardTitle>Configurações de SEO</DashboardCardTitle>
                    <DashboardCardDescription>
                      Configure os metadados para melhorar a busca do seu site.
                    </DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    <Form {...seoForm}>
                      <form onSubmit={seoForm.handleSubmit(onSaveSeoSettings)} className="space-y-6">
                        <FormField
                          control={seoForm.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Título</FormLabel>
                              <FormControl>
                                <Input placeholder="FovDark - Scripts e Cheats para Blood Strike" {...field} />
                              </FormControl>
                              <FormDescription>
                                O título que aparecerá nas buscas (55-60 caracteres).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={seoForm.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Descrição</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Os melhores scripts e cheats para Blood Strike e outros jogos." 
                                  {...field} 
                                  className="min-h-[80px]"
                                />
                              </FormControl>
                              <FormDescription>
                                A descrição que aparecerá nas buscas (150-160 caracteres).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={seoForm.control}
                            name="googleAnalyticsId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ID do Google Analytics</FormLabel>
                                <FormControl>
                                  <Input placeholder="UA-XXXXXXXXX-X ou G-XXXXXXXXXX" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Seu ID do Google Analytics para rastreamento.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={seoForm.control}
                            name="twitterHandle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome de usuário no Twitter</FormLabel>
                                <FormControl>
                                  <Input placeholder="@fovdark" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Seu nome de usuário no Twitter/X.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={seoForm.control}
                          name="ogImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Imagem Open Graph</FormLabel>
                              <FormControl>
                                <Input placeholder="https://exemplo.com/og-image.jpg" {...field} />
                              </FormControl>
                              <FormDescription>
                                A imagem usada quando o site é compartilhado em redes sociais.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator className="my-6" />

                        <h3 className="font-medium text-lg mb-4">Recursos Adicionais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={seoForm.control}
                            name="structuredData"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Dados Estruturados</FormLabel>
                                  <FormDescription>
                                    Ativar marcação JSON-LD.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={seoForm.control}
                            name="sitemapEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Sitemap XML</FormLabel>
                                  <FormDescription>
                                    Gerar sitemap.xml automaticamente.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={seoForm.control}
                            name="robotsTxtEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Robots.txt</FormLabel>
                                  <FormDescription>
                                    Gerar robots.txt automaticamente.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="submit"
                            className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <div className="h-4 w-4 mr-2 rounded-full border-2 border-transparent border-t-white animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar Configurações'
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DashboardCardContent>
                </DashboardCard>
              </TabsContent>
              
              <TabsContent value="payment">
                <DashboardCard>
                  <DashboardCardHeader>
                    <DashboardCardTitle>Configurações de Pagamento</DashboardCardTitle>
                    <DashboardCardDescription>
                      Configure os métodos de pagamento do seu site.
                    </DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    <Form {...paymentForm}>
                      <form onSubmit={paymentForm.handleSubmit(onSavePaymentSettings)} className="space-y-6">
                        <FormField
                          control={paymentForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Moeda Principal</FormLabel>
                              <FormControl>
                                <Input placeholder="BRL" {...field} />
                              </FormControl>
                              <FormDescription>
                                Código da moeda (BRL, USD, EUR, etc).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator className="my-6" />

                        <h3 className="font-medium text-lg mb-4">Pix</h3>
                        <FormField
                          control={paymentForm.control}
                          name="pixEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Habilitar Pagamento por Pix</FormLabel>
                                <FormDescription>
                                  Permitir pagamentos via Pix.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {paymentForm.watch("pixEnabled") && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={paymentForm.control}
                              name="pixKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Chave Pix</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Sua chave Pix" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Chave Pix para recebimento de pagamentos.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paymentForm.control}
                              name="pixKeyType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Chave Pix</FormLabel>
                                  <FormControl>
                                    <Input placeholder="email" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Tipo de chave (email, cpf, telefone, aleatória).
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <Separator className="my-6" />

                        <h3 className="font-medium text-lg mb-4">Transferência Bancária</h3>
                        <FormField
                          control={paymentForm.control}
                          name="bankTransferEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Habilitar Transferência Bancária</FormLabel>
                                <FormDescription>
                                  Permitir pagamentos via transferência bancária.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {paymentForm.watch("bankTransferEnabled") && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                              control={paymentForm.control}
                              name="bankName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Banco</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nome do banco" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paymentForm.control}
                              name="bankAccount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número da Conta</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Número da conta" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paymentForm.control}
                              name="bankBranch"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Agência</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Número da agência" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <Separator className="my-6" />

                        <h3 className="font-medium text-lg mb-4">Criptomoedas</h3>
                        <FormField
                          control={paymentForm.control}
                          name="cryptoEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Habilitar Pagamento com Criptomoedas</FormLabel>
                                <FormDescription>
                                  Permitir pagamentos via Bitcoin, Ethereum, etc.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {paymentForm.watch("cryptoEnabled") && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={paymentForm.control}
                              name="bitcoinAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Endereço Bitcoin</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Seu endereço Bitcoin" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Endereço da carteira Bitcoin.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paymentForm.control}
                              name="ethereumAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Endereço Ethereum</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Seu endereço Ethereum" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Endereço da carteira Ethereum.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button 
                            type="submit"
                            className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <div className="h-4 w-4 mr-2 rounded-full border-2 border-transparent border-t-white animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar Configurações'
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DashboardCardContent>
                </DashboardCard>
              </TabsContent>
            </Tabs>
          </DashboardContent>
        </DashboardMain>
      </Dashboard>
    </>
  );
}
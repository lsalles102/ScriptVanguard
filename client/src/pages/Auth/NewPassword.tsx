import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewPassword() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificar se o usuário tem permissão para redefinir a senha
    const checkRecoveryToken = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // Se não houver sessão com token de recuperação, redirecionar para a página de login
      if (error || !data.session) {
        toast({
          title: t("auth.invalid_link"),
          description: t("auth.reset_link_expired"),
          variant: "destructive",
        });
        setLocation("/login");
      }
    };

    checkRecoveryToken();
  }, [setLocation, t, toast]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError(t("auth.passwords_not_match"));
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast({
          title: t("auth.password_update_error"),
          description: error.message,
          variant: "destructive",
        });
        setError(error.message);
      } else {
        setSuccess(true);
        toast({
          title: t("auth.password_updated"),
          description: t("auth.password_updated_desc"),
        });
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        title: t("auth.password_update_error"),
        description: t("auth.unknown_error"),
        variant: "destructive",
      });
      setError(t("auth.unknown_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("auth.new_password")} | FovDark</title>
        <meta name="description" content={t("auth.new_password_desc")} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border border-primary/20 shadow-lg shadow-primary/5 bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-cyber text-center">
              {t("auth.new_password")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.new_password_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!success ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t("auth.new_password")}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t("auth.confirm_password")}
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                
                {error && (
                  <div className="text-sm text-red-500 font-medium">{error}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full cyber-btn"
                  disabled={loading}
                >
                  {loading ? t("auth.updating_password") : t("auth.update_password")}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="py-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
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
                      className="text-primary"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                </div>
                <p className="font-medium text-lg">
                  {t("auth.password_updated")}
                </p>
                <p className="text-muted-foreground">
                  {t("auth.password_updated_details")}
                </p>
                <Button 
                  className="w-full cyber-btn mt-4"
                  onClick={() => setLocation("/login")}
                >
                  {t("auth.continue_to_login")}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-center">
              <Link href="/login" className="text-primary hover:underline">
                {t("auth.back_to_login")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Register() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError(t("auth.passwords_not_match"));
      return;
    }
    
    if (!agreeTerms) {
      setError(t("auth.must_agree_terms"));
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/verificar-email`,
        },
      });

      if (error) {
        toast({
          title: t("auth.register_error"),
          description: error.message,
          variant: "destructive",
        });
        setError(error.message);
      } else {
        toast({
          title: t("auth.register_success"),
          description: t("auth.verify_email_sent"),
        });
        // Redirecionar para página de sucesso
        window.location.href = "/registro-concluido";
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: t("auth.register_error"),
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
        <title>{t("auth.register")} | FovDark</title>
        <meta name="description" content={t("auth.register_meta_desc")} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border border-primary/20 shadow-lg shadow-primary/5 bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-cyber text-center">
              {t("auth.create_account")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.register_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    {t("auth.first_name")}
                  </label>
                  <Input
                    id="firstName"
                    placeholder={t("auth.first_name")}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    {t("auth.last_name")}
                  </label>
                  <Input
                    id="lastName"
                    placeholder={t("auth.last_name")}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t("auth.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  {t("auth.password")}
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
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                />
                <Label 
                  htmlFor="terms" 
                  className="text-sm cursor-pointer"
                >
                  {t("auth.agree")}{" "}
                  <Link href="/termos" className="text-primary hover:underline">
                    {t("auth.terms")}
                  </Link>{" "}
                  {t("auth.and")}{" "}
                  <Link href="/privacidade" className="text-primary hover:underline">
                    {t("auth.privacy")}
                  </Link>
                </Label>
              </div>
              
              {error && (
                <div className="text-sm text-red-500 font-medium">{error}</div>
              )}
              
              <Button 
                type="submit" 
                className="w-full cyber-btn"
                disabled={loading}
              >
                {loading ? t("auth.creating_account") : t("auth.register")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-center">
              {t("auth.already_account")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("auth.login")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
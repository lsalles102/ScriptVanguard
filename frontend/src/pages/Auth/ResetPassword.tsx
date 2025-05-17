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

export default function ResetPassword() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nova-senha`,
      });

      if (error) {
        toast({
          title: t("auth.reset_error"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSubmitted(true);
        toast({
          title: t("auth.reset_email_sent"),
          description: t("auth.reset_email_instructions"),
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: t("auth.reset_error"),
        description: t("auth.unknown_error"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("auth.reset_password")} | FovDark</title>
        <meta name="description" content={t("auth.reset_password_desc")} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border border-primary/20 shadow-lg shadow-primary/5 bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-cyber text-center">
              {t("auth.reset_password")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.reset_password_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
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
                <Button 
                  type="submit" 
                  className="w-full cyber-btn"
                  disabled={loading}
                >
                  {loading ? t("auth.sending") : t("auth.send_reset_email")}
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
                      <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-3.5"></path>
                      <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-3.5"></path>
                      <path d="M18 2v4"></path>
                      <path d="M6 2v4"></path>
                      <path d="M2 10h20"></path>
                      <circle cx="10" cy="14" r="2"></circle>
                      <path d="M10 12v-4"></path>
                    </svg>
                  </div>
                </div>
                <p className="font-medium text-lg">
                  {t("auth.check_email")}
                </p>
                <p className="text-muted-foreground">
                  {t("auth.reset_email_sent_desc", { email })}
                </p>
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
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterSuccess() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("auth.registration_complete")} | FovDark</title>
        <meta name="description" content={t("auth.registration_complete_desc")} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border border-primary/20 shadow-lg shadow-primary/5 bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
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
            <CardTitle className="text-2xl font-cyber text-center mt-4">
              {t("auth.registration_complete")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.verify_email_instructions")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>{t("auth.verify_email_details")}</p>
            <div className="py-4 px-6 rounded-lg bg-background/50 border border-primary/20 mt-4">
              <p className="text-muted-foreground">
                {t("auth.verify_email_note")}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full cyber-btn">
              <Link href="/">{t("auth.back_to_home")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">{t("auth.go_to_login")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
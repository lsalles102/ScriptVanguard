import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";

export default function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-card border border-muted/30 p-8 md:p-12 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 tech-pattern opacity-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7000ff]/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="font-cyber text-3xl md:text-4xl font-bold mb-4">
              {t("cta.title_1")} <span className="text-primary neon-text">{t("cta.title_2")}</span> {t("cta.title_3")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("cta.subtitle")}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="cyber-btn px-6 py-6 bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 transition duration-300 rounded-md font-cyber">
                <Link href="/products">
                  {t("cta.primary_button")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="px-6 py-6 border border-muted-foreground/30 hover:border-muted-foreground/50 text-foreground hover:text-white transition duration-300 rounded-md font-cyber">
                <Link href="/demo">
                  {t("cta.secondary_button")}
                </Link>
              </Button>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background/40 backdrop-blur-sm p-4 rounded border border-muted/30">
                <div className="font-cyber text-primary text-2xl font-bold">500+</div>
                <div className="text-muted-foreground text-sm">{t("cta.stats.users")}</div>
              </div>
              <div className="bg-background/40 backdrop-blur-sm p-4 rounded border border-muted/30">
                <div className="font-cyber text-[#ff2a6d] text-2xl font-bold">99.7%</div>
                <div className="text-muted-foreground text-sm">{t("cta.stats.satisfaction")}</div>
              </div>
              <div className="bg-background/40 backdrop-blur-sm p-4 rounded border border-muted/30">
                <div className="font-cyber text-[#7000ff] text-2xl font-bold">24/7</div>
                <div className="text-muted-foreground text-sm">{t("cta.stats.support")}</div>
              </div>
              <div className="bg-background/40 backdrop-blur-sm p-4 rounded border border-muted/30">
                <div className="font-cyber text-[#00ff66] text-2xl font-bold">{t("cta.stats.weekly")}</div>
                <div className="text-muted-foreground text-sm">{t("cta.stats.updates")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

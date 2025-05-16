import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function SalesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-cyber text-3xl md:text-4xl font-bold mb-6">
              {t("sales.title_1")} <span className="text-primary neon-text">{t("sales.title_2")}</span> {t("sales.title_3")}
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-cyber text-xl font-semibold mb-2">{t("sales.feature_1.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("sales.feature_1.desc")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ff2a6d]/20 flex items-center justify-center shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff2a6d]">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-cyber text-xl font-semibold mb-2">{t("sales.feature_2.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("sales.feature_2.desc")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7000ff]/20 flex items-center justify-center shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7000ff]">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-cyber text-xl font-semibold mb-2">{t("sales.feature_3.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("sales.feature_3.desc")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/80 border border-muted/30 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="text-3xl text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-cyber text-lg font-semibold mb-2">{t("sales.offer.title")}</h4>
                  <p className="text-muted-foreground mb-4">
                    {t("sales.offer.desc")}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button className="cyber-btn px-4 py-2 bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 transition duration-300 rounded font-cyber text-sm">
                      {t("sales.offer.button")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="rounded-lg overflow-hidden shadow-xl shadow-primary/10 border border-muted/30">
                <img 
                  src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000" 
                  alt="FovDark in action" 
                  className="w-full h-auto" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 p-4 bg-background border border-primary/30 rounded shadow-lg max-w-xs">
                <div className="mb-3 font-mono text-xs text-primary">FovDark Console {'>'} Aimbot Settings</div>
                <div className="bg-card rounded p-3 font-mono text-xs">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">FOV:</span>
                    <span className="text-primary">16.5</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Smoothness:</span>
                    <span className="text-[#ff2a6d]">4.2</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="text-[#7000ff]">HEAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-[#00ff66]">ACTIVE</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-[#ff2a6d]/30 p-3 rounded shadow-lg">
                <div className="text-[#ff2a6d] font-cyber text-lg font-bold">35+ KILLS</div>
                <div className="text-muted-foreground text-xs">{t("sales.avg_kills")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

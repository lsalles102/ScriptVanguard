import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function GuideSection() {
  const { t } = useTranslation();

  return (
    <section id="guide" className="py-16 bg-background relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-cyber text-3xl md:text-4xl font-bold mb-4">
            <span className="text-[#7000ff] neon-purple-text">{t("guide.title_1")}</span> {t("guide.title_2")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("guide.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex gap-4 bg-card p-6 rounded-lg border border-muted/30">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1 border border-primary/30">
                  <span className="font-cyber font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-cyber text-xl font-semibold mb-2">{t("guide.step_1.title")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t("guide.step_1.desc")}
                  </p>
                  <div className="bg-background/60 p-4 rounded border border-muted/30">
                    <div className="flex items-center gap-2 text-[#ffb300] text-sm mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      <span className="font-cyber">{t("guide.important")}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {t("guide.step_1.important")}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 bg-card p-6 rounded-lg border border-muted/30">
                <div className="w-10 h-10 bg-[#ff2a6d]/10 rounded-full flex items-center justify-center shrink-0 mt-1 border border-[#ff2a6d]/30">
                  <span className="font-cyber font-bold text-[#ff2a6d]">2</span>
                </div>
                <div>
                  <h3 className="font-cyber text-xl font-semibold mb-2">{t("guide.step_2.title")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t("guide.step_2.desc")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-background/60 p-4 rounded border border-muted/30">
                      <h4 className="font-cyber text-sm font-semibold mb-2 text-primary">{t("guide.step_2.req_title")}</h4>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• {t("guide.step_2.req_1")}</li>
                        <li>• {t("guide.step_2.req_2")}</li>
                        <li>• {t("guide.step_2.req_3")}</li>
                        <li>• {t("guide.step_2.req_4")}</li>
                      </ul>
                    </div>
                    <div className="bg-background/60 p-4 rounded border border-muted/30">
                      <h4 className="font-cyber text-sm font-semibold mb-2 text-primary">{t("guide.step_2.comp_title")}</h4>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• {t("guide.step_2.comp_1")}</li>
                        <li>• {t("guide.step_2.comp_2")}</li>
                        <li>• {t("guide.step_2.comp_3")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 bg-card p-6 rounded-lg border border-muted/30">
                <div className="w-10 h-10 bg-[#7000ff]/10 rounded-full flex items-center justify-center shrink-0 mt-1 border border-[#7000ff]/30">
                  <span className="font-cyber font-bold text-[#7000ff]">3</span>
                </div>
                <div>
                  <h3 className="font-cyber text-xl font-semibold mb-2">{t("guide.step_3.title")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t("guide.step_3.desc")}
                  </p>
                  <div className="relative mb-4 rounded overflow-hidden border border-muted/30">
                    <img 
                      src="https://images.unsplash.com/photo-1547082299-de196ea013d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                      alt="FovDark Loader Interface" 
                      className="w-full h-auto" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                  </div>
                  <p className="text-muted-foreground">
                    {t("guide.step_3.tip")} <span className="text-[#7000ff] font-mono">[INSERT]</span> {t("guide.step_3.tip_2")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-card p-6 rounded-lg border border-muted/30 sticky top-24">
              <h3 className="font-cyber text-xl font-semibold mb-4">{t("guide.tips.title")}</h3>
              <div className="space-y-4">
                <div className="p-4 bg-background/60 rounded border border-muted/30">
                  <h4 className="font-cyber text-primary font-semibold mb-2">{t("guide.tips.tip_1.title")}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t("guide.tips.tip_1.desc")}
                  </p>
                </div>
                
                <div className="p-4 bg-background/60 rounded border border-muted/30">
                  <h4 className="font-cyber text-[#ff2a6d] font-semibold mb-2">{t("guide.tips.tip_2.title")}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t("guide.tips.tip_2.desc")}
                  </p>
                </div>
                
                <div className="p-4 bg-background/60 rounded border border-muted/30">
                  <h4 className="font-cyber text-[#7000ff] font-semibold mb-2">{t("guide.tips.tip_3.title")}</h4>
                  <div className="text-muted-foreground text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="font-mono">INSERT</span>
                      <span>{t("guide.tips.bindings.open")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">END</span>
                      <span>{t("guide.tips.bindings.panic")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">NUM+</span>
                      <span>{t("guide.tips.bindings.increase")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">NUM-</span>
                      <span>{t("guide.tips.bindings.decrease")}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-background/60 rounded border border-muted/30">
                  <h4 className="font-cyber text-[#00ff66] font-semibold mb-2">{t("guide.tips.help.title")}</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    {t("guide.tips.help.desc")}
                  </p>
                  <Button className="inline-block w-full cyber-btn px-4 py-2 bg-[#00ff66]/10 border border-[#00ff66]/50 text-[#00ff66] hover:bg-[#00ff66]/20 transition duration-300 rounded font-cyber text-sm text-center">
                    {t("guide.tips.help.button")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

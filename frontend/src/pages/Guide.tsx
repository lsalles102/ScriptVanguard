import { useTranslation } from "@/lib/i18n";
import { Helmet } from "react-helmet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Guide() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("meta.guide.title")} | FovDark</title>
        <meta name="description" content={t("meta.guide.description")} />
        <meta property="og:title" content={t("meta.guide.title") + " | FovDark"} />
        <meta property="og:description" content={t("meta.guide.description")} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-cyber text-4xl md:text-5xl font-bold mb-4">
              {t("guide_page.title_1")} <span className="text-[#7000ff] neon-purple-text">{t("guide_page.title_2")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("guide_page.subtitle")}
            </p>
          </div>
        </div>
      </div>
      
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="font-cyber text-2xl font-bold mb-6">
                {t("guide_page.getting_started")}
              </h2>
              
              <div className="space-y-6 mb-12">
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
              
              <h2 className="font-cyber text-2xl font-bold mb-6">
                {t("guide_page.key_bindings")}
              </h2>
              
              <div className="bg-card p-6 rounded-lg border border-muted/30 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-cyber text-lg font-semibold mb-4 text-primary">
                      {t("guide_page.basic_controls")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-muted/30 pb-2">
                        <span className="font-mono text-muted-foreground">INSERT</span>
                        <span>{t("guide.tips.bindings.open")}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted/30 pb-2">
                        <span className="font-mono text-muted-foreground">END</span>
                        <span>{t("guide.tips.bindings.panic")}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted/30 pb-2">
                        <span className="font-mono text-muted-foreground">HOME</span>
                        <span>{t("guide_page.bindings.toggle_settings")}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted/30 pb-2">
                        <span className="font-mono text-muted-foreground">F1</span>
                        <span>{t("guide_page.bindings.help")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-cyber text-lg font-semibold mb-4 text-[#ff2a6d]">
                      {t("guide_page.advanced_controls")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-muted/30 pb-2">
                        <span className="font-mono text-muted-foreground">NUM+</span>
                        <span>{t("guide.tips.bindings.increase")}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted/30 pb-2">
                        <span className="font-mono text-muted-foreground">NUM-</span>
                        <span>{t("guide.tips.bindings.decrease")}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted/30 pb-2">
                        <span className="font-mono text-muted-foreground">CAPS LOCK</span>
                        <span>{t("guide_page.bindings.toggle_aimbot")}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted/30 pb-2">
                        <span className="font-mono text-muted-foreground">CTRL+F</span>
                        <span>{t("guide_page.bindings.toggle_esp")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="font-cyber text-2xl font-bold mb-6">
                {t("guide_page.troubleshooting")}
              </h2>
              
              <Accordion type="single" collapsible className="mb-12">
                <AccordionItem value="issue-1" className="bg-card border border-muted/30 rounded-lg mb-4">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <h3 className="font-cyber text-lg font-semibold text-left">
                      {t("guide_page.issues.issue_1.title")}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground mb-4">
                      {t("guide_page.issues.issue_1.desc")}
                    </p>
                    <div className="bg-background/60 p-4 rounded border border-muted/30">
                      <h4 className="font-cyber text-sm font-semibold mb-2 text-primary">
                        {t("guide_page.solution")}
                      </h4>
                      <ol className="list-decimal list-inside text-muted-foreground text-sm space-y-2">
                        <li>{t("guide_page.issues.issue_1.step_1")}</li>
                        <li>{t("guide_page.issues.issue_1.step_2")}</li>
                        <li>{t("guide_page.issues.issue_1.step_3")}</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="issue-2" className="bg-card border border-muted/30 rounded-lg mb-4">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <h3 className="font-cyber text-lg font-semibold text-left">
                      {t("guide_page.issues.issue_2.title")}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground mb-4">
                      {t("guide_page.issues.issue_2.desc")}
                    </p>
                    <div className="bg-background/60 p-4 rounded border border-muted/30">
                      <h4 className="font-cyber text-sm font-semibold mb-2 text-primary">
                        {t("guide_page.solution")}
                      </h4>
                      <ol className="list-decimal list-inside text-muted-foreground text-sm space-y-2">
                        <li>{t("guide_page.issues.issue_2.step_1")}</li>
                        <li>{t("guide_page.issues.issue_2.step_2")}</li>
                        <li>{t("guide_page.issues.issue_2.step_3")}</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="issue-3" className="bg-card border border-muted/30 rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <h3 className="font-cyber text-lg font-semibold text-left">
                      {t("guide_page.issues.issue_3.title")}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground mb-4">
                      {t("guide_page.issues.issue_3.desc")}
                    </p>
                    <div className="bg-background/60 p-4 rounded border border-muted/30">
                      <h4 className="font-cyber text-sm font-semibold mb-2 text-primary">
                        {t("guide_page.solution")}
                      </h4>
                      <ol className="list-decimal list-inside text-muted-foreground text-sm space-y-2">
                        <li>{t("guide_page.issues.issue_3.step_1")}</li>
                        <li>{t("guide_page.issues.issue_3.step_2")}</li>
                        <li>{t("guide_page.issues.issue_3.step_3")}</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <h2 className="font-cyber text-2xl font-bold mb-6">
                {t("guide_page.tips_tricks")}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-card p-6 rounded-lg border border-muted/30">
                  <div className="text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m15 9-6 6"></path>
                      <path d="m9 9 6 6"></path>
                    </svg>
                  </div>
                  <h3 className="font-cyber text-lg font-semibold mb-2">
                    {t("guide_page.tips.tip_1.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("guide_page.tips.tip_1.desc")}
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-muted/30">
                  <div className="text-[#ff2a6d] mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 10v12"></path>
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                    </svg>
                  </div>
                  <h3 className="font-cyber text-lg font-semibold mb-2">
                    {t("guide_page.tips.tip_2.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("guide_page.tips.tip_2.desc")}
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-muted/30">
                  <div className="text-[#7000ff] mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"></path>
                      <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"></path>
                      <path d="M4 15v-3a6 6 0 0 1 6-6h0"></path>
                      <path d="M14 6h0a6 6 0 0 1 6 6v3"></path>
                    </svg>
                  </div>
                  <h3 className="font-cyber text-lg font-semibold mb-2">
                    {t("guide_page.tips.tip_3.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("guide_page.tips.tip_3.desc")}
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-muted/30">
                  <div className="text-[#00ff66] mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v8"></path>
                      <path d="m4.93 10.93 1.41 1.41"></path>
                      <path d="M2 18h2"></path>
                      <path d="M20 18h2"></path>
                      <path d="m19.07 10.93-1.41 1.41"></path>
                      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path>
                    </svg>
                  </div>
                  <h3 className="font-cyber text-lg font-semibold mb-2">
                    {t("guide_page.tips.tip_4.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("guide_page.tips.tip_4.desc")}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-card p-6 rounded-lg border border-muted/30 sticky top-24">
                <h3 className="font-cyber text-xl font-semibold mb-4">{t("guide_page.need_help")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("guide_page.help_desc")}
                </p>
                
                <div className="space-y-4">
                  <Button className="w-full cyber-btn px-4 py-2 bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 transition duration-300 rounded font-cyber">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M8 9h8" />
                      <path d="M8 13h6" />
                      <path d="M18 2a3 3 0 0 1 2.995 2.824L21 5v14a3 3 0 0 1-2.824 2.995L18 22H6a3 3 0 0 1-2.995-2.824L3 19V5a3 3 0 0 1 2.824-2.995L6 2h12Z" />
                    </svg>
                    {t("guide_page.visit_faq")}
                  </Button>
                  
                  <Button className="w-full cyber-btn px-4 py-2 bg-[#7000ff]/10 border border-[#7000ff]/50 text-[#7000ff] hover:bg-[#7000ff]/20 transition duration-300 rounded font-cyber">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M13.5 2h-4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9.5" />
                      <path d="M13.5 2 19 7.5" />
                      <path d="M8 14h8" />
                      <path d="M8 10h2" />
                      <path d="M8 18h5" />
                    </svg>
                    {t("guide_page.download_manual")}
                  </Button>
                  
                  <Button className="w-full cyber-btn px-4 py-2 bg-[#00ff66]/10 border border-[#00ff66]/50 text-[#00ff66] hover:bg-[#00ff66]/20 transition duration-300 rounded font-cyber">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    {t("guide_page.contact_support")}
                  </Button>
                </div>
                
                <div className="mt-8 p-4 bg-background/60 rounded border border-muted/30">
                  <h4 className="font-cyber text-sm font-semibold mb-2 text-primary">
                    {t("guide_page.useful_resources")}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary transition duration-300 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                        {t("guide_page.resources.video_tutorials")}
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary transition duration-300 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                        {t("guide_page.resources.community_forum")}
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary transition duration-300 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                        {t("guide_page.resources.optimization_guide")}
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary transition duration-300 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                        {t("guide_page.resources.changelog")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

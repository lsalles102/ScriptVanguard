import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const [glitching, setGlitching] = useState(false);
  
  // Occasional glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldGlitch = Math.random() > 0.7;
      if (shouldGlitch) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 150);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("footer.newsletter_success"),
      description: t("footer.newsletter_message"),
    });
    setEmail("");
  };

  return (
    <footer className="bg-black relative mt-20">
      {/* Digital circuit lines */}
      <div className="absolute top-0 inset-x-0 h-12 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent"></div>
        <div className="circuit-pattern opacity-20 absolute inset-0"></div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company info */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-8 group">
              <div className="relative w-12 h-12">
                {/* Logo background with glow */}
                <div className="absolute inset-0 rounded-sm bg-black border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-300"></div>
                
                {/* Logo corners */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-cyan-400"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-cyan-400"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400"></div>
                
                {/* Logo letter */}
                <span className="absolute inset-0 flex items-center justify-center font-cyber font-bold text-cyan-400 text-2xl group-hover:text-cyan-300 transition-colors duration-300">F</span>
              </div>
              
              <h3 className="font-cyber font-bold text-2xl text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">FOV</span>
                <span className={`text-white ${glitching ? 'text-glitch' : ''}`}>DARK</span>
              </h3>
            </div>
            
            <p className="text-gray-400 mb-8 relative">
              {t("footer.description")}
              {/* Accent line */}
              <span className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/70 via-cyan-500/10 to-transparent"></span>
            </p>
            
            {/* Social icons */}
            <div className="flex gap-4">
              {[
                { label: "Discord", icon: "M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" },
                { label: "Telegram", icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" },
                { label: "Twitter", icon: "M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" },
                { label: "YouTube", icon: "M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="social-icon-btn group"
                  aria-label={social.label}
                >
                  <div className="w-10 h-10 rounded-sm relative overflow-hidden border border-cyan-500/30 group-hover:border-cyan-400/70 transition-all duration-300">
                    <div className="absolute inset-0 bg-black group-hover:bg-cyan-950/20 transition-colors duration-300 flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        fill="currentColor" 
                        viewBox="0 0 16 16"
                        className="text-gray-400 group-hover:text-cyan-400 transition-colors duration-300"
                      >
                        <path d={social.icon} />
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500/50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h4 className="font-cyber font-bold text-lg mb-8 text-cyan-400">
              {t("footer.quick_links")}
              <div className="h-px w-24 bg-gradient-to-r from-cyan-500 to-transparent mt-2"></div>
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/", label: t("footer.home") },
                { href: "/products", label: t("footer.products") },
                { href: "/guide", label: t("footer.guide") },
                { href: "/reviews", label: t("footer.reviews") },
                { href: "/blog", label: t("footer.blog") }
              ].map((link, index) => (
                <li key={index} className="group">
                  <Link 
                    href={link.href} 
                    className="flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 mr-2 transition-colors duration-300"></span>
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-cyan-500/50 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support links */}
          <div>
            <h4 className="font-cyber font-bold text-lg mb-8 text-pink-500">
              {t("footer.support")}
              <div className="h-px w-24 bg-gradient-to-r from-pink-500 to-transparent mt-2"></div>
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/contact", label: t("footer.contact_us") },
                { href: "/faq", label: t("footer.faq") },
                { href: "/chat", label: t("footer.live_chat") },
                { href: "/kb", label: t("footer.knowledge_base") },
                { href: "/status", label: t("footer.system_status") }
              ].map((link, index) => (
                <li key={index} className="group">
                  <Link 
                    href={link.href} 
                    className="flex items-center text-gray-400 hover:text-pink-400 transition-colors duration-300"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-500/50 group-hover:bg-pink-400 mr-2 transition-colors duration-300"></span>
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-pink-500/50 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="relative">
            <h4 className="font-cyber font-bold text-lg mb-8 text-purple-400">
              {t("footer.newsletter")}
              <div className="h-px w-24 bg-gradient-to-r from-purple-500 to-transparent mt-2"></div>
            </h4>
            <p className="text-gray-400 mb-6 relative">
              {t("footer.newsletter_desc")}
            </p>
            
            {/* Newsletter form */}
            <form className="mb-6 relative" onSubmit={handleSubmit}>
              <div className="relative">
                {/* Email input corners */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-purple-500 z-10"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-purple-500 z-10"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-purple-500 z-10"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-purple-500 z-10"></div>
                
                <div className="flex">
                  <Input
                    type="email"
                    placeholder={t("footer.your_email")}
                    className="bg-black border border-purple-500/30 rounded-none p-3 w-full text-white focus:border-purple-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button 
                    type="submit" 
                    className="relative bg-gradient-to-r from-purple-500/80 to-indigo-500/80 hover:from-purple-400 hover:to-indigo-400 text-white border-none rounded-none min-w-12 transition-all duration-300"
                  >
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
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    <span className="absolute inset-0 bg-black/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                </div>
              </div>
            </form>
            
            {/* Legal links */}
            <div className="flex gap-3">
              <Link 
                href="/privacy" 
                className="text-gray-500 hover:text-purple-400 transition-colors duration-300 text-sm relative inline-block group"
              >
                <span>{t("footer.privacy_policy")}</span>
                <span className="absolute bottom-0 left-0 right-0 h-px bg-purple-500/30 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </Link>
              <span className="text-gray-600">•</span>
              <Link 
                href="/terms" 
                className="text-gray-500 hover:text-purple-400 transition-colors duration-300 text-sm relative inline-block group"
              >
                <span>{t("footer.terms")}</span>
                <span className="absolute bottom-0 left-0 right-0 h-px bg-purple-500/30 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Footer bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center relative">
          {/* Digital noise background */}
          <div className="absolute inset-0 opacity-5 noise-bg pointer-events-none"></div>
          
          {/* Copyright */}
          <div className="text-gray-500 text-sm mb-4 md:mb-0 relative z-10">
            © {new Date().getFullYear()} FovDark. {t("footer.all_rights")}
          </div>
          
          {/* Language switcher */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="text-gray-500 text-sm">{t("language")}:</div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      
      {/* Bottom decorative elements */}
      <div className="relative overflow-hidden h-4 w-full">
        <div className="absolute inset-x-0 h-px bottom-0 bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent"></div>
      </div>
    </footer>
  );
}

import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useEffect, useState, useRef } from "react";
import { cyberpunkGradient } from "@/lib/utils";

export default function HeroSection() {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  // Handle parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Handle mouse movement for dynamic lighting
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMouseX(x);
        setMouseY(y);
        
        // Update the glow position
        if (glowRef.current) {
          glowRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.15) 0%, transparent 60%)`;
        }
      }
    };
    
    const element = heroRef.current;
    if (element) {
      element.addEventListener("mousemove", handleMouseMove);
      return () => element.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  // Randomly changing glitch effect
  const [glitchActive, setGlitchActive] = useState(false);
  
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 5000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative bg-black overflow-hidden min-h-[100vh] flex items-center"
      style={{ 
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      {/* Dynamic lighting overlay */}
      <div 
        ref={glowRef} 
        className="absolute inset-0 pointer-events-none z-10"
      ></div>
      
      {/* Cyberpunk grid background */}
      <div 
        className="absolute inset-0 cyberpunk-grid z-0 opacity-30"
        style={{ 
          transform: `translateY(${scrollY * 0.1}px)`,
          backgroundSize: "100px 100px",
          backgroundImage: "linear-gradient(to right, rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.2) 1px, transparent 1px)"
        }}
      ></div>
      
      {/* Futuristic circuit pattern */}
      <div 
        className="absolute inset-0 tech-pattern opacity-20 z-0" 
        style={{ transform: `translateY(${scrollY * 0.05}px)` }}
      ></div>
      
      {/* Abstract geometric shapes */}
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-20 z-0">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#00f0ff" d="M31.9,-51.2C45,-45.5,62,-43.8,70.9,-34.4C79.8,-25.1,80.7,-8.1,76.7,6.5C72.7,21.1,63.8,33.2,53.3,42.9C42.8,52.5,30.7,59.8,17.5,63.2C4.4,66.7,-9.8,66.4,-21.7,61.3C-33.6,56.3,-43.2,46.4,-55.6,35.6C-68,24.8,-83.2,13,-85.9,-1.5C-88.6,-16.1,-78.7,-33.5,-65.9,-40.8C-53.1,-48.1,-37.4,-45.3,-25,-48.1C-12.7,-50.9,-3.7,-59.2,3.9,-65.5C11.4,-71.9,18.9,-56.9,31.9,-51.2Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      <div className="absolute top-0 left-0 w-1/3 h-1/3 opacity-30 z-0" style={{ transform: `translateY(${scrollY * 0.08}px) rotate(${scrollY * 0.02}deg)` }}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#7000ff" d="M54.2,-76.3C70.3,-68.3,83.4,-53.9,88.7,-37.5C94,-21.1,91.4,-2.7,85.4,13.1C79.4,28.9,70,42.1,58.4,53.8C46.8,65.5,33,75.6,16.9,79.4C0.7,83.2,-17.8,80.7,-33.6,73.2C-49.4,65.6,-62.4,53,-72.2,37.7C-81.9,22.4,-88.3,4.5,-87.2,-13.6C-86.1,-31.7,-77.5,-50,-64,-63.8C-50.5,-77.5,-32.1,-86.8,-13.3,-88.2C5.6,-89.6,38.1,-84.2,54.2,-76.3Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 scanline opacity-10 pointer-events-none z-30"></div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="mb-10 glitch-wrapper">
              <div className={`mb-2 inline-block ${glitchActive ? 'text-glitch' : ''}`}>
                <div className="text-xs md:text-sm uppercase tracking-wider font-cyber text-cyan-400 mb-2 flex items-center">
                  <span className="inline-block w-8 h-[1px] bg-cyan-400 mr-2"></span>
                  FOVDARK PREMIUM
                </div>
              </div>
              
              <h1 className={`font-cyber text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight cyberpunk-heading ${glitchActive ? 'text-glitch' : ''}`}>
                <span className="block">
                  {t("hero.title_1")} <span className="text-transparent bg-clip-text" style={{ backgroundImage: cyberpunkGradient("#00f0ff", "#7000ff") }}>{t("hero.title_2")}</span>
                </span>
                <span className="block relative">
                  {t("hero.title_3")}
                  <span className="absolute -right-4 -top-2 text-xs bg-cyan-400 text-black px-1 font-mono rotate-12">3.2</span>
                </span>
              </h1>
              
              <p className="text-muted-foreground text-lg mb-8 max-w-xl leading-relaxed hud-text">
                {t("hero.description")}
              </p>
              
              <div className="flex flex-wrap gap-5">
                <Button asChild className="cyber-btn text-base px-8 py-7 bg-gradient-to-r from-cyan-500/90 to-purple-600/90 border-none text-white hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-all duration-300 rounded-sm relative overflow-hidden group">
                  <Link href="/products">
                    <span className="relative z-10 font-cyber">{t("hero.explore_button")}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="text-base px-7 py-7 border-2 border-cyan-400/30 text-cyan-400 hover:bg-cyan-950/30 hover:border-cyan-400/50 transition-all duration-300 rounded-sm relative overflow-hidden group">
                  <Link href="/guide">
                    <span className="relative z-10 font-cyber">{t("hero.how_it_works")}</span>
                    <span className="absolute inset-0 bg-cyan-950/30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              <div className="cyber-box bg-black border-[1px] border-cyan-400/30 p-5 rounded-sm relative overflow-hidden group hover:border-cyan-400/70 transition-all duration-300">
                <div className="absolute h-1 w-0 group-hover:w-full bg-cyan-400 top-0 left-0 transition-all duration-500"></div>
                <div className="text-cyan-400 mb-3">
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
                  >
                    <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h6" />
                    <path d="M14 2v6h6" />
                    <path d="M19.5 15.5 17 18l2.5 2.5" />
                    <path d="M19.5 20.5 17 18l2.5-2.5" />
                    <path d="M13.5 15.5 16 18l-2.5 2.5" />
                    <path d="M13.5 20.5 16 18l-2.5-2.5" />
                  </svg>
                </div>
                <h3 className="font-cyber font-bold text-white">{t("hero.feature_1.title")}</h3>
                <p className="text-cyan-400/80 text-sm mt-2">{t("hero.feature_1.desc")}</p>
              </div>
              
              <div className="cyber-box bg-black border-[1px] border-pink-500/30 p-5 rounded-sm relative overflow-hidden group hover:border-pink-500/70 transition-all duration-300">
                <div className="absolute h-1 w-0 group-hover:w-full bg-pink-500 top-0 left-0 transition-all duration-500"></div>
                <div className="text-pink-500 mb-3">
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
                  >
                    <path d="m13 2-2 2.5h3L12 7" />
                    <path d="M10 9 8 7v4" />
                    <path d="m14 4 1 7" />
                    <path d="m19 9-3 2 3 1" />
                    <path d="m21 14-3.37 1.12A2 2 0 0 0 16.5 17h-9a4 4 0 0 1-4-4v-3a3 3 0 0 1 3-3h.5" />
                    <path d="m5 18 4 4" />
                    <path d="m15 18-4 4" />
                  </svg>
                </div>
                <h3 className="font-cyber font-bold text-white">{t("hero.feature_2.title")}</h3>
                <p className="text-pink-500/80 text-sm mt-2">{t("hero.feature_2.desc")}</p>
              </div>
              
              <div className="cyber-box bg-black border-[1px] border-purple-500/30 p-5 rounded-sm relative overflow-hidden group hover:border-purple-500/70 transition-all duration-300">
                <div className="absolute h-1 w-0 group-hover:w-full bg-purple-500 top-0 left-0 transition-all duration-500"></div>
                <div className="text-purple-500 mb-3">
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
                  >
                    <path d="M22 8.5a6.5 6.5 0 0 1-7.5 7.5 6.5 6.5 0 0 0-8 8" />
                    <path d="M17 3a2 2 0 0 1 2 2" />
                    <path d="M14 5a2 2 0 0 1 0-4" />
                    <path d="M10 7a2 2 0 0 1-2 2" />
                    <path d="M7 10a2 2 0 0 1-4 0" />
                    <path d="M14.5 17.5 9 12l2-2" />
                    <path d="M7 10v.9a4.1 4.1 0 0 0 4.1 4.1h.9" />
                    <path d="m9 12 5.5 5.5" />
                  </svg>
                </div>
                <h3 className="font-cyber font-bold text-white">{t("hero.feature_3.title")}</h3>
                <p className="text-purple-500/80 text-sm mt-2">{t("hero.feature_3.desc")}</p>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            {/* Game screenshot with UI elements */}
            <div className="relative z-10 cyber-window mb-8">
              {/* Cyberpunk UI frame */}
              <div className="absolute -inset-1 border border-cyan-400/50 rounded-sm z-0 bg-black/50"></div>
              <div className="absolute -inset-3 border border-cyan-400/20 rounded-sm z-0"></div>
              <div className="absolute -inset-5 border border-cyan-400/10 rounded-sm z-0"></div>
              
              {/* Corner elements */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
              
              <div className="relative overflow-hidden rounded-sm border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <div className="absolute top-0 w-full h-6 bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center px-2 z-20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-xs text-black font-semibold">FOVDARK_AIMBOT.exe</span>
                  </div>
                </div>
                
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                    alt="Blood Strike gameplay" 
                    className="w-full h-auto translate-y-6 pt-2" 
                  />
                  
                  {/* UI Overlays */}
                  <div className="absolute top-12 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 border border-cyan-400/50 rounded-sm z-30">
                    <div className="text-xs text-cyan-400 font-mono flex items-center">
                      <span className="inline-block w-2 h-2 bg-cyan-400 mr-2 rounded-full animate-pulse"></span>
                      ACTIVE
                    </div>
                  </div>
                  
                  <div className="absolute top-12 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 border border-pink-500/50 rounded-sm z-30">
                    <div className="text-xs text-pink-500 font-mono">
                      FPS: 120
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 border border-cyan-400/50 rounded-sm z-30">
                    <div className="flex items-center">
                      <span className="font-mono text-xs text-cyan-400 mr-2">AIMBOT</span>
                      <span className="font-mono text-xs text-white">V3.2</span>
                    </div>
                    <div className="mt-1 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-2 border border-pink-500/50 rounded-sm z-30">
                    <span className="font-mono text-xs text-pink-500">ESP ENABLED</span>
                  </div>
                  
                  {/* Targeting element */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="40" r="30" stroke="#00f0ff" strokeWidth="1" strokeDasharray="10 5" className="animate-[spin_10s_linear_infinite]" />
                      <circle cx="40" cy="40" r="3" fill="#00f0ff" />
                      <path d="M40 30V36" stroke="#00f0ff" strokeWidth="1" />
                      <path d="M40 44V50" stroke="#00f0ff" strokeWidth="1" />
                      <path d="M50 40H44" stroke="#00f0ff" strokeWidth="1" />
                      <path d="M36 40H30" stroke="#00f0ff" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats display */}
            <div className="bg-black/60 border border-cyan-400/30 p-4 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-cyber text-sm text-white">PERFORMANCE STATS</span>
                <div className="h-1 flex-1 mx-3 bg-cyan-400/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyan-400 animate-pulse-slow"></div>
                </div>
                <span className="font-mono text-xs text-cyan-400">LIVE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-cyan-400/20 p-2 rounded-sm bg-black/40">
                  <div className="text-xs text-cyan-400/70 font-mono mb-1">Aimbot Accuracy</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-cyber">98.5%</span>
                    <div className="w-1/2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-[98.5%] bg-cyan-400"></div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-pink-500/20 p-2 rounded-sm bg-black/40">
                  <div className="text-xs text-pink-500/70 font-mono mb-1">ESP Range</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-cyber">250m</span>
                    <div className="w-1/2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-pink-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-20"></div>
      
      {/* Animated line across bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyan-400/50 z-30"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-[1px] bg-cyan-400 z-30 animate-[line-scan_3s_ease-in-out_infinite_alternate]"></div>
    </section>
  );
}

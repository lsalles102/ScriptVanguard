import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [adminPulse, setAdminPulse] = useState(false);
  const isMobile = useIsMobile();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Admin notification pulsing effect
  useEffect(() => {
    if (isAdmin) {
      const interval = setInterval(() => {
        setAdminPulse(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/guide", label: t("nav.guide") },
    { href: "/reviews", label: t("nav.reviews") },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="relative z-50">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500"></div>
      
      <nav className={`fixed w-full border-b border-cyan-500/20 backdrop-blur-md transition-all duration-300 ${
        scrolled 
          ? 'py-2 bg-black/90 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
          : 'py-4 bg-black/70'
      }`}>
        <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2 relative">
            <Link href="/" className="flex items-center gap-2 group">
              <div className={`w-10 h-10 flex items-center justify-center transition-all duration-500 ${
                scrolled ? 'rounded-sm' : 'rounded'
              }`}>
                <div className="relative">
                  {/* Logo background with glow */}
                  <div className={`absolute inset-0 rounded-sm bg-black border border-cyan-400/50 transform transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]`}></div>
                  
                  {/* Logo corners */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-cyan-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-cyan-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400"></div>
                  
                  {/* Logo letter */}
                  <span className="relative z-10 font-cyber font-bold text-cyan-400 text-xl group-hover:text-cyan-300 transform transition-all duration-300 inline-block group-hover:scale-110 pulse-glow-text">F</span>
                </div>
              </div>
              
              <h1 className="font-cyber font-bold text-2xl text-white transition-all duration-300 group-hover:scale-[1.03]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 text-2xl">FOV</span>
                <span className="text-white">DARK</span>
              </h1>
            </Link>
            
            {/* Status indicator for admins */}
            {isAdmin && (
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 ${adminPulse ? 'animate-ping' : ''}`}></div>
            )}
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`font-cyber text-white/80 text-sm uppercase tracking-wide relative group overflow-hidden px-1 py-2`}
              >
                <span className={`relative z-10 transition-colors duration-300 ${
                  location === link.href 
                    ? 'text-cyan-400' 
                    : 'group-hover:text-cyan-400'
                }`}>
                  {link.label}
                </span>
                
                {/* Hover bottom border effect */}
                <span className={`absolute bottom-0 left-0 w-full h-[2px] transition-transform duration-300 transform ${
                  location === link.href 
                    ? 'bg-cyan-400 scale-x-100' 
                    : 'bg-cyan-400/50 scale-x-0 group-hover:scale-x-100'
                }`}></span>
                
                {/* Active indicator triangle */}
                {location === link.href && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-cyan-400 rotate-45"></span>
                )}
              </Link>
            ))}
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center gap-3 border-r border-cyan-500/20 pr-4">
              <LanguageSwitcher />
            </div>
            
            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="w-20 h-8 bg-cyan-400/10 rounded-sm animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* User avatar */}
                  <Link href="/profile" className="relative group">
                    <div className="w-8 h-8 rounded-sm overflow-hidden border border-cyan-400/30 group-hover:border-cyan-400/70 transition-all duration-300">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt={user.email || "User"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-cyan-400/10 text-cyan-400">
                          {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black"></div>
                  </Link>
                  
                  {/* Dropdown button */}
                  {!isMobile && (
                    <div className="relative group">
                      <Button
                        variant="link"
                        className="text-sm font-cyber text-white/80 hover:text-cyan-400 transition-colors duration-300 h-8 px-2"
                      >
                        {user?.firstName || user?.email?.split('@')[0] || t("nav.account")}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1"
                        >
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </Button>
                      
                      {/* Dropdown menu */}
                      <div className="absolute right-0 top-full mt-1 w-48 bg-black border border-cyan-400/30 rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                        <div className="py-1">
                          {isAdmin && (
                            <Link 
                              href="/admin" 
                              className="block px-4 py-2 text-sm font-cyber text-pink-400 hover:bg-pink-400/10 transition-colors duration-200"
                            >
                              {t("nav.admin_panel")}
                            </Link>
                          )}
                          <Link 
                            href="/profile" 
                            className="block px-4 py-2 text-sm font-cyber text-white hover:bg-cyan-400/10 hover:text-cyan-400 transition-colors duration-200"
                          >
                            {t("nav.profile")}
                          </Link>
                          <Link 
                            href="/orders" 
                            className="block px-4 py-2 text-sm font-cyber text-white hover:bg-cyan-400/10 hover:text-cyan-400 transition-colors duration-200"
                          >
                            {t("nav.orders")}
                          </Link>
                          <button
                            onClick={async () => {
                              await supabase.auth.signOut();
                              window.location.href = "/";
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-cyber text-white hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
                          >
                            {t("nav.logout")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mobile logout button */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = "/";
                      }}
                      className="h-8 px-3 text-sm font-cyber text-white/80 hover:text-cyan-400 hover:bg-transparent"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="text-sm font-cyber text-white/80 hover:text-cyan-400 transition-colors duration-300 h-8"
                  >
                    <Link href="/login">
                      {t("nav.login")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-transparent border border-cyan-400/70 text-cyan-400 hover:bg-cyan-950/20 hover:border-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-sm h-8 px-4 text-sm font-cyber"
                  >
                    <Link href="/registrar">
                      {t("nav.register")}
                    </Link>
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile menu toggle */}
            <button 
              className="md:hidden text-white h-10 w-10 flex items-center justify-center"
              onClick={toggleMenu}
              aria-label="Toggle mobile menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 w-full h-0.5 bg-cyan-400 transform transition-all duration-300 ${
                  isMenuOpen ? 'top-3 rotate-45' : 'top-1'
                }`}></span>
                <span className={`absolute left-0 top-3 w-full h-0.5 bg-cyan-400 transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`absolute left-0 w-full h-0.5 bg-cyan-400 transform transition-all duration-300 ${
                  isMenuOpen ? 'top-3 -rotate-45' : 'top-5'
                }`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <div 
        className={`fixed top-[57px] left-0 w-full bg-black/95 backdrop-blur-md z-40 border-b border-cyan-500/20 transform transition-all duration-500 ${
          isMenuOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        <div className="container mx-auto py-6 px-6">
          <div className="flex flex-col gap-2">
            {navLinks.map((link, idx) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`font-cyber text-white hover:text-cyan-400 transition-all duration-200 py-3 pl-3 border-l-2 ${
                  location === link.href 
                    ? 'border-cyan-400 text-cyan-400' 
                    : 'border-transparent'
                } flex items-center transform hover:translate-x-2`}
                onClick={() => setIsMenuOpen(false)}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile-only links */}
            {isAuthenticated && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-2"></div>
                
                <Link 
                  href="/profile" 
                  className="font-cyber text-white hover:text-cyan-400 transition-all duration-200 py-3 pl-3 border-l-2 border-transparent flex items-center transform hover:translate-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.profile")}
                </Link>
                
                <Link 
                  href="/orders" 
                  className="font-cyber text-white hover:text-cyan-400 transition-all duration-200 py-3 pl-3 border-l-2 border-transparent flex items-center transform hover:translate-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.orders")}
                </Link>
                
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="font-cyber text-pink-400 hover:text-pink-300 transition-all duration-200 py-3 pl-3 border-l-2 border-transparent flex items-center transform hover:translate-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.admin_panel")}
                  </Link>
                )}
              </>
            )}
            
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-2"></div>
            
            <div className="flex items-center gap-4 py-3 pl-3">
              <span className="text-xs uppercase text-white/60 font-cyber">{t("language")}:</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}

import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import ProductCard from "./ProductCard";
import { Product } from "@shared/schema";
import { useState, useEffect } from "react";
import { cyberpunkGradient } from "@/lib/utils";

interface ProductsSectionProps {
  products: Product[];
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  // Alternate colors for product cards
  const colors = ["blue", "pink", "purple"] as const;

  // Handle parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate featured product
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <section id="products" className="py-20 bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div 
        className="absolute inset-0 cyberpunk-grid z-0"
        style={{ 
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      ></div>
      
      <div 
        className="absolute top-0 right-0 w-1/2 h-1/2 opacity-10 z-0" 
        style={{ transform: `translateY(${scrollY * 0.08}px) rotate(${scrollY * 0.02}deg)` }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#ff2a6d" d="M54.2,-76.3C70.3,-68.3,83.4,-53.9,88.7,-37.5C94,-21.1,91.4,-2.7,85.4,13.1C79.4,28.9,70,42.1,58.4,53.8C46.8,65.5,33,75.6,16.9,79.4C0.7,83.2,-17.8,80.7,-33.6,73.2C-49.4,65.6,-62.4,53,-72.2,37.7C-81.9,22.4,-88.3,4.5,-87.2,-13.6C-86.1,-31.7,-77.5,-50,-64,-63.8C-50.5,-77.5,-32.1,-86.8,-13.3,-88.2C5.6,-89.6,38.1,-84.2,54.2,-76.3Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 scanline opacity-10 pointer-events-none z-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center mb-16">
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <div className="inline-block mb-4">
              <div className="text-xs md:text-sm uppercase tracking-wider font-cyber text-pink-500 mb-2 flex items-center">
                <span className="inline-block w-8 h-[1px] bg-pink-500 mr-2"></span>
                {t("products_section.featured")}
              </div>
            </div>
            
            <h2 className="font-cyber text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="block">{t("products_section.title_1")}</span>
              <span className="text-transparent bg-clip-text" 
                style={{ backgroundImage: cyberpunkGradient("#00f0ff", "#ff2a6d") }}>
                {t("products_section.title_2")}
              </span>
            </h2>
            
            <p className="text-muted-foreground max-w-xl text-lg mb-8">
              {t("products_section.subtitle")}
            </p>
            
            <div className="flex space-x-4">
              <Button asChild className="bg-transparent border-2 border-cyan-400/70 text-cyan-400 hover:bg-cyan-950/30 hover:border-cyan-400 cyber-btn rounded-sm px-6 py-6 font-cyber">
                <Link href="/products">
                  {t("products_section.explore")}
                </Link>
              </Button>
              
              <div className="hidden md:flex space-x-1">
                {products.slice(0, 3).map((_, idx) => (
                  <button 
                    key={idx}
                    className={`w-3 h-3 rounded-full ${activeIndex === idx ? 'bg-cyan-400' : 'bg-gray-700'}`}
                    onClick={() => setActiveIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 md:pl-10">
            <div className="relative cyber-window">
              {/* Corner decorations */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-pink-500 z-20"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-pink-500 z-20"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-pink-500 z-20"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-pink-500 z-20"></div>
              
              <div className="relative p-1 border-2 border-pink-500/70 rounded-sm shadow-[0_0_15px_rgba(255,42,109,0.3)]">
                <div className="absolute top-0 w-full h-5 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center px-2 z-20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-black/50"></div>
                    <div className="w-2 h-2 rounded-full bg-black/30"></div>
                    <div className="w-2 h-2 rounded-full bg-black/10"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center py-8 px-4 bg-black/60 pt-8">
                  <div className="text-center">
                    <h3 className="font-cyber text-2xl font-bold text-pink-500 mb-2">
                      {products[activeIndex]?.name || "Loading..."}
                    </h3>
                    
                    <div className="mb-3 flex justify-center">
                      <div className="px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded-sm">
                        <span className="text-xs font-mono text-pink-400">
                          {products[activeIndex]?.price ? `${products[activeIndex]?.price} USD` : "0.00 USD"}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {products[activeIndex]?.shortDescription || "Loading description..."}
                    </p>
                    
                    <Button asChild className="bg-gradient-to-r from-pink-500/90 to-purple-600/90 border-none text-white hover:from-pink-500 hover:to-purple-500 shadow-[0_0_15px_rgba(255,42,109,0.3)] hover:shadow-[0_0_25px_rgba(255,42,109,0.5)] rounded-sm px-4 py-2 text-sm">
                      <Link href={`/products/${products[activeIndex]?.slug || "#"}`}>
                        {t("products_section.details")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              color={colors[index % colors.length]}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button asChild className="inline-block bg-transparent border-2 border-purple-500/50 text-purple-400 hover:border-purple-500 hover:bg-purple-950/20 rounded-sm px-8 py-6 font-cyber relative overflow-hidden group">
            <Link href="/products">
              <span className="relative z-10">{t("products_section.view_all")}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-0 h-px bg-pink-500 animate-line-scan"></div>
    </section>
  );
}

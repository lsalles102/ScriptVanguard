import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  color?: "blue" | "pink" | "purple";
}

export default function ProductCard({ product, color = "blue" }: ProductCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Define color variations
  const colorVariants = {
    blue: {
      colorClass: "cyan",
      primary: "#00f0ff",
      secondary: "#055b94",
      bgGlow: "shadow-[0_0_15px_rgba(0,240,255,0.2)]",
      hoverGlow: "group-hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]",
      borderGlow: "group-hover:border-cyan-400",
      text: "text-cyan-400",
      textHover: "group-hover:text-cyan-300",
      buttonGradient: "from-cyan-500/90 to-blue-500/80",
      buttonHover: "hover:from-cyan-400 hover:to-blue-400",
    },
    pink: {
      colorClass: "pink",
      primary: "#ff2a6d",
      secondary: "#d11c69",
      bgGlow: "shadow-[0_0_15px_rgba(255,42,109,0.2)]",
      hoverGlow: "group-hover:shadow-[0_0_25px_rgba(255,42,109,0.4)]",
      borderGlow: "group-hover:border-pink-500",
      text: "text-pink-500",
      textHover: "group-hover:text-pink-400",
      buttonGradient: "from-pink-500/90 to-purple-500/80",
      buttonHover: "hover:from-pink-400 hover:to-purple-400",
    },
    purple: {
      colorClass: "purple",
      primary: "#7000ff",
      secondary: "#5f00d4",
      bgGlow: "shadow-[0_0_15px_rgba(112,0,255,0.2)]",
      hoverGlow: "group-hover:shadow-[0_0_25px_rgba(112,0,255,0.4)]",
      borderGlow: "group-hover:border-purple-500",
      text: "text-purple-500",
      textHover: "group-hover:text-purple-400",
      buttonGradient: "from-purple-500/90 to-indigo-500/80",
      buttonHover: "hover:from-purple-400 hover:to-indigo-400",
    },
  };
  
  const colorClasses = colorVariants[color];
  
  // Randomly trigger glitch effect
  useEffect(() => {
    if (isHovered) {
      const glitchTimeout = setTimeout(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }, Math.random() * 2000 + 1000);
      
      return () => clearTimeout(glitchTimeout);
    }
  }, [isHovered]);

  return (
    <div 
      className={`product-card bg-black border border-${colorClasses.colorClass}-500/30 relative overflow-hidden rounded-sm transition-all duration-300 ${colorClasses.bgGlow} ${colorClasses.hoverGlow} ${colorClasses.borderGlow} transform group hover:-translate-y-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Corner elements */}
      <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-${colorClasses.colorClass}-500 z-10 transition-all duration-300 opacity-50 group-hover:opacity-100`}></div>
      <div className={`absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-${colorClasses.colorClass}-500 z-10 transition-all duration-300 opacity-50 group-hover:opacity-100`}></div>
      <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-${colorClasses.colorClass}-500 z-10 transition-all duration-300 opacity-50 group-hover:opacity-100`}></div>
      <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-${colorClasses.colorClass}-500 z-10 transition-all duration-300 opacity-50 group-hover:opacity-100`}></div>
      
      {/* Vertical side light */}
      <div className={`absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-${colorClasses.colorClass}-500 via-transparent to-transparent opacity-50 group-hover:opacity-80`}></div>
      
      {/* Product image */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 border-b border-${colorClasses.colorClass}-500/30 z-10 pointer-events-none`}></div>
        <img 
          src={product.imageUrl || "https://pixabay.com/get/g1891a2213814653ce217951e9f14ee4a81c04c28da18fa6878954067fa77eee619c085395814e8d905f967a87222eb43140d3f20ac6c9f56ee0ba4550be217a6_1280.jpg"} 
          alt={product.name} 
          className={`w-full h-48 object-cover transition-all duration-500 ${isGlitching ? 'scale-[1.02] translate-x-[2px] brightness-150' : 'scale-100'}`}
        />
        
        {/* Overlay with scanlines */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-70"></div>
        <div className="absolute inset-0 scanline opacity-40 pointer-events-none"></div>
        
        {/* Status indicator */}
        {product.isBestseller && (
          <div className={`absolute top-3 right-3 bg-${colorClasses.colorClass}-500/20 ${colorClasses.text} px-3 py-1 rounded-sm text-xs font-cyber border border-${colorClasses.colorClass}-500/50 backdrop-blur-sm z-20`}>
            <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            {t("product.bestseller")}
          </div>
        )}
        
        {/* Image glitch overlay */}
        {isGlitching && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent z-20"></div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6 relative">
        {/* Product title with glitch effect */}
        <h3 className={`font-cyber text-xl font-bold mb-3 ${colorClasses.text} ${colorClasses.textHover} transition-colors duration-300 ${isGlitching ? 'text-glitch' : ''}`}>
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-4 text-[#ffb300]">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg 
              key={star}
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transform transition-transform duration-300 group-hover:scale-110"
              style={{ transitionDelay: `${star * 50}ms` }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span className="text-muted-foreground text-xs ml-1">(127)</span>
        </div>
        
        {/* Description */}
        <div className="text-muted-foreground mb-5 text-sm">
          <p>{product.shortDescription}</p>
        </div>
        
        {/* Features list with animated marker */}
        {product.features && Array.isArray(product.features) && product.features.length > 0 && (
          <ul className="space-y-2 mb-5">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className={`inline-block mt-1 w-1.5 h-1.5 rounded-full bg-${colorClasses.colorClass}-500 group-hover:animate-pulse flex-shrink-0`}></span>
                <span className="text-sm text-white/80">{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        {/* Price and action */}
        <div className="flex justify-between items-center mt-6 relative">
          <div className="font-cyber">
            <span className={`${colorClasses.text} font-bold text-xl`}>
              {formatPrice(product.price)}
            </span>
            <span className="text-muted-foreground text-xs ml-1">/mês</span>
          </div>
          
          <Button 
            asChild 
            className={`relative bg-gradient-to-r ${colorClasses.buttonGradient} ${colorClasses.buttonHover} border-none text-white shadow-[0_0_10px_rgba(0,0,0,0.3)] rounded-sm px-4 py-2 font-cyber text-sm overflow-hidden group-hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300`}
          >
            <Link href={`/products/${product.slug}`}>
              <span className="relative z-10">
                {t("product.purchase")}
              </span>
              <span className="absolute inset-0 bg-black/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Bottom highlight line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${colorClasses.colorClass}-500/70 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-500`}></div>
    </div>
  );
}

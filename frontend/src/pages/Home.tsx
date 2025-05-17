import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ProductsSection from "@/components/ProductsSection";
import SalesSection from "@/components/SalesSection";
import ReviewsSection from "@/components/ReviewsSection";
import GuideSection from "@/components/GuideSection";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/lib/i18n";

const ProductsLoader = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-muted/30 rounded-lg overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const { t } = useTranslation();
  
  const { data: products, isLoading } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  // Preload products for the ProductsSection
  const ProductsWithData = () => {
    if (isLoading) return <ProductsLoader />;
    if (!products || !Array.isArray(products)) return null;
    
    const featuredProducts = products.slice(0, 3);
    return <ProductsSection products={featuredProducts} />;
  };

  return (
    <>
      <Helmet>
        <title>{t("meta.home.title")} | FovDark</title>
        <meta name="description" content={t("meta.home.description")} />
        <meta property="og:title" content={t("meta.home.title") + " | FovDark"} />
        <meta property="og:description" content={t("meta.home.description")} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <HeroSection />
      <FeaturesSection />
      <ProductsWithData />
      <SalesSection />
      <ReviewsSection />
      <GuideSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}

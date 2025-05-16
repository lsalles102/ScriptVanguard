import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${slug}`],
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/products/${product?.id}/reviews`],
    enabled: !!product?.id,
  });

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: t("product_detail.login_required"),
        description: t("product_detail.login_message"),
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    setIsProcessing(true);
    try {
      const orderData = {
        total: product.price,
        status: "pending",
        paymentMethod: "credit_card",
        items: [
          {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        ],
      };

      await apiRequest("POST", "/api/orders", orderData);
      
      toast({
        title: t("product_detail.purchase_success"),
        description: t("product_detail.purchase_message"),
      });
      
      // Redirect to the dashboard or order confirmation page
    } catch (error) {
      toast({
        title: t("product_detail.purchase_error"),
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format price from cents to dollars
  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/4 mb-8" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-3/4 mb-8" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-cyber text-3xl mb-4">{t("product_detail.not_found")}</h1>
        <p className="text-muted-foreground mb-8">{t("product_detail.not_found_message")}</p>
        <Button asChild>
          <Link href="/products">{t("product_detail.back_to_products")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | FovDark</title>
        <meta name="description" content={product.shortDescription || product.description.slice(0, 160)} />
        <meta property="og:title" content={product.name + " | FovDark"} />
        <meta property="og:description" content={product.shortDescription || product.description.slice(0, 160)} />
        <meta property="og:type" content="product" />
      </Helmet>
      
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative">
              <div className="rounded-lg overflow-hidden shadow-xl shadow-primary/10 border border-muted/30">
                <img 
                  src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt={product.name} 
                  className="w-full h-auto" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              </div>
              
              {product.isBestseller && (
                <div className="absolute top-4 right-4 bg-primary/20 text-primary px-3 py-2 rounded font-cyber text-sm">
                  {t("product_detail.bestseller")}
                </div>
              )}
              
              <div className="absolute -bottom-4 -left-4 p-4 bg-background border border-primary/30 rounded shadow-lg max-w-xs">
                <div className="mb-3 font-mono text-xs text-primary">FovDark Premium Features</div>
                <div className="bg-card rounded p-3 font-mono text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00ff66]">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Anti-Ban Technology</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00ff66]">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00ff66]">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Weekly Updates</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Details */}
            <div>
              <h1 className="font-cyber text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-1 mb-6 text-[#ffb300]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-muted-foreground text-sm ml-1">
                  (127 {t("product_detail.reviews")})
                </span>
              </div>
              
              <div className="text-2xl font-cyber font-bold text-primary mb-6">
                {formatPrice(product.price)}
                <span className="text-muted-foreground text-sm ml-1">/month</span>
              </div>
              
              <div className="mb-8">
                <p className="text-muted-foreground mb-4">{product.description}</p>
                
                {product.features && Array.isArray(product.features) && (
                  <div className="mt-4">
                    <h3 className="font-cyber font-semibold mb-2">{t("product_detail.key_features")}</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1 shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <Button 
                className="cyber-btn px-6 py-6 bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 transition duration-300 rounded-md font-cyber"
                onClick={handlePurchase}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("product_detail.processing")}
                  </div>
                ) : t("product_detail.purchase_button")}
              </Button>
              
              {!isAuthenticated && (
                <p className="text-muted-foreground text-sm mt-2">
                  {t("product_detail.login_to_purchase")}
                </p>
              )}
              
              <div className="mt-8">
                <Accordion type="single" collapsible>
                  <AccordionItem value="system-requirements" className="border-muted/30">
                    <AccordionTrigger className="hover:no-underline">
                      <h3 className="font-cyber font-semibold">
                        {t("product_detail.system_requirements")}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• {t("product_detail.system.os")}</li>
                        <li>• {t("product_detail.system.processor")}</li>
                        <li>• {t("product_detail.system.memory")}</li>
                        <li>• {t("product_detail.system.storage")}</li>
                        <li>• {t("product_detail.system.directx")}</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="delivery" className="border-muted/30">
                    <AccordionTrigger className="hover:no-underline">
                      <h3 className="font-cyber font-semibold">
                        {t("product_detail.delivery")}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        {t("product_detail.delivery_info")}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="refund-policy" className="border-muted/30">
                    <AccordionTrigger className="hover:no-underline">
                      <h3 className="font-cyber font-semibold">
                        {t("product_detail.refund_policy")}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        {t("product_detail.refund_info")}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="mt-16">
            <h2 className="font-cyber text-2xl font-bold mb-6 border-b border-muted/30 pb-4">
              {t("product_detail.customer_reviews")}
            </h2>
            
            {reviewsLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-card p-6 rounded-lg border border-muted/30">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-card p-6 rounded-lg border border-muted/30">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-cyber font-bold text-primary">
                            {review.userId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-cyber font-semibold">User_{review.userId.substring(0, 6)}</h4>
                          <p className="text-muted-foreground text-xs">Verified Buyer</p>
                        </div>
                      </div>
                      <div className="flex gap-1 text-[#ffb300]">
                        {Array(5).fill(0).map((_, i) => (
                          <svg 
                            key={i}
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill={i < review.rating ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            strokeWidth="1" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {review.comment}
                    </p>
                    <div className="text-muted-foreground/50 text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card/30 rounded-lg border border-muted/30">
                <h3 className="font-cyber text-xl mb-2">{t("product_detail.no_reviews")}</h3>
                <p className="text-muted-foreground">{t("product_detail.be_first")}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

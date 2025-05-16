import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Review {
  id: number;
  userId: string;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
}

export default function Reviews() {
  const { t } = useTranslation();
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingCounts = () => {
    if (!reviews) return [0, 0, 0, 0, 0];
    
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      counts[5 - review.rating]++;
    });
    
    return counts;
  };

  const ratingCounts = getRatingCounts();
  const totalReviews = reviews?.length || 0;

  const getProductName = (productId: number) => {
    if (!products) return "Unknown Product";
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const filteredReviews = reviews?.filter(review => {
    // Filter by rating
    const ratingMatch = filterRating === "all" || review.rating === parseInt(filterRating);
    
    // Filter by product
    const productMatch = filterProduct === "all" || review.productId === parseInt(filterProduct);
    
    return ratingMatch && productMatch;
  });

  // Define the schema for the review form
  const formSchema = z.object({
    productId: z.string().min(1, { message: t("reviews_page.form.product_required") }),
    rating: z.string().min(1, { message: t("reviews_page.form.rating_required") }),
    comment: z.string().min(10, { message: t("reviews_page.form.comment_min") }).max(500, { message: t("reviews_page.form.comment_max") }),
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      rating: "",
      comment: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isAuthenticated) {
      toast({
        title: t("reviews_page.login_required"),
        description: t("reviews_page.login_message"),
        variant: "destructive",
      });
      return;
    }

    try {
      const reviewData = {
        productId: parseInt(values.productId),
        rating: parseInt(values.rating),
        comment: values.comment,
      };

      await apiRequest("POST", "/api/reviews", reviewData);
      
      toast({
        title: t("reviews_page.review_success"),
        description: t("reviews_page.review_message"),
      });
      
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      
      // Close the dialog and reset the form
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: t("reviews_page.review_error"),
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("meta.reviews.title")} | FovDark</title>
        <meta name="description" content={t("meta.reviews.description")} />
        <meta property="og:title" content={t("meta.reviews.title") + " | FovDark"} />
        <meta property="og:description" content={t("meta.reviews.description")} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="font-cyber text-4xl md:text-5xl font-bold mb-4">
              {t("reviews_page.title_1")} <span className="text-[#ff2a6d] neon-pink-text">{t("reviews_page.title_2")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("reviews_page.subtitle")}
            </p>
          </div>
          
          {/* Review summary */}
          {!reviewsLoading && reviews && (
            <div className="max-w-4xl mx-auto bg-card border border-muted/30 rounded-lg p-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center md:border-r md:border-muted/30 flex flex-col justify-center items-center">
                  <div className="text-5xl font-cyber font-bold text-primary mb-2">
                    {getAverageRating()}
                  </div>
                  <div className="flex gap-1 mb-2 text-[#ffb300]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-muted-foreground">
                    {t("reviews_page.based_on")} {totalReviews} {t("reviews_page.reviews")}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="font-cyber text-lg font-semibold mb-4">
                    {t("reviews_page.rating_breakdown")}
                  </h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-24">
                          <span>{rating}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#ffb300]">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </div>
                        <div className="flex-1 bg-background rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${totalReviews ? (ratingCounts[5 - rating] / totalReviews) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right text-muted-foreground text-sm">
                          {ratingCounts[5 - rating]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-muted/30">
                <p className="text-muted-foreground">
                  {t("reviews_page.verified_purchases")}
                </p>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className="cyber-btn px-4 py-2 bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 transition duration-300 rounded font-cyber">
                      {t("reviews_page.write_review")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-muted p-0 sm:max-w-[500px]">
                    <DialogHeader className="p-6 pb-0">
                      <DialogTitle className="font-cyber text-xl">
                        {t("reviews_page.write_review")}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="productId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("reviews_page.form.product")}</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-card border-muted">
                                      <SelectValue placeholder={t("reviews_page.form.select_product")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {!productsLoading && products?.map((product) => (
                                      <SelectItem key={product.id} value={product.id.toString()}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("reviews_page.form.rating")}</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-card border-muted">
                                      <SelectValue placeholder={t("reviews_page.form.select_rating")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="5">5 {t("reviews_page.form.stars")} - {t("reviews_page.form.excellent")}</SelectItem>
                                    <SelectItem value="4">4 {t("reviews_page.form.stars")} - {t("reviews_page.form.good")}</SelectItem>
                                    <SelectItem value="3">3 {t("reviews_page.form.stars")} - {t("reviews_page.form.average")}</SelectItem>
                                    <SelectItem value="2">2 {t("reviews_page.form.stars")} - {t("reviews_page.form.fair")}</SelectItem>
                                    <SelectItem value="1">1 {t("reviews_page.form.star")} - {t("reviews_page.form.poor")}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("reviews_page.form.comment")}</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder={t("reviews_page.form.comment_placeholder")} 
                                    className="bg-card border-muted resize-none h-32"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  {field.value.length}/500 {t("reviews_page.form.characters")}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              className="cyber-btn px-4 py-2 bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 transition duration-300 rounded font-cyber"
                            >
                              {t("reviews_page.form.submit")}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="font-cyber text-2xl font-bold">
              {t("reviews_page.customer_reviews")}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select 
                value={filterRating} 
                onValueChange={setFilterRating}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-card border-muted">
                  <SelectValue placeholder={t("reviews_page.filter_rating")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reviews_page.all_ratings")}</SelectItem>
                  <SelectItem value="5">5 {t("reviews_page.form.stars")}</SelectItem>
                  <SelectItem value="4">4 {t("reviews_page.form.stars")}</SelectItem>
                  <SelectItem value="3">3 {t("reviews_page.form.stars")}</SelectItem>
                  <SelectItem value="2">2 {t("reviews_page.form.stars")}</SelectItem>
                  <SelectItem value="1">1 {t("reviews_page.form.star")}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filterProduct} 
                onValueChange={setFilterProduct}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-card border-muted">
                  <SelectValue placeholder={t("reviews_page.filter_product")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reviews_page.all_products")}</SelectItem>
                  {!productsLoading && products?.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Reviews list */}
          {reviewsLoading ? (
            <div className="space-y-6">
              {Array(4).fill(0).map((_, i) => (
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
          ) : filteredReviews && filteredReviews.length > 0 ? (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-card p-6 rounded-lg border border-muted/30">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
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
                    <div>
                      <div className="flex gap-1 text-[#ffb300] mb-1">
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
                      <p className="text-sm text-muted-foreground">
                        {getProductName(review.productId)}
                      </p>
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
            <div className="text-center py-16 bg-card/30 rounded-lg border border-muted/30">
              <h3 className="font-cyber text-xl mb-2">{t("reviews_page.no_reviews")}</h3>
              <p className="text-muted-foreground">{t("reviews_page.try_different_filters")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Product } from "@shared/schema";

export default function Products() {
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const filteredProducts = products?.filter(product => {
    // Filter by category
    const categoryMatch = categoryFilter === "all" || product.categoryId === parseInt(categoryFilter);
    
    // Filter by search query
    const searchMatch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  // Alternate colors for product cards
  const colors = ["blue", "pink", "purple"] as const;

  return (
    <>
      <Helmet>
        <title>{t("meta.products.title")} | FovDark</title>
        <meta name="description" content={t("meta.products.description")} />
        <meta property="og:title" content={t("meta.products.title") + " | FovDark"} />
        <meta property="og:description" content={t("meta.products.description")} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <section className="relative py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-cyber text-4xl md:text-5xl font-bold mb-4">
              {t("products.title")} <span className="text-primary neon-text">{t("products.title_accent")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("products.subtitle")}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="w-full md:w-auto">
              <Input 
                placeholder={t("products.search_placeholder")} 
                className="bg-card border-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full md:w-[200px] bg-card border-muted">
                  <SelectValue placeholder={t("products.category_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.all_categories")}</SelectItem>
                  {!categoriesLoading && categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
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
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  color={colors[index % colors.length]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card/30 rounded-lg border border-muted/30">
              <h3 className="font-cyber text-xl mb-2">{t("products.no_results")}</h3>
              <p className="text-muted-foreground">{t("products.try_different")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

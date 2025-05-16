
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { GameAccount } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatPrice } from "@/lib/utils";
import { insertGameAccountSchema } from "@shared/schema";
import { Helmet } from "react-helmet";

export default function Marketplace() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: accounts, isLoading, refetch } = useQuery({
    queryKey: ['/api/accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json();
    }
  });

  const form = useForm({
    resolver: zodResolver(insertGameAccountSchema),
    defaultValues: {
      title: '',
      description: '',
      game: '',
      price: 0,
      imageUrl: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating account listing:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("marketplace.title")} | FovDark</title>
        <meta name="description" content={t("marketplace.description")} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-cyber text-primary mb-2">{t("marketplace.title")}</h1>
            <p className="text-muted-foreground">{t("marketplace.subtitle")}</p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
              {t("marketplace.create_listing")}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts?.map((account: GameAccount) => (
              <div key={account.id} className="bg-card/80 border border-primary/20 rounded-lg overflow-hidden hover:border-primary/40 transition-colors">
                {account.imageUrl && (
                  <img src={account.imageUrl} alt={account.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-cyber mb-2">{account.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{account.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-cyber">{formatPrice(account.price)}</span>
                    <Button variant="outline" className="hover:bg-primary hover:text-white">
                      {t("marketplace.buy_now")}
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="bg-primary/10 px-2 py-1 rounded">{account.game}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("marketplace.create_listing")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("marketplace.form.title")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("marketplace.form.description")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="game"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("marketplace.form.game")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("marketplace.form.price")}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("marketplace.form.image")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{t("marketplace.form.submit")}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

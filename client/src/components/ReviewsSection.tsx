import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";

interface ReviewProps {
  username: string;
  initial: string;
  color: "blue" | "pink" | "purple";
  rating: number;
  comment: string;
  date: string;
  product: string;
}

const Review = ({ username, initial, color, rating, comment, date, product }: ReviewProps) => {
  // Define color variations
  const colorVariants = {
    blue: {
      bg: "bg-primary/20",
      text: "text-primary",
    },
    pink: {
      bg: "bg-[#ff2a6d]/20",
      text: "text-[#ff2a6d]",
    },
    purple: {
      bg: "bg-[#7000ff]/20",
      text: "text-[#7000ff]",
    },
  };
  
  const colorClasses = colorVariants[color];

  // Render stars based on rating
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        // Full star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      } else if (i - 0.5 <= rating) {
        // Half star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77v-8.82l-3.94 2.4L12 2z" />
            <path d="M12 8.95v8.82l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2" fill="none" />
          </svg>
        );
      } else {
        // Empty star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      }
    }
    
    return stars;
  };

  return (
    <div className="bg-background p-6 rounded-lg border border-muted/30 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colorClasses.bg} flex items-center justify-center`}>
            <span className={`font-cyber font-bold ${colorClasses.text}`}>{initial}</span>
          </div>
          <div>
            <h4 className="font-cyber font-semibold">{username}</h4>
            <p className="text-muted-foreground text-xs">Verified Buyer</p>
          </div>
        </div>
        <div className="flex gap-1 text-[#ffb300]">
          {renderStars()}
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-3">
        "{comment}"
      </p>
      <div className="text-muted-foreground/50 text-xs">
        {date} | {product}
      </div>
    </div>
  );
};

export default function ReviewsSection() {
  const { t } = useTranslation();
  
  const reviews = [
    {
      username: "ShadowSniper",
      initial: "S",
      color: "blue" as const,
      rating: 5,
      comment: t("reviews.review_1.comment"),
      date: t("reviews.review_1.date"),
      product: t("reviews.review_1.product"),
    },
    {
      username: "Vortex420",
      initial: "V",
      color: "pink" as const,
      rating: 4.5,
      comment: t("reviews.review_2.comment"),
      date: t("reviews.review_2.date"),
      product: t("reviews.review_2.product"),
    },
    {
      username: "RapidFire",
      initial: "R",
      color: "purple" as const,
      rating: 5,
      comment: t("reviews.review_3.comment"),
      date: t("reviews.review_3.date"),
      product: t("reviews.review_3.product"),
    },
    {
      username: "HeadHunter",
      initial: "H",
      color: "blue" as const,
      rating: 4,
      comment: t("reviews.review_4.comment"),
      date: t("reviews.review_4.date"),
      product: t("reviews.review_4.product"),
    },
    {
      username: "NinjaStrike",
      initial: "N",
      color: "pink" as const,
      rating: 5,
      comment: t("reviews.review_5.comment"),
      date: t("reviews.review_5.date"),
      product: t("reviews.review_5.product"),
    },
    {
      username: "PhantomX",
      initial: "P",
      color: "purple" as const,
      rating: 4.5,
      comment: t("reviews.review_6.comment"),
      date: t("reviews.review_6.date"),
      product: t("reviews.review_6.product"),
    },
  ];

  return (
    <section id="reviews" className="py-16 bg-card relative diagonal-box-reverse">
      <div className="absolute inset-0 tech-pattern opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-cyber text-3xl md:text-4xl font-bold mb-4">
            {t("reviews.title_1")} <span className="text-[#ff2a6d] neon-pink-text">{t("reviews.title_2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("reviews.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Review key={index} {...review} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button asChild className="inline-block cyber-btn px-6 py-3 bg-card border border-muted/50 text-foreground hover:text-[#ff2a6d] hover:border-[#ff2a6d]/50 transition duration-300 rounded font-cyber">
            <Link href="/reviews">
              {t("reviews.read_more")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

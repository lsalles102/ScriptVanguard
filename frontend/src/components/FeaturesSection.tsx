import { useTranslation } from "@/lib/i18n";

const featureIcons = {
  aimbot: (
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
      <path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10z" />
      <path d="M12 6v12" />
      <path d="M6 12h12" />
    </svg>
  ),
  esp: (
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
      <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />
      <path d="M12 16v-4" />
      <path d="M8 16v-4" />
      <path d="M16 8v4" />
      <path d="M12 8h4" />
      <path d="M12 12h4" />
    </svg>
  ),
  recoil: (
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
      <path d="M6 18h12" />
      <path d="M18 9 7 9" />
      <path d="M12 18v-9" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  ),
  speed: (
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
      <path d="M5 16V9h14V2" />
      <path d="M19 15v7" />
      <path d="M5 22V9" />
      <path d="m2 13 3-3 3 3" />
      <path d="m19 8-3 3-3-3" />
    </svg>
  ),
  detection: (
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
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="16" r="1" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ui: (
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
      <path d="M12 2H2v10h10V2Z" />
      <path d="M22 2h-5v5h5V2Z" />
      <path d="M22 12h-5v10h5V12Z" />
      <path d="M12 17h-5v5h5v-5Z" />
      <path d="M7 12H2v-2h5v2Z" />
    </svg>
  ),
};

export default function FeaturesSection() {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: featureIcons.aimbot,
      title: t("features.aimbot.title"),
      description: t("features.aimbot.desc"),
      color: "neon-blue",
    },
    {
      icon: featureIcons.esp,
      title: t("features.esp.title"),
      description: t("features.esp.desc"),
      color: "neon-pink",
    },
    {
      icon: featureIcons.recoil,
      title: t("features.recoil.title"),
      description: t("features.recoil.desc"),
      color: "neon-purple",
    },
    {
      icon: featureIcons.speed,
      title: t("features.speed.title"),
      description: t("features.speed.desc"),
      color: "neon-blue",
    },
    {
      icon: featureIcons.detection,
      title: t("features.detection.title"),
      description: t("features.detection.desc"),
      color: "neon-pink",
    },
    {
      icon: featureIcons.ui,
      title: t("features.ui.title"),
      description: t("features.ui.desc"),
      color: "neon-purple",
    },
  ];

  return (
    <section id="features" className="py-16 bg-background relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-cyber text-3xl md:text-4xl font-bold mb-4">
            {t("features.title_1")} <span className="text-primary neon-text">{t("features.title_2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border border-muted/30 rounded-lg p-6 hover:border-primary/50 transition duration-300 group"
            >
              <div className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-4 text-${feature.color} group-hover:bg-${feature.color}/20 transition duration-300`}>
                {feature.icon}
              </div>
              <h3 className="font-cyber text-xl font-semibold mb-2 group-hover:text-primary transition duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

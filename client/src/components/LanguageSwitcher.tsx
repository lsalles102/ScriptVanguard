import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => changeLanguage("pt")} 
        className={`hover:text-primary transition duration-300 p-1 ${language === "pt" ? "text-primary neon-text" : ""}`}
        aria-label="Portuguese"
      >
        PT
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => changeLanguage("en")} 
        className={`hover:text-primary transition duration-300 p-1 ${language === "en" ? "text-primary neon-text" : ""}`}
        aria-label="English"
      >
        EN
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => changeLanguage("es")} 
        className={`hover:text-primary transition duration-300 p-1 ${language === "es" ? "text-primary neon-text" : ""}`}
        aria-label="Spanish"
      >
        ES
      </Button>
    </>
  );
}

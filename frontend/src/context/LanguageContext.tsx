import { createContext, useState, useContext, useEffect, ReactNode } from "react";

type Language = "en" | "pt" | "es";

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  changeLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Try to get the language from localStorage or use browser language
  const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return "en";
    
    const savedLanguage = localStorage.getItem("fovdark_language") as Language;
    if (savedLanguage && ["en", "pt", "es"].includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === "pt") return "pt";
    if (browserLang === "es") return "es";
    
    return "en";
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage());

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("fovdark_language", lang);
  };

  useEffect(() => {
    // Update html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

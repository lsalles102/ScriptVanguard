import { useLanguage } from "@/context/LanguageContext";
import { enTranslations } from "./translations/en";
import { ptTranslations } from "./translations/pt";
import { esTranslations } from "./translations/es";

// Define the translations object type
type Translations = typeof enTranslations;

// Map of available translations
const translations: Record<string, Translations> = {
  en: enTranslations,
  pt: ptTranslations,
  es: esTranslations,
};

// Type for the path to a translation
type TranslationPath = keyof Translations | (string & {});

// A utility function to get a nested property using a dot notation path
function getNestedProperty(obj: any, path: string): string {
  return path.split('.').reduce((prev, curr) => {
    return prev && prev[curr] !== undefined ? prev[curr] : undefined;
  }, obj);
}

export function useTranslation() {
  const { language } = useLanguage();
  
  // The translation function that accepts a key path
  const t = (key: TranslationPath, replacements?: Record<string, string>): string => {
    // Get the translations for the current language or fall back to English
    const currentTranslations = translations[language] || enTranslations;
    
    // Get the translation string using the key path
    let translatedText = getNestedProperty(currentTranslations, key);
    
    // Fallback to English if the translation is not found
    if (translatedText === undefined && language !== 'en') {
      translatedText = getNestedProperty(enTranslations, key) || key;
    }
    
    // Return the key itself if no translation is found
    if (translatedText === undefined) {
      return key;
    }
    
    // Replace placeholders with values if replacements are provided
    if (replacements) {
      for (const [key, value] of Object.entries(replacements)) {
        translatedText = translatedText.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }
    
    return translatedText;
  };
  
  return { t, language };
}

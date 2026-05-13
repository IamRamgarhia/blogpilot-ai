export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "en-US", name: "English (US)", nativeName: "English (US)" },
  { code: "en-GB", name: "English (UK)", nativeName: "English (UK)" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "es-ES", name: "Spanish (Spain)", nativeName: "Español (España)" },
  { code: "es-MX", name: "Spanish (Mexico)", nativeName: "Español (México)" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "fr-FR", name: "French (France)", nativeName: "Français (France)" },
  { code: "fr-CA", name: "French (Canada)", nativeName: "Français (Canada)" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "de-DE", name: "German (Germany)", nativeName: "Deutsch (Deutschland)" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português (Brasil)" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "he", name: "Hebrew", nativeName: "עברית", rtl: true },
  { code: "fa", name: "Persian", nativeName: "فارسی", rtl: true },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "zh-Hans", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-Hant", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" }
];

const BCP47_RX = /^([a-z]{2,3})(-[A-Z][a-z]{3})?(-[A-Z]{2})?$/;

export function isValidLanguageCode(code: string): boolean {
  if (code === "x-default") return true;
  return BCP47_RX.test(code);
}

export function findLanguage(code: string): LanguageMeta | undefined {
  return LANGUAGES.find((l) => l.code === code || l.code.startsWith(code + "-"));
}

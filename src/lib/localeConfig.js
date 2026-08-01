/** Base currency — all product prices in DB are stored in INR */
export const BASE_CURRENCY = "INR";

export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 1, locale: "en-IN" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 0.012, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.011, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.0095, locale: "en-GB" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 0.044, locale: "ar-AE" },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rate: 0.045, locale: "ar-SA" },
};

export const LANGUAGES = {
  en: { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  ar: { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  fr: { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
};

export const LOCALE_STORAGE_KEY = "tark_locale_prefs";

export const FREE_SHIPPING_THRESHOLD_INR = 999;

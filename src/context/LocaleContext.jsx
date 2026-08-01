"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  BASE_CURRENCY,
  CURRENCIES,
  FREE_SHIPPING_THRESHOLD_INR,
  LANGUAGES,
  LOCALE_STORAGE_KEY,
} from "@/lib/localeConfig";
import { translations } from "@/lib/translations";

const LocaleContext = createContext(null);

function loadPrefs() {
  if (typeof window === "undefined") {
    return { currency: BASE_CURRENCY, language: "en" };
  }
  try {
    const stored = JSON.parse(localStorage.getItem(LOCALE_STORAGE_KEY) || "{}");
    return {
      currency: CURRENCIES[stored.currency] ? stored.currency : BASE_CURRENCY,
      language: LANGUAGES[stored.language] ? stored.language : "en",
    };
  } catch {
    return { currency: BASE_CURRENCY, language: "en" };
  }
}

export function LocaleProvider({ children }) {
  const [currency, setCurrencyState] = useState(BASE_CURRENCY);
  const [language, setLanguageState] = useState("en");
  const [rates, setRates] = useState(CURRENCIES);
  const [ready, setReady] = useState(false);

  // Load saved prefs before paint to avoid English flash
  useLayoutEffect(() => {
    const prefs = loadPrefs();
    setCurrencyState(prefs.currency);
    setLanguageState(prefs.language);
    setReady(true);
  }, []);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) {
          setRates((prev) => {
            const updated = { ...prev };
            Object.entries(data.rates).forEach(([code, rate]) => {
              if (updated[code]) updated[code] = { ...updated[code], rate };
            });
            return updated;
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(
      LOCALE_STORAGE_KEY,
      JSON.stringify({ currency, language })
    );

    const lang = LANGUAGES[language];
    document.documentElement.lang = language;
    document.documentElement.dir = lang?.dir || "ltr";
  }, [currency, language, ready]);

  const setCurrency = useCallback((code) => {
    if (CURRENCIES[code]) setCurrencyState(code);
  }, []);

  const setLanguage = useCallback((code) => {
    if (LANGUAGES[code]) setLanguageState(code);
  }, []);

  const formatPrice = useCallback(
    (amountInInr, options = {}) => {
      const num = Number(amountInInr) || 0;
      const cur = rates[currency] || rates[BASE_CURRENCY];
      const converted = num * cur.rate;

      const formatted = new Intl.NumberFormat(cur.locale, {
        style: "currency",
        currency: cur.code,
        minimumFractionDigits: cur.code === "INR" ? 0 : 2,
        maximumFractionDigits: cur.code === "INR" ? 0 : 2,
        ...options,
      }).format(converted);

      return formatted;
    },
    [currency, rates]
  );

  const t = useCallback(
    (key, vars = {}) => {
      const dict = translations[language] || translations.en;
      let text = dict[key] || translations.en[key] || key;

      Object.entries(vars).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, String(v));
      });

      return text;
    },
    [language]
  );

  const freeShippingThreshold = useMemo(() => {
    const cur = rates[currency] || rates[BASE_CURRENCY];
    return FREE_SHIPPING_THRESHOLD_INR * cur.rate;
  }, [currency, rates]);

  const value = useMemo(
    () => ({
      currency,
      language,
      setCurrency,
      setLanguage,
      formatPrice,
      t,
      currencies: CURRENCIES,
      languages: LANGUAGES,
      freeShippingThresholdInr: FREE_SHIPPING_THRESHOLD_INR,
      freeShippingThreshold,
    }),
    [currency, language, setCurrency, setLanguage, formatPrice, t, freeShippingThreshold]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

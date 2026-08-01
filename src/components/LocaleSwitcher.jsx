"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function LocaleSwitcher({ variant = "dark" }) {
  const { currency, language, setCurrency, setLanguage, currencies, languages, t } =
    useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDark = variant === "dark";
  const btnClass = isDark
    ? "text-gray-200 hover:text-white"
    : "text-gray-600 hover:text-indigo-600";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-xs sm:text-sm transition ${btnClass}`}
        aria-label="Change currency and language"
        aria-expanded={open}
      >
        <Globe size={14} />
        <span className="hidden sm:inline">
          {currencies[currency]?.code} / {languages[language]?.nativeName}
        </span>
        <span className="sm:hidden">{currencies[currency]?.symbol}</span>
        <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border z-[60] p-3 space-y-3 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t("locale.currency")}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-field py-2 text-sm text-gray-800"
            >
              {Object.values(currencies).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t("locale.language")}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field py-2 text-sm text-gray-800"
            >
              {Object.values(languages).map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

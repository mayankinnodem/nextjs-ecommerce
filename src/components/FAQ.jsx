"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { pickLocalized } from "@/lib/i18nContent";

export default function FAQ() {
  const { t, language } = useLocale();
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    fetch("/api/admin/faq")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFaqs(data.faqs);
      })
      .catch(() => {});
  }, []);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-block bg-white">
      <div className="page-container max-w-3xl">
        <div className="section-header-center">
          <h2 className="section-title">{t("faq.title")}</h2>
        </div>

        <div className="space-y-3">
          {faqs.slice(0, 6).map((f, index) => (
            <div key={f._id} className="card overflow-hidden">
              <button
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index}
                className="w-full flex justify-between items-start gap-4 px-5 py-4 text-left hover:bg-gray-50/80 transition"
              >
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  {pickLocalized(f, "question", language, f.question)}
                </span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-indigo-600 transition-transform duration-300 mt-0.5 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                  {pickLocalized(f, "answer", language, f.answer)}
                </div>
              )}
            </div>
          ))}

          {faqs.length === 0 && (
            <p className="text-center text-gray-500 py-8">{t("faq.noFaqs")}</p>
          )}

          {faqs.length > 6 && (
            <div className="text-center pt-4">
              <Link href="/faq" className="btn-primary inline-block px-8 py-3 rounded-full">
                {t("faq.viewAll")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

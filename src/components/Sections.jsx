"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { pickLocalized } from "@/lib/i18nContent";
import { Sparkles } from "lucide-react";

const Sections = ({ section }) => {
  const { t, language } = useLocale();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!section) return;

    fetch("/api/store/sections")
      .then((res) => res.json())
      .then((json) => {
        const selected = json?.banners?.find((item) => item.section === section);
        setData(selected || null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [section]);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="page-container py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="skeleton h-12 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="flex gap-3 pt-2">
              <div className="skeleton h-12 w-36 rounded-xl" />
              <div className="skeleton h-12 w-36 rounded-xl" />
            </div>
          </div>
          <div className="skeleton h-64 md:h-96 rounded-3xl" />
        </div>
      </section>
    );
  }

  const bannerUrl = data?.bannerUrl?.url;
  const title = pickLocalized(data, "title", language, t("hero.defaultTitle"));
  const subtitle = pickLocalized(data, "subtitle", language, t("hero.defaultSubtitle"));
  const button1 = pickLocalized(data, "buttonText1", language, t("hero.shopNow"));
  const button2 = pickLocalized(data, "buttonText2", language, t("hero.learnMore"));

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="page-container py-10 sm:py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 relative">
        <div className="animate-fadeIn order-2 md:order-1">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles size={14} />
            {t("hero.shopNow")}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-[1.15] tracking-tight">
            {title}
          </h1>

          <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed max-w-xl">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              onClick={() => router.push("/shop")}
              className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto"
            >
              {button1}
            </button>
            <Link href="/about" className="btn-secondary px-8 py-3.5 text-base text-center w-full sm:w-auto">
              {button2}
            </Link>
          </div>
        </div>

        <div className="flex justify-center animate-fadeIn order-1 md:order-2">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={title || "Hero banner"}
              className="rounded-3xl max-h-[280px] sm:max-h-[380px] md:max-h-[440px] w-full object-cover shadow-2xl shadow-indigo-200/50 ring-1 ring-black/5"
            />
          ) : (
            <div className="w-full max-h-[440px] aspect-[4/3] rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shadow-inner ring-1 ring-indigo-200/50">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-indigo-700 font-semibold text-lg">
                  {t("hero.placeholder")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Sections;

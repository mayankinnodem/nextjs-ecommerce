"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

import { pickLocalized } from "@/lib/i18nContent";

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
      <section className="bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="skeleton h-12 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="flex gap-3 pt-2">
              <div className="skeleton h-11 w-32" />
              <div className="skeleton h-11 w-32" />
            </div>
          </div>
          <div className="skeleton h-72 md:h-96 rounded-2xl" />
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
    <section className="bg-gradient-to-br from-indigo-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        <div className="animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            {title}
          </h1>

          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/shop")}
              className="btn-primary px-6 py-3"
            >
              {button1}
            </button>
            <Link
              href="/about"
              className="px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              {button2}
            </Link>
          </div>
        </div>

        <div className="flex justify-center animate-fadeIn">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={title || "Hero banner"}
              className="rounded-2xl max-h-[420px] w-full object-cover shadow-lg"
            />
          ) : (
            <div className="w-full max-h-[420px] aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-inner">
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

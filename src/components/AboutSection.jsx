"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { pickLocalized } from "@/lib/i18nContent";

const AboutSection = () => {
  const { t, language } = useLocale();
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetch("/api/store/about", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setAbout(data?.about))
      .catch(() => setAbout(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="page-container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </section>
    );
  }

  if (!about) return null;

  const title = pickLocalized(about, "title", language, t("about.defaultTitle"));
  const subtitle = pickLocalized(about, "subtitle", language, "");
  const description = pickLocalized(about, "description", language, t("about.defaultDescription"));

  return (
    <section className="section-block bg-gradient-to-b from-white to-gray-50">
      <div className="page-container grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">{title}</h2>
          {subtitle && (
            <p className="text-lg text-indigo-600 mt-2 font-medium">{subtitle}</p>
          )}
          <p className="mt-5 text-gray-600 leading-relaxed">{description}</p>

          {about.stats?.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-8">
              {about.stats.map((s, i) => (
                <div key={i} className="card p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {pickLocalized(s, "label", language, s.label)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {about.image?.url && !imageError && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={about.image.url}
              alt="About us"
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;

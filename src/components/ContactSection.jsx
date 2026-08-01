"use client";

import React, { useEffect, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "./ContactForm";
import { useLocale } from "@/context/LocaleContext";
import { pickLocalized } from "@/lib/i18nContent";

const ContactSection = () => {
  const { t, language } = useLocale();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/store/contact-section", {
      cache: "force-cache",
      next: { revalidate: 600 },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-block bg-gray-50">
        <div className="page-container grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="skeleton h-10 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <p className="text-center py-10 text-red-500">{t("contact.notFound")}</p>
    );
  }

  return (
    <section className="section-block bg-gradient-to-b from-gray-50 to-indigo-50/30">
      <div className="page-container grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-5">
          {data.icon?.url && (
            <img
              src={data.icon.url}
              alt=""
              className="w-14 h-14 object-contain"
            />
          )}

          <div>
            <h2 className="section-title">
              {pickLocalized(data, "title", language, t("contact.defaultTitle"))}
            </h2>
            <p className="section-subtitle mt-2">
              {pickLocalized(data, "description", language, t("contact.defaultDescription"))}
            </p>
          </div>

          <div className="space-y-3">
            {data.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-700 hover:text-indigo-600 transition card px-4 py-3"
              >
                <MapPin size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <span className="text-sm">{data.address}</span>
              </a>
            )}
            {data.phone && (
              <a
                href={`tel:${data.phone}`}
                className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition card px-4 py-3"
              >
                <Phone size={18} className="text-indigo-600 shrink-0" />
                <span className="text-sm">{data.phone}</span>
              </a>
            )}
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition card px-4 py-3"
              >
                <Mail size={18} className="text-indigo-600 shrink-0" />
                <span className="text-sm break-all">{data.email}</span>
              </a>
            )}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

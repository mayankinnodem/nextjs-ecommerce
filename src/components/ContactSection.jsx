"use client";

import React, { useEffect, useState } from "react";
import ContactForm from "./ContactForm";
import { useLocale } from "@/context/LocaleContext";
import { pickLocalized } from "@/lib/i18nContent";

const ContactSection = () => {
  const { t, language } = useLocale();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContactData = async () => {
    try {
      const res = await fetch("/api/store/contact-section", {
        cache: 'force-cache', // Cache to reduce server load
        next: { revalidate: 600 }, // Revalidate every 10 minutes
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      let json = {};
      try {
        json = await res.json();
      } catch {
        console.error("Empty or invalid JSON response");
        return;
      }

      if (json.success && json.data) {
        setData(json.data);
      } else {
        console.error(json.message || "No data found");
      }
    } catch (err) {
      console.error("GET ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  if (loading) {
    return <p className="text-center py-10">{t("contact.loading")}</p>;
  }

  if (!data) {
    return (
      <p className="text-center py-10 text-red-500">{t("contact.notFound")}</p>
    );
  }

  return (
    <section className="bg-gray-100 py-12 text-gray-900">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {/* ✅ Icon from Cloudinary */}
          {data.icon?.url && (
            <img
              src={data.icon.url}
              alt="Contact Icon"
              className="w-16 h-16 object-contain"
            />
          )}

          <h2 className="text-3xl font-bold">
            {pickLocalized(data, "title", language, t("contact.defaultTitle"))}
          </h2>
          <p className="text-gray-700">
            {pickLocalized(data, "description", language, t("contact.defaultDescription"))}
          </p>

          <div className="space-y-2">
            {data.address && <p>📍 {data.address}</p>}
            {data.phone && <p>📞 {data.phone}</p>}
            {data.email && <p>✉️ {data.email}</p>}
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
};

export default ContactSection;

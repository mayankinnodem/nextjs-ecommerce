"use client";

import React, { useEffect, useState } from "react";
import ContactForm from "./ContactForm";

const ContactSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch contact section data from store API
  const fetchContactData = async () => {
    try {
      const res = await fetch("/api/store/contact-section", {
        cache: "no-store", // always fresh
      });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
      } else {
        console.error("Failed to load contact data:", json.error || json.message);
      }
    } catch (error) {
      console.error("GET ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  if (loading) return <p className="text-center py-10 text-gray-600">Loading...</p>;

  if (!data) return <p className="text-center py-10 text-red-500">Contact info not found.</p>;

  return (
    <section className="bg-gray-100 py-12 text-gray-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* ✅ LEFT CONTACT INFO */}
        <div className="space-y-5">

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {data.title || "Get in Touch"}
          </h2>
          <p className="text-gray-600 mb-6">{data.description || "We’d love to hear from you."}</p>

          <div className="space-y-3 text-gray-700">
            {data.address && <p>📍 {data.address}</p>}
            {data.phone && <p>📞 {data.phone}</p>}
            {data.email && <p>✉️ {data.email}</p>}
          </div>
        </div>

        {/* ✅ RIGHT: CONTACT FORM */}
        <ContactForm />
      </div>
    </section>
  );
};

export default ContactSection;

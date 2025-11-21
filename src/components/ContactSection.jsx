"use client";

import React, { useEffect, useState } from "react";
import ContactForm from "./ContactForm";

const ContactSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContactData = async () => {
    try {
      const res = await fetch("/api/store/contact-section", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("API request failed");

      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        console.error(json.message);
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

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!data) return <p className="text-center py-10 text-red-500">Contact info not found.</p>;

  return (
    <section className="bg-gray-100 py-12 text-gray-900">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-bold">{data.title}</h2>
          <p>{data.description}</p>
          <p>📍 {data.address}</p>
          <p>📞 {data.phone}</p>
          <p>✉️ {data.email}</p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
};

export default ContactSection;

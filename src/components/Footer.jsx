"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch("/api/store/contact-section", { cache: "no-store" });
        const json = await res.json();
        console.log("Footer API Response:", json); // 🧠 Debug check
        if (json.success) setContact(json.data);
      } catch (err) {
        console.error("Footer fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  if (loading) return <footer className="text-center p-4">Loading...</footer>;

  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* ✅ Branding Section */}
        <div>
          {contact?.logo?.url && (
            <img
              src={contact.logo.url}
              alt="Logo"
              className="h-14 mb-4 object-contain"
            />
          )}
          <h2 className="text-2xl font-bold text-white mb-4">
            {contact?.title || "Contact Us"}
          </h2>
          <p className="text-sm">{contact?.description}</p>
        </div>

        {/* ✅ Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/shop" className="hover:text-white">Shop</a></li>
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* ✅ Customer Service */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
          <ul className="space-y-2">
            <li><a href="faq" className="hover:text-white">FAQ</a></li>
            <li><a href="#" className="hover:text-white">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* ✅ Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <p className="text-sm">📍 {contact?.address}</p>
          <p className="text-sm">📞 {contact?.phone}</p>
          <p className="text-sm">✉️ {contact?.email}</p>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Innodem Private Limited. All Rights Reserved.
      </div>
    </footer>
  );
}

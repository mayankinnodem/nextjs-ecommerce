"use client";

import { useEffect, useState } from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch("/api/store/contact-section", { cache: "no-store" });
        const json = await res.json();
        if (json.success) setContact(json.data);
      } catch (err) {
        console.error("Footer fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  if (loading)
    return (
      <footer className="bg-gray-900 text-center py-10 text-gray-400">
        Loading footer...
      </footer>
    );

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300 pt-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Branding */}
        <div>
          {contact?.logo?.url && (
            <img
              src={contact.logo.url}
              alt="Logo"
              className="h-14 mb-4 object-contain"
            />
          )}
          <h2 className="text-2xl font-bold text-white mb-3">
            {contact?.title || "Contact Us"}
          </h2>
          <p className="text-sm leading-relaxed text-gray-400">
            {contact?.description}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition">Home</a></li>
            <li><a href="/shop" className="hover:text-white transition">Shop</a></li>
            <li><a href="/about" className="hover:text-white transition">About Us</a></li>
            <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Contact Info + Social */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2"><MapPin size={16} /> {contact?.address}</p>
            <p className="flex items-center gap-2"><Phone size={16} /> {contact?.phone}</p>
            <p className="flex items-center gap-2"><Mail size={16} /> {contact?.email}</p>
          </div>

          <div className="flex gap-4 mt-5">
            <a href="#" className="hover:text-white transition"><Facebook size={20} /></a>
            <a href="#" className="hover:text-white transition"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white transition"><Twitter size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Innodem Private Limited. All Rights Reserved.
      </div>
    </footer>
  );
}
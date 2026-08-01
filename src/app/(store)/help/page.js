"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEnvelope, FaPhone } from "react-icons/fa";

export default function HelpPage() {
  const [contact, setContact] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const faqCategories = [
    {
      category: "Orders",
      faqs: [
        {
          question: "How can I place an order?",
          answer:
            "Browse products, add items to your cart, and proceed to checkout. You can pay via Cash on Delivery or online payment.",
        },
        {
          question: "Can I cancel my order?",
          answer:
            "Pending orders can be cancelled from your account dashboard under My Orders.",
        },
      ],
    },
    {
      category: "Shipping",
      faqs: [
        {
          question: "What are the shipping charges?",
          answer:
            "Standard shipping is ₹99. Orders above ₹999 qualify for free shipping.",
        },
        {
          question: "How do I track my order?",
          answer:
            "Use the Track Order page with your Order ID, or check status in My Orders after logging in.",
        },
      ],
    },
    {
      category: "Returns & Refunds",
      faqs: [
        {
          question: "What is the return policy?",
          answer:
            "Most products can be returned within 15 days of delivery. See our Shipping & Returns page for details.",
        },
        {
          question: "How long do refunds take?",
          answer:
            "Refunds are processed within 5–7 business days after the returned product is received.",
        },
      ],
    },
  ];

  useEffect(() => {
    fetch("/api/store/contact-section")
      .then((r) => r.json())
      .then((d) => setContact(d?.data || null))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormMessage("");

    if (!form.name || !form.email || !form.message) {
      setFormError("Please fill in name, email, and message.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/store/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        setFormMessage("Message sent! Our team will get back to you soon.");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setFormError(json.error || "Failed to send message.");
      }
    } catch {
      setFormError("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Help & Support
          </h1>
          <p className="text-gray-600 mt-2">
            Find answers below or reach out to our team directly.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {faqCategories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {cat.category}
              </h2>
              <div className="space-y-2">
                {cat.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group border rounded-lg p-4 bg-gray-50 hover:bg-gray-100/80 transition"
                  >
                    <summary className="font-medium text-gray-800 cursor-pointer list-none flex justify-between items-center">
                      {faq.question}
                      <span className="text-indigo-500 group-open:rotate-45 transition text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Contact Us
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8 text-gray-700">
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 hover:text-indigo-600 transition"
              >
                <FaEnvelope className="text-indigo-500" /> {contact.email}
              </a>
            )}
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 hover:text-indigo-600 transition"
              >
                <FaPhone className="text-emerald-500" /> {contact.phone}
              </a>
            )}
          </div>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
            <input
              type="text"
              placeholder="Your Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
            <input
              type="email"
              placeholder="Your Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
            />
            <textarea
              placeholder="Your Message *"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input-field"
              rows={5}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
            {formError && <div className="alert-error text-sm">{formError}</div>}
            {formMessage && (
              <div className="alert-success text-sm">{formMessage}</div>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Or visit our{" "}
            <Link href="/contact" className="text-indigo-600 hover:underline">
              Contact page
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

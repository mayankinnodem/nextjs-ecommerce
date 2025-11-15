"use client";

import { useEffect, useState } from "react";

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Load FAQs from API
  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await fetch("/api/admin/faq"); // <-- correct API
        const data = await res.json();

        // Ensure data is an array
        if (Array.isArray(data)) {
          setFaqs(data);
        } else if (data.faqs && Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        } else {
          setFaqs([]);
        }
      } catch (error) {
        console.error("FAQ load error:", error);
        setFaqs([]);
      }
    }

    loadFaqs();
  }, []);

  // Filter logic (question + answer)
  const filteredFaqs = faqs.filter((faq) => {
    const t = searchText.toLowerCase();
    return (
      faq.question.toLowerCase().includes(t) ||
      faq.answer.toLowerCase().includes(t)
    );
  });

  return (
    <section className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Frequently Asked Questions
      </h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search questions or answers..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="border p-3 rounded-lg w-full mb-6 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div
              key={faq._id}
              className="border p-4 rounded-lg shadow-sm bg-white"
            >
              <h3 className="font-semibold text-lg">{faq.question}</h3>
              <p className="text-gray-700 mt-1">{faq.answer}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 pt-6">
            No matching FAQs found.
          </p>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/faq");
      const data = await res.json();
      if (data.success) setFaqs(data.faqs);
    }
    load();
  }, []);

  return (
    <section className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>

      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f._id} className="border p-4 rounded shadow-sm">
            <h3 className="font-semibold text-lg">{f.question}</h3>
            <p className="text-gray-700 mt-1">{f.answer}</p>
          </div>
        ))}

        {faqs.length === 0 && (
          <p className="text-center text-gray-500">No FAQs available.</p>
        )}
      </div>
    </section>
  );
}

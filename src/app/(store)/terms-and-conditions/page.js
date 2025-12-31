"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

export default function TermsConditionsPage() {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    fetch("/api/store/contact-section")
      .then(res => res.ok ? res.json() : null)
      .then(json => json?.success && setContact(json.data))
      .catch(() => {});
  }, []);

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>

        <div className="space-y-7 text-sm text-gray-700 leading-relaxed">
          <p>
            These Terms & Conditions govern your access to and use of our
            website, products, and services. By using this website, you agree
            to be bound by these terms.
          </p>

          <h2 className="text-lg font-semibold">Website Usage</h2>
          <p>
            Content on this website is provided for general information and
            shopping purposes. We reserve the right to modify or discontinue
            any part of the website without notice.
          </p>

          <h2 className="text-lg font-semibold">Product Information</h2>
          <p>
            Product descriptions, pricing, availability, and images may change
            without prior notice. In case of errors, we reserve the right to
            cancel or refuse any order.
          </p>

          <h2 className="text-lg font-semibold">Orders & Payments</h2>
          <p>
            Placing an order does not guarantee acceptance. Orders may be
            canceled due to payment failure, stock issues, pricing errors, or
            suspected fraudulent activity.
          </p>

          <h2 className="text-lg font-semibold">Limitation of Liability</h2>
          <p>
            Our liability, if any, shall be limited to the value of the product
            purchased. We shall not be liable for indirect or consequential
            damages.
          </p>

          <h2 className="text-lg font-semibold">Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be
            subject to the jurisdiction of Indian courts.
          </p>
        </div>

        {contact?.email && (
          <div className="mt-10 border-t pt-6 text-sm">
            <p className="flex gap-2 items-center">
              <Mail size={16} />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
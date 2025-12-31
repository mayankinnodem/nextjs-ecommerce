"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-7 text-sm text-gray-700 leading-relaxed">
          <p>
            We value your privacy and are committed to protecting your personal
            information. This Privacy Policy explains how data is collected,
            used, and safeguarded when you use our website or services.
          </p>

          <h2 className="text-lg font-semibold">Information We Collect</h2>
          <p>
            We may collect personal information such as name, phone number,
            email address, billing and shipping address, and order details.
            Payment transactions are processed securely through certified
            payment gateways. We do not store card or banking information.
          </p>

          <h2 className="text-lg font-semibold">Use of Information</h2>
          <p>
            Collected data is used for order processing, delivery coordination,
            customer support, communication of updates, fraud prevention, and
            improvement of our services and website experience.
          </p>

          <h2 className="text-lg font-semibold">Data Sharing & Security</h2>
          <p>
            Information is shared only with trusted third-party service providers
            such as logistics partners and payment processors, strictly for
            operational purposes. Appropriate technical and organizational
            security measures are implemented to protect your data.
          </p>

          <h2 className="text-lg font-semibold">Policy Updates</h2>
          <p>
            We may update this policy periodically. Continued use of our website
            constitutes acceptance of the updated Privacy Policy.
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

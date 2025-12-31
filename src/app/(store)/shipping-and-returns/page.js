"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ShippingReturnsPage() {
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
        <h1 className="text-3xl font-bold mb-8">
          Shipping, Returns & Refund Policy
        </h1>

        <div className="space-y-7 text-sm text-gray-700 leading-relaxed">

          <p>
            We are committed to providing a smooth, transparent, and reliable
            shopping experience. This policy explains how orders are processed,
            shipped, and handled in case of returns, replacements, or refunds.
            These terms apply to <b>all products sold on our website</b>.
          </p>

          {/* SHIPPING */}
          <h2 className="text-lg font-semibold">Shipping Information</h2>
          <p>
            Orders are processed within <b>1–3 business days</b> after successful
            payment confirmation. We ship across India using trusted courier
            partners to ensure safe and timely delivery.
          </p>
          <p>
            Estimated delivery timelines range between <b>4–8 business days</b>,
            depending on the customer’s location and courier availability.
            Delivery timelines are indicative and may vary due to external
            factors beyond our control.
          </p>
          <p>
            Any applicable shipping charges are clearly displayed at checkout.
            Once dispatched, tracking details are shared via email or SMS.
          </p>

          {/* RETURNS */}
          <h2 className="text-lg font-semibold">
            Returns, Replacements & Refunds
          </h2>

          <ul className="list-disc pl-5 space-y-3">
            <li>
              Requests for return or replacement must be raised within
              <b> 48 hours of delivery</b>. Requests submitted after this period
              will not be eligible for review.
            </li>

            <li>
              Returns or replacements are accepted <b>only</b> under the
              following conditions:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Product received is damaged</li>
                <li>Product received is defective</li>
                <li>Product delivered is incorrect</li>
              </ul>
            </li>

            <li>
              Returns or refunds are <b>not applicable</b> for:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Change of mind or personal preference</li>
                <li>Incorrect product selection by the customer</li>
                <li>Minor color or design variations due to screen differences</li>
                <li>Products damaged after delivery</li>
              </ul>
            </li>

            <li>
              Customers must provide <b>clear photos and/or an unboxing video</b>
              as proof. Requests without sufficient evidence may be declined.
            </li>

            <li>
              Returned items must be unused, unwashed, and in original packaging
              with all tags, labels, and accessories intact.
            </li>

            <li>
              Replacement is preferred over refund wherever possible. Refunds
              are processed only if replacement is not feasible.
            </li>

            <li>
              Approved refunds are initiated within <b>5–7 business days</b> to
              the original payment method. Shipping charges, if any, are
              non-refundable.
            </li>

            <li>
              We reserve the right to approve or reject any request after product
              inspection. Our decision shall be final.
            </li>
          </ul>
        </div>

        {contact && (
          <div className="mt-12 border-t pt-6 space-y-2 text-sm">
            <h3 className="font-semibold">Support Contact</h3>
            {contact.email && (
              <p className="flex gap-2 items-center">
                <Mail size={16} />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            )}
            {contact.phone && (
              <p className="flex gap-2 items-center">
                <Phone size={16} />
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              </p>
            )}
            {contact.address && (
              <p className="flex gap-2 items-start">
                <MapPin size={16} />
                {contact.address}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

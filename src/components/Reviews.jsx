"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  const loadReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      const data = await res.json();

      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.log("Error loading reviews", error);
      setReviews([]);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <section className="py-16 px-4 md:px-12 bg-gradient-to-b from-gray-50 to-white">
      <h2 className="text-4xl font-bold text-center mb-4">
        What Our Customers Say
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
        Real feedback from customers who trust our products and services.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="flex flex-col items-center">
              {review.photo ? (
                <img
                  src={review.photo}
                  alt={review.name}
                  className="w-24 h-24 object-cover rounded-full border-4 border-white shadow -mt-16 mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 -mt-16 mb-4 flex items-center justify-center text-xl font-bold text-gray-500">
                  {review.name?.charAt(0)}
                </div>
              )}

              <h3 className="text-lg font-semibold text-center">
                {review.name}
              </h3>
              <p className="text-sm text-gray-400 text-center mb-3">
                {review.email}
              </p>

              <div className="flex justify-center mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < review.rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="text-gray-700 text-center italic leading-relaxed">
                “{review.review}”
              </p>
            </div>
          </motion.div>
        ))}

        {reviews.length === 0 && (
          <p className="text-center col-span-full text-gray-500">
            No reviews found.
          </p>
        )}
      </div>
    </section>
  );
}
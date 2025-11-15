"use client";

import { useEffect, useState } from "react";

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
    <section className="py-12 px-4 md:px-12">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="border rounded-lg p-6 shadow-sm hover:shadow-md transition bg-white"
          >
            {review.photo ? (
              <img
                src={review.photo}
                alt={review.name}
                className="w-20 h-20 object-cover rounded-full mx-auto mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4" />
            )}

            <h3 className="text-lg font-semibold text-center">{review.name}</h3>
            <p className="text-sm text-gray-500 text-center mb-3">{review.email}</p>

            <div className="flex justify-center mb-3">
              {Array.from({ length: review.rating }).map((_, i) => (
                <span key={i} className="text-yellow-500 text-lg">★</span>
              ))}
            </div>

            <p className="text-gray-700 text-center italic">"{review.review}"</p>
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="text-center col-span-3 text-gray-500">No reviews found.</p>
        )}
      </div>
    </section>
  );
}
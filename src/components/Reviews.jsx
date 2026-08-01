"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";

export default function Reviews() {
  const { t } = useLocale();
  const [reviews, setReviews] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch("/api/store/reviews", { next: { revalidate: 60 } })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setReviews(data.reviews || []);
      })
      .catch(() => {});
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -350 : 350,
      behavior: "smooth",
    });
  };

  if (!reviews.length) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <h2 className="text-4xl font-bold text-center mb-4">{t("reviews.title")}</h2>
      <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
        {t("reviews.subtitle")}
      </p>

      <div className="relative max-w-[1400px] mx-auto">
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full items-center justify-center"
          aria-label="Previous reviews"
        >
          ‹
        </button>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full items-center justify-center"
          aria-label="Next reviews"
        >
          ›
        </button>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scroll-smooth px-8 pb-6 no-scrollbar"
        >
          {reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[320px] bg-white rounded-2xl shadow-lg p-6 pt-12"
            >
              <div className="flex flex-col items-center text-center">
                {review.photo ? (
                  <img
                    src={review.photo}
                    alt={review.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow -mt-12 mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 -mt-12 mb-3 flex items-center justify-center text-xl font-bold text-gray-500">
                    {review.name?.charAt(0)}
                  </div>
                )}

                <h3 className="text-lg font-semibold">{review.name}</h3>

                <div className="flex my-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`text-lg ${
                        idx < review.rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 text-sm italic leading-relaxed mt-2">
                  "{review.review}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

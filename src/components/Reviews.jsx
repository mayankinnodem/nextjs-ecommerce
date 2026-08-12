"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  if (!reviews.length) return null;

  return (
    <section className="section-block bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="page-container">
        <div className="section-header-center">
          <h2 className="section-title">{t("reviews.title")}</h2>
          <p className="section-subtitle">{t("reviews.subtitle")}</p>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full flex items-center justify-center hidden sm:flex hover:bg-gray-50 transition border"
            aria-label="Previous reviews"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full flex items-center justify-center hidden sm:flex hover:bg-gray-50 transition border"
            aria-label="Next reviews"
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth px-1 pb-4 snap-x snap-mandatory scrollbar-hide"
          >
            {reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="snap-start shrink-0 w-[78vw] max-w-[300px] sm:w-[300px] md:w-[320px] card p-5 sm:p-6 pt-12 relative"
              >
                <div className="flex flex-col items-center text-center">
                  {review.photo ? (
                    <img
                      src={review.photo}
                      alt={review.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-md -mt-10 mb-3"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-100 -mt-10 mb-3 flex items-center justify-center text-xl font-bold text-indigo-600">
                      {review.name?.charAt(0)}
                    </div>
                  )}

                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {review.name}
                  </h3>

                  <div className="flex my-2" aria-label={`${review.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`text-base sm:text-lg ${
                          idx < review.rating ? "text-amber-400" : "text-gray-200"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mt-1 line-clamp-4">
                    &ldquo;{review.review}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-2 sm:hidden">
            ← Swipe to see more →
          </p>
        </div>
      </div>
    </section>
  );
}

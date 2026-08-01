"use client";

import { useState } from "react";

const PLACEHOLDER = "/placeholder.svg";

export default function ProductGallery({ images = [], name = "Product" }) {
  const validImages = images.filter((img) => img?.url);
  const [active, setActive] = useState(0);

  const mainSrc = validImages[active]?.url || PLACEHOLDER;

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl border bg-gray-50 shadow-sm">
        <img
          src={mainSrc}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {validImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                active === i
                  ? "border-indigo-600 ring-2 ring-indigo-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={img.url}
                alt={`${name} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

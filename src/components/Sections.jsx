"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Sections = ({ section }) => {
  const [data, setData] = useState(null);
  const router = useRouter();

  const fetchBanner = async () => {
    try {
      const res = await fetch("/api/store/sections");
      const json = await res.json();

      const selected = json?.banners?.find(
        (item) => item.section === section
      );
      setData(selected);
    } catch (error) {
      console.log("Banner API Error:", error);
    }
  };

  useEffect(() => {
    if (section) fetchBanner();
  }, [section]);

  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-10">

        {/* LEFT */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {data?.title || (
              <>
                Discover the Best{" "}
                <span className="text-blue-600">E-Commerce</span> Deals
              </>
            )}
          </h1>

          <p className="text-gray-600 mb-6">
            {data?.subtitle ||
              "Shop the latest products with unbeatable prices. Fast delivery, secure payments, and 24/7 customer support."}
          </p>

          <div className="flex gap-4">
            {/* SHOP PAGE */}
            <button
              onClick={() => router.push("/shop")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {data?.buttonText1 || "Shop Now"}
            </button>

            {/* ABOUT PAGE */}
            <button
              onClick={() => router.push("/about")}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              {data?.buttonText2 || "Learn More"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex justify-center">
          <img
            src={
              data?.bannerUrl?.url 
              // ||
              // "https://i.pinimg.com/1200x/96/87/ea/9687ead19117c1f09dd535bf5163a2b9.jpg"
            }
            alt="Banner"
            className="rounded-2xl max-h-[520px] object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Sections;

import React from "react";

const Banner = ({ bannerUrl }) => {
  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        
        {/* Left Side - Text */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Discover the Best <span className="text-blue-600">E-Commerce</span> Deals
          </h1>
          <p className="text-gray-600 mb-6">
            Shop the latest products with unbeatable prices. Fast delivery,
            secure payments, and 24/7 customer support.
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Shop Now
            </button>
            <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Side - Dynamic Image */}
        <div className="flex justify-center">
          <img
            src={bannerUrl || "https://i.pinimg.com/1200x/96/87/ea/9687ead19117c1f09dd535bf5163a2b9.jpg"} 
            alt="E-commerce Banner"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
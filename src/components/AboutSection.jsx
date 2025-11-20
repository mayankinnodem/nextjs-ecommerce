"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const AboutSection = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  useEffect(() => {
    async function fetchAbout() {
      try {
        const res = await fetch(`${baseUrl}/api/store/about`, {
          cache: "no-store",
        });
        const data = await res.json();
        setAbout(data?.about);
      } catch (error) {
        console.log("Error fetching about:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAbout();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {about?.title}
          </h2>

          <p className="text-lg text-gray-600 mt-3">{about?.subtitle}</p>

          <p className="mt-5 text-gray-700 leading-relaxed">
            {about?.description}
          </p>

          {/* ✅ Stats */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            {about?.stats?.map((s, i) => (
              <div key={i} className="flex items-center">
                <h3 className="text-md font-bold text-gray-900">{s.value}</h3>
                <p className="text-gray-600 ml-2">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT */}
        {about?.image?.url && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="relative w-full h-[450px]"
          >
            <Image
              src={about.image.url}
              alt="About Image"
              fill
              className="rounded-xl shadow-xl object-cover"
            />
            <div className="absolute inset-0 rounded-xl bg-black/10 backdrop-blur-[1px]" />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;

"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Basic validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";

    if (form.phone.trim()) {
      if (!/^\d{10}$/.test(form.phone))
        newErrors.phone = "Phone must be 10 digits";
    }

    if (!form.message.trim()) newErrors.message = "Message is required";
    else if (form.message.length < 10)
      newErrors.message = "Message must be at least 10 characters long";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Frontend spam check (localStorage-based)
  const checkLocalMessageLimit = (phone) => {
    const key = `messages_${phone}`;
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem(key) || "{}");

    // reset if old day
    if (data.date !== today) {
      localStorage.setItem(
        key,
        JSON.stringify({ date: today, count: 0 })
      );
      return false;
    }

    // block if >= 2
    if (data.count >= 2) {
      setStatus("⚠️ You can only send 2 messages per day from this phone.");
      return true;
    }

    return false;
  };

  const incrementLocalMessageCount = (phone) => {
    const key = `messages_${phone}`;
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem(key) || "{}");

    const newData = {
      date: today,
      count: data.date === today ? (data.count || 0) + 1 : 1,
    };

    localStorage.setItem(key, JSON.stringify(newData));
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // frontend limit check
    if (form.phone && checkLocalMessageLimit(form.phone)) return;

    setLoading(true);
    setStatus("Submitting…");

    try {
      const res = await fetch("/api/store/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (json.success) {
        incrementLocalMessageCount(form.phone);
        setStatus("✅ Message sent successfully!");
        setForm({ name: "", email: "", phone: "", message: "" });
        setErrors({});
      } else {
        setStatus(`❌ ${json.error || "Failed to send message"}`);
      }
    } catch (error) {
      setStatus("❌ Server Error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.trimStart() }));
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        Contact Form
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ✅ Name */}
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className={`w-full border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-lg p-2 focus:ring-2 focus:ring-blue-500`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* ✅ Email */}
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className={`w-full border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-lg p-2 focus:ring-2 focus:ring-blue-500`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* ✅ Phone — max 10 digits */}
        <div>
          <label className="block text-gray-700 mb-1">Phone</label>
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            value={form.phone}
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm((prev) => ({ ...prev, phone: onlyDigits }));
            }}
            onPaste={(e) => {
              e.preventDefault();
              const paste = (e.clipboardData || window.clipboardData).getData("text");
              const onlyDigits = (paste || "").replace(/\D/g, "").slice(0, 10);
              setForm((prev) => ({ ...prev, phone: onlyDigits }));
            }}
            placeholder="10-digit phone number"
            className={`w-full border ${
              errors.phone ? "border-red-500" : "border-gray-300"
            } rounded-lg p-2 focus:ring-2 focus:ring-blue-500`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* ✅ Message */}
        <div>
          <label className="block text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            rows="4"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            className={`w-full border ${
              errors.message ? "border-red-500" : "border-gray-300"
            } rounded-lg p-2 focus:ring-2 focus:ring-blue-500`}
          ></textarea>
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
          )}
        </div>

        {/* ✅ Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      {status && (
        <p className="mt-3 text-center text-gray-900 font-medium">{status}</p>
      )}
    </div>
  );
}

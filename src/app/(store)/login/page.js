"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get("redirect") || "/"; // ⭐ default home

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("");

  const showMsg = (text, t = "error") => {
    setMsg(text);
    setType(t);
    setTimeout(() => setMsg(""), 1800);
  };

  // OTP UI logic
  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    if (val !== "" && idx < 5) inputRefs.current[idx + 1].focus();
    if (newOtp.join("").length === 6) handleVerifyOtp(newOtp.join(""));
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10) return showMsg("Enter valid phone number");

    setLoading(true);
    try {
      const res = await fetch("/api/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        showMsg(`OTP sent to ${phone}`, "success");
      } else {
        showMsg(data.message);
      }
    } catch {
      showMsg("Server error");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (fullOtp) => {
    if (!fullOtp || fullOtp.length !== 6) return;

    setLoading(true);

    try {
      const res = await fetch("/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: fullOtp }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        showMsg("Login successful!", "success");

        setTimeout(() => router.replace(redirect), 600); // ⭐ exact return here
      } else {
        showMsg(data.message || "Invalid OTP");
      }
    } catch {
      showMsg("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        {!otpSent ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Login / Register</h1>

            <input
              type="tel"
              placeholder="Enter 10 digit phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="border p-3 w-full rounded mb-4 text-lg"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`bg-blue-600 text-white w-full p-3 rounded-lg font-semibold transition ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Enter OTP</h1>

            {/* ⭐ OTP 6 boxes auto-focus */}
            <div className="flex justify-between mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  className="w-12 h-12 border text-center rounded-lg text-xl font-bold focus:ring-2 ring-blue-500"
                />
              ))}
            </div>

            <button
              onClick={() => handleVerifyOtp(otp.join(""))}
              disabled={loading}
              className={`bg-green-600 text-white w-full p-3 rounded-lg font-semibold transition ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p
              onClick={() => setOtpSent(false)}
              className="mt-4 text-blue-500 text-center cursor-pointer hover:underline"
            >
              Edit phone
            </p>
          </>
        )}

        {/* message */}
        {msg && (
          <p className={`mt-4 text-center font-semibold ${
            type === "success" ? "text-green-600" : "text-red-500"
          }`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

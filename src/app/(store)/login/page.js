"use client";

import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // Send OTP
  const handleSendOtp = async () => {
    if (!phone) {
      setMessage("Please enter your phone number");
      setMessageType("error");
      return;
    }

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
        setMessage(`OTP sent to ${phone}`);
        setMessageType("success");
      } else {
        setMessage(data.message || "Failed to send OTP");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        // Only essential fields to avoid quota error
        const userObj = {
          _id: data.user._id,
          phone: data.user.phone,
          name: data.user.name || "",
          profilePic: data.user.profilePic || "",
          // email: data.user.email || "",
        };

        localStorage.setItem("user", JSON.stringify(userObj));
        // localStorage.setItem("userLoggedIn", "true");

        setMessage("Login successful!");
        setMessageType("success");

        setTimeout(() => window.location.href = "/", 800);
      } else {
        setMessage(data.message || "Invalid OTP. Try again.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {!otpSent ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Login / Register</h1>
            <input
              type="tel"
              placeholder="Enter phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="border p-3 w-full rounded mb-4"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`bg-blue-500 text-white w-full p-3 rounded transition flex items-center justify-center ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "Send OTP"
              )}
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Enter OTP</h1>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="border p-3 w-full rounded mb-4"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className={`bg-green-500 text-white w-full p-3 rounded transition flex items-center justify-center ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-600"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>
            <p
              onClick={() => setOtpSent(false)}
              className="mt-4 text-sm text-blue-500 cursor-pointer hover:underline text-center"
            >
              Edit phone
            </p>
          </>
        )}

        {message && (
          <p className={`mt-4 text-center ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

const STATUS_STEPS = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e) => {
    e?.preventDefault();

    if (!orderId.trim()) {
      setError("Please enter your Order ID");
      setOrder(null);
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(
        `/api/track-order?orderId=${encodeURIComponent(orderId.trim())}`
      );
      const data = await res.json();

      if (data.success) {
        setOrder(data);
      } else {
        setError(data.message || "Order not found. Check your Order ID.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-[70vh] bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Package className="mx-auto text-indigo-600 mb-3" size={40} />
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-600 mt-2">
            Enter the Order ID from your confirmation email or orders page.
          </p>
        </div>

        <form
          onSubmit={handleTrackOrder}
          className="bg-white rounded-2xl shadow-sm border p-6 space-y-4"
        >
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
              Order ID
            </label>
            <input
              id="orderId"
              type="text"
              placeholder="e.g. last 6 characters of order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-60"
          >
            {loading ? "Tracking..." : "Track Order"}
          </button>

          {error && <div className="alert-error text-sm">{error}</div>}
        </form>

        {order && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border p-6 animate-fadeIn space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-semibold text-gray-900">
                  #{order.orderId.slice(-8).toUpperCase()}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                {order.status}
              </span>
            </div>

            {order.expectedDelivery && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Truck size={16} />
                Expected delivery:{" "}
                <strong>
                  {new Date(order.expectedDelivery).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Order Progress</p>
              {STATUS_STEPS.map((step, i) => {
                const done = currentStep >= i;
                const active = order.status === step;
                return (
                  <div key={step} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2
                        size={18}
                        className={active ? "text-indigo-600" : "text-emerald-500"}
                      />
                    ) : (
                      <Clock size={18} className="text-gray-300" />
                    )}
                    <span
                      className={`text-sm ${
                        done ? "text-gray-900 font-medium" : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/user-dashboard/orders"
              className="block text-center text-sm text-indigo-600 hover:underline"
            >
              View all your orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

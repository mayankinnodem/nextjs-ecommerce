"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import countriesData from "@/lib/countries.json" assert { type: "json" };

export default function CheckoutPage() {
  const router = useRouter();

  const [initialized, setInitialized] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // Dropdown lists
  const [countries] = useState(countriesData);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Address
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
    street: "",
    country: "India",
    state: "",
    city: "",
    pincode: "",
  });

  const [paymentMode, setPaymentMode] = useState("COD");
  const [loading, setLoading] = useState(false);

  // Utility functions
  const handleNumberInput = (value) => value.replace(/\D/g, "");
  const validatePhone = (num) => /^\d{10}$/.test(num);
  const validatePincode = (num) => /^\d{6}$/.test(num);

  // Load user + cart from localStorage
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user") || "null");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]").map((i) => ({
      ...i,
      price: Number(i.price),
      quantity: Number(i.quantity),
    }));

    if (!localUser) return router.push("/login");

    setCartItems(cart);
    setUser(localUser);

    // Load country → states
    const selectedCountry = countries.find(
      (c) => c.name === (localUser.country || "India")
    );
    const countryStates = selectedCountry?.states || [];
    setStates(countryStates);

    // Load state → cities
    const selectedState = countryStates.find((s) => s.name === localUser.state);
    setCities(selectedState?.cities || []);

    // Prefill address
    setAddress({
      name: localUser.name || "",
      phone: localUser.phone || "",
      alternatePhone: "",
      street: localUser.address || "",
      city: localUser.city || "",
      state: localUser.state || "",
      pincode: localUser.pincode || "",
      country: localUser.country || "India",
    });

    setInitialized(true);
  }, []);

  // COUNTRY CHANGE → update states
  useEffect(() => {
    const selectedCountry = countries.find(
      (c) => c.name === address.country
    );

    setStates(selectedCountry?.states || []);

    const stateExists = selectedCountry?.states.some(
      (s) => s.name === address.state
    );

    if (!stateExists) {
      setAddress((prev) => ({ ...prev, state: "", city: "" }));
      setCities([]);
    } else {
      setCities(
        selectedCountry.states.find((s) => s.name === address.state)?.cities ||
          []
      );
    }
  }, [address.country]);

  // STATE CHANGE → update cities
  useEffect(() => {
    const selectedState = states.find((s) => s.name === address.state);

    const cityExists = selectedState?.cities.includes(address.city);

    if (!cityExists) {
      setAddress((prev) => ({ ...prev, city: "" }));
    }

    setCities(selectedState?.cities || []);
  }, [address.state]);

  // Totals
  const subtotal = cartItems.reduce(
    (total, i) => total + i.price * i.quantity,
    0
  );
  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  // Place order
  const handlePlaceOrder = async () => {
    if (!validatePhone(address.phone)) {
      alert("⚠️ Enter a valid 10-digit phone number.");
      return;
    }

    if (address.alternatePhone && !validatePhone(address.alternatePhone)) {
      alert("⚠️ Enter a valid 10-digit alternate phone number.");
      return;
    }

    if (!validatePincode(address.pincode)) {
      alert("⚠️ Enter a valid 6-digit pincode.");
      return;
    }

    if (
      !address.name ||
      !address.street ||
      !address.city ||
      !address.state
    ) {
      alert("⚠️ Fill all required shipping details.");
      return;
    }

    if (!cartItems.length) {
      alert("⚠️ Cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          address,
          items: cartItems.map((item) => ({
            productId: item._id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
          total,
          paymentMode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Order Placed Successfully!");
        localStorage.removeItem("cart");
        router.push("/user-dashboard/orders");
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Something went wrong!");
      console.error(error);
    }

    setLoading(false);
  };

  if (!initialized)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading checkout...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex justify-center">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Checkout 🛒
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* SHIPPING DETAILS */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Shipping Details</h2>

            <div className="space-y-4">
              <input
                placeholder="Full Name"
                value={address.name}
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              />

              <input
                placeholder="Phone (10 digits)"
                value={address.phone}
                maxLength={10}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    phone: handleNumberInput(e.target.value),
                  })
                }
                className={`w-full border p-3 rounded-lg ${
                  validatePhone(address.phone) ? "" : "border-red-500"
                }`}
              />

              <input
                placeholder="Alternate Phone (Optional)"
                value={address.alternatePhone}
                maxLength={10}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    alternatePhone: handleNumberInput(e.target.value),
                  })
                }
                className={`w-full border p-3 rounded-lg ${
                  address.alternatePhone &&
                  !validatePhone(address.alternatePhone)
                    ? "border-red-500"
                    : ""
                }`}
              />

              <input
                placeholder="Street Address"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              />

              <select
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              >
                {countries.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              >
                <option value="">Select City</option>
                {cities.map((c, index) => (
  <option key={index} value={typeof c === "string" ? c : c.name}>
    {typeof c === "string" ? c : c.name}
  </option>
))}
  </select>

              <input
                placeholder="Pincode (6 digits)"
                value={address.pincode}
                maxLength={6}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    pincode: handleNumberInput(e.target.value),
                  })
                }
                className={`w-full border p-3 rounded-lg ${
                  validatePincode(address.pincode) ? "" : "border-red-500"
                }`}
              />

              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full border p-3 rounded-lg"
              >
                <option value="COD">Cash on Delivery</option>
                <option value="Online">Online Payment</option>
              </select>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between border-b pb-2">
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-600 text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="mt-6 border-t pt-4 space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{shipping}</span>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

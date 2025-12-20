"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import countriesData from "@/lib/countries.json" assert { type: "json" };

export default function CheckoutClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectAfter = params.get("redirect") || "/";

  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const [countries] = useState(countriesData);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [paymentMode, setPaymentMode] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [sameAsProfile, setSameAsProfile] = useState(true);

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

  // -----------------------------------
  // LOAD USER + CART + PREFILL ADDRESS
  // -----------------------------------
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    const c = JSON.parse(localStorage.getItem("cart") || "[]");

    if (!u) {
      router.push(`/auth/login?redirect=/checkout`);
      return;
    }

    setUser(u);
    setCartItems(c);

    const countryObj = countries.find(c => c.name === (u.country || "India"));
    setStates(countryObj?.states || []);

    const stateObj = countryObj?.states?.find(s => s.name === u.state);
    setCities(stateObj?.cities || []);

    setAddress({
      name: u.name || "",
      phone: u.phone || "",
      alternatePhone: "",
      street: u.address || "",
      city: u.city || "",
      state: u.state || "",
      pincode: u.pincode || "",
      country: u.country || "India",
    });

    setInitialized(true);
  }, []);

  // -----------------------------------
  // HANDLE DROPDOWNS
  // -----------------------------------
  useEffect(() => {
    const c = countries.find(x => x.name === address.country);
    setStates(c?.states || []);
  }, [address.country]);

  useEffect(() => {
    const s = states.find(x => x.name === address.state);
    setCities(s?.cities || []);
  }, [address.state]);

  // -----------------------------------
  // PRICE CALCULATION
  // -----------------------------------
  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  // ---------------- VALIDATION ----------------
  const validatePhone = v => /^\d{10}$/.test(v);
  const validatePincode = v => /^\d{6}$/.test(v);

  // -----------------------------------
  // PLACE ORDER
  // -----------------------------------
  const handlePlaceOrder = async () => {
    if (!cartItems.length) return alert("Cart empty.");

    if (!validatePhone(address.phone)) return alert("Enter valid phone.");
    if (address.alternatePhone && !validatePhone(address.alternatePhone))
      return alert("Invalid alternate phone.");
    if (!validatePincode(address.pincode)) return alert("Invalid pincode.");
    if (!address.name || !address.street || !address.city || !address.state)
      return alert("Fill all required shipping info.");

    setLoading(true);

    try {
      const res = await fetch("/api/user/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          address,
          items: cartItems.map(i => ({
            productId: i._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount: total,
          paymentMode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("cart");
        alert("Order Placed Successfully!");
        router.push("/user-dashboard/orders");
      } else alert(data.message);
    } catch (err) {
      alert("Server error, try again.");
    }

    setLoading(false);
  };

  if (!initialized)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Preparing checkout...</p>
      </div>
    );

  // -----------------------------------
  // UI RENDER
  // -----------------------------------
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Checkout 🛍️
        </h1>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* SHIPPING */}
          <div>
            <div className="flex justify-between">
              <h2 className="text-2xl font-semibold mb-4">Shipping Details</h2>

              <div className="flex items-center gap-3">
  <span className="text-sm font-semibold">
    {sameAsProfile ? "Using Profile" : "Edit Address"}
  </span>

  <div
    onClick={() => setSameAsProfile(!sameAsProfile)}
    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all flex items-center 
      ${sameAsProfile ? "bg-indigo-600" : "bg-gray-300"}`}
  >
    <div
      className={`w-5 h-5 rounded-full bg-white shadow-md transition-all 
        ${sameAsProfile ? "ml-5" : "ml-0"}`}
    />
  </div>
</div>

            </div>

            {sameAsProfile ? (
              <div className="space-y-1 bg-purple-50 p-4 rounded-lg border">
                <p>{user.name}</p>
                <p>📞 {user.phone}</p>
                <p>{user.address}</p>
                <p>
                  {user.city}, {user.state} - {user.pincode}
                </p>
                <p>{user.country}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  placeholder="Full Name"
                  value={address.name}
                  onChange={e => setAddress({ ...address, name: e.target.value })}
                  className="w-full border p-3 rounded-lg"
                />

                <input
                  placeholder="Phone (10 digits)"
                  value={address.phone}
                  maxLength={10}
                  onChange={e =>
                    setAddress({ ...address, phone: e.target.value.replace(/\D/g, "") })
                  }
                  className={`w-full border p-3 rounded-lg ${
                    validatePhone(address.phone) ? "" : "border-red-500"
                  }`}
                />

                <input
                  placeholder="Alternate Phone"
                  value={address.alternatePhone}
                  maxLength={10}
                  onChange={e =>
                    setAddress({ ...address, alternatePhone: e.target.value.replace(/\D/g, "") })
                  }
                  className="w-full border p-3 rounded-lg"
                />

                <input
                  placeholder="Street Address"
                  value={address.street}
                  onChange={e => setAddress({ ...address, street: e.target.value })}
                  className="w-full border p-3 rounded-lg"
                />

                <select
                  value={address.country}
                  onChange={e => setAddress({ ...address, country: e.target.value })}
                  className="w-full border p-3 rounded-lg"
                >
                  {countries.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={address.state}
                  onChange={e => setAddress({ ...address, state: e.target.value })}
                  className="w-full border p-3 rounded-lg"
                >
                  <option>Select State</option>
                  {states.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={address.city}
                  onChange={e => setAddress({ ...address, city: e.target.value })}
                  className="w-full border p-3 rounded-lg"
                >
                  <option>Select City</option>
                  {cities.map((c, idx) => (
                    <option key={idx} value={c.name || c}>{c.name || c}</option>
                  ))}
                </select>

                <input
                  placeholder="Pincode"
                  value={address.pincode}
                  maxLength={6}
                  onChange={e =>
                    setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })
                  }
                  className={`w-full border p-3 rounded-lg ${
                    validatePincode(address.pincode) ? "" : "border-red-500"
                  }`}
                />

                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full border p-3 rounded-lg"
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="Online">Online Payment</option>
                </select>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3">
              {cartItems.map(i => (
                <div key={i._id} className="flex justify-between border-b pb-2">
                  <div className="flex gap-3 items-center">
                    <img
                      src={i.image}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{i.name}</p>
                      <p className="text-gray-600 text-sm">Qty: {i.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">
                    ₹{(i.price * i.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* PRICE SUMMARY */}
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
          </div>

        </div>
      </div>
    </div>
  );
}

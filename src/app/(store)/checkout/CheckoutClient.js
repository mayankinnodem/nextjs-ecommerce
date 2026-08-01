"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import countriesData from "@/lib/countries.json" assert { type: "json" };
import Price from "@/components/Price";
import { useLocale } from "@/context/LocaleContext";
import { FREE_SHIPPING_THRESHOLD_INR } from "@/lib/localeConfig";

export default function CheckoutClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, formatPrice } = useLocale();

  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const [countries] = useState(countriesData);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [paymentMode, setPaymentMode] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [sameAsProfile, setSameAsProfile] = useState(true);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    const c = JSON.parse(localStorage.getItem("cart") || "[]");

    if (!u) {
      router.push(`/login?redirect=/checkout`);
      return;
    }

    setUser(u);
    setCartItems(c);

    const countryObj = countries.find((x) => x.name === (u.country || "India"));
    setStates(countryObj?.states || []);

    const stateObj = countryObj?.states?.find((s) => s.name === u.state);
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
  }, [router, countries]);

  useEffect(() => {
    const c = countries.find((x) => x.name === address.country);
    setStates(c?.states || []);
  }, [address.country, countries]);

  useEffect(() => {
    const s = states.find((x) => x.name === address.state);
    setCities(s?.cities || []);
  }, [address.state, states]);

  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  const validatePhone = (v) => /^\d{10}$/.test(v);
  const validatePincode = (v) => /^\d{6}$/.test(v);

  const getShippingAddress = () => {
    if (sameAsProfile) {
      return {
        name: user.name || "",
        phone: user.phone || "",
        alternatePhone: "",
        street: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        country: user.country || "India",
      };
    }
    return address;
  };

  const handlePlaceOrder = async () => {
    setFormError("");
    setSuccessMsg("");

    const ship = getShippingAddress();

    if (!cartItems.length) {
      setFormError("Your cart is empty. Add products before checkout.");
      return;
    }
    if (!validatePhone(ship.phone)) {
      setFormError("Enter a valid 10-digit phone number.");
      return;
    }
    if (ship.alternatePhone && !validatePhone(ship.alternatePhone)) {
      setFormError("Alternate phone must be 10 digits.");
      return;
    }
    if (!validatePincode(ship.pincode)) {
      setFormError("Enter a valid 6-digit pincode.");
      return;
    }
    if (!ship.name || !ship.street || !ship.city || !ship.state) {
      setFormError("Please fill all required shipping details.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          address: ship,
          items: cartItems.map((i) => ({
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
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: 0 }));
        router.push("/user-dashboard/orders");
      } else {
        setFormError(data.message || "Could not place order. Please try again.");
      }
    } catch {
      setFormError("Server error. Please try again in a moment.");
    }

    setLoading(false);
  };

  if (!initialized) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center space-y-3">
          <div className="skeleton w-12 h-12 rounded-full mx-auto" />
          <p className="text-gray-600">{t("checkout.preparing")}</p>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="page-container py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{t("checkout.emptyCart")}</h1>
        <p className="text-gray-600">Add some products before checking out.</p>
        <Link href="/shop" className="btn-primary inline-block px-6 py-3">
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {t("checkout.title")}
        </h1>

        {formError && <div className="alert-error mb-6 max-w-3xl mx-auto">{formError}</div>}
        {successMsg && <div className="alert-success mb-6 max-w-3xl mx-auto">{successMsg}</div>}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t("checkout.shipping")}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {sameAsProfile ? t("checkout.usingProfile") : t("checkout.customAddress")}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={sameAsProfile}
                  onClick={() => setSameAsProfile(!sameAsProfile)}
                  className={`w-12 h-7 rounded-full p-1 transition flex items-center ${
                    sameAsProfile ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition ${
                      sameAsProfile ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {sameAsProfile ? (
              <div className="space-y-1 bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-gray-700">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p>📞 {user.phone}</p>
                <p>{user.address}</p>
                <p>
                  {user.city}, {user.state} - {user.pincode}
                </p>
                <p>{user.country}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  placeholder="Full Name *"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="input-field"
                />
                <input
                  placeholder="Phone (10 digits) *"
                  value={address.phone}
                  maxLength={10}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className={`input-field ${address.phone && !validatePhone(address.phone) ? "error" : ""}`}
                />
                <input
                  placeholder="Alternate Phone"
                  value={address.alternatePhone}
                  maxLength={10}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      alternatePhone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="input-field"
                />
                <input
                  placeholder="Street Address *"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="input-field"
                />
                <select
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="input-field"
                >
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="input-field"
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
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select City</option>
                  {cities.map((c, idx) => (
                    <option key={idx} value={c.name || c}>
                      {c.name || c}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Pincode *"
                  value={address.pincode}
                  maxLength={6}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      pincode: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className={`input-field ${address.pincode && !validatePincode(address.pincode) ? "error" : ""}`}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("checkout.payment")}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="input-field"
              >
                <option value="COD">{t("checkout.cod")}</option>
                <option value="Online">{t("checkout.online")}</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">{t("checkout.summary")}</h2>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {cartItems.map((i) => (
                <div key={i._id} className="flex justify-between gap-3 border-b pb-3">
                  <div className="flex gap-3 items-center">
                    <img
                      src={i.image || "/placeholder.svg"}
                      alt={i.name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{i.name}</p>
                      <p className="text-sm text-gray-500">Qty: {i.quantity}</p>
                    </div>
                  </div>
                  <Price amount={i.price * i.quantity} className="font-semibold text-gray-800" />
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4 space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>{t("checkout.subtotal")}</span>
                <Price amount={subtotal} />
              </div>
              <div className="flex justify-between">
                <span>{t("checkout.shippingFee")}</span>
                <span>{shipping === 0 ? t("checkout.free") : formatPrice(shipping)}</span>
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD_INR && subtotal > 0 && (
                <p className="text-xs text-emerald-600">
                  {t("checkout.freeShippingHint", {
                    amount: formatPrice(FREE_SHIPPING_THRESHOLD_INR - subtotal),
                  })}
                </p>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                <span>{t("checkout.total")}</span>
                <Price amount={total} />
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-accent w-full mt-4 py-3 disabled:opacity-60"
              >
                {loading ? t("checkout.placing") : t("checkout.placeOrder")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

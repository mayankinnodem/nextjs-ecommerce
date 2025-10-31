"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState({
    name: "", phone: "", street: "", city: "", state: "", pincode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const localUser = JSON.parse(localStorage.getItem("user") || "null");
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (!localUser) return router.push("/login");

      try {
        const res = await fetch(`/api/user/get-profile?phone=${localUser.phone}`);
        const data = await res.json();
        const currentUser = data.success ? data.user : localUser;

        setUser(currentUser);
        setAddress({
          name: currentUser.name || "",
          phone: currentUser.phone || "",
          street: currentUser.address || "",
          city: currentUser.city || "",
          state: currentUser.state || "",
          pincode: currentUser.pincode || "",
        });
      } catch {
        setUser(localUser);
      }

      setCartItems(cart);
      setInitialized(true);
    })();
  }, [router]);

  const subtotal = cartItems.reduce((total, i) => total + Number(i.price) * i.quantity, 0);
  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      alert("⚠️ Fill all shipping details."); return;
    }
    if (!cartItems.length) { alert("⚠️ Cart is empty."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/user/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  userId: user._id,  // ✅ from localStorage user object
  address,
  items: cartItems.map(item => ({
    productId: item._id,  // ✅ from cart item
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.images?.[0]?.url || "/placeholder.png",
  })),
  total,
  paymentMode: "COD",
  status: "Pending",
})

      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Order placed!");
        localStorage.removeItem("cart");
        router.push("/user-dashboard/orders");
      } else alert(`❌ ${data.message || "Failed"}`);
    } catch (err) {
      console.error("Order Error:", err);
      alert("❌ Something went wrong");
    } finally { setLoading(false); }
  };

  if (!initialized) return (
    <div className="min-h-screen flex justify-center items-center">
      <p className="text-lg text-gray-600">Loading checkout...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex justify-center">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Checkout 🛒</h1>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Shipping Details</h2>
            <div className="space-y-4">
              {["name","phone","street","city","state","pincode"].map(f => (
                <input key={f} type={f==="phone"?"tel":"text"} placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
                  value={address[f]}
                  onChange={e=>setAddress({...address,[f]:e.target.value})}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.length===0 ? <p className="text-gray-500">Cart empty</p> : cartItems.map(i=>(
                <div key={i._id} className="flex justify-between border-b pb-2">
                  <div className="flex gap-3 items-center">
                    <img src={i.images?.[0]?.url||"/placeholder.png"} alt={i.name} className="w-16 h-16 rounded object-cover"/>
                    <div>
                      <p className="font-medium text-gray-800">{i.name}</p>
                      <p className="text-gray-600 text-sm">Qty: {i.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">₹{(i.price*i.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {cartItems.length>0 && (
              <div className="mt-6 border-t pt-4 space-y-2 text-gray-700">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span>₹{shipping}</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>₹{total.toLocaleString()}</span></div>
                <button onClick={handlePlaceOrder} disabled={loading} className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-70">
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

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ store user
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // ✅ store product
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  total: Number,
  status: { type: String, default: "Pending" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);

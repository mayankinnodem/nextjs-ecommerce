import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String },
    description: { type: String },
    category: { type: String },
    subCategory: { type: String },
    brand: { type: String },
    gender: { type: String, enum: ["Men", "Women", "Unisex"], default: "Unisex" },

    // Pricing
    price: { type: Number },
    discount: { type: Number, default: 0 },
    salePrice: { type: Number },

    // Inventory
    stock: { type: Number, default: 0 },
    minOrder: { type: Number, default: 1 },

    // ✅ Attributes (added)
    attributes: [
      {
        name: { type: String },
        value: { type: String },
      },
    ],

    // Media
    images: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],

    // SEO / Tags
    tags: [{ type: String }],

    // Flags
    isTrending: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    season: { type: String, default: "All" },

    // Status
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    publishDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;

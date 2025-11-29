import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String },
    sku: { type: String },

    // ✅ category → ObjectId
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    
    // ✅ ⛔ DO NOT CHANGE — subCategory remains STRING
    subCategory: { type: String }, // ✅ you asked to keep it same

    // ✅ brand → ObjectId
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      default: "Unisex",
    },

    // Pricing
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    salePrice: { type: Number },

    // Inventory
    stock: { type: Number, default: 0 },
    minOrder: { type: Number, default: 1 },

    // Attributes
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
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    publishDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;

import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: {
      type: String,
      required: true,
      unique: true,      // ✅ Slug must be unique
      lowercase: true,
      trim: true,
    },
    description: String,
    image: {
      url: String,
      public_id: String, // cloudinary public id
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    translations: { type: mongoose.Schema.Types.Mixed, default: {} },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      metaKeywords: { type: String, default: "" },
      ogTitle: { type: String, default: "" },
      ogDescription: { type: String, default: "" },
      ogImage: { url: String, public_id: String },
      canonicalUrl: { type: String, default: "" },
      robotsIndex: { type: Boolean, default: true },
      robotsFollow: { type: Boolean, default: true },
      publisher: { type: String, default: "" },
      language: { type: String, default: "" },
      structuredData: { type: mongoose.Schema.Types.Mixed, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);

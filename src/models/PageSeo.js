import mongoose from "mongoose";

const PageSeoSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: {
      url: String,
      public_id: String,
    },
    canonicalUrl: { type: String, default: "" },
    robotsIndex: { type: Boolean, default: true },
    robotsFollow: { type: Boolean, default: true },
    publisher: { type: String, default: "" },
    language: { type: String, default: "en" },
    structuredData: { type: mongoose.Schema.Types.Mixed, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.PageSeo ||
  mongoose.model("PageSeo", PageSeoSchema);

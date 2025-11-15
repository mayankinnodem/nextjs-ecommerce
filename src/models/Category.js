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
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);

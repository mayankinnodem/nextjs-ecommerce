import mongoose from "mongoose";

const ContactSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },

    // ✅ Contact Details
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },

    // ✅ Branding
    logo: {
      url: String,
      public_id: String,
    },
    favicon: {
      url: String,
      public_id: String,
    },

    // ✅ Form labels – optional
    formTitle: { type: String, default: "Contact Form" },
    formSubtitle: { type: String, default: "" },

    // ✅ Extra Fields
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.ContactSection ||
  mongoose.model("ContactSection", ContactSectionSchema);

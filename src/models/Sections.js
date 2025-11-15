import mongoose from "mongoose";

const SectionsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    buttonText1: { type: String },
    buttonText2: { type: String },

    section: {
      type: String,
      required: true,
      trim: true,
    },

    bannerUrl: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Sections || mongoose.model("Sections", SectionsSchema);
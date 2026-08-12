import mongoose from "mongoose";

const SeoSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "" },
    siteUrl: { type: String, default: "" },
    domain: { type: String, default: "" },
    titleTemplate: { type: String, default: "%s" },
    defaultMetaDescription: { type: String, default: "" },
    defaultMetaKeywords: { type: String, default: "" },
    defaultOgImage: {
      url: String,
      public_id: String,
    },
    googleSiteVerification: { type: String, default: "" },
    bingSiteVerification: { type: String, default: "" },
    twitterHandle: { type: String, default: "" },
    organizationName: { type: String, default: "" },
    defaultPublisher: { type: String, default: "" },
    defaultLanguage: { type: String, default: "en" },
    organizationLogo: {
      url: String,
      public_id: String,
    },
    robotsExtra: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.SeoSettings ||
  mongoose.model("SeoSettings", SeoSettingsSchema);

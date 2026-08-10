import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/privacy-policy", {
    title: "Privacy Policy",
    description: "Read our privacy policy and how we handle your data.",
  });
}

export default function PrivacyLayout({ children }) {
  return children;
}

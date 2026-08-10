import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/terms-and-conditions", {
    title: "Terms & Conditions",
    description: "Terms and conditions for using our store and services.",
  });
}

export default function TermsLayout({ children }) {
  return children;
}

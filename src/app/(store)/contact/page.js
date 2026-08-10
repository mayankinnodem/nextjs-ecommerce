import ContactSection from "@/components/ContactSection";
import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export const revalidate = 60;

export async function generateMetadata() {
  return buildStaticPageMetadata("/contact", {
    title: "Contact Us",
    description: "Get in touch with us for orders, support and inquiries.",
  });
}

export default function ContactPage() {
  return (
    <div>
      <PageSeoJsonLd path="/contact" />
      <ContactSection />
    </div>
  );
}

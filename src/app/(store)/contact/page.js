import ContactSection from "@/components/ContactSection";
import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export const revalidate = 60;

export async function generateMetadata() {
  return buildStaticPageMetadata("/contact");
}

export default function ContactPage() {
  return (
    <div>
      <PageSeoJsonLd path="/contact" />
      <ContactSection />
    </div>
  );
}

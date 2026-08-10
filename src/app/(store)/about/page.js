import AboutSection from "@/components/AboutSection";
import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export const revalidate = 60;

export async function generateMetadata() {
  return buildStaticPageMetadata("/about", {
    title: "About Us",
    description: "Learn more about our company, mission and values.",
  });
}

export default function AboutPage() {
  return (
    <div>
      <PageSeoJsonLd path="/about" />
      <AboutSection />
    </div>
  );
}

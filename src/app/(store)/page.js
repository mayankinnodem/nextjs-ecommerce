import ContactSection from "@/components/ContactSection";
import Sections from "@/components/Sections";
import ProductsList from "@/components/ProductsList";
import Category from "./all-categories/page";
import Flags from "@/components/shop/Flags";
import AboutSection from "@/components/AboutSection";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import { getContactSection } from "@/lib/staticData";
import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

// ISR: Revalidate homepage every 60 seconds
export const revalidate = 60;

export async function generateMetadata() {
  const contact = await getContactSection();
  const siteName = contact.siteName;
  return buildStaticPageMetadata("/", {
    title: `${siteName} - Quality Products at Best Prices`,
    description:
      contact.description ||
      `Shop at ${siteName}. Quality products, secure payments, and fast delivery.`,
  });
}

export default function Home() {
  return (
    <div>
      <PageSeoJsonLd path="/" />
      <Sections section="landingpage-frontsection"/>
      <Category/>
      <ProductsList limit={8} titleKey="products.featured" />
      <Flags/>
      <AboutSection/>
      <Reviews/>
      <FAQ/>
      <ContactSection/>
    </div>
  );
}
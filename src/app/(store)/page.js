import ContactSection from "@/components/ContactSection";
import Sections from "@/components/Sections";
import ProductsList from "@/components/ProductsList";
import Category from "./all-categories/page";
import Flags from "@/components/shop/Flags";
import AboutSection from "@/components/AboutSection";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

// ISR: Revalidate homepage every 60 seconds
export const revalidate = 60;

export async function generateMetadata() {
  return buildStaticPageMetadata("/");
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
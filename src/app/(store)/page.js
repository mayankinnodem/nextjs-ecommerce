import ContactSection from "@/components/ContactSection";
import Sections from "@/components/Sections";
import ProductsList from "@/components/ProductsList";
import Category from "./all-categories/page";
import Flags from "@/components/shop/Flags";
import AboutSection from "@/components/AboutSection";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import { getContactSection } from "@/lib/staticData";
import { getSiteMetadata } from "@/lib/metadata";

// ISR: Revalidate homepage every 60 seconds
export const revalidate = 60;

export async function generateMetadata() {
  const contact = await getContactSection();
  const siteName = contact.siteName;
  const description =
    contact.description ||
    `Shop at ${siteName}. Quality products, secure payments, and fast delivery.`;
  const pageTitle = `${siteName} - Quality Products at Best Prices`;

  return getSiteMetadata({
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
    },
  });
}

export default function Home() {
  return (
    <div>
      <Sections section="landingpage-frontsection"/>
      <Category/>
      <ProductsList limit={8} title="Featured Products" />
      <Flags/>
      <AboutSection/>
      <Reviews/>
      <FAQ/>
      <ContactSection/>
    </div>
  );
}
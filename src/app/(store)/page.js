import ContactSection from "@/components/ContactSection";
import Sections from "@/components/Sections";
import ProductsList from "@/components/ProductsList";
import Category from "./all-categories/page";
import Flags from "@/components/shop/Flags";
import AboutSection from "@/components/AboutSection";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";

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
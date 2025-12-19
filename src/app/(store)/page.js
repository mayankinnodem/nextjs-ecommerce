import ContactSection from "@/components/ContactSection";
import Sections from "@/components/Sections";
import Products from "./shop/page";
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
      <Products/>
      <Flags/>
      <AboutSection/>
      <Reviews/>
      <FAQ/>
      <ContactSection/>
    </div>
  );
}
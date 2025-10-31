import ContactSection from "@/components/ContactSection";
import Banner from "@/components/Banner";
import ProductsFromApi from "@/components/shop/productsFromApi";
import Flags from "@/components/shop/Flags";




export default function Home() {
  return (
    <div>
      <Banner/>
      <ProductsFromApi/>
      <Flags/>
      <ContactSection/>
    </div>
  );
}

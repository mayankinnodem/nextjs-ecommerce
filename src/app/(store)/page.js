import ContactSection from "@/components/ContactSection";
import Banner from "@/components/Banner";
import ProductsFromApi from "@/components/shop/productsFromApi";




export default function Home() {
  return (
    <div>
      <Banner/>
      <ProductsFromApi/>
      <ContactSection/>
    </div>
  );
}

// app/layout.jsx
import "../globals.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ViewCartFloatingButton from "@/components/CartButton";

export const metadata = {
  title: "",
  description: "My E-commerce Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <Navbar />
        </header>
        <main className="main-container bg-white">
          {children}
          <ViewCartFloatingButton />
        </main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}

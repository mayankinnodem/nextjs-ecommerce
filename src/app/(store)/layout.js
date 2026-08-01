// app/layout.jsx
import "../globals.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ViewCartFloatingButton from "@/components/CartButton";
import { getSiteMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return getSiteMetadata();
}

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

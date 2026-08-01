// app/layout.jsx
import "../globals.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ViewCartFloatingButton from "@/components/CartButton";
import ChatBot from "@/components/ChatBot";
import StoreProviders from "@/components/StoreProviders";
import { getSiteMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return getSiteMetadata();
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProviders>
          <Navbar />
          <main className="main-container bg-white">
            {children}
            <ViewCartFloatingButton />
            <ChatBot />
          </main>
          <Footer />
        </StoreProviders>
      </body>
    </html>
  );
}

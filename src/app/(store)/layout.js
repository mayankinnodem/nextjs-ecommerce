// app/layout.jsx
import "../globals.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ViewCartFloatingButton from "@/components/CartButton";
import ChatBot from "@/components/ChatBot";
import StoreProviders from "@/components/StoreProviders";
import { getLayoutMetadata } from "@/lib/metadata";
import { getGlobalSeoSettings } from "@/lib/seo";

export async function generateMetadata() {
  const [layoutMeta, global] = await Promise.all([
    getLayoutMetadata(),
    getGlobalSeoSettings(),
  ]);

  const template = global.titleTemplate || "%s";

  return {
    ...layoutMeta,
    title: {
      ...layoutMeta.title,
      template,
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getGlobalSeoSettings();
  const htmlLang = settings.defaultLanguage || "en";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
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

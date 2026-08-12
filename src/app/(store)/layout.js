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
  try {
    const [layoutMeta, global] = await Promise.all([
      getLayoutMetadata(),
      getGlobalSeoSettings(),
    ]);

    // Page meta titles in DB already include the brand, so keep template as passthrough.
    // Never fall back to "%s | SiteName" here — that doubles the company name on nested routes.
    const template =
      global.titleTemplate && global.titleTemplate.includes("%s")
        ? global.titleTemplate
        : "%s";

    return {
      ...layoutMeta,
      title: {
        default: layoutMeta.title?.default,
        template,
      },
    };
  } catch (error) {
    console.error("Layout metadata error:", error);
    return {
      title: {
        default: "Store",
        template: "%s",
      },
    };
  }
}

export default async function RootLayout({ children }) {
  let htmlLang = "en";
  try {
    const settings = await getGlobalSeoSettings();
    htmlLang = settings.defaultLanguage || "en";
  } catch {
    // keep default during build if DB is unavailable
  }

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

import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export async function generateMetadata() {
  return buildStaticPageMetadata("/login", {
    title: "Login",
    description: "Login to your account",
  });
}

export default function LoginLayout({ children }) {
  return (
    <>
      <PageSeoJsonLd path="/login" />
      {children}
    </>
  );
}

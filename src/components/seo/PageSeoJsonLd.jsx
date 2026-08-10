import { getResolvedStructuredData } from "@/lib/seo";

function JsonLdScript({ data }) {
  if (!data) return null;

  const json = typeof data === "string" ? data : JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** Renders JSON-LD from PageSeo for any path (optional entity SEO fallback) */
export default async function PageSeoJsonLd({ path, entitySeo = null }) {
  const structuredData = await getResolvedStructuredData(path, entitySeo);
  return <JsonLdScript data={structuredData} />;
}

export { JsonLdScript };

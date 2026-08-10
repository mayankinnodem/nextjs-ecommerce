import { getPageSeoByPath } from "@/lib/seo";

function JsonLdScript({ data }) {
  if (!data) return null;

  const json =
    typeof data === "string" ? data : JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** Renders JSON-LD from admin Page SEO settings for a static route */
export default async function PageSeoJsonLd({ path }) {
  const pageSeo = await getPageSeoByPath(path);
  return <JsonLdScript data={pageSeo?.structuredData} />;
}

export { JsonLdScript };

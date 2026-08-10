import { getContactSection } from "@/lib/staticData";
import { getSiteUrl } from "@/lib/siteUrl";

const DEFAULT_SITE_NAME = "E-Commerce Store";
const DEFAULT_DESCRIPTION = "Your trusted shopping destination";

function buildIcons(faviconUrl) {
  if (!faviconUrl) return undefined;

  return {
    icon: [{ url: faviconUrl, type: "image/png" }],
    shortcut: faviconUrl,
    apple: faviconUrl,
  };
}

/**
 * Base site metadata (title template, favicon, openGraph) scoped to the current domain.
 */
export async function getSiteMetadata(overrides = {}) {
  const contact = await getContactSection();
  const siteUrl = await getSiteUrl();
  const siteName = contact?.siteName || DEFAULT_SITE_NAME;
  const description = contact?.description || DEFAULT_DESCRIPTION;
  const faviconUrl = contact?.favicon?.url;

  const {
    title,
    description: overrideDescription,
    openGraph,
    ...rest
  } = overrides;

  const resolvedDescription = overrideDescription ?? description;

  return {
    metadataBase: new URL(siteUrl),
    title: title ?? {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: resolvedDescription,
    keywords: overrides.keywords,
    robots: overrides.robots,
    alternates: overrides.alternates,
    verification: overrides.verification,
    icons: buildIcons(faviconUrl),
    openGraph: {
      title: openGraph?.title ?? siteName,
      description: openGraph?.description ?? resolvedDescription,
      type: "website",
      url: openGraph?.url ?? siteUrl,
      siteName,
      ...openGraph,
    },
    ...rest,
  };
}

export { DEFAULT_SITE_NAME, DEFAULT_DESCRIPTION };

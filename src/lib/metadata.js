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
 * Minimal layout-level metadata only (no page-specific description/OG).
 * Page routes supply SEO from the database via buildPageMetadata().
 */
export async function getLayoutMetadata() {
  try {
    const contact = await getContactSection();
    const siteUrl = await getSiteUrl();
    const siteName = contact?.siteName || DEFAULT_SITE_NAME;

    return {
      metadataBase: new URL(siteUrl || "http://localhost:3000"),
      title: {
        default: siteName,
        template: "%s",
      },
      icons: buildIcons(contact?.favicon?.url),
    };
  } catch (error) {
    console.error("Layout metadata fetch error:", error);
    return {
      metadataBase: new URL("http://localhost:3000"),
      title: {
        default: DEFAULT_SITE_NAME,
        template: "%s",
      },
    };
  }
}

/**
 * Full metadata for a specific page (used by buildMetadataFromSeo).
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
    twitter,
    ...rest
  } = overrides;

  const resolvedDescription = overrideDescription ?? description;

  // When title is { absolute: "..." } from DB, do not apply layout template
  const resolvedTitle =
    title ??
    ({
      default: siteName,
      template: "%s",
    });

  const resolvedOpenGraph = {
    type: "website",
    siteName,
    ...(openGraph || {}),
  };

  if (!resolvedOpenGraph.title) {
    resolvedOpenGraph.title =
      typeof title === "object" && title.absolute
        ? title.absolute
        : typeof title === "string"
          ? title
          : siteName;
  }
  if (!resolvedOpenGraph.description) {
    resolvedOpenGraph.description = resolvedDescription;
  }
  if (!resolvedOpenGraph.url) {
    resolvedOpenGraph.url = siteUrl;
  }

  const resolvedTwitter = twitter || {
    card: "summary_large_image",
    title: resolvedOpenGraph.title,
    description: resolvedOpenGraph.description,
    images: resolvedOpenGraph.images,
  };

  return {
    metadataBase: new URL(siteUrl),
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: overrides.keywords,
    robots: overrides.robots,
    alternates: overrides.alternates,
    verification: overrides.verification,
    icons: buildIcons(faviconUrl),
    openGraph: resolvedOpenGraph,
    twitter: resolvedTwitter,
    ...rest,
  };
}

export { DEFAULT_SITE_NAME, DEFAULT_DESCRIPTION, buildIcons };

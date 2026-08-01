import { connectDB } from "@/lib/dbConnect";
import ContactSection from "@/models/ContactSection";
import { normalizeDomain } from "@/lib/siteUrl";

const DEFAULT_CONTACT = {
  siteName: "E-Commerce Store",
  title: "E-Commerce Store",
  companyName: "E-Commerce Store",
  description: "Your trusted shopping destination",
  logo: { url: "" },
  favicon: { url: "" },
};

function formatContact(data) {
  if (!data) return DEFAULT_CONTACT;

  const siteName = data.companyName || data.title || DEFAULT_CONTACT.siteName;
  return {
    siteName,
    title: data.title,
    companyName: data.companyName || data.title,
    description: data.description || DEFAULT_CONTACT.description,
    logo: data.logo || { url: "" },
    favicon: data.favicon || { url: "" },
    domain: data.domain || "",
  };
}

async function findByDomain(domain) {
  const normalized = normalizeDomain(domain);
  if (!normalized) return null;

  const variants = [normalized, `www.${normalized}`];
  return ContactSection.findOne({ domain: { $in: variants } }).lean();
}

export async function findContactSectionDocument(domain) {
  await connectDB();

  if (domain) {
    const byDomain = await findByDomain(domain);
    if (byDomain) return byDomain;
  }

  return ContactSection.findOne().lean();
}

export async function getContactSectionData(domain) {
  try {
    const data = await findContactSectionDocument(domain);
    return formatContact(data);
  } catch (error) {
    console.error("Error fetching contact section:", error);
    return DEFAULT_CONTACT;
  }
}

export { DEFAULT_CONTACT, formatContact };

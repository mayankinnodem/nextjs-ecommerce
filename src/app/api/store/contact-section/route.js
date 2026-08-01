import { jsonResponse, handleOptions } from "@/lib/apiHelpers";
import {
  DEFAULT_CONTACT,
  findContactSectionDocument,
} from "@/lib/contactSectionQuery";
import { resolveDomain } from "@/lib/siteUrl";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  try {
    const domain = await resolveDomain(request);
    const data = await findContactSectionDocument(domain);

    if (!data) {
      return jsonResponse(
        {
          success: true,
          data: {
            title: DEFAULT_CONTACT.title,
            companyName: DEFAULT_CONTACT.companyName,
            description: DEFAULT_CONTACT.description,
            address: "",
            phone: "",
            email: "",
            logo: { url: "" },
            favicon: { url: "" },
            socialLinks: [],
          },
        },
        200,
        {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        }
      );
    }

    return jsonResponse(
      {
        success: true,
        data,
      },
      200,
      {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      }
    );
  } catch (error) {
    console.error("Contact Section GET Error:", error);

    return jsonResponse(
      {
        success: true,
        data: {
          title: DEFAULT_CONTACT.title,
          companyName: DEFAULT_CONTACT.companyName,
          description: DEFAULT_CONTACT.description,
          address: "",
          phone: "",
          email: "",
          logo: { url: "" },
          favicon: { url: "" },
          socialLinks: [],
        },
      },
      200
    );
  }
}

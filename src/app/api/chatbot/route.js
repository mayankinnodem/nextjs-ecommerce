import { connectDB } from "@/lib/dbConnect";
import { jsonResponse, handleOptions } from "@/lib/apiHelpers";
import { getChatbotReply } from "@/lib/chatbotEngine";
import { resolveDomain } from "@/lib/siteUrl";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = (body.message || "").trim();

    if (!message || message.length > 500) {
      return jsonResponse(
        { success: false, error: "Please enter a valid message." },
        400
      );
    }

    await connectDB();

    const domain = await resolveDomain(request);
    const language = body.language || "en";

    const result = await getChatbotReply({ message, language, domain });

    return jsonResponse({ success: true, ...result });
  } catch (error) {
    console.error("Chatbot error:", error);
    return jsonResponse(
      { success: false, error: "Something went wrong. Please try again." },
      500
    );
  }
}

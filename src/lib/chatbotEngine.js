import FAQ from "@/models/FAQ";
import Product from "@/models/Product";
import { findContactSectionDocument } from "@/lib/contactSectionQuery";
import { FREE_SHIPPING_THRESHOLD_INR } from "@/lib/localeConfig";

const RESPONSES = {
  en: {
    greeting:
      "Hello! 👋 I'm your shopping assistant. I can help with orders, shipping, products, and more. How can I help you today?",
    orderTrack:
      "To track your order, go to **Track Order** and enter your Order ID (last 6 characters from your orders page). You can also check status in **My Orders** after logging in.",
    shipping: `We offer standard delivery across India. Shipping is ₹99, or **FREE on orders above ₹${FREE_SHIPPING_THRESHOLD_INR}**. Delivery usually takes 3–7 business days.`,
    returns:
      "Most items can be returned within 15 days of delivery. Visit our **Shipping & Returns** page for full details, or contact support for a return request.",
    payment:
      "We accept **Cash on Delivery (COD)** and **Online Payment** at checkout. All online transactions are secure and encrypted.",
    contact: "Reach our support team:",
    productNone: "I couldn't find products matching that. Try browsing our **Shop** or describe differently.",
    productFound: "Here are some products I found:",
    login: "Please **Login** to view orders, wishlist, and account details. New users can sign up with phone OTP.",
    fallback:
      "I'm not sure about that. Try asking about orders, shipping, returns, products, or contact support. You can also visit our **Help** page.",
    faqPrefix: "Here's what I found:",
  },
  hi: {
    greeting:
      "नमस्ते! 👋 मैं आपकी शॉपिंग सहायक हूँ। ऑर्डर, शिपिंग, उत्पाद और अन्य में मदद कर सकती हूँ। आज कैसे मदद करूँ?",
    orderTrack:
      "ऑर्डर ट्रैक करने के लिए **Track Order** पर जाएँ और Order ID दर्ज करें। लॉगिन के बाद **My Orders** में भी स्थिति देख सकते हैं।",
    shipping: `हम पूरे भारत में डिलीवरी करते हैं। शिपिंग ₹99 है, या **₹${FREE_SHIPPING_THRESHOLD_INR} से ऊपर मुफ़्त**। आमतौर पर 3–7 कार्य दिवस।`,
    returns:
      "अधिकांश उत्पाद 15 दिनों में वापस किए जा सकते हैं। पूरी जानकारी के लिए **Shipping & Returns** देखें।",
    payment:
      "हम **Cash on Delivery** और **Online Payment** स्वीकार करते हैं। सभी ऑनलाइन लेनदेन सुरक्षित हैं।",
    contact: "हमारी सहायता टीम से संपर्क करें:",
    productNone: "मुझे ऐसा कोई उत्पाद नहीं मिला। **Shop** ब्राउज़ करें या दूसरे शब्दों में पूछें।",
    productFound: "ये कुछ उत्पाद मिले:",
    login: "ऑर्डर और खाता देखने के लिए **Login** करें। नए उपयोगकर्ता OTP से साइन अप कर सकते हैं।",
    fallback:
      "मुझे समझ नहीं आया। ऑर्डर, शिपिंग, रिटर्न, उत्पाद या संपर्क के बारे में पूछें। **Help** पेज भी देखें।",
    faqPrefix: "यह जानकारी मिली:",
  },
  ar: {
    greeting:
      "مرحباً! 👋 أنا مساعد التسوق. يمكنني المساعدة في الطلبات والشحن والمنتجات. كيف أساعدك؟",
    orderTrack:
      "لتتبع طلبك، اذهب إلى **Track Order** وأدخل رقم الطلب. يمكنك أيضاً التحقق من **My Orders** بعد تسجيل الدخول.",
    shipping: `نوفر التوصيل في جم أنحاء الهند. رسوم الشحن ₹99، أو **مجاني للطلبات فوق ₹${FREE_SHIPPING_THRESHOLD_INR}**.`,
    returns:
      "يمكن إرجاع معظم المنتجات خلال 15 يوماً. راجع صفحة **Shipping & Returns** للتفاصيل.",
    payment: "نقبل **الدفع عند الاستلام** و**الدفع الإلكتروني**. جميع المعاملات آمنة.",
    contact: "تواصل مع فريق الدعم:",
    productNone: "لم أجد منتجات مطابقة. تصفح **Shop** أو صِف بطريقة أخرى.",
    productFound: "إليك بعض المنتجات:",
    login: "يرجى **Login** لعرض الطلبات والحساب. يمكن للمستخدمين الجدد التسجيل برمز OTP.",
    fallback: "لم أفهم ذلك. اسأل عن الطلبات أو الشحن أو المنتجات. راجع **Help**.",
    faqPrefix: "إليك ما وجدته:",
  },
  fr: {
    greeting:
      "Bonjour! 👋 Je suis votre assistant shopping. Je peux aider avec les commandes, la livraison et les produits.",
    orderTrack:
      "Pour suivre votre commande, allez sur **Track Order** et entrez votre numéro. Consultez aussi **My Orders** après connexion.",
    shipping: `Livraison en Inde. Frais ₹99, ou **gratuit au-dessus de ₹${FREE_SHIPPING_THRESHOLD_INR}**. Délai 3–7 jours ouvrés.`,
    returns:
      "Retours possibles sous 15 jours. Voir **Shipping & Returns** pour les détails.",
    payment: "Nous acceptons **paiement à la livraison** et **paiement en ligne**.",
    contact: "Contactez notre support:",
    productNone: "Aucun produit trouvé. Parcourez **Shop** ou reformulez.",
    productFound: "Voici quelques produits:",
    login: "Veuillez vous **Login** pour voir vos commandes. Inscription par OTP.",
    fallback: "Je n'ai pas compris. Demandez sur commandes, livraison, produits. Voir **Help**.",
    faqPrefix: "Voici ce que j'ai trouvé:",
  },
};

function getLang(language) {
  return RESPONSES[language] || RESPONSES.en;
}

function matchIntent(text) {
  const q = text.toLowerCase();

  if (/hello|hi|hey|namaste|नमस्ते|help|start|مرحب|bonjour|salut/.test(q)) {
    return "greeting";
  }
  if (/track|order status|where is my order|ऑर्डर|ट्रैक|تتبع|suivre|commande/.test(q)) {
    return "orderTrack";
  }
  if (/ship|deliver|delivery|शिप|डिलीव|توصيل|livraison/.test(q)) {
    return "shipping";
  }
  if (/return|refund|exchange|वापस|रिटर्न|إرجاع|retour|rembours/.test(q)) {
    return "returns";
  }
  if (/pay|cod|payment|upi|card|भुगतान|دفع|paiement/.test(q)) {
    return "payment";
  }
  if (/contact|phone|email|call|support|संपर्क|اتصل|contacter/.test(q)) {
    return "contact";
  }
  if (/login|account|sign up|otp|wishlist|लॉगिन|खाता|تسجيل|connexion/.test(q)) {
    return "login";
  }
  if (/product|buy|price|shop|browse|show|find|खरीद|उत्पाद|منتج|produit|acheter/.test(q)) {
    return "product";
  }
  return "fallback";
}

function extractProductQuery(text) {
  return text
    .replace(/show|find|search|product|products|buy|price|shop|browse|me|the|a|an|for|about/gi, "")
    .trim();
}

export async function getChatbotReply({ message, language = "en", domain }) {
  const lang = getLang(language);
  const intent = matchIntent(message);
  const links = [];

  if (intent === "greeting") {
    return {
      reply: lang.greeting,
      suggestions: getQuickSuggestions(language),
    };
  }

  if (intent === "orderTrack") {
    links.push({ label: "Track Order", href: "/track" }, { label: "My Orders", href: "/user-dashboard/orders" });
    return { reply: lang.orderTrack, links, suggestions: getQuickSuggestions(language) };
  }

  if (intent === "shipping") {
    links.push({ label: "Shipping Policy", href: "/shipping-and-returns" });
    return { reply: lang.shipping, links, suggestions: getQuickSuggestions(language) };
  }

  if (intent === "returns") {
    links.push({ label: "Returns Policy", href: "/shipping-and-returns" });
    return { reply: lang.returns, links, suggestions: getQuickSuggestions(language) };
  }

  if (intent === "payment") {
    links.push({ label: "Shop Now", href: "/shop" });
    return { reply: lang.payment, links, suggestions: getQuickSuggestions(language) };
  }

  if (intent === "login") {
    links.push({ label: "Login", href: "/login" }, { label: "My Account", href: "/user-dashboard" });
    return { reply: lang.login, links, suggestions: getQuickSuggestions(language) };
  }

  if (intent === "contact") {
    const contact = await findContactSectionDocument(domain);
    let reply = lang.contact + "\n";
    if (contact?.phone) reply += `\n📞 ${contact.phone}`;
    if (contact?.email) reply += `\n✉️ ${contact.email}`;
    if (contact?.address) reply += `\n📍 ${contact.address}`;
    links.push({ label: "Contact Us", href: "/contact" }, { label: "Help Center", href: "/help" });
    return { reply: reply.trim(), links, suggestions: getQuickSuggestions(language) };
  }

  if (intent === "product") {
    const query = extractProductQuery(message) || message;
    const products = await Product.find({
      status: "active",
      name: { $regex: query.slice(0, 50), $options: "i" },
    })
      .select("name slug price salePrice images category")
      .populate("category", "slug")
      .limit(3)
      .lean();

    if (!products.length) {
      links.push({ label: "Browse Shop", href: "/shop" });
      return { reply: lang.productNone, links, suggestions: getQuickSuggestions(language) };
    }

    const lines = products.map((p) => {
      const price = p.salePrice || p.price;
      const slug = p.category?.slug || "shop";
      return `• **${p.name}** — ₹${price}`;
    });

    const productLinks = products.map((p) => ({
      label: p.name,
      href: `/${p.category?.slug || "shop"}/${p.slug}`,
      price: p.salePrice || p.price,
      image: p.images?.[0]?.url,
    }));

    return {
      reply: `${lang.productFound}\n\n${lines.join("\n")}`,
      links: productLinks,
      suggestions: getQuickSuggestions(language),
    };
  }

  // Try FAQ keyword match
  const faqs = await FAQ.find({
    $or: [
      { question: { $regex: message.slice(0, 80), $options: "i" } },
      { answer: { $regex: message.slice(0, 80), $options: "i" } },
    ],
  })
    .limit(1)
    .lean();

  if (faqs.length) {
    return {
      reply: `${lang.faqPrefix}\n\n**${faqs[0].question}**\n${faqs[0].answer}`,
      links: [{ label: "All FAQs", href: "/faq" }],
      suggestions: getQuickSuggestions(language),
    };
  }

  links.push({ label: "Help Center", href: "/help" }, { label: "Contact", href: "/contact" });
  return { reply: lang.fallback, links, suggestions: getQuickSuggestions(language) };
}

export function getQuickSuggestions(language) {
  const map = {
    en: ["Track my order", "Shipping info", "Return policy", "Browse products", "Contact support"],
    hi: ["ऑर्डर ट्रैक करें", "शिपिंग जानकारी", "रिटर्न नीति", "उत्पाद देखें", "संपर्क करें"],
    ar: ["تتبع الطلب", "معلومات الشحن", "سياسة الإرجاع", "تصفح المنتجات", "اتصل بالدعم"],
    fr: ["Suivre commande", "Info livraison", "Politique retour", "Voir produits", "Contacter"],
  };
  return map[language] || map.en;
}

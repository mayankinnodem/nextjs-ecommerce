/** Default static store pages admin can manage SEO for */
export const STATIC_SEO_PAGES = [
  { path: "/", label: "Homepage", robotsIndex: true },
  { path: "/shop", label: "Shop", robotsIndex: true },
  { path: "/about", label: "About Us", robotsIndex: true },
  { path: "/contact", label: "Contact", robotsIndex: true },
  { path: "/faq", label: "FAQ", robotsIndex: true },
  { path: "/help", label: "Help", robotsIndex: true },
  { path: "/all-categories", label: "All Categories", robotsIndex: true },
  { path: "/privacy-policy", label: "Privacy Policy", robotsIndex: true },
  { path: "/terms-and-conditions", label: "Terms & Conditions", robotsIndex: true },
  { path: "/shipping-and-returns", label: "Shipping & Returns", robotsIndex: true },
  { path: "/track", label: "Track Order", robotsIndex: true },
  { path: "/cart", label: "Cart", robotsIndex: false },
  { path: "/checkout", label: "Checkout", robotsIndex: false },
  { path: "/login", label: "Login", robotsIndex: false },
  { path: "/delete-account", label: "Delete Account", robotsIndex: false },
];

export const EMPTY_SEO = {
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: { url: "", public_id: "" },
  canonicalUrl: "",
  publisher: "",
  language: "en",
  structuredData: null,
  robotsIndex: true,
  robotsFollow: true,
};

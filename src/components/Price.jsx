"use client";

import { useLocale } from "@/context/LocaleContext";

/** Displays an INR amount converted to the user's selected currency */
export default function Price({ amount, className = "" }) {
  const { formatPrice } = useLocale();
  return <span className={className}>{formatPrice(amount)}</span>;
}

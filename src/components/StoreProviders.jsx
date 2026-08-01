"use client";

import { LocaleProvider } from "@/context/LocaleContext";

export default function StoreProviders({ children }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

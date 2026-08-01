import { CURRENCIES, BASE_CURRENCY } from "@/lib/localeConfig";
import { jsonResponse } from "@/lib/apiHelpers";

let cachedRates = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchLiveRates() {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const usdToEur = data.rates.EUR;
    const usdToGbp = data.rates.GBP;
    if (!usdToEur) return null;

    // INR rate from config; update others from live USD base
    const inrPerUsd = 1 / (CURRENCIES.USD.rate || 0.012);

    return {
      INR: 1,
      USD: 1 / inrPerUsd,
      EUR: (1 / usdToEur) / inrPerUsd,
      GBP: (1 / usdToGbp) / inrPerUsd,
      AED: CURRENCIES.AED.rate,
      SAR: CURRENCIES.SAR.rate,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();

  if (cachedRates && now - cacheTime < CACHE_TTL) {
    return jsonResponse({ success: true, rates: cachedRates, base: BASE_CURRENCY });
  }

  const live = await fetchLiveRates();

  if (live) {
    cachedRates = live;
    cacheTime = now;
    return jsonResponse({ success: true, rates: live, base: BASE_CURRENCY, live: true });
  }

  const fallback = Object.fromEntries(
    Object.entries(CURRENCIES).map(([code, c]) => [code, c.rate])
  );

  return jsonResponse({
    success: true,
    rates: fallback,
    base: BASE_CURRENCY,
    live: false,
  });
}

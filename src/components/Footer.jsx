"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { pickLocalized } from "@/lib/i18nContent";

function getSiteUrl() {
  const fromEnv = (process.env.NEXT_PUBLIC_BASE_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "";
}

function FooterSkeleton() {
  return (
    <footer className="bg-gray-900 pt-10 sm:pt-14 pb-6">
      <div className="page-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton h-6 w-32 bg-gray-700" />
            <div className="skeleton h-4 w-full bg-gray-700" />
            <div className="skeleton h-4 w-5/6 bg-gray-700" />
          </div>
        ))}
      </div>
    </footer>
  );
}

export default function Footer() {
  const { t, language } = useLocale();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteUrl, setSiteUrl] = useState(getSiteUrl);

  useEffect(() => {
    if (!siteUrl) setSiteUrl(getSiteUrl());

    fetch("/api/store/contact-section", { cache: "force-cache" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setContact(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteUrl]);

  if (loading) return <FooterSkeleton />;

  const title =
    pickLocalized(contact, "title", language, "") ||
    contact?.companyName ||
    "Store";
  const description = pickLocalized(
    contact,
    "description",
    language,
    t("footer.defaultDescription")
  );

  const quickLinks = [
    ["/", "nav.home"],
    ["/shop", "nav.shop"],
    ["/about", "nav.about"],
    ["/contact", "nav.contact"],
  ];

  const supportLinks = [
    ["/help", "footer.helpCenter"],
    ["/faq", "footer.faq"],
    ["/shipping-and-returns", "footer.shipping"],
    ["/privacy-policy", "footer.privacy"],
    ["/terms-and-conditions", "footer.terms"],
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-300 pt-10 sm:pt-14 pb-safe">
      <div className="page-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        <div>
          {contact?.logo?.url && (
            <img
              src={contact.logo.url}
              alt={title}
              className="h-10 sm:h-12 mb-4 object-contain"
            />
          )}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3">{title}</h2>
          <p className="text-sm leading-relaxed text-gray-400">{description}</p>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            {t("footer.quickLinks")}
          </h3>
          <ul className="space-y-2 text-sm">
            {quickLinks.map(([href, key]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition py-0.5 inline-block">
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            {t("footer.support")}
          </h3>
          <ul className="space-y-2 text-sm">
            {supportLinks.map(([href, key]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition py-0.5 inline-block">
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            {t("footer.getInTouch")}
          </h3>
          <div className="space-y-3 text-sm">
            {contact?.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-white transition"
              >
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span className="break-words">{contact.address}</span>
              </a>
            )}
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Phone size={16} className="shrink-0" /> {contact.phone}
              </a>
            )}
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 hover:text-white transition min-w-0"
              >
                <Mail size={16} className="shrink-0" />
                <span className="break-all">{contact.email}</span>
              </a>
            )}

            <a
              href={`https://secure.trust-provider.com/ttb_searcher/trustlogo?v_querytype=W&v_shortname=CL1&v_search=${encodeURIComponent(
                siteUrl ? `${siteUrl}/` : "https://tarkeshwarartsglobal.com/"
              )}&x=6&y=5`}
              target="_blank"
              rel="noopener noreferrer"
              title="Secured by PositiveSSL"
              className="inline-block pt-2 max-w-full"
            >
              <img
                src="/positivessl-trust-seal.png"
                alt="Secured by PositiveSSL"
                width={222}
                height={54}
                className="h-[44px] sm:h-[54px] w-auto max-w-full hover:opacity-90 transition"
              />
            </a>
          </div>

          {contact?.socialLinks?.length > 0 && (
            <div className="flex gap-3 mt-5 flex-wrap">
              {contact.socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition"
                  title={social.platform}
                >
                  {social.icon?.url ? (
                    <img
                      src={social.icon.url}
                      alt={social.platform}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="text-sm">{social.platform}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 sm:mt-12 border-t border-gray-800 py-5 sm:py-6 text-center text-xs sm:text-sm text-gray-500 px-4">
        © {new Date().getFullYear()} {title}. {t("footer.rights")}
      </div>
    </footer>
  );
}

import type { Locale } from "./i18n";

export const AFFILIATE_URL = {
  ja: "https://doda.jp/",
  en: "https://www.linkedin.com/jobs/",
} as const;

export function getAffiliateOfferUrl(locale: Locale): string {
  if (locale === "ja") {
    return process.env.NEXT_PUBLIC_AFFILIATE_OFFER_JA ?? AFFILIATE_URL.ja;
  }
  return process.env.NEXT_PUBLIC_AFFILIATE_OFFER_EN ?? AFFILIATE_URL.en;
}

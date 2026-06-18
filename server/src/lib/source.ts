import { LeadSource } from "@prisma/client";

export interface SourceSignals {
  utmSource?: string | null;
  utmMedium?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  referrer?: string | null;
}

const SEARCH_ENGINES = ["google.", "bing.", "duckduckgo.", "yahoo.", "ecosia.", "startpage."];
const SOCIAL_HOSTS = [
  "facebook.", "instagram.", "linkedin.", "lnkd.in", "twitter.", "x.com",
  "t.co", "youtube.", "tiktok.", "pinterest.", "reddit.",
];
const PAID_MEDIUMS = ["cpc", "ppc", "paid", "paidsearch", "paid_search", "sea", "display"];
const SOCIAL_MEDIUMS = ["social", "social-paid", "paid-social", "paid_social"];
const ORGANIC_MEDIUMS = ["organic", "seo"];

function lc(v?: string | null): string {
  return (v ?? "").toString().trim().toLowerCase();
}

function hostMatches(referrer: string, needles: string[]): boolean {
  return needles.some((n) => referrer.includes(n));
}

/**
 * Bepaalt de leadbron uit UTM-parameters, click-ids en referrer.
 * Volgorde: betaald (SEA) > social > organisch (SEO) > direct.
 */
export function resolveSource(signals: SourceSignals): LeadSource {
  const utmSource = lc(signals.utmSource);
  const utmMedium = lc(signals.utmMedium);
  const referrer = lc(signals.referrer);
  const hasGclid = !!lc(signals.gclid);
  const hasFbclid = !!lc(signals.fbclid);

  // Betaald zoeken / display
  if (hasGclid || PAID_MEDIUMS.includes(utmMedium)) return LeadSource.SEA;

  // Social (betaald of organisch)
  if (
    hasFbclid ||
    SOCIAL_MEDIUMS.includes(utmMedium) ||
    SOCIAL_HOSTS.some((h) => utmSource.includes(h.replace(".", ""))) ||
    (referrer && hostMatches(referrer, SOCIAL_HOSTS))
  ) {
    return LeadSource.SOCIAL;
  }

  // Organisch zoeken
  if (
    ORGANIC_MEDIUMS.includes(utmMedium) ||
    (referrer && hostMatches(referrer, SEARCH_ENGINES))
  ) {
    return LeadSource.SEO;
  }

  // Expliciete utm zonder match -> behandel als direct/overig
  return LeadSource.DIRECT;
}

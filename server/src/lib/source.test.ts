import { describe, it, expect } from "vitest";
import { resolveSource } from "./source.js";

describe("resolveSource", () => {
  it("herkent betaald zoeken (SEA) via gclid", () => {
    expect(resolveSource({ gclid: "abc123" })).toBe("SEA");
  });

  it("herkent SEA via utm_medium=cpc", () => {
    expect(resolveSource({ utmMedium: "cpc" })).toBe("SEA");
  });

  it("herkent social via fbclid", () => {
    expect(resolveSource({ fbclid: "xyz" })).toBe("SOCIAL");
  });

  it("herkent social via referrer", () => {
    expect(resolveSource({ referrer: "https://www.linkedin.com/feed" })).toBe("SOCIAL");
  });

  it("herkent social via utm_medium", () => {
    expect(resolveSource({ utmMedium: "social" })).toBe("SOCIAL");
  });

  it("herkent SEO via organische referrer", () => {
    expect(resolveSource({ referrer: "https://www.google.com/search?q=test" })).toBe("SEO");
  });

  it("herkent SEO via utm_medium=organic", () => {
    expect(resolveSource({ utmMedium: "organic" })).toBe("SEO");
  });

  it("valt terug op DIRECT zonder signalen", () => {
    expect(resolveSource({})).toBe("DIRECT");
  });

  it("prioriteert SEA boven social", () => {
    expect(resolveSource({ gclid: "g", fbclid: "f" })).toBe("SEA");
  });
});

import { describe, it, expect } from "vitest";
import { computeExpectedRevenue } from "./revenue.js";

describe("computeExpectedRevenue", () => {
  it("berekent omzet voor gekwalificeerde fase", () => {
    expect(computeExpectedRevenue(10000, 0.4)).toBe(4000);
  });

  it("gebruikt de win-kans van de fase", () => {
    expect(computeExpectedRevenue(25000, 0.8)).toBe(20000);
  });

  it("geeft volledige waarde bij gewonnen (100%)", () => {
    expect(computeExpectedRevenue(10000, 1)).toBe(10000);
  });

  it("geeft null onder de drempel", () => {
    expect(computeExpectedRevenue(10000, 0.1)).toBeNull();
  });

  it("geeft null zonder dealwaarde", () => {
    expect(computeExpectedRevenue(null, 0.8)).toBeNull();
  });

  it("rondt af op 2 decimalen", () => {
    expect(computeExpectedRevenue(3333.33, 0.4)).toBe(1333.33);
  });
});

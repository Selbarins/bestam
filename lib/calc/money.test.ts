import { describe, it, expect } from "vitest";
import { toMad, roundMoney } from "./money";

describe("roundMoney", () => {
  it("rounds to 2 decimals", () => {
    expect(roundMoney(1.005)).toBe(1.01);
    expect(roundMoney(1.004)).toBe(1);
    expect(roundMoney(10.1)).toBe(10.1);
  });
});

describe("toMad", () => {
  it("uses rate 1 by default", () => {
    expect(toMad(100)).toBe(100);
  });

  it("applies rate and rounds", () => {
    expect(toMad(10, 10.5)).toBe(105);
    expect(toMad("25.555", 1)).toBe(25.56);
  });

  it("returns 0 for invalid input", () => {
    expect(toMad(NaN)).toBe(0);
    expect(toMad(10, NaN)).toBe(0);
  });
});

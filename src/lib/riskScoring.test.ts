import { describe, expect, it } from "vitest";
import { calculateRiskScore } from "./riskScoring";

const baseSignals = {
  status: "ACTIVE",
  bankruptcy: false,
  enforcementProceedings: 0,
  defendantCourtCases: 0,
  ageMonths: 48,
  authorizedCapital: 500_000,
  negativeProfitYears: 0,
  revenueDropPercent: 0,
  massAddress: false,
  frequentDirectorChanges: false,
};

describe("calculateRiskScore", () => {
  it("returns low risk for a mature active company without negative signals", () => {
    const result = calculateRiskScore(baseSignals);

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.reasons).toEqual([]);
  });

  it("caps accumulated risk at 100 and labels high risk", () => {
    const result = calculateRiskScore({
      ...baseSignals,
      status: "LIQUIDATION",
      bankruptcy: true,
      enforcementProceedings: 4,
      defendantCourtCases: 8,
      ageMonths: 5,
      authorizedCapital: 10_000,
      negativeProfitYears: 2,
      revenueDropPercent: 70,
      massAddress: true,
    });

    expect(result.score).toBe(100);
    expect(result.level).toBe("high");
    expect(result.reasons.map((reason) => reason.code)).toContain("liquidation");
    expect(result.reasons.map((reason) => reason.code)).toContain("bankruptcy");
    expect(result.reasons.map((reason) => reason.code)).toContain("revenue_drop");
  });

  it("uses medium risk for scores from 26 to 60", () => {
    const result = calculateRiskScore({
      ...baseSignals,
      enforcementProceedings: 1,
      authorizedCapital: 10_000,
    });

    expect(result.score).toBe(30);
    expect(result.level).toBe("medium");
  });
});

import { describe, expect, it } from "vitest";
import {
  FREE_VERIFIED_CHECK_LIMIT,
  FREE_UNVERIFIED_CHECK_LIMIT,
  buildTrialDecision,
  isCorporateEmail,
} from "./trialLimits";

describe("trial access limits", () => {
  it("keeps unverified free accounts to one check", () => {
    expect(
      buildTrialDecision({
        plan: "free",
        workspaceStatus: "unverified",
        userChecks: 0,
        deviceChecks: 0,
        ipChecks: 0,
      }),
    ).toMatchObject({ allowed: true, limit: FREE_UNVERIFIED_CHECK_LIMIT, remaining: 1 });

    expect(
      buildTrialDecision({
        plan: "free",
        workspaceStatus: "unverified",
        userChecks: 1,
        deviceChecks: 0,
        ipChecks: 0,
      }).allowed,
    ).toBe(false);
  });

  it("allows three checks only for verified workspaces", () => {
    expect(
      buildTrialDecision({
        plan: "free",
        workspaceStatus: "verified",
        userChecks: 2,
        deviceChecks: 2,
        ipChecks: 2,
      }),
    ).toMatchObject({ allowed: true, limit: FREE_VERIFIED_CHECK_LIMIT, remaining: 1 });
  });

  it("blocks repeated free use from the same unverified device or ip", () => {
    expect(
      buildTrialDecision({
        plan: "free",
        workspaceStatus: "unverified",
        userChecks: 0,
        deviceChecks: 1,
        ipChecks: 0,
      }).allowed,
    ).toBe(false);

    expect(
      buildTrialDecision({
        plan: "free",
        workspaceStatus: "unverified",
        userChecks: 0,
        deviceChecks: 0,
        ipChecks: 1,
      }).allowed,
    ).toBe(false);
  });

  it("does not treat public mailbox domains as corporate email", () => {
    expect(isCorporateEmail("owner@mail.ru")).toBe(false);
    expect(isCorporateEmail("risk@example.com")).toBe(true);
  });
});

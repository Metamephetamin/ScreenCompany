import { describe, expect, it } from "vitest";
import { canAccessAdmin } from "./admin";

describe("admin access", () => {
  it("allows only admin users", () => {
    expect(canAccessAdmin({ role: "admin" })).toBe(true);
    expect(canAccessAdmin({ role: "user" })).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
  });
});

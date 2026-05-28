import { describe, expect, it } from "vitest";
import {
  assertSameOrigin,
  credentialsSchema,
  normalizeEmailInput,
  registerSchema,
  stripWhitespace,
} from "./security";

describe("auth input hardening", () => {
  it("normalizes email casing and surrounding whitespace", () => {
    expect(normalizeEmailInput("  Demo@Risk.Local ")).toBe("demo@risk.local");
  });

  it("removes whitespace while typing credentials", () => {
    expect(stripWhitespace("de mo\t@risk.local")).toBe("demo@risk.local");
    expect(stripWhitespace("pass word\n123")).toBe("password123");
  });

  it("rejects whitespace in login credentials on the server", () => {
    const result = credentialsSchema.safeParse({
      email: "demo @risk.local",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("requires stronger registration passwords", () => {
    const result = registerSchema.safeParse({
      email: "new@risk.local",
      password: "1234567",
      termsAccepted: true,
    });

    expect(result.success).toBe(false);
  });

  it("requires legal terms consent for registration", () => {
    const result = registerSchema.safeParse({
      email: "new@risk.local",
      password: "Password123",
      termsAccepted: false,
    });

    expect(result.success).toBe(false);
  });

  it("rejects cross-origin unsafe requests", () => {
    const request = new Request("https://konturagent.ru/api/check", {
      method: "POST",
      headers: {
        host: "konturagent.ru",
        origin: "https://evil.example",
      },
    });

    expect(assertSameOrigin(request).allowed).toBe(false);
  });

  it("allows same-origin unsafe requests", () => {
    const request = new Request("https://konturagent.ru/api/check", {
      method: "POST",
      headers: {
        host: "konturagent.ru",
        origin: "https://konturagent.ru",
      },
    });

    expect(assertSameOrigin(request).allowed).toBe(true);
  });
});

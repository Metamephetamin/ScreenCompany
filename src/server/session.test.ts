import { afterEach, describe, expect, it, vi } from "vitest";

describe("shouldUseSecureCookies", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses secure cookies for HTTPS public URLs", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/app");
    vi.stubEnv("NEXTAUTH_URL", "https://risk.example.com");

    return expect(import("./session").then((module) => module.shouldUseSecureCookies())).resolves.toBe(
      true,
    );
  });

  it("allows non-secure cookies for HTTP IP deployments", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/app");
    vi.stubEnv("NEXTAUTH_URL", "http://217.114.7.59");

    return expect(import("./session").then((module) => module.shouldUseSecureCookies())).resolves.toBe(
      false,
    );
  });
});

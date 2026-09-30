import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "../../../next.config";

describe("security headers / CSP", () => {
  it("sets Content-Security-Policy without unsafe-eval", () => {
    const csp = securityHeaders.find(
      (header) => header.key === "Content-Security-Policy",
    );
    expect(csp?.value).toBe(contentSecurityPolicy);
    expect(contentSecurityPolicy).toContain("script-src 'self' 'unsafe-inline'");
    expect(contentSecurityPolicy).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
  });
});

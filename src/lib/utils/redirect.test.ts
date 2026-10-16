import { describe, it, expect } from "vitest";
import { validateRedirectPath } from "./redirect";

describe("Open Redirect Prevention Validator", () => {
  it("allows safe relative paths starting with a single '/'", () => {
    expect(validateRedirectPath("/dashboard")).toBe("/dashboard");
    expect(validateRedirectPath("/scan")).toBe("/scan");
    expect(validateRedirectPath("/settings?tab=profile")).toBe("/settings?tab=profile");
    expect(validateRedirectPath("/swap/detail/123")).toBe("/swap/detail/123");
  });

  it("blocks protocol-relative URLs starting with '//'", () => {
    expect(validateRedirectPath("//evil.com")).toBe("/dashboard");
    expect(validateRedirectPath("//attacker.org/steal")).toBe("/dashboard");
    expect(validateRedirectPath("///nested/evil")).toBe("/dashboard");
  });

  it("blocks absolute URLs with schemes", () => {
    expect(validateRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(validateRedirectPath("http://evil.com/login")).toBe("/dashboard");
    expect(validateRedirectPath("javascript:alert(1)")).toBe("/dashboard");
    expect(validateRedirectPath("data:text/html,evil")).toBe("/dashboard");
  });

  it("blocks backslash bypass attempts", () => {
    expect(validateRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(validateRedirectPath("\\evil.com")).toBe("/dashboard");
    expect(validateRedirectPath("/dashboard\\evil")).toBe("/dashboard");
  });

  it("falls back to default path on empty or invalid inputs", () => {
    expect(validateRedirectPath(null)).toBe("/dashboard");
    expect(validateRedirectPath(undefined)).toBe("/dashboard");
    expect(validateRedirectPath("")).toBe("/dashboard");
    expect(validateRedirectPath("   ")).toBe("/dashboard");
    expect(validateRedirectPath(null, "/custom")).toBe("/custom");
  });
});

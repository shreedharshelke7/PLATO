import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  calculatePasswordStrength,
} from "./schemas";
import { mapSupabaseAuthError } from "./errors";

describe("Authentication Zod Schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and non-empty password", () => {
      const valid = loginSchema.safeParse({
        email: "warrior@olympus.gr",
        password: "secretPassword123",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const invalid = loginSchema.safeParse({
        email: "not-an-email",
        password: "secretPassword123",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain("valid email");
      }
    });

    it("rejects empty password", () => {
      const invalid = loginSchema.safeParse({
        email: "warrior@olympus.gr",
        password: "",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("signupSchema", () => {
    it("validates successful registration details", () => {
      const valid = signupSchema.safeParse({
        name: "Plato",
        email: "plato@academy.gr",
        password: "SacredPhilosophy1!",
        confirmPassword: "SacredPhilosophy1!",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects short names (< 2 characters)", () => {
      const invalid = signupSchema.safeParse({
        name: "P",
        email: "p@academy.gr",
        password: "SacredPhilosophy1!",
        confirmPassword: "SacredPhilosophy1!",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain("at least 2 characters");
      }
    });

    it("rejects passwords shorter than 8 characters", () => {
      const invalid = signupSchema.safeParse({
        name: "Socrates",
        email: "socrates@academy.gr",
        password: "short",
        confirmPassword: "short",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain("at least 8 characters");
      }
    });

    it("rejects mismatched confirmPassword", () => {
      const invalid = signupSchema.safeParse({
        name: "Aristotle",
        email: "aristotle@academy.gr",
        password: "GoldenMean123!",
        confirmPassword: "DifferentPassword123!",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toBe("Passwords do not match");
      }
    });
  });

  describe("resetPasswordSchema & updatePasswordSchema", () => {
    it("validates email for reset", () => {
      expect(resetPasswordSchema.safeParse({ email: "hero@olympus.gr" }).success).toBe(true);
      expect(resetPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false);
    });

    it("validates password matching on update", () => {
      const valid = updatePasswordSchema.safeParse({
        password: "NewSacredPassword8!",
        confirmPassword: "NewSacredPassword8!",
      });
      expect(valid.success).toBe(true);

      const mismatch = updatePasswordSchema.safeParse({
        password: "NewSacredPassword8!",
        confirmPassword: "DifferentPassword!",
      });
      expect(mismatch.success).toBe(false);
    });
  });

  describe("calculatePasswordStrength", () => {
    it("evaluates weak to strong passwords accurately", () => {
      expect(calculatePasswordStrength("").score).toBe(0);
      expect(calculatePasswordStrength("simple").score).toBe(0);
      expect(calculatePasswordStrength("longsimple").score).toBe(1);
      expect(calculatePasswordStrength("LongSimple").score).toBe(2);
      expect(calculatePasswordStrength("LongSimple1").score).toBe(3);
      expect(calculatePasswordStrength("LongSimple1!").score).toBe(4);
      expect(calculatePasswordStrength("LongSimple1!").label).toBe("Strong");
    });
  });
});

describe("Supabase Error to User Message Mapper", () => {
  it("maps invalid login credentials", () => {
    const res = mapSupabaseAuthError({ message: "Invalid login credentials" });
    expect(res.message).toContain("Invalid email or password");
    expect(res.isEmailNotConfirmed).toBeFalsy();
  });

  it("maps unconfirmed email and flags for resend action", () => {
    const res = mapSupabaseAuthError({ message: "Email not confirmed" });
    expect(res.message).toContain("confirm your email");
    expect(res.isEmailNotConfirmed).toBe(true);
  });

  it("maps already registered user message", () => {
    const res = mapSupabaseAuthError({ message: "User already registered" });
    expect(res.message).toContain("already exists");
  });

  it("maps rate limits and sets flag", () => {
    const res = mapSupabaseAuthError({ message: "over_email_send_rate_limit" });
    expect(res.message).toContain("Too many attempts");
    expect(res.isRateLimit).toBe(true);
  });

  it("maps network connectivity failures", () => {
    const res = mapSupabaseAuthError("Failed to fetch");
    expect(res.message).toContain("Network connection lost");
  });

  it("handles null or undefined safely", () => {
    const res = mapSupabaseAuthError(null);
    expect(res.message).toBe("An unexpected error occurred. Please try again.");
  });
});

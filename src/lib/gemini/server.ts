import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/supabase/server";

// Best-effort in-memory rate limiter
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

// Track request timestamps and counters by IP/User
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const guestDailyCounts = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

/**
 * Basic in-memory rate limit check (backward-compatible)
 */
export function checkRateLimit(req: NextRequest): boolean {
  const ip = getClientIp(req);
  const now = Date.now();
  const client = ipRequestCounts.get(ip);

  if (!client || now > client.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (client.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  client.count++;
  return true;
}

export interface AbuseCheckResult {
  allowed: boolean;
  code?: string;
  message?: string;
  isGuest?: boolean;
}

/**
 * Tiered AI abuse protection:
 * - Users with their own Gemini key (x-user-key) bypass shared server limits completely.
 * - Signed-in users get high best-effort capacity.
 * - Guests get a low daily limit (5 scans/day per IP) with a friendly sign-in prompt.
 * Server verifies user identity via Supabase auth cookies, never client flags.
 */
export async function checkAIAccessLimits(req: NextRequest): Promise<AbuseCheckResult> {
  const userKey = req.headers.get("x-user-key")?.trim();
  if (userKey) {
    // Custom key bypasses shared limits
    return { allowed: true };
  }

  const ip = getClientIp(req);
  const now = Date.now();

  // Verify server-side Supabase authentication
  let isUserSignedIn = false;
  try {
    const user = await getVerifiedUser();
    if (user) {
      isUserSignedIn = true;
    }
  } catch {
    isUserSignedIn = false;
  }

  if (isUserSignedIn) {
    // Burst protection: 40 requests per minute
    const client = ipRequestCounts.get(`user_${ip}`);
    if (!client || now > client.resetAt) {
      ipRequestCounts.set(`user_${ip}`, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, isGuest: false };
    }
    if (client.count >= 40) {
      return {
        allowed: false,
        code: "RATE_LIMIT_EXCEEDED",
        message: "Request limit exceeded. Please wait a minute before making more requests.",
        isGuest: false,
      };
    }
    client.count++;
    return { allowed: true, isGuest: false };
  }

  // Guest Daily Quota: 5 AI calls per 24 hours per IP
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const guestRecord = guestDailyCounts.get(ip);

  if (!guestRecord || now > guestRecord.resetAt) {
    guestDailyCounts.set(ip, { count: 1, resetAt: now + ONE_DAY_MS });
    return { allowed: true, isGuest: true };
  }

  if (guestRecord.count >= 5) {
    return {
      allowed: false,
      code: "GUEST_DAILY_LIMIT_REACHED",
      message:
        "You have reached the daily 5-scan limit for guest mode. Sign in to your free account for higher limits, or add your personal Gemini key in Settings.",
      isGuest: true,
    };
  }

  guestRecord.count++;
  return { allowed: true, isGuest: true };
}

export function getGeminiConfig(req: NextRequest) {
  const userKey = req.headers.get("x-user-key")?.trim();
  const apiKey = userKey || process.env.GEMINI_API_KEY?.trim();
  let model = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";

  // Google Gemini API model normalization:
  // "gemini-2.5-flash" does not exist in Google AI Studio and returns 404 (Not Found).
  // Automatically normalize to Google's official stable vision model "gemini-1.5-flash".
  if (model === "gemini-2.5-flash" || !model) {
    model = "gemini-1.5-flash";
  }

  return { apiKey, model, isUserKey: Boolean(userKey) };
}

export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

/**
 * Generate Gemini content with automatic fallback to gemini-1.5-flash
 * if the primary model is not found, deprecated, or unavailable.
 */
export async function generateContentWithFallback(
  ai: GoogleGenAI,
  reqModel: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentsPayload: any
) {
  try {
    return await ai.models.generateContent({
      ...contentsPayload,
      model: reqModel,
    });
  } catch (err: unknown) {
    const errStr = String(err).toLowerCase();
    if (
      (errStr.includes("not found") || errStr.includes("404") || errStr.includes("unsupported")) &&
      reqModel !== "gemini-1.5-flash"
    ) {
      return await ai.models.generateContent({
        ...contentsPayload,
        model: "gemini-1.5-flash",
      });
    }
    throw err;
  }
}

export function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export function errorResponse(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

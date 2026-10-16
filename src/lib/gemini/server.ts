import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Best-effort in-memory per-IP rate limiter (20 requests per minute)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 25;
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(req: NextRequest): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

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

export function getGeminiConfig(req: NextRequest) {
  // Check optional user key in x-user-key header first
  const userKey = req.headers.get("x-user-key")?.trim();
  const apiKey = userKey || process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  return { apiKey, model, isUserKey: Boolean(userKey) };
}

export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  // Strip ```json and ```
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

import { NextRequest, NextResponse } from "next/server";
import { getGeminiConfig, createGeminiClient, errorResponse } from "@/lib/gemini/server";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { apiKey } = getGeminiConfig(req);
  return NextResponse.json({
    ok: true,
    aiConfigured: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const { apiKey, model } = getGeminiConfig(req);
  if (!apiKey) {
    return errorResponse("No Gemini API key provided. Please paste a key.", "MISSING_KEY", 400);
  }

  try {
    const ai = createGeminiClient(apiKey);
    const response = await ai.models.generateContent({
      model,
      contents: "ping",
    });
    if (!response || !response.text) {
      return errorResponse("Model returned empty response", "EMPTY_RESPONSE", 500);
    }
    return NextResponse.json({
      ok: true,
      valid: true,
      message: "API key verified successfully with Gemini 2.5 Flash!",
    });
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    let friendly = "Failed to authenticate with Gemini API.";
    if (rawMsg.includes("API_KEY_INVALID") || rawMsg.includes("403") || rawMsg.toLowerCase().includes("invalid")) {
      friendly = "API key is invalid. Please verify the key copied from Google AI Studio.";
    } else if (rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("429")) {
      friendly = "Quota limit reached on this key. Please wait or check your Google AI Studio quota.";
    } else {
      friendly = rawMsg;
    }
    return errorResponse(friendly, "INVALID_KEY", 400);
  }
}

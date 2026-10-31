import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/gemini/server";
import { getAIConfig, generateTextCompletion } from "@/lib/ai/provider";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const aiConfig = getAIConfig(req, "text");
  return NextResponse.json({
    ok: true,
    aiConfigured: Boolean(aiConfig?.apiKey),
    provider: aiConfig?.provider || "none",
    model: aiConfig?.model || "none",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const aiConfig = getAIConfig(req, "text");
  if (!aiConfig || !aiConfig.apiKey) {
    return errorResponse("No AI API key provided. Please paste your Groq or Gemini key.", "MISSING_KEY", 400);
  }

  try {
    const text = await generateTextCompletion({
      config: aiConfig,
      prompt: "Respond with the word pong in lowercase.",
    });

    if (!text) {
      return errorResponse("Model returned empty response", "EMPTY_RESPONSE", 500);
    }

    const providerName = aiConfig.provider === "groq" ? "Groq LPU" : "Gemini";
    return NextResponse.json({
      ok: true,
      valid: true,
      provider: aiConfig.provider,
      message: `✓ Connected to ${providerName} (${aiConfig.model}) successfully!`,
    });
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    let friendly = `Failed to authenticate with ${aiConfig.provider === "groq" ? "Groq" : "Gemini"} API.`;
    if (
      rawMsg.includes("API_KEY_INVALID") ||
      rawMsg.includes("403") ||
      rawMsg.includes("401") ||
      rawMsg.toLowerCase().includes("invalid_api_key") ||
      rawMsg.toLowerCase().includes("invalid api key")
    ) {
      friendly = `API key is invalid. Please verify the key copied from ${aiConfig.provider === "groq" ? "Groq Cloud (console.groq.com)" : "Google AI Studio"}.`;
    } else if (rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("429")) {
      friendly = "Quota limit reached. Please wait a moment or check your API account.";
    } else {
      friendly = rawMsg;
    }
    return errorResponse(friendly, "INVALID_KEY", 400);
  }
}

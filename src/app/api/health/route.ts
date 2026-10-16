import { NextRequest, NextResponse } from "next/server";
import { getGeminiConfig } from "@/lib/gemini/server";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { apiKey } = getGeminiConfig(req);
  return NextResponse.json({
    ok: true,
    aiConfigured: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkAIAccessLimits,
  cleanJsonOutput,
  errorResponse,
} from "@/lib/gemini/server";
import { getAIConfig, generateVisionCompletion } from "@/lib/ai/provider";

export const maxDuration = 30;

const ScanResponseSchema = z.object({
  dishName: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      portion: z.object({
        amount: z.number(),
        unit: z.string(),
        grams: z.number(),
      }),
      calories: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fat_g: z.number(),
      fiber_g: z.number(),
      confidence: z.number().optional().default(0.85),
    })
  ),
  notes: z.string().optional().default(""),
});

export type ScanResponse = z.infer<typeof ScanResponseSchema>;

export async function POST(req: NextRequest) {
  // 1. Rate limit & Tiered abuse protection
  const limitCheck = await checkAIAccessLimits(req);
  if (!limitCheck.allowed) {
    return errorResponse(
      limitCheck.message || "Rate limit exceeded.",
      limitCheck.code || "RATE_LIMIT_EXCEEDED",
      429
    );
  }

  // 2. Resolve AI provider config (Groq or Gemini)
  const aiConfig = getAIConfig(req, "vision");
  if (!aiConfig || !aiConfig.apiKey) {
    return errorResponse(
      "AI is not configured. Add your Groq API key (free at console.groq.com) or Gemini key in Settings or environment variables.",
      "AI_NOT_CONFIGURED",
      503
    );
  }

  // 3. Payload reading (accepts JSON base64 or FormData)
  let imageBase64 = "";
  let mimeType = "image/jpeg";

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      imageBase64 = body.imageBase64;
      mimeType = body.mimeType || "image/jpeg";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return errorResponse("No file uploaded in form data", "MISSING_FILE", 400);
      }
      if (file.size > 4 * 1024 * 1024) {
        return errorResponse("Image exceeds 4MB limit", "PAYLOAD_TOO_LARGE", 413);
      }
      mimeType = file.type;
      const buffer = Buffer.from(await file.arrayBuffer());
      imageBase64 = buffer.toString("base64");
    } else {
      return errorResponse("Unsupported Content-Type", "UNSUPPORTED_MEDIA_TYPE", 415);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error reading request body";
    return errorResponse(msg, "BAD_REQUEST", 400);
  }

  // Validate mime type
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimes.includes(mimeType)) {
    return errorResponse(
      "Invalid image format. Allowed formats: JPEG, PNG, WEBP",
      "INVALID_FORMAT",
      400
    );
  }

  // Validate base64 size (under 4MB)
  if (imageBase64.length * 0.75 > 4.5 * 1024 * 1024) {
    return errorResponse("Image payload exceeds 4MB limit", "PAYLOAD_TOO_LARGE", 413);
  }

  // 4. Prompt Vision AI
  const systemInstruction = `You are Demeter, the Olympian vision food analyst.
Analyze the provided food photograph. You excel at recognizing Indian dishes (thali, roti, chapati, dal tadka, rajma, chole, paneer butter masala, poha, upma, idli, dosa, sambar, vada pav, biryani, street snacks) and global meals.
Estimate portions using visual context (e.g. katori count, roti count, plate percentage, piece sizes).

Output strictly valid JSON conforming to this schema without any markdown formatting or commentary:
{
  "dishName": "Name of the overall meal (e.g. North Indian Thali, Masala Dosa with Sambar)",
  "items": [
    {
      "name": "Item name (e.g. Whole Wheat Roti, Yellow Dal)",
      "portion": {
        "amount": 2,
        "unit": "roti | katori | bowl | piece | slice | plate | grams",
        "grams": 70
      },
      "calories": 170,
      "protein_g": 6.2,
      "carbs_g": 35.0,
      "fat_g": 1.0,
      "fiber_g": 4.6,
      "confidence": 0.95
    }
  ],
  "notes": "Short helpful note on nutritional breakdown or visual cues."
}

CRITICAL RULES:
1. If the image does NOT contain food or drinks, return "items": [] and explain politely in "notes" that no edible items were detected.
2. Provide realistic macronutrient approximations based on standard references (IFCT / USDA).
3. Do not return markdown fences. Return ONLY the raw JSON string.`;

  try {
    const responseText = await generateVisionCompletion({
      config: aiConfig,
      prompt: systemInstruction,
      imageBase64,
      mimeType,
    });

    const cleanedJson = cleanJsonOutput(responseText);
    const parsed = JSON.parse(cleanedJson);
    const validated = ScanResponseSchema.parse(parsed);

    return NextResponse.json(validated);
  } catch (err: unknown) {
    const errorStr = String(err);
    if (errorStr.includes("not found") || errorStr.includes("model")) {
      return errorResponse(
        `AI vision model "${aiConfig.model}" was not found or is unavailable for this key.`,
        "MODEL_NOT_FOUND",
        503
      );
    }
    if (
      errorStr.includes("API_KEY_INVALID") ||
      errorStr.includes("403") ||
      errorStr.includes("401") ||
      errorStr.includes("invalid_api_key")
    ) {
      return errorResponse(
        `Invalid ${aiConfig.provider === "groq" ? "Groq" : "Gemini"} API key provided. Please verify your key in Settings.`,
        "INVALID_API_KEY",
        401
      );
    }
    if (errorStr.includes("rate_limit_exceeded") || errorStr.includes("429")) {
      return errorResponse(
        "AI rate limit reached. Please wait a moment before trying again.",
        "RATE_LIMIT_EXCEEDED",
        429
      );
    }

    return errorResponse(
      `Failed to analyze food image: ${err instanceof Error ? err.message : "Parsing error"}`,
      "ANALYSIS_FAILED",
      500
    );
  }
}

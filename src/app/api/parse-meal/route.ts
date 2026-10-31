import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkAIAccessLimits,
  cleanJsonOutput,
  errorResponse,
} from "@/lib/gemini/server";
import { getAIConfig, generateTextCompletion } from "@/lib/ai/provider";
import { searchLocalFoods } from "@/data/foods";

export const maxDuration = 30;

const ParseMealSchema = z.object({
  dishName: z.string().default("Logged Feast"),
  items: z.array(
    z.object({
      name: z.string(),
      portionAmount: z.number().default(1),
      portionUnit: z.string().default("serving"),
      grams: z.number().default(100),
      calories: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fat_g: z.number(),
      fiber_g: z.number(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const limitCheck = await checkAIAccessLimits(req);
  if (!limitCheck.allowed) {
    return errorResponse(
      limitCheck.message || "Rate limit exceeded.",
      limitCheck.code || "RATE_LIMIT_EXCEEDED",
      429
    );
  }

  const body = await req.json().catch(() => ({}));
  const text = (body.text || "").trim();

  if (!text) {
    return errorResponse("Text is required to parse a meal", "MISSING_TEXT", 400);
  }

  const aiConfig = getAIConfig(req, "text");

  // If AI key is available, use Groq or Gemini text for intelligent NLP portion extraction
  if (aiConfig && aiConfig.apiKey) {
    try {
      const prompt = `You are Demeter's nutrition parser. Convert this description into a structured meal item list:
"${text}"

Recognize Indian food terminology (roti, chapati, dal, katori, sabzi, thali, biryani, paneer, poha, etc.).
Return ONLY raw JSON conforming to this schema without markdown fences:
{
  "dishName": "Summary of meal",
  "items": [
    {
      "name": "Food item name",
      "portionAmount": 2,
      "portionUnit": "roti | katori | cup | piece | grams",
      "grams": 70,
      "calories": 170,
      "protein_g": 6.2,
      "carbs_g": 35.0,
      "fat_g": 1.0,
      "fiber_g": 4.6
    }
  ]
}`;

      const responseText = await generateTextCompletion({
        config: aiConfig,
        prompt,
      });

      const cleaned = cleanJsonOutput(responseText);
      const parsed = JSON.parse(cleaned);
      const validated = ParseMealSchema.parse(parsed);

      return NextResponse.json(validated);
    } catch {
      // Fallback to local offline matcher below
    }
  }

  // Offline / Fallback local regex matcher against LOCAL_FOODS
  const words = text.toLowerCase().split(/[,+&]|\band\b/);
  const matchedItems = [];

  for (const part of words) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check for leading numbers e.g. "2 rotis", "1 katori dal"
    const countMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.*)/);
    let count = 1;
    let query = trimmed;

    if (countMatch) {
      count = parseFloat(countMatch[1]) || 1;
      query = countMatch[2] || trimmed;
    }

    const matches = searchLocalFoods(query, 1);
    if (matches.length > 0) {
      const food = matches[0];
      matchedItems.push({
        name: food.name,
        portionAmount: count,
        portionUnit: food.servingUnit,
        grams: Math.round(food.servingGrams * count),
        calories: Math.round(food.perServing.calories * count),
        protein_g: Number((food.perServing.protein_g * count).toFixed(1)),
        carbs_g: Number((food.perServing.carbs_g * count).toFixed(1)),
        fat_g: Number((food.perServing.fat_g * count).toFixed(1)),
        fiber_g: Number((food.perServing.fiber_g * count).toFixed(1)),
      });
    }
  }

  return NextResponse.json({
    dishName: text.length > 40 ? `${text.slice(0, 37)}...` : text,
    items: matchedItems,
  });
}

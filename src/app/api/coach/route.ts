import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkAIAccessLimits,
  getGeminiConfig,
  createGeminiClient,
  cleanJsonOutput,
  errorResponse,
} from "@/lib/gemini/server";

export const maxDuration = 30;

const CoachResponseSchema = z.object({
  answer: z.string(),
  insights: z.array(z.string()).min(1),
  focusForTomorrow: z.string().optional().default(""),
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
  const question = (body.question || "").trim();
  const past7Days = body.past7DaysSummary || {};
  const profile = body.profile || {};

  const { apiKey, model } = getGeminiConfig(req);

  if (apiKey) {
    try {
      const ai = createGeminiClient(apiKey);

      const prompt = `You are Athena, the Greek Goddess of Strategic Wisdom and AI Nutrition Coach in Ambrosia.
The user is asking: "${question || "What strategic improvements can I make to my diet based on my recent progress?"}"

User Profile Context:
- Goal: ${profile.goal || "Healthy Vitality"}
- Targets: Calories ${profile.targets?.calories || 2000} kcal, Protein ${profile.targets?.proteinG || 140}g, Fiber ${profile.targets?.fiberG || 28}g
- Diet: ${profile.diet || "Vegetarian"}

Past 7 Days Aggregates:
- Average Daily Calories: ${past7Days.avgCalories || 1950} kcal
- Average Protein: ${past7Days.avgProtein || 110}g
- Days Breakfast Logged: ${past7Days.breakfastDays || 4}/7 days
- Total Water: ${past7Days.avgWater || 2200} ml/day

MANDATORY RULES:
1. Provide practical, supportive, science-backed guidance.
2. REFUSE medical diagnoses or clinical prescription. If the user asks about an illness, eating disorder, or medical symptoms, firmly advise consulting a qualified doctor or clinical dietitian.
3. Keep the answer concise (2-3 paragraphs max) and provide 3 actionable bullet insights.

Output strictly valid JSON:
{
  "answer": "Detailed helpful response to the user's question",
  "insights": [
    "Actionable tactical point 1",
    "Actionable tactical point 2",
    "Actionable tactical point 3"
  ],
  "focusForTomorrow": "One single priority for tomorrow"
}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const text = response.text || "";
      const cleaned = cleanJsonOutput(text);
      const parsed = JSON.parse(cleaned);
      const validated = CoachResponseSchema.parse(parsed);

      return NextResponse.json(validated);
    } catch {
      // Fallback below
    }
  }

  // Fallback offline wisdom
  return NextResponse.json({
    answer:
      "Welcome, mortal seeker. Consistency in protein distribution and regular circadian hydration will always triumph over extreme restriction. If you find time tight in the morning, remember our Pune student study: 62% skip breakfast due to rush. Preparing 2 boiled eggs or a sattu shake the evening before guarantees steady mental acuity.",
    insights: [
      "Front-load 30g of protein into your morning to anchor satiety hormones.",
      "Keep pre-portioned roasted makhana or bhuna chana in your bag to conquer evening cravings.",
      "Pair high-GI rice meals with high-fiber dal or vegetable sabzi to flatten glucose spikes.",
    ],
    focusForTomorrow: "Secure your breakfast protein within 60 minutes of waking.",
  });
}

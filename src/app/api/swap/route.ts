import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkAIAccessLimits,
  cleanJsonOutput,
  errorResponse,
} from "@/lib/gemini/server";
import { getAIConfig, generateTextCompletion } from "@/lib/ai/provider";

export const maxDuration = 30;

const SwapItemSchema = z.object({
  name: z.string(),
  whyItWorks: z.string(),
  tasteMatch: z.number().min(1).max(10),
  prepMinutes: z.number(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  fiber_g: z.number(),
  howTo: z.string(),
});

const SwapResponseSchema = z.object({
  original: z.object({
    name: z.string(),
    calories: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
    fiber_g: z.number(),
  }),
  swaps: z.array(SwapItemSchema).length(3),
});

export type SwapResponse = z.infer<typeof SwapResponseSchema>;

// Curated offline fallback swaps for common fast food items
const FALLBACK_SWAPS: Record<string, SwapResponse> = {
  samosa: {
    original: {
      name: "Deep-Fried Punjabi Samosa (2 pcs)",
      calories: 520,
      protein_g: 8.4,
      carbs_g: 64.0,
      fat_g: 26.0,
      fiber_g: 5.0,
    },
    swaps: [
      {
        name: "Air-Crisped Paneer & Green Pea Samosa",
        whyItWorks: "Delivers that exact shatteringly crisp pastry crunch with rich savory potato-paneer spices, using 80% less oil.",
        tasteMatch: 9.2,
        prepMinutes: 10,
        calories: 280,
        protein_g: 16.5,
        carbs_g: 34.0,
        fat_g: 8.5,
        fiber_g: 5.5,
        howTo: "Wrap spiced paneer, peas, and mashed potato in whole-wheat filo or roti sheets; air fry or tawa-crisp with 1 tsp ghee for 8 mins.",
      },
      {
        name: "Tangy Moong Sprouts & Samosa Chaat",
        whyItWorks: "All the chatpata cumin, tamarind, and mint flavors of street samosa chaat with a massive fiber and protein foundation.",
        tasteMatch: 8.8,
        prepMinutes: 5,
        calories: 230,
        protein_g: 14.0,
        carbs_g: 36.0,
        fat_g: 3.5,
        fiber_g: 8.5,
        howTo: "Toss 1 cup warm steamed sprouts with chopped onion, tomato, roasted cumin, 1 crushed roasted papad, and mint chutney.",
      },
      {
        name: "Baked Samosa Pinwheels with Mint Dip",
        whyItWorks: "Bite-sized spiced potato spirals on whole-wheat crust that bake rapidly and satisfy sudden late-night cravings.",
        tasteMatch: 8.5,
        prepMinutes: 12,
        calories: 240,
        protein_g: 9.0,
        carbs_g: 38.0,
        fat_g: 6.0,
        fiber_g: 4.8,
        howTo: "Spread seasoned potato & coriander on rolled atta roti, roll into a pinwheel log, slice into discs, and pan-roast until golden.",
      },
    ],
  },
  pizza: {
    original: {
      name: "Large Slice Cheese Margherita Pizza",
      calories: 420,
      protein_g: 15.0,
      carbs_g: 48.0,
      fat_g: 18.0,
      fiber_g: 2.2,
    },
    swaps: [
      {
        name: "Crispy Roti-Pizza with Fresh Paneer & Herbs",
        whyItWorks: "Thin-crust wood-fired texture using everyday whole-wheat roti, topped with molten cheese, oregano, and succulent paneer.",
        tasteMatch: 9.4,
        prepMinutes: 7,
        calories: 260,
        protein_g: 18.0,
        carbs_g: 24.0,
        fat_g: 10.5,
        fiber_g: 4.2,
        howTo: "Spread marinara on a crisp tawa roti, add diced paneer, capsicum, oregano, and 25g mozzarella; cover pan on low flame for 4 mins.",
      },
      {
        name: "High-Protein Sourdough Paneer Bruschetta",
        whyItWorks: "Crunchy toasted base with juicy roasted garlic tomatoes, basil, and protein-dense crumbled cottage cheese.",
        tasteMatch: 8.9,
        prepMinutes: 6,
        calories: 240,
        protein_g: 16.5,
        carbs_g: 28.0,
        fat_g: 7.0,
        fiber_g: 5.0,
        howTo: "Toast sourdough or brown bread, top with warm garlic cherry tomatoes, salt, black pepper, and 60g crushed paneer.",
      },
      {
        name: "Pita Pocket Calzone with Veggies & Cheese",
        whyItWorks: "Sealed cheesy pocket holding savory marinara and sautéed mushrooms without oily delivery crust.",
        tasteMatch: 9.0,
        prepMinutes: 8,
        calories: 280,
        protein_g: 15.0,
        carbs_g: 36.0,
        fat_g: 8.5,
        fiber_g: 6.0,
        howTo: "Stuff a whole-wheat pita with tomato paste, oregano, sautéed bell peppers, and cheese; press on tawa for 3 mins.",
      },
    ],
  },
  maggi: {
    original: {
      name: "Maggi 2-Minute Noodles (Double Pack)",
      calories: 620,
      protein_g: 13.5,
      carbs_g: 90.0,
      fat_g: 23.0,
      fiber_g: 4.4,
    },
    swaps: [
      {
        name: "Veggie Atta Noodles with Soft Egg or Tofu",
        whyItWorks: "Retains that beloved nostalgic masala aroma and slurpable broth with whole-grain fiber and double the protein.",
        tasteMatch: 9.5,
        prepMinutes: 7,
        calories: 340,
        protein_g: 19.0,
        carbs_g: 48.0,
        fat_g: 7.5,
        fiber_g: 7.0,
        howTo: "Boil whole-wheat noodles in Maggi tastemaker or peri-peri spice; stir in 1 soft boiled egg or 80g pan-seared paneer/tofu.",
      },
      {
        name: "Masala Oats Soupy Bowl with Peas & Corn",
        whyItWorks: "Thick, warming, peppery broth with the exact spice profile of instant ramen, taking just 4 minutes on the stove.",
        tasteMatch: 8.8,
        prepMinutes: 5,
        calories: 220,
        protein_g: 8.5,
        carbs_g: 36.0,
        fat_g: 4.5,
        fiber_g: 6.8,
        howTo: "Simmer rolled oats with onion, tomato, green chilli, garam masala, and peas for 4 minutes until luscious.",
      },
      {
        name: "Spicy Garlic Hakka Zucchini & Vermicelli",
        whyItWorks: "Ultra-low-carb spiralized zucchini mixed with roasted vermicelli and toasted sesame garlic oil.",
        tasteMatch: 8.6,
        prepMinutes: 9,
        calories: 190,
        protein_g: 7.0,
        carbs_g: 26.0,
        fat_g: 6.0,
        fiber_g: 5.5,
        howTo: "Toss roasted wheat vermicelli and zoodles in high flame with soy sauce, chilli flakes, garlic, and shredded carrots.",
      },
    ],
  },
};

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
  const query = (body.query || "").trim();
  const diet = body.diet || "veg";
  const allergies = body.allergies || [];
  const goal = body.goal || "lose_fat";

  if (!query) {
    return errorResponse("Query food is required for Divine Swap", "MISSING_QUERY", 400);
  }

  const aiConfig = getAIConfig(req, "text");

  // If AI is configured (Groq or Gemini), invoke Dionysus AI
  if (aiConfig && aiConfig.apiKey) {
    try {
      const prompt = `You are Dionysus, the master of feasts and Divine Swaps in Ambrosia.
The user is craving this junk/fast food: "${query}".
User Profile:
- Dietary Foundation: ${diet} (respect strictly: if veg or vegan, never suggest meat/poultry/eggs)
- Allergies/Dislikes to exclude: ${allergies.join(", ") || "None"}
- Target Goal: ${goal}

Generate exactly 3 realistic, delicious Divine Swaps that:
1. Retain the exact same mouthfeel, savory seasoning, and taste profile of the craving.
2. Prioritize rapid preparation under 10 minutes (solving the 50% time barrier).
3. Substantially elevate protein and prebiotic fiber while trimming empty calories.
4. TONE MANDATE: Never shame the user. No moralizing ("clean/dirty food"). Be practical, India-aware, and budget-friendly.

Return ONLY raw JSON conforming to this schema without markdown fences:
{
  "original": {
    "name": "Exact craving name",
    "calories": 450,
    "protein_g": 6.5,
    "carbs_g": 55.0,
    "fat_g": 22.0,
    "fiber_g": 3.0
  },
  "swaps": [
    {
      "name": "Creative swap name",
      "whyItWorks": "1-2 sentences on how the flavor and texture match the craving",
      "tasteMatch": 9,
      "prepMinutes": 8,
      "calories": 260,
      "protein_g": 18.0,
      "carbs_g": 30.0,
      "fat_g": 7.0,
      "fiber_g": 6.0,
      "howTo": "1-2 concise sentences on how to make it quickly"
    }
  ]
}`;

      const text = await generateTextCompletion({
        config: aiConfig,
        prompt,
      });

      const cleaned = cleanJsonOutput(text);
      const parsed = JSON.parse(cleaned);
      const validated = SwapResponseSchema.parse(parsed);

      return NextResponse.json(validated);
    } catch {
      // Fallback below
    }
  }

  // Fallback if AI is offline or key missing
  const lowerQuery = query.toLowerCase();
  for (const key of Object.keys(FALLBACK_SWAPS)) {
    if (lowerQuery.includes(key)) {
      return NextResponse.json(FALLBACK_SWAPS[key]);
    }
  }

  // Default fallback swap for generic street cravings
  return NextResponse.json(FALLBACK_SWAPS.samosa);
}

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/gemini/server";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim();

  if (!code) {
    return errorResponse("Barcode code is required", "MISSING_CODE", 400);
  }

  try {
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
      code
    )}.json`;

    const res = await fetch(offUrl, {
      headers: {
        "User-Agent": "AmbrosiaNutrition - WebApp - Version 1.0 (https://ambrosia.app)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({
        found: false,
        code,
        message: "Open Food Facts lookup failed or product not found.",
      });
    }

    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({
        found: false,
        code,
        message: "Product not indexed in Open Food Facts.",
      });
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const calories100g =
      nutriments["energy-kcal_100g"] ??
      (nutriments["energy_100g"] ? Math.round(nutriments["energy_100g"] / 4.184) : 0);

    const protein100g = Number((nutriments["proteins_100g"] || 0).toFixed(1));
    const carbs100g = Number((nutriments["carbohydrates_100g"] || 0).toFixed(1));
    const fat100g = Number((nutriments["fat_100g"] || 0).toFixed(1));
    const fiber100g = Number((nutriments["fiber_100g"] || 0).toFixed(1));

    let servingGrams = 100;
    if (p.serving_quantity) {
      servingGrams = parseFloat(p.serving_quantity) || 100;
    }

    return NextResponse.json({
      found: true,
      code,
      name: p.product_name || p.product_name_en || "Packaged Product",
      brand: p.brands || "",
      servingSizeStr: p.serving_size || `${servingGrams}g`,
      servingGrams,
      per100g: {
        calories: Math.round(calories100g),
        protein_g: protein100g,
        carbs_g: carbs100g,
        fat_g: fat100g,
        fiber_g: fiber100g,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Barcode lookup failed";
    return errorResponse(msg, "FETCH_ERROR", 500);
  }
}

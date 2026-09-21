import { NextResponse } from "next/server";
import { generateChefRecipes } from "@/lib/meals/chef-agent";
import type { ChefGenerateRequest } from "@/lib/meals/chef-types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ChefGenerateRequest>;

    const req: ChefGenerateRequest = {
      craving: typeof body.craving === "string" ? body.craving : "",
      pantry: Array.isArray(body.pantry)
        ? body.pantry.filter((x): x is string => typeof x === "string")
        : [],
      quickShopOk: body.quickShopOk !== false,
      mealType: body.mealType === "midi" ? "midi" : "soir",
      servings: typeof body.servings === "number" && body.servings > 0 ? body.servings : 4,
    };

    const result = await generateChefRecipes(req);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Impossible de générer les recettes" },
      { status: 500 }
    );
  }
}

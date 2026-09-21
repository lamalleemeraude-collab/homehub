import { NextResponse } from "next/server";
import {
  addFavoriteMenu,
  readFavoriteMenus,
  removeFavoriteMenu,
} from "@/lib/meals/favorite-menus-storage";
import type { MenuIdea } from "@/lib/meals/menu-idea-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const favorites = await readFavoriteMenus();
  return NextResponse.json(favorites);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<MenuIdea>;
    if (
      !body.id ||
      !body.title ||
      !body.shortDescription ||
      !body.miniRecipe?.ingredients ||
      !body.miniRecipe?.steps
    ) {
      return NextResponse.json({ error: "Menu invalide" }, { status: 400 });
    }

    const idea: MenuIdea = {
      id: String(body.id),
      title: String(body.title),
      shortDescription: String(body.shortDescription),
      emoji: typeof body.emoji === "string" ? body.emoji : undefined,
      miniRecipe: {
        ingredients: body.miniRecipe.ingredients.map(String),
        steps: body.miniRecipe.steps.map(String),
      },
    };

    const favorites = await addFavoriteMenu(idea);
    return NextResponse.json(favorites);
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le favori" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }
    const favorites = await removeFavoriteMenu(id);
    return NextResponse.json(favorites);
  } catch {
    return NextResponse.json(
      { error: "Impossible de retirer le favori" },
      { status: 500 }
    );
  }
}

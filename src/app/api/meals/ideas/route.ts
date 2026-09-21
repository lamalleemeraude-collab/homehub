import { NextResponse } from "next/server";
import { generateMenuIdeas } from "@/lib/meals/menu-ideas-agent";

export const dynamic = "force-dynamic";

/** POST → tableau JSON strict de 3 idées repas */
export async function POST() {
  try {
    const { ideas, source } = await generateMenuIdeas();
    return NextResponse.json(ideas, {
      headers: {
        "X-Menu-Ideas-Source": source,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de générer des idées" },
      { status: 500 }
    );
  }
}

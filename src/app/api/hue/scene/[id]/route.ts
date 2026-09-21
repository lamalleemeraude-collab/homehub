import { NextResponse } from "next/server";
import { activateHueScene } from "@/lib/hue/client";
import { getHueSceneConfig } from "@/lib/hue/scenes";
import type { HueSceneId } from "@/lib/hue/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!getHueSceneConfig(id)) {
    return NextResponse.json(
      { ok: false, message: `Scène « ${id} » inconnue` },
      { status: 404 }
    );
  }

  const result = await activateHueScene(id as HueSceneId);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

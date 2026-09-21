import { NextResponse } from "next/server";
import { cycleHueLights } from "@/lib/hue/client";

export async function POST(request: Request) {
  const body = (await request.json()) as { current?: "off" | "warm" | "cool" };
  const current = body.current ?? "off";
  const result = await cycleHueLights(current);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

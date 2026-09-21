import { NextResponse } from "next/server";
import { checkHueConnection } from "@/lib/hue/client";

export async function GET() {
  const status = await checkHueConnection();
  return NextResponse.json(status);
}

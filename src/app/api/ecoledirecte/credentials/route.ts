import { NextResponse } from "next/server";
import {
  readStoredCredentials,
  resolveCredentials,
  writeStoredCredentials,
} from "@/lib/ecoledirecte/credentials";

export const dynamic = "force-dynamic";

export async function GET() {
  const creds = await resolveCredentials();
  return NextResponse.json({
    configured: Boolean(creds),
    username: creds?.username ?? "",
    source: process.env.ED_USERNAME?.trim()
      ? "env"
      : creds
        ? "file"
        : "none",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      studentName?: string;
    };

    const previous = await readStoredCredentials();
    const username = body.username?.trim() || previous?.username || "";
    const password = body.password?.trim() || previous?.password || "";
    const studentName =
      body.studentName?.trim() || previous?.studentName || "Maelle";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Identifiant et mot de passe requis." },
        { status: 400 }
      );
    }

    await writeStoredCredentials({ username, password, studentName });

    return NextResponse.json({ ok: true, configured: true, source: "file" });
  } catch (error) {
    console.error("[api/ecoledirecte/credentials]", error);
    return NextResponse.json(
      { ok: false, error: "Impossible d’enregistrer." },
      { status: 500 }
    );
  }
}

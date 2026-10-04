import { NextResponse } from "next/server";
import {
  hasEnvCredentials,
  readStoredCredentials,
  resolveCredentials,
  writeStoredCredentials,
} from "@/lib/ecoledirecte/credentials";

export const dynamic = "force-dynamic";

export async function GET() {
  const creds = await resolveCredentials();
  const fromEnv = hasEnvCredentials();
  return NextResponse.json({
    configured: Boolean(creds),
    username: creds?.username ?? "",
    source: fromEnv ? "env" : creds ? "file" : "none",
  });
}

export async function POST(request: Request) {
  try {
    // Sur Vercel, les secrets doivent être en variables d’environnement.
    if (hasEnvCredentials()) {
      return NextResponse.json({
        ok: true,
        configured: true,
        source: "env",
        message: "Identifiants déjà configurés côté serveur (Vercel).",
      });
    }

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
    const msg =
      error instanceof Error && error.message.includes("read-only")
        ? "Sur Vercel, ajoute ED_USERNAME et ED_PASSWORD dans les variables d’environnement du projet."
        : "Impossible d’enregistrer.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import {
  readStoredCredentials,
  resolveCredentials,
  writeStoredCredentials,
} from "@/lib/ecoledirecte/credentials";
import { isServerlessRuntime } from "@/lib/ecoledirecte/runtime-fs";

export const dynamic = "force-dynamic";

export async function GET() {
  const creds = await resolveCredentials();
  const fromEnv = Boolean(process.env.ED_USERNAME?.trim());
  return NextResponse.json({
    configured: Boolean(creds),
    username: fromEnv
      ? process.env.ED_USERNAME?.trim() || ""
      : creds?.username ?? "",
    source: fromEnv ? "env" : creds ? "file" : "none",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      studentName?: string;
    };

    // Prod Vercel : les secrets viennent des env vars (pas d’écriture disque)
    if (isServerlessRuntime() && process.env.ED_USERNAME && process.env.ED_PASSWORD) {
      return NextResponse.json({
        ok: true,
        configured: true,
        source: "env",
        message: "Identifiants déjà configurés sur le serveur.",
      });
    }

    if (isServerlessRuntime()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Sur Vercel, ajoute ED_USERNAME et ED_PASSWORD dans Project → Settings → Environment Variables, puis redéploie.",
        },
        { status: 503 }
      );
    }

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
      {
        ok: false,
        error:
          "Impossible d’enregistrer. Sur Vercel, utilise les variables d’environnement ED_USERNAME / ED_PASSWORD.",
      },
      { status: 500 }
    );
  }
}

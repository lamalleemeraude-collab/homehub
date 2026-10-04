import { NextResponse } from "next/server";
import {
  readStoredCredentials,
  resolveCredentials,
  usesFileCredentialStore,
  writeStoredCredentials,
} from "@/lib/ecoledirecte/credentials";

export const dynamic = "force-dynamic";

export async function GET() {
  const creds = await resolveCredentials();
  const fromEnv = Boolean(
    process.env.ED_USERNAME?.trim() && process.env.ED_PASSWORD?.trim()
  );
  return NextResponse.json({
    configured: Boolean(creds),
    username: fromEnv ? (process.env.ED_USERNAME?.trim() ?? "") : creds?.username ?? "",
    source: fromEnv ? "env" : creds ? "file" : "none",
    serverless: !usesFileCredentialStore(),
  });
}

export async function POST(request: Request) {
  try {
    const fromEnv = Boolean(
      process.env.ED_USERNAME?.trim() && process.env.ED_PASSWORD?.trim()
    );

    // Prod Vercel : les identifiants viennent des env vars, pas d’un fichier.
    if (!usesFileCredentialStore()) {
      if (fromEnv) {
        return NextResponse.json({
          ok: true,
          configured: true,
          source: "env",
        });
      }
      return NextResponse.json(
        {
          ok: false,
          error:
            "Sur Vercel, ajoute ED_USERNAME et ED_PASSWORD dans Project Settings → Environment Variables, puis redéploie.",
        },
        { status: 503 }
      );
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
    const err = error as NodeJS.ErrnoException;
    const message =
      err.code === "EROFS"
        ? "Serveur en lecture seule — configure ED_USERNAME / ED_PASSWORD sur Vercel."
        : "Impossible d’enregistrer.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

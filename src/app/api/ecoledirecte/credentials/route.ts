import { NextResponse } from "next/server";
import {
  readStoredCredentials,
  resolveCredentials,
  writeStoredCredentials,
} from "@/lib/ecoledirecte/credentials";
import { isServerlessRuntime } from "@/lib/ecoledirecte/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const creds = await resolveCredentials();
  const fromEnv = Boolean(process.env.ED_USERNAME?.trim());
  return NextResponse.json({
    configured: Boolean(creds),
    username: creds?.username ?? "",
    source: fromEnv ? "env" : creds ? "file" : "none",
  });
}

export async function POST(request: Request) {
  try {
    // Sur Vercel : les identifiants doivent être dans les variables d’environnement
    if (isServerlessRuntime()) {
      const envOk = Boolean(
        process.env.ED_USERNAME?.trim() && process.env.ED_PASSWORD?.trim()
      );
      if (envOk) {
        return NextResponse.json({
          ok: true,
          configured: true,
          source: "env",
          hint: "Identifiants déjà configurés sur le serveur.",
        });
      }
      return NextResponse.json(
        {
          ok: false,
          error:
            "Sur Vercel, ajoute ED_USERNAME et ED_PASSWORD dans Project → Settings → Environment Variables, puis redéploie.",
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
    return NextResponse.json(
      { ok: false, error: "Impossible d’enregistrer." },
      { status: 500 }
    );
  }
}

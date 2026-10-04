import { NextResponse } from "next/server";
import {
  isServerlessRuntime,
  readStoredCredentials,
  resolveCredentials,
  writeStoredCredentials,
} from "@/lib/ecoledirecte/credentials";

export const dynamic = "force-dynamic";

export async function GET() {
  const creds = await resolveCredentials();
  const fromEnv = Boolean(process.env.ED_USERNAME?.trim());
  return NextResponse.json({
    configured: Boolean(creds),
    username: creds?.username ?? "",
    source: fromEnv ? "env" : creds ? "file" : "none",
    serverless: isServerlessRuntime(),
  });
}

export async function POST(request: Request) {
  try {
    if (isServerlessRuntime()) {
      // Sur Vercel le FS est read-only : les secrets vont dans les env Vercel.
      const fromEnv = await resolveCredentials();
      if (fromEnv) {
        return NextResponse.json({
          ok: true,
          configured: true,
          source: "env",
          hint: "Identifiants déjà fournis via ED_USERNAME / ED_PASSWORD sur Vercel.",
        });
      }
      return NextResponse.json(
        {
          ok: false,
          error:
            "En ligne, configure ED_USERNAME et ED_PASSWORD dans Vercel → Settings → Environment Variables, puis redéploie.",
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
    if (err?.code === "EROFS" || err?.code === "EACCES") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Impossible d’écrire sur le serveur. Ajoute ED_USERNAME et ED_PASSWORD dans Vercel.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Impossible d’enregistrer." },
      { status: 500 }
    );
  }
}

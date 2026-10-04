import { cookies } from "next/headers";

const COOKIE_CN = "ed_fa_cn";
const COOKIE_CV = "ed_fa_cv";
const COOKIE_UUID = "ed_device_uuid";

export async function readFaFromCookie(): Promise<{
  cn?: string;
  cv?: string;
  uuid?: string;
}> {
  try {
    const jar = await cookies();
    const cn = jar.get(COOKIE_CN)?.value?.trim();
    const cv = jar.get(COOKIE_CV)?.value?.trim();
    const uuid = jar.get(COOKIE_UUID)?.value?.trim();
    return {
      ...(cn && cv ? { cn, cv } : {}),
      ...(uuid ? { uuid } : {}),
    };
  } catch {
    // hors contexte request
  }
  return {};
}

export function applyUuidCookie(
  response: { cookies: { set: (n: string, v: string, o: object) => void } },
  uuid: string
): void {
  response.cookies.set(COOKIE_UUID, uuid, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax" as const,
    secure: true,
    httpOnly: true,
  });
}

export function faCookieHeaders(cn: string, cv: string): HeadersInit {
  const maxAge = 60 * 60 * 24 * 180; // 6 mois
  const common = `Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure; HttpOnly`;
  return {
    "Set-Cookie": [
      `${COOKIE_CN}=${encodeURIComponent(cn)}; ${common}`,
      `${COOKIE_CV}=${encodeURIComponent(cv)}; ${common}`,
    ].join(", "),
  };
}

/** Pour NextResponse — set cookies individuellement. */
export function applyFaCookies(
  response: { cookies: { set: (n: string, v: string, o: object) => void } },
  cn: string,
  cv: string
): void {
  const opts = {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax" as const,
    secure: true,
    httpOnly: true,
  };
  response.cookies.set(COOKIE_CN, cn, opts);
  response.cookies.set(COOKIE_CV, cv, opts);
}

export function clearFaCookies(
  response: { cookies: { set: (n: string, v: string, o: object) => void } }
): void {
  const opts = { path: "/", maxAge: 0 };
  response.cookies.set(COOKIE_CN, "", opts);
  response.cookies.set(COOKIE_CV, "", opts);
}

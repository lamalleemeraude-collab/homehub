import { cookies } from "next/headers";

const COOKIE_CN = "ed_fa_cn";
const COOKIE_CV = "ed_fa_cv";
const COOKIE_UUID = "ed_uuid";

const FA_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 180,
  sameSite: "lax" as const,
  secure: true,
  httpOnly: true,
};

const UUID_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  secure: true,
  httpOnly: true,
};

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
    return {};
  }
}

export function applyFaCookies(
  response: { cookies: { set: (n: string, v: string, o: object) => void } },
  cn: string,
  cv: string
): void {
  response.cookies.set(COOKIE_CN, cn, FA_OPTS);
  response.cookies.set(COOKIE_CV, cv, FA_OPTS);
}

export function applyUuidCookie(
  response: { cookies: { set: (n: string, v: string, o: object) => void } },
  uuid: string
): void {
  if (!uuid) return;
  response.cookies.set(COOKIE_UUID, uuid, UUID_OPTS);
}

export function clearFaCookies(response: {
  cookies: { set: (n: string, v: string, o: object) => void };
}): void {
  const opts = { path: "/", maxAge: 0 };
  response.cookies.set(COOKIE_CN, "", opts);
  response.cookies.set(COOKIE_CV, "", opts);
}

import { cookies } from "next/headers";

const COOKIE = "ed_device_uuid";

export async function readUuidFromCookie(): Promise<string | undefined> {
  try {
    const jar = await cookies();
    const v = jar.get(COOKIE)?.value?.trim();
    return v || undefined;
  } catch {
    return undefined;
  }
}

export async function setUuidCookie(uuid: string): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(COOKIE, uuid, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  } catch {
    // hors contexte request
  }
}

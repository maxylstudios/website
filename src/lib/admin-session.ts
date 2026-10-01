import { cookies } from "next/headers";

const cookieName = "maxyl_admin";

export async function readAdminToken() {
  const jar = await cookies();
  return jar.get(cookieName)?.value ?? null;
}

export async function hasAdminSession() {
  return Boolean(await readAdminToken());
}

export async function setAdminToken(token: string) {
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminToken() {
  const jar = await cookies();
  jar.delete(cookieName);
}

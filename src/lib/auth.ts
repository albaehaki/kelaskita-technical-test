import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

const COOKIE_NAME = "kk_session";
const MAX_AGE = 60 * 60 * 8; // 8 jam

function secretKey() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "dev-only-secret-jangan-dipakai-di-produksi"
  );
}

/**
 * Cookie `Secure` hanya boleh dipasang saat request benar-benar HTTPS.
 * Sebelumnya memakai NODE_ENV=production, sehingga di Docker yang diakses
 * lewat http://192.168.x.x browser menolak cookie → login seolah gagal.
 */
export async function cookieSecure() {
  const override = process.env.COOKIE_SECURE;
  if (override === "true") return true;
  if (override === "false") return false;

  const header = await headers();
  const proto = (header.get("x-forwarded-proto") ?? "").split(",")[0].trim();
  return proto === "https";
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: await cookieSecure(),
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}

export type SessionUser = { id: string; name: string; email: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true },
    });
    return user;
  } catch {
    return null;
  }
}

/** Dipakai di halaman/layout server: redirect ke login bila belum masuk. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Dipakai di route handler: balikan 401 JSON, bukan redirect. */
export async function requireAdminApi() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

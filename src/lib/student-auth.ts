import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

/**
 * Sesi peserta (LMS) — terpisah total dari sesi admin.
 * Login memakai email + nomor invoice yang sudah lunas (tanpa password),
 * karena peserta sudah membuktikan kepemilikan transaksi lewat invoice.
 */

const COOKIE = "kk_student";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

function secretKey() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "dev-only-secret-jangan-dipakai-di-produksi"
  );
}

async function cookieSecure() {
  const override = process.env.COOKIE_SECURE;
  if (override === "true") return true;
  if (override === "false") return false;

  const header = await headers();
  const proto = (header.get("x-forwarded-proto") ?? "").split(",")[0].trim();
  return proto === "https";
}

export async function createStudentSession(email: string) {
  const token = await new SignJWT({ email: email.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: await cookieSecure(),
    maxAge: MAX_AGE,
  });
}

export async function destroyStudentSession() {
  (await cookies()).delete(COOKIE);
}

export async function getStudentEmail(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

export async function requireStudent(): Promise<string> {
  const email = await getStudentEmail();
  if (!email) redirect("/kelas-saya");
  return email;
}

/** Semua pendaftaran lunas milik satu email. */
export async function getStudentEnrollments(email: string) {
  return prisma.enrollment.findMany({
    where: { email: email.toLowerCase(), status: "PAID" },
    include: {
      course: {
        include: {
          category: true,
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
    orderBy: { paidAt: "desc" },
  });
}

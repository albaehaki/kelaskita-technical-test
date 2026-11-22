import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Pesan error disengaja generik supaya tidak membocorkan email mana yang terdaftar.
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return Response.json({ error: "Email atau password salah" }, { status: 401 });
  }

  await createSession(user.id);
  return Response.json({ ok: true, name: user.name });
}

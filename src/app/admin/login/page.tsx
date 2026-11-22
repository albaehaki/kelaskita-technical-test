import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Masuk CMS" };

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-paper)] px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-brand)] text-xl font-semibold text-white">
            K
          </span>
          <h1 className="mt-3 text-xl font-semibold tracking-tight">Masuk ke CMS</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Kelola kelas, pendaftaran, dan artikel.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-[var(--color-ink-soft)]">
          Demo: admin@kelaskita.test / Admin123!
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "./actions";
import { IconDashboard, IconBook, IconReceipt, IconPencil } from "@/components/icons";

const menu = [
  { href: "/admin", label: "Dashboard", icon: IconDashboard },
  { href: "/admin/kelas", label: "Kelas", icon: IconBook },
  { href: "/admin/peserta", label: "Pendaftaran", icon: IconReceipt },
  { href: "/admin/artikel", label: "Artikel", icon: IconPencil },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  // Halaman login dirender tanpa shell admin.
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-brand)] text-white">
                K
              </span>
              KelasKita
            </Link>
            <p className="mt-1 pl-10 text-xs text-[var(--color-ink-soft)]">CMS Admin</p>

            <nav className="mt-4 grid grid-cols-2 gap-1 lg:mt-5 lg:block lg:space-y-1">
              {menu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-dark)]"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-3 lg:block lg:pt-4">
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-ink-soft)]">Masuk sebagai</p>
                <p className="truncate text-sm font-medium">{user.name}</p>
              </div>
              <form action={logoutAction} className="shrink-0 lg:mt-2">
                <button className="text-xs text-red-600 hover:underline">Keluar</button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

import type { SVGProps } from "react";

/**
 * Ikon SVG internal (bukan emoji).
 * Alasan per ikon: setiap glyph mewakili isi yang sebenarnya
 * (kode untuk React, silinder untuk PostgreSQL, kontainer untuk Docker, dst),
 * bukan dekorasi. Stroke 1.6 agar konsisten dengan bobot teks UI.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconCode(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13.5 6-3 12" />
    </Base>
  );
}

export function IconBraces(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 4c-2 0-2 2-2 4s0 3-2 4c2 1 2 2 2 4s0 4 2 4" />
      <path d="M15 4c2 0 2 2 2 4s0 3 2 4c-2 1-2 2-2 4s0 4-2 4" />
    </Base>
  );
}

export function IconDatabase(props: IconProps) {
  return (
    <Base {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </Base>
  );
}

export function IconChart(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </Base>
  );
}

export function IconContainer(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" />
      <path d="M4 8.5 12 13l8-4.5" />
      <path d="M12 13v7" />
    </Base>
  );
}

export function IconPlug(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 3v5" />
      <path d="M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6z" />
      <path d="M12 17v4" />
    </Base>
  );
}

export function IconBook(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </Base>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="7" height="8" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="3" y="15" width="7" height="6" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
    </Base>
  );
}

export function IconReceipt(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </Base>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 20h4l10-10-4-4L4 16z" />
      <path d="m13.5 5.5 4 4" />
    </Base>
  );
}

export function IconBell(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
      <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
    </Base>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Base>
  );
}

export function IconAward(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="9" r="5" />
      <path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7" />
    </Base>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Base>
  );
}

/** Peta ikon per kelas, dipilih dari isi silabusnya. */
export function CourseIcon({ slug, ...props }: IconProps & { slug: string }) {
  if (slug.includes("react")) return <IconCode {...props} />;
  if (slug.includes("typescript")) return <IconBraces {...props} />;
  if (slug.includes("postgresql")) return <IconDatabase {...props} />;
  if (slug.includes("data-analysis")) return <IconChart {...props} />;
  if (slug.includes("docker")) return <IconContainer {...props} />;
  if (slug.includes("api-design")) return <IconPlug {...props} />;
  return <IconBook {...props} />;
}

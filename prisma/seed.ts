import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Web Development", slug: "web-development" },
  { name: "Data & AI", slug: "data-ai" },
  { name: "Cloud & DevOps", slug: "cloud-devops" },
];

type SeedCourse = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  level: string;
  price: number;
  durationHours: number;
  coverEmoji: string;
  syllabus: string[];
  category: string;
};

const courses: SeedCourse[] = [
  {
    title: "Fundamental React & Next.js",
    slug: "fundamental-react-nextjs",
    summary: "Bangun aplikasi web modern dari nol: komponen, routing, data fetching, sampai deploy.",
    description:
      "Kelas praktik untuk kamu yang ingin serius jadi frontend engineer. Setiap modul punya latihan yang direview, dan di akhir kelas kamu punya satu proyek portofolio yang layak dipamerkan ke rekruter.",
    level: "Pemula",
    price: 349000,
    durationHours: 24,
    coverEmoji: "⚛️",
    syllabus: [
      "Dasar komponen, props, dan state",
      "Routing & layout di App Router",
      "Server component vs client component",
      "Data fetching, caching, dan revalidasi",
      "Form, validasi, dan error handling",
      "Deploy & monitoring aplikasi",
    ],
    category: "web-development",
  },
  {
    title: "TypeScript untuk Produksi",
    slug: "typescript-untuk-produksi",
    summary: "Tipe yang bikin bug ketahuan sebelum rilis: generics, discriminated union, dan pola aman.",
    description:
      "Bukan sekadar menambahkan ': string'. Kelas ini membahas cara memodelkan domain dengan tipe, menjaga kontrak API, dan membaca error TypeScript tanpa panik.",
    level: "Menengah",
    price: 299000,
    durationHours: 16,
    coverEmoji: "🟦",
    syllabus: [
      "Structural typing & inference",
      "Generics yang tidak bikin pusing",
      "Discriminated union untuk state machine",
      "Zod: validasi runtime + tipe statis",
      "Migrasi codebase JS bertahap",
    ],
    category: "web-development",
  },
  {
    title: "PostgreSQL untuk Backend Engineer",
    slug: "postgresql-untuk-backend-engineer",
    summary: "Query, index, transaksi, dan desain skema yang siap dipakai produksi.",
    description:
      "Database bukan cuma tempat menyimpan data. Kelas ini mengajarkan cara membaca query plan, memilih index, dan merancang relasi yang tidak menyiksa tim saat aplikasi tumbuh.",
    level: "Menengah",
    price: 399000,
    durationHours: 20,
    coverEmoji: "🐘",
    syllabus: [
      "Relasi & normalisasi praktis",
      "JOIN, agregasi, dan window function",
      "Index: kapan membantu, kapan merusak",
      "Transaksi & isolation level",
      "Migrasi skema tanpa downtime",
    ],
    category: "data-ai",
  },
  {
    title: "Data Analysis dengan Python",
    slug: "data-analysis-dengan-python",
    summary: "Dari CSV berantakan jadi insight: pandas, visualisasi, dan pelaporan yang meyakinkan.",
    description:
      "Kelas untuk pemula yang ingin pindah ke bidang data. Semua materi memakai dataset Indonesia, jadi konteksnya dekat dengan pekerjaan sehari-hari.",
    level: "Pemula",
    price: 329000,
    durationHours: 18,
    coverEmoji: "📊",
    syllabus: [
      "pandas: load, bersihkan, transformasi",
      "Exploratory data analysis",
      "Visualisasi dengan matplotlib",
      "Merangkum insight jadi cerita",
      "Studi kasus: data penjualan UMKM",
    ],
    category: "data-ai",
  },
  {
    title: "Docker & CI/CD Praktis",
    slug: "docker-cicd-praktis",
    summary: "Bawa aplikasi dari laptop ke server dengan container, compose, dan pipeline otomatis.",
    description:
      "Fokus ke hal yang benar-benar dipakai di tim: menulis Dockerfile yang ramping, compose multi-service, environment rahasia, dan pipeline yang gagal cepat.",
    level: "Menengah",
    price: 379000,
    durationHours: 14,
    coverEmoji: "🐳",
    syllabus: [
      "Image, layer, dan caching",
      "Dockerfile multi-stage",
      "Compose: app + database + volume",
      "Environment & secret management",
      "Pipeline build, test, deploy",
    ],
    category: "cloud-devops",
  },
  {
    title: "API Design yang Enak Dipakai",
    slug: "api-design-yang-enak-dipakai",
    summary: "REST yang konsisten, error yang jelas, versi yang tidak bikin klien menangis.",
    description:
      "Kelas singkat untuk backend developer: kontrak API, status code, pagination, idempotency, dan dokumentasi yang dibaca orang lain.",
    level: "Menengah",
    price: 249000,
    durationHours: 10,
    coverEmoji: "🔌",
    syllabus: [
      "Resource & naming yang konsisten",
      "Status code dan format error",
      "Pagination, filter, sorting",
      "Idempotency untuk endpoint kritikal",
      "Dokumentasi OpenAPI",
    ],
    category: "web-development",
  },
];

const articles = [
  {
    title: "Cara Memilih Kelas yang Tepat Tanpa FOMO",
    slug: "cara-memilih-kelas-yang-tepat",
    excerpt:
      "Katalog kelas yang panjang justru bikin bingung. Ini kerangka sederhana untuk memilih berdasarkan tujuan, bukan tren.",
    content:
      "Mulai dari satu pertanyaan: setelah kelas ini selesai, kemampuan apa yang ingin kamu buktikan? Jika jawabannya masih kabur, tunda membeli. Pilih kelas yang punya proyek akhir konkret, bukan yang silabusnya paling panjang.\n\nKedua, cek prasyarat. Kelas menengah terasa sulit bukan karena materinya jelek, tapi karena fondasi kita bolong. Ketiga, siapkan jam belajar di kalender sebelum checkout — kelas tanpa jadwal hampir selalu berakhir jadi bookmark.",
  },
  {
    title: "Belajar Programming di Sela Pekerjaan: Realistis atau Tidak?",
    slug: "belajar-programming-di-sela-pekerjaan",
    excerpt:
      "Bukan soal punya 4 jam sehari. Ini soal konsistensi 45 menit dan cara menyusun target mingguan.",
    content:
      "Riset kecil di komunitas kami menunjukkan: yang bertahan bukan yang belajar paling lama, tapi yang punya slot tetap. 45 menit setiap hari lebih efektif daripada 6 jam di akhir pekan.\n\nBuat target mingguan yang bisa dihitung — satu modul, satu latihan, satu catatan. Rayakan penyelesaian, bukan durasi duduk di depan layar.",
  },
  {
    title: "Portofolio yang Dilihat Rekruter dalam 30 Detik",
    slug: "portofolio-yang-dilihat-rekruter",
    excerpt:
      "Struktur README, demo yang hidup, dan satu paragraf yang menjelaskan keputusan teknismu.",
    content:
      "Rekruter tidak membaca semua kode. Mereka mencari bukti: aplikasi bisa dijalankan, ada README yang jelas, dan ada penjelasan kenapa kamu memilih pendekatan tertentu.\n\nKarena itu, tulis keputusan arsitektur secara singkat: masalah, pilihan, alternatif yang ditolak, dan alasannya. Itu yang membedakan portofolio 'hasil tutorial' dengan portofolio engineer.",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = "admin@kelaskita.test";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin KelasKita",
        email: adminEmail,
        passwordHash: await bcrypt.hash("Admin123!", 10),
        role: "ADMIN",
      },
    });
    console.log("  ✓ admin dibuat");
  } else {
    console.log("  • admin sudah ada, dilewati");
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  console.log(`  ✓ ${categories.length} kategori`);

  for (const course of courses) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: course.category },
    });
    const saved = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        summary: course.summary,
        description: course.description,
        level: course.level,
        price: course.price,
        durationHours: course.durationHours,
        coverEmoji: course.coverEmoji,
        syllabus: course.syllabus,
        categoryId: category.id,
      },
      create: {
        title: course.title,
        slug: course.slug,
        summary: course.summary,
        description: course.description,
        level: course.level,
        price: course.price,
        durationHours: course.durationHours,
        coverEmoji: course.coverEmoji,
        syllabus: course.syllabus,
        categoryId: category.id,
      },
    });

    // Materi LMS: satu modul per poin silabus (idempotent via unique courseId+order).
    for (const [index, topic] of course.syllabus.entries()) {
      const order = index + 1;
      await prisma.lesson.upsert({
        where: { courseId_order: { courseId: saved.id, order } },
        update: { title: topic },
        create: {
          courseId: saved.id,
          order,
          title: topic,
          content:
            `Modul ini membahas ${topic.toLowerCase()} dengan pendekatan praktik.\n\n` +
            `Kamu akan melihat contoh kasus nyata, mengerjakan latihan singkat, lalu ` +
            `membandingkan hasilnya dengan pembahasan. Fokusnya bukan menghafal sintaks, ` +
            `tapi tahu kapan dan mengapa memakai pendekatan tersebut.\n\n` +
            `Latihan: terapkan materi ini pada proyek akhir kelasmu, lalu catat satu ` +
            `keputusan teknis yang kamu ambil beserta alasannya.`,
        },
      });
    }
  }
  console.log(`  ✓ ${courses.length} kelas + materi LMS`);

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }
  console.log(`  ✓ ${articles.length} artikel`);

  // Contoh transaksi supaya dashboard CMS tidak kosong saat pertama dibuka.
  const reactCourse = await prisma.course.findUniqueOrThrow({
    where: { slug: "fundamental-react-nextjs" },
  });

  const sampleInvoice = "KK-SEED-0001";
  const existingSample = await prisma.enrollment.findUnique({
    where: { invoiceNo: sampleInvoice },
  });

  if (!existingSample) {
    const enrollment = await prisma.enrollment.create({
      data: {
        invoiceNo: sampleInvoice,
        studentName: "Rani Puspita",
        email: "rani@example.com",
        phone: "081298460513",
        province: "JAWA BARAT",
        city: "KOTA BEKASI",
        amount: reactCourse.price,
        status: "PAID",
        paidAt: new Date(),
        courseId: reactCourse.id,
      },
    });
    await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        provider: "mock",
        reference: `MOCK-${sampleInvoice}`,
        amount: reactCourse.price,
        status: "PAID",
        paidAt: new Date(),
      },
    });
    console.log("  ✓ 1 contoh pendaftaran lunas");
  } else {
    console.log("  • contoh pendaftaran sudah ada, dilewati");
  }

  console.log("✅ Seed selesai (idempotent — aman dijalankan berulang).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

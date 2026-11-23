"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { destroySession } from "@/lib/auth";

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

const courseSchema = z.object({
  title: z.string().min(4),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, dan strip"),
  summary: z.string().min(10),
  description: z.string().min(20),
  level: z.string().min(3),
  price: z.coerce.number().int().min(0),
  durationHours: z.coerce.number().int().min(1),
  coverEmoji: z.string().optional(),
  categoryId: z.string().min(1),
  syllabus: z.string().min(3),
  published: z.boolean(),
});

function parseCourse(formData: FormData) {
  return courseSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    level: formData.get("level"),
    price: formData.get("price"),
    durationHours: formData.get("durationHours"),
    coverEmoji: formData.get("coverEmoji") || undefined,
    categoryId: formData.get("categoryId"),
    syllabus: formData.get("syllabus"),
    published: formData.get("published") === "on",
  });
}

export async function createCourseAction(formData: FormData) {
  await requireAdmin();
  const data = parseCourse(formData);

  await prisma.course.create({
    data: {
      ...data,
      syllabus: data.syllabus
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    },
  });

  revalidatePath("/admin/kelas");
  revalidatePath("/");
}

export async function updateCourseAction(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseCourse(formData);

  await prisma.course.update({
    where: { id },
    data: {
      ...data,
      syllabus: data.syllabus
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    },
  });

  revalidatePath("/admin/kelas");
  revalidatePath("/");
  redirect("/admin/kelas");
}

export async function deleteCourseAction(id: string) {
  await requireAdmin();
  const enrollments = await prisma.enrollment.count({ where: { courseId: id } });

  if (enrollments > 0) {
    // Jangan hapus kelas yang sudah punya transaksi — nonaktifkan saja.
    await prisma.course.update({ where: { id }, data: { published: false } });
  } else {
    await prisma.course.delete({ where: { id } });
  }

  revalidatePath("/admin/kelas");
  revalidatePath("/");
}

export async function toggleCourseAction(id: string) {
  await requireAdmin();
  const course = await prisma.course.findUniqueOrThrow({ where: { id } });
  await prisma.course.update({ where: { id }, data: { published: !course.published } });
  revalidatePath("/admin/kelas");
  revalidatePath("/");
}

const statusSchema = z.enum(["PENDING", "PAID", "EXPIRED", "CANCELLED"]);

export async function updateEnrollmentStatusAction(id: string, formData: FormData) {
  await requireAdmin();
  const status = statusSchema.parse(formData.get("status"));
  const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.update({
      where: { id },
      data: {
        status,
        paidAt: status === "PAID" ? (enrollment.paidAt ?? new Date()) : null,
      },
    });
    await tx.payment.updateMany({
      where: { enrollmentId: id },
      data: {
        status: status === "PAID" ? "PAID" : status === "EXPIRED" ? "EXPIRED" : "PENDING",
        paidAt: status === "PAID" ? (enrollment.paidAt ?? new Date()) : null,
      },
    });
  });

  revalidatePath("/admin/peserta");
  revalidatePath("/admin");
}

const articleSchema = z.object({
  title: z.string().min(6),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(20),
  content: z.string().min(50),
  published: z.boolean(),
});

export async function createArticleAction(formData: FormData) {
  await requireAdmin();
  const data = articleSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
  });

  await prisma.article.create({ data });
  revalidatePath("/admin/artikel");
  revalidatePath("/artikel");
}

export async function deleteArticleAction(id: string) {
  await requireAdmin();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/artikel");
  revalidatePath("/artikel");
}

export async function markNotificationReadAction(id: string) {
  await requireAdmin();
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin");
}

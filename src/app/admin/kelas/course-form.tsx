import { prisma } from "@/lib/db";
import { createCourseAction, updateCourseAction } from "../actions";

type CourseDefaults = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  description?: string;
  level?: string;
  price?: number;
  durationHours?: number;
  coverEmoji?: string;
  categoryId?: string;
  syllabus?: string[];
  published?: boolean;
};

export async function CourseForm({ course }: { course?: CourseDefaults }) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const isEdit = Boolean(course?.id);

  const action = isEdit
    ? updateCourseAction.bind(null, course!.id!)
    : createCourseAction;

  const inputClass =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium">Judul kelas</span>
          <input name="title" required defaultValue={course?.title} className={inputClass} />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Slug</span>
          <input
            name="slug"
            required
            defaultValue={course?.slug}
            placeholder="fundamental-react"
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Kategori</span>
          <select name="categoryId" required defaultValue={course?.categoryId} className={inputClass}>
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Level</span>
          <select name="level" defaultValue={course?.level ?? "Pemula"} className={inputClass}>
            <option>Pemula</option>
            <option>Menengah</option>
            <option>Lanjutan</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Harga (Rp)</span>
          <input
            name="price"
            type="number"
            min={0}
            required
            defaultValue={course?.price ?? 249000}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Durasi (jam)</span>
          <input
            name="durationHours"
            type="number"
            min={1}
            required
            defaultValue={course?.durationHours ?? 10}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Emoji cover</span>
          <input
            name="coverEmoji"
            maxLength={4}
            defaultValue={course?.coverEmoji ?? "🎓"}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Ringkasan</span>
        <textarea name="summary" rows={2} required defaultValue={course?.summary} className={inputClass} />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Deskripsi</span>
        <textarea
          name="description"
          rows={4}
          required
          defaultValue={course?.description}
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Silabus (satu poin per baris)</span>
        <textarea
          name="syllabus"
          rows={6}
          required
          defaultValue={course?.syllabus?.join("\n")}
          className={inputClass}
          placeholder={"Dasar komponen\nRouting\nData fetching"}
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={course?.published ?? true}
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        Tayangkan di website
      </label>

      <button className="rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]">
        {isEdit ? "Simpan perubahan" : "Tambah kelas"}
      </button>
    </form>
  );
}

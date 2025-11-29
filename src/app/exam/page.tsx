// src/app/exam/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { subjects } from "@/lib/subjects";

export default function Page() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">เลือกวิชา</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <button
            key={s.slug}
            onClick={() => router.push(`/quiz/${s.slug}/all`)}
            className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="text-3xl">{s.icon}</div>
            <div className="mt-2 text-lg font-semibold">{s.name}</div>
            <div className="mt-1 text-sm text-gray-600">รวมทุกข้อของวิชานี้</div>
          </button>
        ))}
      </div>
    </main>
  );
}

import Quiz from "@/components/Quiz";
import { notFound } from "next/navigation";
import { toUIQuestions } from "@/data/adapters";
import { mathAllRaw } from "@/data/subjects/math/all";

export default function MathAllPage() {
  const ui = toUIQuestions(mathAllRaw, "math-all");
  if (!ui.length) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Quiz
        title={`วิชาคณิตศาสตร์ • รวมทุกข้อ (${ui.length} ข้อ)`}
        questions={ui}
        setKey="math-all"
        isPremium={true}
      />
    </div>
  );
}

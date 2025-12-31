import Quiz from "@/components/Quiz";
import { notFound } from "next/navigation";
import { toUIQuestions } from "@/data/adapters";
import { mathAllRaw } from "@/data/subjects/math/all";

export default function MathAllPage() {
  const ui = toUIQuestions(mathAllRaw, "math-all");
  if (!ui.length) return notFound();

  return (
    <div className="w-full h-screen flex flex-col">
      <Quiz
        title={`วิชาคณิตศาสตร์ • รวมทุกข้อ (${ui.length} ข้อ)`}
        questions={ui}
        setKey="math-all"
        isPremium={true}
      />
    </div>
  );
}

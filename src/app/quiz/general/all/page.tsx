import PremiumAwareQuiz from "@/components/PremiumAwareQuiz";
import { notFound } from "next/navigation";
import { toUIQuestions } from "@/data/adapters";
import { generalAllRaw } from "@/data/subjects/general/all";

export default function GeneralAllPage() {
  const ui = toUIQuestions(generalAllRaw, "general-all");
  if (!ui.length) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PremiumAwareQuiz
        title={`วิชาความสามารถทั่วไป • รวมทุกข้อ (${ui.length} ข้อ)`}
        questions={ui}
        setKey="general-all"
        // durationMin={45}
      />
    </div>
  );
}

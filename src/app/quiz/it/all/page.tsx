import PremiumAwareQuiz from "@/components/PremiumAwareQuiz";
import { notFound } from "next/navigation";
import { toUIQuestions } from "@/data/adapters";
import { itAllRaw } from "@/data/subjects/it/all";

export default function ItAllPage() {
  const ui = toUIQuestions(itAllRaw, "it-all");
  if (!ui.length) return notFound();

  return (
    <div className="w-full h-screen flex flex-col">
      <PremiumAwareQuiz
        title={`วิชาคอมพิวเตอร์ • รวมทุกข้อ (${ui.length} ข้อ)`}
        questions={ui}
        setKey="it-all"
        // durationMin={25}
      />
    </div>
  );
}

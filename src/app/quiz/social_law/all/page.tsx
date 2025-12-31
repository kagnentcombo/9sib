import PremiumAwareQuiz from "@/components/PremiumAwareQuiz";
import { notFound } from "next/navigation";
import { toUIQuestions } from "@/data/adapters";
import { lawAllRaw } from "@/data/subjects/law/all";

export default function LawAllPage() {
  const ui = toUIQuestions(lawAllRaw, "law-all");
  if (!ui.length) return notFound();

  return (
    <div className="w-full h-screen flex flex-col">
      <PremiumAwareQuiz
        title={`วิชาสังคม/กฎหมาย • รวมทุกข้อ (${ui.length} ข้อ)`}
        questions={ui}
        setKey="law-all"
        // durationMin={30}
      />
    </div>
  );
}

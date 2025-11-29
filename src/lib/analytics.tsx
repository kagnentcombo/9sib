import type {
  RawQuestion, UserAnswer, Topic, TopicStat, AnalysisResult, AnalysisSummary, MasteryLevel,
} from "@/data/types";

function levelFromAccuracy(acc: number): MasteryLevel {
  if (acc >= 90) return "เก่งมาก";
  if (acc >= 75) return "เก่ง";
  if (acc >= 60) return "ปานกลาง";
  if (acc >= 40) return "อ่อน";
  return "อ่อนมาก";
}
const r1 = (n: number) => Math.round(n * 10) / 10;

export function analyzeSet(questions: RawQuestion[], answers: UserAnswer[]): AnalysisResult {
  const byId = new Map(questions.map(q => [q.id, q]));

  const topicCounter = new Map<Topic, { total: number; correct: number; wrong: number }>();
  for (const q of questions) {
    const topics = q.topics?.length ? q.topics : (["อื่น ๆ"] as Topic[]);
    for (const t of topics) {
      const b = topicCounter.get(t) ?? { total: 0, correct: 0, wrong: 0 };
      b.total += 1;
      topicCounter.set(t, b);
    }
  }

  let attempted = 0, correct = 0;
  const wrongIds: string[] = [];

  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    if (a.selectedKey == null) continue;
    attempted++;

    const ok = a.selectedKey === q.correctKey;
    if (ok) correct++; else wrongIds.push(q.id);

    const topics = q.topics?.length ? q.topics : (["อื่น ๆ"] as Topic[]);
    for (const t of topics) {
      const b = topicCounter.get(t)!;
      if (ok) b.correct++; else b.wrong++;
    }
  }

  const wrong = attempted - correct;
  const acc = attempted ? (correct / attempted) * 100 : 0;
  const summary: AnalysisSummary = {
    total: questions.length,
    attempted, correct, wrong,
    accuracy: r1(acc),
    level: levelFromAccuracy(acc),
  };

  const totalWrong = Array.from(topicCounter.values()).reduce((s, v) => s + v.wrong, 0);

  const byTopic: TopicStat[] = Array.from(topicCounter.entries()).map(([topic, v]) => {
    const accT = v.total ? (v.correct / v.total) * 100 : 0;
    const errShare = totalWrong ? (v.wrong / totalWrong) * 100 : 0;
    const focus = errShare; // ถ้าอยาก “บูสต์” หัวข้อที่อ่อนมาก: errShare * (1 + (100-accT)/100)

    return {
      topic,
      total: v.total,
      correct: v.correct,
      wrong: v.wrong,
      accuracy: r1(accT),
      level: levelFromAccuracy(accT),
      errorShare: r1(errShare),
      focusPercent: r1(focus),
    };
  }).sort((a, b) => b.focusPercent - a.focusPercent);

  return { summary, byTopic, wrongQuestionIds: wrongIds };
}

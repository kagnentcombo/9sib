import { AttemptRecord, RawChoiceKey, RawQuestion, UserAnswer } from "@/data/types";
import { analyzeSet } from "./analytics";

const KEY = "9sib:attempts";

export function getAllAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AttemptRecord[];
  } catch { return []; }
}

export function saveAttempt(attempt: AttemptRecord) {
  const list = getAllAttempts();
  list.unshift(attempt); // ล่าสุดอยู่บนสุด
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200))); } catch {}
}

export function buildAttemptRecord(params: {
  setKey: string; title: string; subject?: string;
  startedAt: number; endedAt: number;
  questions: RawQuestion[];
  answersMap: Record<string, RawChoiceKey | undefined>;
}) {
  const answers: UserAnswer[] = params.questions.map(q => ({
    questionId: q.id,
    selectedKey: params.answersMap[q.id] ?? null,
  }));
  const result = analyzeSet(params.questions, answers);
  const attempt: AttemptRecord = {
    id: crypto.randomUUID(),
    setKey: params.setKey,
    title: params.title,
    subject: params.subject,
    createdAt: params.endedAt,
    durationMs: Math.max(0, params.endedAt - params.startedAt),
    answers: params.answersMap,
    result,
  };
  return attempt;
}

// รวม “ข้อผิดล่าสุดของชุด setKey” มาเป็นเด็คทวน
export function getLatestWrongDeck(setKey: string, questions: RawQuestion[]): RawQuestion[] {
  const latest = getAllAttempts().find(a => a.setKey === setKey);
  if (!latest || latest.result.wrongQuestionIds.length === 0) return [];
  const ids = new Set(latest.result.wrongQuestionIds);
  return questions.filter(q => ids.has(q.id));
}

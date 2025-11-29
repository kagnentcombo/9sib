// src/data/adapters.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Question } from "@/types/quiz";
import type { RawQuestion } from "@/data/types";
import { ensureTopicsOnRaw } from "@/lib/topicTagger";

export function toUIQuestions(raw: RawQuestion[], keyPrefix: string): Question[] {
  const withTopics = ensureTopicsOnRaw(raw);
  return withTopics.map((q, i) => ({
    id: q.id ?? `${keyPrefix}-${i + 1}`,
    text: q.text,
    image: q.image, // ✅ ส่งต่อ
    imageAlt: q.imageAlt, // ✅ ส่งต่อ
    choices: q.choices.map((c) => ({
      key: c.key,
      label: c.label,
      img: c.img, // ✅ ส่งต่อ
      imgAlt: c.imgAlt,
    })),
    correctKey: q.correctKey,
    explanation: q.explanation,
    topics: (q as any).topics,
  }));
}

import type { RawQuestion } from "@/data/types";

const KNOWN_TOPICS = [
  "อนุกรม",
  "สัดส่วนร้อยละ",
  "เวนน์/นับจำนวน",
  "อัตราส่วน/แปรผัน",
  "จำนวนจริง/พีชคณิต",
  "ค่าเฉลี่ย/สถิติ",
  "หารร่วมมาก/ตัวประกอบ",
  "เวลา/งาน/อัตรา",
  "อายุ/สมการคำพูด",
  "เรขาคณิตพื้นฐาน",
  "อื่น ๆ",
];

function normalize(s: string) {
  return s
    .replace(/[^\p{L}\p{N}]+/gu, " ") // keep letters/numbers, replace others with space
    .trim();
}

export function inferTopicsFromExplanation(q: RawQuestion): string[] | null {
  const explan = q.explanation;
  if (!explan) return null;

  // explanation may be string or string[]
  const lines = Array.isArray(explan) ? explan : String(explan).split(/\r?\n/);
  if (!lines.length) return null;

  // look for a line that contains 'เรื่อง' or 'เรื่อง:' or 'Topic:' (Thai-centric)
  const candidateLine = lines.find((l) => /เรื่อง[:：]/i.test(l) || /เรื่อง/i.test(l)) || lines[0];
  const txt = normalize(candidateLine);

  // try to find known topic names inside the text
  const found: string[] = [];
  for (const t of KNOWN_TOPICS) {
    if (t === "อื่น ๆ") continue;
    if (txt.includes(normalize(t))) found.push(t);
  }

  if (found.length) return found.slice(0, 1); // return only the first match for clarity

  // fallback: try to parse after 'เรื่อง' token
  const m = candidateLine.match(/เรื่อง[:：]?\s*(.+)/i);
  if (m && m[1]) {
    // try to match known topics first
    for (const t of KNOWN_TOPICS) {
      if (t !== "อื่น ๆ" && m[1].includes(t)) {
        return [t];
      }
    }
  }

  return null;
}

export function ensureTopicsOnRaw(raw: RawQuestion[]): RawQuestion[] {
  return raw.map((q) => {
    if (q.topics && q.topics.length) return q;
    const inferred = inferTopicsFromExplanation(q);
    if (inferred && inferred.length) return ({ ...q, topics: inferred } as unknown as RawQuestion);
    return ({ ...q, topics: ["อื่น ๆ"] } as unknown as RawQuestion);
  });
}

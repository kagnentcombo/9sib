#!/usr/bin/env node
/**
 * Auto-tag script: adds `topics` field to questions in general/all.ts and math/all.ts
 * Infers topics from explanation or question text.
 */

import fs from "fs";
import path from "path";

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

function normalize(s: string): string {
  return s
    .replace(/[^\p{L}\p{N}]/gu, " ")
    .trim()
    .toLowerCase();
}

function inferTopicFromQuestion(q: any): string[] {
  // 1. ถ้ามี topics อยู่แล้ว ให้คืนค่า
  if (q.topics && q.topics.length > 0) {
    return q.topics;
  }

  const candidates: string[] = [];

  // 2. หลักการ: ดูเฉลยแรกบรรทัด (หรือ text) หา "เรื่อง: ..."
  const explan = q.explanation;
  const firstLine = Array.isArray(explan)
    ? explan[0] || ""
    : String(explan || "");

  const normalized = normalize(firstLine);

  // 3. ลอง match ทั้งหมด known topics
  for (const t of KNOWN_TOPICS) {
    if (t === "อื่น ๆ") continue;
    if (normalized.includes(normalize(t))) {
      candidates.push(t);
    }
  }

  if (candidates.length > 0) {
    return candidates.length > 1 ? candidates.slice(0, 2) : candidates;
  }

  // 4. ถ้าหา keyword ไม่เจอ, ลองดู question text
  const textNorm = normalize(q.text || "");
  for (const t of KNOWN_TOPICS) {
    if (t === "อื่น ๆ") continue;
    if (
      textNorm.includes(normalize(t)) ||
      textNorm.includes("อนุกรม") ||
      textNorm.includes("สัดส่วน") ||
      textNorm.includes("เวนน์") ||
      textNorm.includes("อัตราส่วน") ||
      textNorm.includes("ค่าเฉลี่ย") ||
      textNorm.includes("หารร่วม") ||
      textNorm.includes("เวลา") ||
      textNorm.includes("อายุ") ||
      textNorm.includes("เรขาคณิต")
    ) {
      candidates.push(t);
    }
  }

  if (candidates.length > 0) {
    return candidates.length > 1 ? candidates.slice(0, 2) : candidates;
  }

  // 5. ถ้าหาไม่เจอ ให้เป็น "อื่น ๆ"
  return ["อื่น ๆ"];
}

function processFile(filePath: string): void {
  console.log(`📖 Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, "utf-8");

  // ใช้ regex เพื่อแปลง .ts file เป็น JSON (สัญญาว่า ทั้ง all.ts ใช้รูปแบบ export const xxx = [...])
  // ตัดออก "export const" และ tail "; "

  try {
    // แยก JSON array จากไฟล์ .ts
    const arrayMatch = content.match(/export const \w+ = (\[[\s\S]*\]);?$/);
    if (!arrayMatch) {
      console.error("❌ Could not find export array in file");
      return;
    }

    const jsonStr = arrayMatch[1];
    // ป้องกัน undefined values / trailing commas
    const cleanJson = jsonStr
      .replace(/,\s*]/g, "]")
      .replace(/,\s*}/g, "}")
      .replace(/undefined/g, "null");

    // Try JSON.parse (อาจต้อง relax กฎบางอย่าง)
    let questions: any[];
    try {
      questions = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("  ⚠️ Fallback: Trying to parse with eval (not ideal)");
      // fallback: ใช้ TypeScript compiler lib เพื่อ parse (ถ้ามีติดตั้ง) หรือเรียกใช้ ts-node
      // ตอนนี้ข้ามไป, ให้ผู้ใช้รัน command ด้วย ts-node
      console.error("  ❌ Could not parse JSON");
      return;
    }

    // Process each question
    const updated = questions.map((q) => {
      if (!q.topics || q.topics.length === 0) {
        const inferred = inferTopicFromQuestion(q);
        return { ...q, topics: inferred };
      }
      return q;
    });

    // Regenerate TS file
    const exportName = arrayMatch[0].match(/export const (\w+)/)?.[1] || "array";
    const newContent =
      content.substring(0, arrayMatch.index) +
      `export const ${exportName} = ${JSON.stringify(updated, null, 2)};`;

    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log("  ✅ File updated successfully");
  } catch (err) {
    console.error("  ❌ Error:", err);
  }
}

// Main
const generalPath = path.join(
  process.cwd(),
  "src/data/subjects/general/all.ts"
);
const mathPath = path.join(process.cwd(), "src/data/subjects/math/all.ts");

console.log("🚀 Starting auto-tag script...\n");
processFile(generalPath);
processFile(mathPath);
console.log("\n✨ Done!");

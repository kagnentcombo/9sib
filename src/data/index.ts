// src/data/index.ts
export type { Subject, SetMeta, SetEntry } from "./types";

// กรณีประกาศฟังก์ชันภายในไฟล์นี้เอง
export function listSets(subject: string, year: number | "all"): import("./types").SetMeta[] {
  // ... ของเดิมคุณ (อย่าเรียก import จาก "@/data" ซ้ำเด็ดขาด)
  return []; // <- แทนด้วยของจริง
}

export function listYears(subject: string): number[] {
  // ... ของเดิมคุณ
  return []; // <- แทนด้วยของจริง
}

export function getSet(subject: string, year: number, id: string): import("./types").SetEntry | undefined {
  // ... ของเดิมคุณ
  return undefined; // <- แทนด้วยของจริง
}

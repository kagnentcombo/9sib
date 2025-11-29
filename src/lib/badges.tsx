import { AttemptRecord } from "@/data/types";

export type Badge = { code: string; name: string; desc: string };

export function computeBadges(attempts: AttemptRecord[]): Badge[] {
  const res: Badge[] = [];
  const total = attempts.length;
  const bestAcc = Math.max(0, ...attempts.map(a => a.result.summary.accuracy));
  const streak = calcDailyStreak(attempts.map(a => a.createdAt));

  if (total >= 1) res.push({ code: "first-blood", name: "เริ่มภารกิจ", desc: "ทำข้อสอบครั้งแรก" });
  if (bestAcc >= 80) res.push({ code: "eagle", name: "Eagle Eye", desc: "ได้ Accuracy ≥ 80%" });
  if (bestAcc >= 95) res.push({ code: "sniper", name: "Sniper", desc: "ได้ Accuracy ≥ 95%" });
  if (streak >= 3) res.push({ code: "streak3", name: "มีวินัย", desc: "ทำต่อเนื่อง 3 วัน" });
  if (streak >= 7) res.push({ code: "streak7", name: "เข้มขั้นสุด", desc: "ทำต่อเนื่อง 7 วัน" });

  return res;
}

function calcDailyStreak(timestamps: number[]): number {
  const days = Array.from(new Set(timestamps.map(t => new Date(t).toDateString()))).sort();
  if (days.length === 0) return 0;
  let streak = 1, maxStreak = 1;
  for (let i = 1; i < days.length; i++) {
    const d1 = new Date(days[i-1]);
    const d2 = new Date(days[i]);
    const diff = (d2.getTime() - d1.getTime()) / 86400000; // day
    if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
    else if (diff > 1) { streak = 1; }
  }
  return maxStreak;
}

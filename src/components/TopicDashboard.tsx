"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllAttempts } from "@/lib/history";
import type { TopicStat } from "@/data/types";

export default function TopicDashboard() {
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    setAttempts(getAllAttempts());
  }, []);

  const agg = useMemo(() => {
    const map = new Map<string, { total: number; correct: number; wrong: number }>();
    for (const a of attempts) {
      const byTopic = a.result?.byTopic as TopicStat[] | undefined;
      if (!byTopic) continue;
      for (const t of byTopic) {
        const cur = map.get(t.topic) ?? { total: 0, correct: 0, wrong: 0 };
        cur.total += t.total;
        cur.correct += t.correct;
        cur.wrong += t.wrong;
        map.set(t.topic, cur);
      }
    }
    const totalWrong = Array.from(map.values()).reduce((s, v) => s + v.wrong, 0);
    return Array.from(map.entries()).map(([topic, v]) => {
      const acc = v.total ? (v.correct / v.total) * 100 : 0;
      const errShare = totalWrong ? (v.wrong / totalWrong) * 100 : 0;
      return {
        topic,
        total: v.total,
        correct: v.correct,
        wrong: v.wrong,
        accuracy: Math.round(acc * 10) / 10,
        errorShare: Math.round(errShare * 10) / 10,
        focusPercent: Math.round(errShare * 10) / 10,
      };
    }).sort((a, b) => b.focusPercent - a.focusPercent);
  }, [attempts]);

  if (!attempts.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-xl border bg-white p-6 text-center text-gray-600">ยังไม่มีประวัติการทำข้อสอบ ลองทำชุดข้อสอบสักชุดเพื่อดูสรุปหัวข้อ</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="text-2xl font-semibold">Dashboard: พัฒนาการตามหัวข้อ</h2>
      <p className="text-sm text-gray-600 mt-2">สรุปจากการทำโจทย์ทั้งหมด (local history)</p>

      <div className="mt-6 space-y-4">
        {agg.map((t) => (
          <div key={t.topic} className="rounded-lg border p-3 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t.topic}</div>
                <div className="text-xs text-gray-500">{t.correct}/{t.total} ถูก — {t.wrong} ผิด</div>
              </div>
              <div className="text-sm text-gray-700">เน้น {t.focusPercent}%</div>
            </div>

            <div className="mt-2">
              <div className="relative h-3 rounded bg-gray-100">
                <div className="absolute left-0 top-0 h-3 rounded bg-green-500" style={{ width: `${t.accuracy}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">Accuracy: {t.accuracy}% — Error share: {t.errorShare}%</div>
            </div>

            <div className="mt-3 flex gap-2">
              <a
                className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                href={`/practice/topic/${encodeURIComponent(t.topic)}`}
              >
                ฝึกหัวข้อนี้
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { getAllAttempts } from "@/lib/history";
import Link from "next/link";

export default function HistoryPage() {
  const attempts = getAllAttempts();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-semibold">ประวัติการทำข้อสอบ</h1>

      {attempts.length === 0 ? (
        <p className="mt-4 text-gray-600">ยังไม่มีประวัติ ลองทำข้อสอบสักชุดก่อนนะ</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {attempts.map(a => (
            <li key={a.id} className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
              <Link href={`/history/${a.id}`} className="block">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-sm text-gray-500">({a.setKey})</div>
                  <div className="ml-auto text-sm text-gray-600">
                    {new Date(a.createdAt).toLocaleString("th-TH")}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-800">
                  คะแนน {a.result.summary.correct}/{a.result.summary.total} • Accuracy {a.result.summary.accuracy}% • ใช้เวลา {fmt(a.durationMs)}
                </div>

                {/* Top 3 หัวข้อที่ควรเน้น */}
                {a.result.byTopic.length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="text-gray-600">ควรเน้น:</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {a.result.byTopic.slice(0, 3).map(t => (
                        <span key={t.topic} className="rounded-full border px-2 py-0.5 text-xs">
                          {t.topic} • {t.focusPercent}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-blue-600 font-medium">
                  คลิกเพื่อดูรายละเอียด →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

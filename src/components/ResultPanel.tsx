
import Link from "next/link";
import { AnalysisResult } from "@/data/types";

type Props = {
  title: string;
  result: AnalysisResult;
  onPracticeWrong?: () => void;
  onReviewTopics?: (topic: string) => void;
};

export default function ResultPanel({ title, result, onPracticeWrong, onReviewTopics }: Props) {
  const s = result.summary;
  const topToStudy = result.byTopic.slice(0, 3);

  function recForTopic(t: typeof result.byTopic[number]) {
    if (t.accuracy < 40) return "ควรอ่านมาก";
    if (t.accuracy < 60) return "ควรฝึกเพิ่ม";
    if (t.accuracy < 75) return "ทบทวนบ้าง";
    return "พอใช้/ทบทวนเล็กน้อย";
  }

  function rankLetter(level: string) {
    // Mapping Thai mastery to letter grade (A=best)
    if (level === "เก่งมาก") return "A";
    if (level === "เก่ง") return "B";
    if (level === "ปานกลาง") return "C";
    if (level === "อ่อน") return "D";
    return "E";
  }

  return (
    <section className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{title} – สรุปผล</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Stat label="คะแนน" value={`${s.correct}/${s.total}`} />
        <Stat label="Accuracy" value={`${s.accuracy}%`} />
        <Stat label="ระดับรวม" value={s.level} />
      </div>

      <h4 className="mt-5 text-base font-semibold">หัวข้อที่ควรเน้น</h4>
      <div className="mt-2 text-sm text-gray-700">
        คำแนะนำ: หัวข้อด้านล่างเรียงตามความสำคัญที่ควรฝึก (สูง → ต่ำ)
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-[560px] w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-3">หัวข้อ</th>
              <th className="py-2 pr-3">ถูก/ทั้งหมด</th>
              <th className="py-2 pr-3">Accuracy</th>
              <th className="py-2 pr-3">ระดับ</th>
              <th className="py-2 pr-3">ควรเน้น</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {result.byTopic.map(t => (
              <tr key={t.topic} className="border-t">
                <td className="py-2 pr-3">{t.topic}</td>
                <td className="py-2 pr-3">{t.correct}/{t.total}</td>
                <td className="py-2 pr-3">
                  <div className="w-40">
                    <div className="relative h-3 rounded bg-gray-100">
                      <div
                        className="absolute left-0 top-0 h-3 rounded bg-green-500"
                        style={{ width: `${t.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t.accuracy}%</div>
                </td>
                <td className="py-2 pr-3">{t.level} <span className="ml-2 font-mono">{rankLetter(t.level)}</span></td>
                <td className="py-2 pr-3">{t.focusPercent}%</td>
                <td className="py-2">
                  <button
                    className="rounded border px-2 py-1 hover:bg-gray-50"
                    onClick={() => onReviewTopics?.(t.topic)}
                  >
                    ฝึกหัวข้อนี้
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5">
        <h4 className="text-base font-semibold">ข้อเสนอแนะเบื้องต้น</h4>
        <div className="mt-2 space-y-2 text-sm">
          {topToStudy.map(t => (
            <div key={t.topic} className="flex items-center justify-between rounded border p-2">
              <div>
                <div className="font-medium">{t.topic}</div>
                <div className="text-xs text-gray-500">{t.correct}/{t.total} — {t.level} — {recForTopic(t)}</div>
              </div>
              <div className="text-sm font-semibold text-red-600">เน้น {t.focusPercent}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={() => onPracticeWrong?.()}>
          ทวน “ข้อที่ผิด” ของรอบนี้
        </button>
        <Link href="/history" className="rounded-lg border px-4 py-2 hover:bg-gray-50">
          ดูประวัติ/พัฒนาการ
        </Link>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

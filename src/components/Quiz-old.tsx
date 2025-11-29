// src/components/Quiz.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Question, ChoiceKey } from "@/types/quiz";

// ✅ เพิ่ม: ใช้แผงสรุป + helper บันทึกประวัติ
import ResultPanel from "@/components/ResultPanel";
import { buildAttemptRecord, saveAttempt } from "@/lib/history";
import type { AnalysisResult, RawQuestion } from "@/data/types";
import { MOCK_UNLOCK_ALL } from "@/lib/config";

/**
 * ✅ ขยาย type เฉพาะในไฟล์นี้ เพื่อรองรับรูปภาพ
 * - ไม่กระทบ type กลางของโปรเจ็กต์
 */
type ChoiceWithImg = Question["choices"][number] & {
  img?: string;
  imgAlt?: string;
};

type QWithImg = Question & {
  image?: string;
  imageAlt?: string;
  // หมายเหตุ: ถ้าแทรก topics มาในคำถาม ให้ส่งมาที่ object นี้ได้ (any)
  // (เรา fallback ไป "อื่น ๆ" ให้อัตโนมัติด้านล่างอยู่แล้ว)
  choices: ChoiceWithImg[];
};

type Props = {
  title: string;
  questions: QWithImg[];     // ⬅️ รองรับรูป (เพิ่ม field optional)
  isPremium?: boolean;       // true = โชว์เฉลย/อธิบายหลังส่ง
  setKey?: string;           // unique key เช่น `${subject}-${year}-${id}` เพื่อผูก autosave/attempt
  durationMin?: number;      // ตั้งเวลาทำข้อสอบ (นาที) ถ้าไม่ใส่ = ไม่มีจำกัดเวลา
};

type SavedState = {
  index: number;
  answers: Record<string, ChoiceKey | undefined>;
  startedAt: number; // Date.now()
};

// ✅ แปลง QWithImg -> RawQuestion สำหรับวิเคราะห์/บันทึกผล
function toRaw(questions: QWithImg[]): RawQuestion[] {
  return questions.map((q: QWithImg) => ({
    id: q.id,
    text: q.text,
    image: q.image,
    imageAlt: q.imageAlt,
    choices: q.choices.map((c: ChoiceWithImg) => ({
      key: c.key,
      label: c.label,
      img: c.img,
      imgAlt: c.imgAlt,
    })),
    correctKey: q.correctKey,
    topics: (q as any).topics ?? ["อื่น ๆ"], // ถ้า QWithImg ยังไม่มี field topics จริง ๆ
    explanation: q.explanation,
  }));
}


export default function Quiz({
  title,
  questions,
  isPremium = false,
  setKey = "default",
  durationMin,
}: Props) {
  // == State ==
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ChoiceKey | undefined>>({});
  const [submitted, setSubmitted] = useState(false);

  // วิเคราะห์ผลรอบนี้ (แสดง ResultPanel)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // สำหรับจับเวลา
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const timeUsedMs = now - startedAt;

  // == Derived ==
  const current = questions[index];
  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((acc, q) => acc + (answers[q.id] === q.correctKey ? 1 : 0), 0);
  }, [submitted, answers, questions]);

  const total = questions.length;

  // == Autosave/load ==
  const storageKey = `quiz:${setKey}`;

  // โหลดสถานะที่เคยเซฟ
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: SavedState = JSON.parse(raw);
        // ตรวจว่าจำนวนข้อยังตรงอยู่ (กันกรณีข้อมูลเก่าไม่ตรงกับชุดใหม่)
        if (parsed && typeof parsed === "object" && questions?.length > 0) {
          setIndex(Math.min(parsed.index ?? 0, questions.length - 1));
          setAnswers(parsed.answers ?? {});
          setStartedAt(parsed.startedAt ?? Date.now());
        }
      } else {
        // ไม่มีของเก่า → รีเซ็ตเริ่มใหม่
        setStartedAt(Date.now());
        setAnswers({});
        setIndex(0);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, questions?.length]);

  // บันทึกทุกครั้งที่ state เปลี่ยน
  useEffect(() => {
    const payload: SavedState = { index, answers, startedAt };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore quota exceeded
    }
  }, [index, answers, startedAt, storageKey]);

  // Timer tick / ตรวจหมดเวลา
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeLeftMs =
    durationMin && durationMin > 0 ? Math.max(0, durationMin * 60_000 - timeUsedMs) : undefined;

  useEffect(() => {
    if (!submitted && timeLeftMs === 0) {
      // หมดเวลา → ส่งอัตโนมัติ
      doSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftMs, submitted]);

  // == Actions ==
  function choose(qid: string, key: ChoiceKey) {
    setAnswers((prev) => ({ ...prev, [qid]: key }));
  }

  function doSubmit(force = false) {
    const answeredCount = Object.values(answers).filter(Boolean).length;
    if (!force && answeredCount < total) {
      const ok = confirm(`ตอบแล้ว ${answeredCount}/${total} ข้อ\nยังไม่ครบ จะส่งเลยไหม?`);
      if (!ok) return;
    }
    setSubmitted(true);

    // ✅ วิเคราะห์ & บันทึกประวัติ (LocalStorage) ให้หน้า /history ใช้ได้ทันที
    try {
      const rawQs = toRaw(questions);
      const endedAt = Date.now();
      const attempt = buildAttemptRecord({
        setKey,
        title,
        subject: undefined, // ใส่ชื่อวิชาได้ หากต้องการ
        startedAt,
        endedAt,
        questions: rawQs,
        answersMap: answers as any,
      });
      saveAttempt(attempt);        // สำคัญ: บันทึกลง key 9sib:attempts
      setAnalysis(attempt.result); // แสดงผลใน ResultPanel
    } catch (e) {
      console.error("save attempt failed", e);
    }

    // ถ้าต้องการ: call API บันทึกผลที่นี่
    // await fetch("/api/attempts", { method:"POST", body: JSON.stringify(attempt) })
  }

  function reset() {
    setSubmitted(false);
    setAnalysis(null);
    setAnswers({});
    setIndex(0);
    setStartedAt(Date.now());
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }

  // ใช้สร้าง “ทวนข้อที่ผิด” ของรอบนี้ ไปที่หน้า /review
  function practiceWrongNow() {
    const wrongIds = questions
      .filter((q) => answers[q.id] && answers[q.id] !== q.correctKey)
      .map((q) => q.id);
    if (wrongIds.length === 0) {
      alert("รอบนี้ไม่มีข้อผิด 🎉");
      return;
    }
    const ids = wrongIds.join(",");
    window.location.href = `/review?set=${encodeURIComponent(setKey)}&ids=${encodeURIComponent(ids)}`;
  }

  // ถ้าคุณมีหน้าฝึกตามหัวข้อ สามารถพาไป route นี้ได้เลย
  function reviewTopic(topic: string) {
    window.location.href = `/practice/topic/${encodeURIComponent(topic)}?from=${encodeURIComponent(
      setKey
    )}`;
  }

  // == UI helpers ==
  function fmt(ms: number) {
    const s = Math.floor(ms / 1000);
    const min = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  }

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      {/* Header */}
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>

        <div className="ml-auto flex items-center gap-3 text-sm text-gray-700">
          <span>
            ข้อ {index + 1}/{total}
          </span>
          <span>ตอบแล้ว {answeredCount}/{total}</span>
          {durationMin ? (
            <span className={timeLeftMs! <= 30_000 ? "font-semibold text-red-600" : ""}>
              เวลา {fmt(timeLeftMs!)}
            </span>
          ) : (
            <span>ใช้เวลา {fmt(timeUsedMs)}</span>
          )}
        </div>
      </header>

      {/* โจทย์ */}
      {!submitted ? (
        <>
          {/* ✅ ถ้ามีรูปโจทย์ ให้แสดงก่อนข้อความ */}
          {current?.image && (
            <div className="mb-3 overflow-hidden rounded-lg border bg-white">
              <Image
                src={current.image}
                alt={current.imageAlt ?? "โจทย์แบบรูปภาพ"}
                width={1600}
                height={1200}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          )}

          {/* ข้อความโจทย์ (optional) */}
          {current?.text && (
            <div className="text-gray-900 leading-relaxed whitespace-pre-line">{current.text}</div>
          )}

          {/* ช้อยส์ */}
          <ul className="mt-4 space-y-2">
            {current.choices.map((c) => {
              const selected = answers[current.id] === c.key;
              return (
                <li key={c.key}>
                  <button
                    onClick={() => choose(current.id, c.key)}
                    className={[
                      "w-full text-left rounded-lg border px-4 py-3 transition",
                      "hover:bg-gray-50",
                      selected ? "border-blue-500 ring-1 ring-blue-200" : "border-gray-200",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm">
                        {c.key}
                      </span>

                      {/* ✅ ถ้าตัวเลือกเป็นรูป ให้เรนเดอร์รูปแทนข้อความ */}
                      {"img" in c && c.img ? (
                        <Image
                          src={c.img}
                          alt={c.imgAlt ?? `ตัวเลือก ${c.key}`}
                          width={1200}
                          height={800}
                          className="max-h-56 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-gray-800">{c.label}</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* ปุ่มควบคุม */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
            >
              ก่อนหน้า
            </button>

            <button
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              disabled={index === total - 1}
            >
              ถัดไป
            </button>

            <button
              className="ml-auto rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => doSubmit(false)}
              disabled={answeredCount === 0}
              title={answeredCount === 0 ? "ยังไม่ได้ตอบเลย" : "ส่งคำตอบ"}
            >
              ส่งคำตอบ
            </button>
          </div>

          {/* ทางลัด bubble */}
          <div className="mt-6 flex flex-wrap gap-2">
            {questions.map((q, i) => {
              const answered = answers[q.id] !== undefined;
              const active = i === index;
              return (
                <button
                  key={q.id}
                  onClick={() => setIndex(i)}
                  className={[
                    "h-9 w-9 rounded-full border text-sm",
                    active ? "border-blue-600 text-blue-700" : "border-gray-300 text-gray-700",
                    answered ? "bg-blue-50" : "bg-white",
                  ].join(" ")}
                  title={`ไปข้อที่ ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        // == Review Mode ==
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="text-base">
              คะแนน: <span className="font-semibold">{score}</span> / {total}
            </div>
            <div className="text-sm text-gray-600">ใช้เวลา {fmt(timeUsedMs)}</div>
          </div>

          <ol className="space-y-4">
            {questions.map((q, i) => {
              const picked = answers[q.id];
              const correct = q.correctKey;
              const isCorrect = picked === correct;
              return (
                <li key={q.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                      {i + 1}
                    </span>

                    <div className="flex-1 space-y-2">
                      {/* ✅ แสดงรูปโจทย์ในโหมดทบทวนด้วย */}
                      {q.image && (
                        <div className="overflow-hidden rounded-lg border bg-white">
                          <Image
                            src={q.image}
                            alt={q.imageAlt ?? `รูปโจทย์ข้อ ${i + 1}`}
                            width={1600}
                            height={1200}
                            className="h-auto w-full object-contain"
                          />
                        </div>
                      )}
                      {q.text && <div className="whitespace-pre-line">{q.text}</div>}
                    </div>
                  </div>

                  <ul className="ml-8 space-y-1">
                    {q.choices.map((c: any) => {
                      const isUser = picked === c.key;
                      const isAns = correct === c.key;
                      return (
                        <li
                          key={c.key}
                          className={[
                            "rounded border px-3 py-2 text-sm",
                            isAns ? "border-green-500 bg-green-50" : "border-gray-200",
                            isUser && !isAns ? "border-red-500 bg-red-50" : "",
                          ].join(" ")}
                        >
                          <span className="mr-2 inline-block rounded-full border px-2 text-xs">
                            {c.key}
                          </span>

                          {/* ✅ รองรับตัวเลือกเป็นรูปในโหมดทบทวน */}
                          {"img" in c && c.img ? (
                            <Image
                              src={c.img}
                              alt={c.imgAlt ?? `ตัวเลือก ${c.key}`}
                              width={1200}
                              height={800}
                              className="max-h-56 w-auto object-contain inline-block align-middle"
                            />
                          ) : (
                            <span>{c.label}</span>
                          )}

                          {isUser && <span className="ml-2 text-xs text-gray-600">(คุณเลือก)</span>}
                          {isAns && <span className="ml-2 text-xs text-green-700">(คำตอบ)</span>}
                        </li>
                      );
                    })}
                  </ul>

                  {((isPremium || MOCK_UNLOCK_ALL) && (q as any).explanation) && (
                    <div className="mt-2 rounded bg-blue-50 p-2 text-sm text-blue-800">
                      <div className="font-medium">เฉลย: {q.correctKey}</div>

                      {Array.isArray((q as any).explanation) ? (
                        <ul className="mt-1 list-disc pl-5 space-y-1">
                          {(q as any).explanation.map((line: string, i: number) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-1 whitespace-pre-line">{(q as any).explanation}</div>
                      )}
                    </div>
                  )}

                  {!isCorrect && !(isPremium || MOCK_UNLOCK_ALL) && (
                    <div className="mt-2 text-xs text-gray-500">
                      อัปเกรดเป็น Premium เพื่อดูวการวิเคราะห์เฉลยและคำอธิบาย
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {/* ✅ แผงวิเคราะห์ผลรายหัวข้อ + ปุ่มทวนข้อผิด */}
          {analysis && (
            <ResultPanel
              title={title}
              setKey={setKey}
              result={analysis}
              onPracticeWrong={practiceWrongNow}
              onReviewTopics={reviewTopic}
            />
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              onClick={reset}
            >
              ทำใหม่
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

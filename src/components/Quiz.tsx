"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question } from "@/types/quiz";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import ResultPanel from "./ResultPanel";
import { buildAttemptRecord, saveAttempt } from "@/lib/history";
import { analyzeSet } from "@/lib/analytics";
import { MOCK_UNLOCK_ALL } from "@/lib/config";
import type { AnalysisResult } from "@/data/types";

interface Props {
  questions: Question[];
  title: string;
  setKey: string;
  isPremium?: boolean;
}

export default function Quiz({
  questions,
  title,
  setKey,
  isPremium = false,
}: Props) {
  const total = questions.length;
  const [answers, setAnswers] = useState<Record<string, string | undefined>>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedModalId, setSelectedModalId] = useState<string | null>(null);
  const [timeUsedMs, setTimeUsedMs] = useState(0);
  const [startTime] = useState(Date.now());
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const current = questions[index];
  const answeredCount = Object.keys(answers).length;

  const score = useMemo(
    () => questions.filter((q) => answers[q.id] === q.correctKey).length,
    [questions, answers]
  );

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeUsedMs(Date.now() - startTime);
    }, 100);
    return () => clearInterval(timer);
  }, [startTime, submitted]);

  const choose = (qId: string, key: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: key }));
  };

  const fmt = (ms: number) => {
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const doSubmit = async () => {
    setIsSubmitting(true);
    const finalTime = Date.now() - startTime;
    setTimeUsedMs(finalTime);

    await new Promise((resolve) => setTimeout(resolve, 300));

    setSubmitted(true);

    const attempt = buildAttemptRecord({
      setKey,
      title,
      startedAt: startTime,
      endedAt: Date.now(),
      questions: questions as any,
      answersMap: answers as any,
    });
    saveAttempt(attempt);

    const result = analyzeSet(
      questions as any,
      Object.entries(answers).map(([questionId, selectedKey]) => ({
        questionId,
        selectedKey: selectedKey as any,
      }))
    );
    setAnalysis(result);
    setIsSubmitting(false);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setIndex(0);
    setTimeUsedMs(0);
    setSelectedModalId(null);
    setAnalysis(null);
    setIsSubmitting(false);
  };

  const practiceWrongNow = () => {};
  const reviewTopic = (topic: string) => {
    window.location.href = `/practice/topic/${encodeURIComponent(topic)}`;
  };

  // ปุ่ม palette เลขข้อ
  const renderPaletteButton = (q: Question, i: number) => {
    const answered = answers[q.id] !== undefined;
    const active = i === index;

    return (
      <button
        key={q.id}
        onClick={() => setIndex(i)}
        className={`h-9 w-9 rounded-md text-xs font-semibold flex items-center justify-center border transition
        ${
          active
            ? "bg-blue-600 border-blue-600 text-white"
            : answered
            ? "bg-green-50 border-green-400 text-green-700"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
        title={`ไปข้อที่ ${i + 1}`}
      >
        {i + 1}
      </button>
    );
  };

  return (
    <div className="flex flex-col bg-gray-50 w-full">
      {/* Header เต็มความกว้าง (ไม่ padding ซ้ายขวามาก) */}
<header className="h-16 flex items-center border-b bg-white px-4 w-full">
  <div className="w-full flex justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <div className="mt-0.5 text-xs text-gray-600">
              ข้อ {index + 1} จาก {total}
            </div>
          </div>
        </div>
      </header>

      {/* ========== โหมดทำข้อสอบ ========== */}
      {!submitted && (
        <>
          <main className="flex-1 flex overflow-hidden w-full">
  <div className="w-full h-full grid grid-cols-[180px,1fr,280px] gap-0 p-0 bg-gray-50">

              {/* ซ้าย: palette เลขข้อ */}
              <aside className="bg-white border-r border-gray-300 px-3 py-3 flex flex-col overflow-y-auto">
                <div className="mb-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  ข้อสอบ
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {questions.map((q, i) => renderPaletteButton(q, i))}
                </div>
              </aside>

              {/* กลาง: โจทย์ + ช้อยส์ */}
              <section className="bg-gray-50 flex flex-col border-r border-gray-300 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-8 py-6 w-full">
                  <div className="mb-4 text-sm text-gray-600">
                    Q: {index + 1}
                  </div>

                  <div className="flex-1">
                  {current?.image && (
                    <div className="mb-4">
                      <Image
                        src={current.image}
                        alt={current.imageAlt ?? "โจทย์"}
                        width={400}
                        height={200}
                        className="max-h-52 w-auto object-contain"
                        priority
                      />
                    </div>
                  )}

                  {current?.text && (
                    <div className="mb-6 text-sm leading-relaxed text-gray-900 whitespace-pre-line">
                      {current.text}
                    </div>
                  )}

                  <div className="space-y-3 mt-6">
                    {current.choices.map((c: any) => {
                      const selected = answers[current.id] === c.key;
                      return (
                        <button
                          key={c.key}
                          onClick={() => choose(current.id, c.key)}
                          className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition
                          ${
                            selected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 bg-white hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 h-7 w-7 flex items-center justify-center rounded-full border text-xs font-semibold
                              ${
                                selected
                                  ? "border-blue-500 bg-blue-500 text-white"
                                  : "border-gray-400 text-gray-700"
                              }`}
                            >
                              {c.key}
                            </span>
                            <span className="text-gray-800">
                              {typeof c === "object" && "label" in c
                                ? c.label
                                : ""}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  </div>
                </div>
              </section>

              {/* ขวา: สรุป / ปุ่ม submit */}
              <aside className="flex flex-col bg-white border-l border-gray-300">
                <div className="px-4 py-4 text-xs border-b border-gray-200 flex-1 overflow-y-auto">
                  <div className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
                    Overview
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ข้อทั้งหมด</span>
                      <span className="font-semibold text-gray-900">{total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ตอบแล้ว</span>
                      <span className="font-semibold text-gray-900">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ยังไม่ได้ตอบ</span>
                      <span className="font-semibold text-gray-900">
                        {total - answeredCount}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
                      <span className="text-gray-600">ใช้เวลา</span>
                      <span className="font-semibold text-gray-900">{fmt(timeUsedMs)}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-4 border-t border-gray-200">
                  <button
                    className="w-full rounded-md bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={doSubmit}
                    disabled={answeredCount === 0 || isSubmitting}
                  >
                    {isSubmitting ? "กำลังส่ง..." : "Review & Submit"}
                  </button>
                </div>
              </aside>
            </div>
          </main>

          {/* แถบปุ่มล่าง เต็มความกว้าง ไม่มีช่องขาวล่างเพิ่ม */}
          <div className="border-t border-gray-200 bg-white w-full">
            <div className="flex w-full items-center justify-between px-1 md:px-2 py-2 text-xs">
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                >
                  ← Previous
                </button>

                <button
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                  disabled={index === total - 1}
                >
                  Save & Next →
                </button>
              </div>

              <button
                className="px-4 py-2 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                onClick={() => {
                  setAnswers((prev) => {
                    const clone = { ...prev };
                    delete clone[current.id];
                    return clone;
                  });
                }}
              >
                Clear Response
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========== โหมดดูเฉลย / สรุปคะแนน ========== */}
      {submitted && (
        <section className="flex-1 overflow-y-auto px-6 py-6 w-full">
          <div className="mb-6 rounded-lg bg-gray-100 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-sm font-medium text-gray-600">คะแนน</div>
                <div className="mt-1 text-3xl font-bold text-gray-900">{score}/{total}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">ความแม่นยำ</div>
                <div className="mt-1 text-3xl font-bold text-blue-600">{Math.round((score / total) * 100)}%</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">ใช้เวลา</div>
                <div className="mt-1 text-3xl font-bold text-gray-900">{fmt(timeUsedMs)}</div>
              </div>
            </div>
          </div>

          {/* Review: แสดงทีละข้อ พร้อมคำตอบที่เลือกและเฉลย */}
          <ol className="space-y-4">
            {questions.map((q, i) => {
              const picked = answers[q.id];
              const correct = q.correctKey;
              const isCorrect = picked === correct;

              const pickedChoice = q.choices.find((c) => c.key === picked);
              const correctChoice = q.choices.find((c) => c.key === correct);

              return (
                <li key={q.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">{i + 1}</span>

                    <div className="flex-1 space-y-2">
                      {q.image && (
                        <div className="mb-2">
                          <Image src={q.image} alt={q.imageAlt ?? `รูปโจทย์ข้อ ${i + 1}`} width={800} height={400} className="max-h-56 w-auto object-contain" />
                        </div>
                      )}

                      {q.text && <div className="whitespace-pre-line">{q.text}</div>}
                    </div>
                  </div>

                  <div className="ml-8 space-y-2">
                    <div className={`rounded border px-3 py-2 text-sm ${isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className="text-sm">
                        <strong>คุณเลือก:</strong> {picked ?? '-'} {pickedChoice?.label ? `- ${pickedChoice.label}` : ''}
                      </div>
                      <div className="text-sm">
                        <strong>เฉลย:</strong> {correct} {correctChoice?.label ? `- ${correctChoice.label}` : ''}
                      </div>
                    </div>

                    {((isPremium || MOCK_UNLOCK_ALL) && (q as any).explanation) && (
                      <div className="mt-2 rounded bg-blue-50 p-2 text-sm text-blue-800">
                        <div className="font-medium">เฉลย: {q.correctKey}</div>

                        {Array.isArray((q as any).explanation) ? (
                          <ul className="mt-1 list-disc pl-5 space-y-1">{(q as any).explanation.map((line: string, idx: number) => (<li key={idx}>{line}</li>))}</ul>
                        ) : (
                          <div className="mt-1 whitespace-pre-line">{(q as any).explanation}</div>
                        )}
                      </div>
                    )}

                    {!isCorrect && !(isPremium || MOCK_UNLOCK_ALL) && (
                      <div className="mt-2 text-xs text-gray-500">อัปเกรดเป็น Premium เพื่อดูการวิเคราะห์เฉลยและคำอธิบาย</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}

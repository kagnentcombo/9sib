"use client";

import { getAttemptById } from "@/lib/history";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function AttemptDetailClient({ params }: { params: { attemptId: string } }) {
  const router = useRouter();
  const attempt = getAttemptById(params.attemptId);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  if (!attempt) {
    return notFound();
  }

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  if (!attempt.questions || attempt.questions.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            ← กลับ
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{attempt.title}</h1>
          </div>
        </div>
        <div className="text-gray-600 bg-gray-100 p-4 rounded-lg">
          ข้อมูลคำถามไม่พร้อมใช้งาน (บันทึกก่อนการอัพเดต)
        </div>
      </main>
    );
  }

  const currentQuestion = attempt.questions[selectedQuestionIndex];

  return (
    <div className="flex flex-col bg-gray-50 w-full h-screen">
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-white px-4 w-full">
        <div className="w-full flex justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← กลับ
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{attempt.title}</h2>
              <div className="mt-0.5 text-xs text-gray-600">
                {new Date(attempt.createdAt).toLocaleString("th-TH")}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content - Side by side layout */}
      <div className="flex-1 flex overflow-hidden w-full">
        <div className="w-full h-full grid grid-cols-[180px,1fr,280px] gap-0 p-0 bg-gray-50">
          {/* Left sidebar - Question navigator */}
          <aside className="bg-white border-r border-gray-300 px-3 py-3 flex flex-col overflow-y-auto">
            <div className="mb-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
              ข้อสอบ
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {attempt.questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestionIndex(i)}
                  className={`h-9 w-9 rounded-md text-xs font-semibold flex items-center justify-center border transition ${
                    i === selectedQuestionIndex
                      ? "bg-blue-600 border-blue-600 text-white"
                      : attempt.answers[q.id] !== undefined
                      ? "bg-green-50 border-green-400 text-green-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title={`ไปข้อที่ ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </aside>

          {/* Main content - Question and answer */}
          <section className="bg-gray-50 flex flex-col border-r border-gray-300 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-6 w-full">
              <div className="mb-4 text-sm text-gray-600">Q: {selectedQuestionIndex + 1}</div>
              <div className="flex-1">
                {currentQuestion?.image && (
                  <div className="mb-4">
                    <Image
                      src={currentQuestion.image}
                      alt={currentQuestion.imageAlt ?? "โจทย์"}
                      width={400}
                      height={200}
                      className="max-h-52 w-auto object-contain"
                      priority
                    />
                  </div>
                )}
                {currentQuestion?.text && (
                  <div className="mb-6 text-sm leading-relaxed text-gray-900 whitespace-pre-line">
                    {currentQuestion.text}
                  </div>
                )}
                <div className="space-y-3 mt-6">
                  {currentQuestion.choices.map((c) => {
                    const selected = attempt.answers[currentQuestion.id] === c.key;
                    const correct = currentQuestion.correctKey === c.key;
                    return (
                      <div
                        key={c.key}
                        className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                          correct
                            ? "border-green-500 bg-green-50"
                            : selected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 h-7 w-7 flex items-center justify-center rounded-full border text-xs font-semibold ${
                              correct
                                ? "border-green-500 bg-green-500 text-white"
                                : selected
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-gray-400 text-gray-700"
                            }`}
                          >
                            {c.key}
                          </span>
                          <span className="text-gray-800">
                            {typeof c === "object" && "label" in c ? c.label : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Right sidebar - Summary */}
          <aside className="flex flex-col bg-white border-l border-gray-300">
            <div className="px-4 py-4 text-xs border-b border-gray-200 flex-1 overflow-y-auto">
              <div className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
                Overview
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ข้อทั้งหมด</span>
                  <span className="font-semibold text-gray-900">{attempt.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ตอบแล้ว</span>
                  <span className="font-semibold text-gray-900">{Object.keys(attempt.answers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ความแม่นยำ</span>
                  <span className="font-semibold text-gray-900">{attempt.result.summary.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ข้อถูก</span>
                  <span className="font-semibold text-green-600">{attempt.result.summary.correct}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ข้อผิด</span>
                  <span className="font-semibold text-red-600">{attempt.result.summary.wrong}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
                  <span className="text-gray-600">ใช้เวลา</span>
                  <span className="font-semibold text-gray-900">{fmt(attempt.durationMs)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

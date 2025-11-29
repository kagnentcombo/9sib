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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedModalId, setSelectedModalId] = useState<string | null>(null);
  const [timeUsedMs, setTimeUsedMs] = useState(0);
  const [startTime] = useState(Date.now());
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const current = questions[index];
  const answeredCount = Object.keys(answers).length;
  const score = useMemo(() => {
    return questions.filter((q) => answers[q.id] === q.correctKey).length;
  }, [questions, answers]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUsedMs(Date.now() - startTime);
    }, 100);
    return () => clearInterval(timer);
  }, [startTime]);

  const choose = (qId: string, key: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: key }));
  };

  const fmt = (ms: number) => {
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const doSubmit = async (skipped: boolean) => {
    setSubmitted(true);

    // Save attempt
    const attempt = buildAttemptRecord({
      setKey,
      questions,
      answers,
      timeUsedMs,
      skipped,
    });
    saveAttempt(attempt);

    // Analyze - cast to match RawQuestion shape
    const result = analyzeSet(
      questions as unknown as typeof questions & { topics: string[] }[],
      Object.entries(answers).map(([qId, key]) => ({ qId, key }))
    );
    setAnalysis(result);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setIndex(0);
    setTimeUsedMs(0);
    setSelectedModalId(null);
    setAnalysis(null);
  };

  const practiceWrongNow = () => {
    // Not used - kept for compatibility
  };

  const reviewTopic = (topic: string) => {
    window.location.href = `/practice/topic/${encodeURIComponent(topic)}`;
  };

  return (
<div className="bg-gray-50">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <header className="border-b border-gray-200 px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
              <div className="mt-1 text-sm text-gray-600">ข้อ {index + 1} จาก {total}</div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-600">ตอบแล้ว</div>
                <div className="font-semibold text-gray-900">{answeredCount}/{total}</div>
              </div>
            </div>
          </div>
        </header>

      {/* Content */}
      {!submitted ? (
        <>
          {/* Question */}
          <div className="border-b border-gray-200 px-6 py-6">
            {current?.image && (
              <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={current.image}
                  alt={current.imageAlt ?? "โจทย์"}
                  width={1600}
                  height={1200}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            )}
            {current?.text && (
              <div className="mb-6 whitespace-pre-line text-lg leading-relaxed text-gray-900">
                {current.text}
              </div>
            )}

            {/* Choices */}
            <ul className="space-y-3">
              {current.choices.map((c) => {
                const selected = answers[current.id] === c.key;
                return (
                  <li key={c.key}>
                    <button
                      onClick={() => choose(current.id, c.key)}
                      className={`w-full rounded-lg border-2 px-4 py-3 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 font-semibold ${
                            selected
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-gray-400 text-gray-600"
                          }`}
                        >
                          {c.key}
                        </span>
                        {"img" in c && c.img ? (
                          <Image
                            src={c.img}
                            alt={c.imgAlt ?? `ตัวเลือก ${c.key}`}
                            width={1200}
                            height={800}
                            className="max-h-48 w-auto object-contain"
                          />
                        ) : (
                          <span className="text-gray-700">{c.label}</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Controls */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
              >
                ← ก่อนหน้า
              </button>

              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                disabled={index === total - 1}
              >
                ถัดไป →
              </button>

              <button
                className="ml-auto rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={() => doSubmit(false)}
                disabled={answeredCount === 0}
              >
                ✓ ส่งคำตอบ
              </button>
            </div>

            {/* Question bubbles */}
            <div className="flex flex-wrap gap-2">
              {questions.map((q, i) => {
                const answered = answers[q.id] !== undefined;
                const active = i === index;
                return (
                  <button
                    key={q.id}
                    onClick={() => setIndex(i)}
                    className={`h-8 w-8 rounded-full border-2 font-semibold transition ${
                      active
                        ? "border-blue-500 bg-blue-500 text-white"
                        : answered
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    title={`ไปข้อที่ ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        // Review Mode
        <section className="px-6 py-6">
          <div className="mb-6 rounded-lg bg-gray-100 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-sm font-medium text-gray-600">คะแนน</div>
                <div className="mt-1 text-3xl font-bold text-gray-900">{score}/{total}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">ความแม่นยำ</div>
                <div className="mt-1 text-3xl font-bold text-blue-600">
                  {Math.round((score / total) * 100)}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">ใช้เวลา</div>
                <div className="mt-1 text-3xl font-bold text-gray-900">{fmt(timeUsedMs)}</div>
              </div>
            </div>
          </div>

          {/* Answer cards - compact grid */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {questions.map((q, i) => {
              const picked = answers[q.id];
              const correct = q.correctKey;
              const isCorrect = picked === correct;
              return (
                <div
                  key={q.id}
                  className={`rounded-lg border-2 p-4 transition ${
                    isCorrect
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="font-semibold">
                        {isCorrect ? "✓ ถูก" : "✗ ผิด"}
                      </span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span>
                        คุณ: <strong>{picked}</strong>
                      </span>
                      <span>
                        ถูก: <strong className="text-green-600">{correct}</strong>
                      </span>
                    </div>
                  </div>

                  {((isPremium || MOCK_UNLOCK_ALL) && (q as any).explanation) && (
                    <button
                      onClick={() => setSelectedModalId(q.id)}
                      className="w-full rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                    >
                      📖 ดูเฉลย
                    </button>
                  )}

                  {!isCorrect && !(isPremium || MOCK_UNLOCK_ALL) && (
                    <div className="text-xs text-gray-600">
                      🔒 อัปเกรดเป็น Premium เพื่อดูเฉลย
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Modal */}
          {selectedModalId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
                {(() => {
                  const q = questions.find((x) => x.id === selectedModalId);
                  if (!q) return null;
                  return (
                    <>
                      <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-gray-900">
                          เฉลยข้อที่ {questions.findIndex((x) => x.id === selectedModalId) + 1}
                        </h3>
                        <button
                          onClick={() => setSelectedModalId(null)}
                          className="rounded-full hover:bg-gray-100 p-2 text-2xl font-bold text-gray-600 hover:text-gray-900"
                        >
                          ×
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        {q.image && (
                          <div className="overflow-hidden rounded-lg border border-gray-200">
                            <Image
                              src={q.image}
                              alt="โจทย์"
                              width={600}
                              height={400}
                              className="h-auto w-full"
                            />
                          </div>
                        )}
                        {q.text && (
                          <div className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                            {q.text}
                          </div>
                        )}
                        <div className="rounded-lg bg-blue-50 border-l-4 border-blue-500 p-4">
                          <div className="font-semibold text-blue-900">
                            ✓ คำตอบที่ถูก: <span className="text-blue-600">{q.correctKey}</span>
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-50 border-l-4 border-gray-400 p-4">
                          <div className="mb-3 font-semibold text-gray-900">
                            📖 คำอธิบาย
                          </div>
                          {Array.isArray((q as any).explanation) ? (
                            <ul className="list-disc space-y-2 pl-5">
                              {(q as any).explanation.map(
                                (line: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-xs leading-relaxed"
                                  >
                                    {line}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <div className="whitespace-pre-line text-xs leading-relaxed">
                              {(q as any).explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Result Panel */}
          {analysis && (
            <ResultPanel
              title={title}
              setKey={setKey}
              result={analysis}
              onPracticeWrong={practiceWrongNow}
              onReviewTopics={reviewTopic}
            />
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              onClick={reset}
            >
              ← ทำใหม่
            </button>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}

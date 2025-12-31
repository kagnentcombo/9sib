"use client";
import { getAttemptById } from "@/lib/history";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  params: { attemptId: string };
}

export default function AttemptDetailPage({ params }: Props) {
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
  const userAnswer = attempt.answers[currentQuestion.id];
  const isCorrect = userAnswer === currentQuestion.correctKey;

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
              {attempt.questions.map((question, index) => {
                const userAnswer = attempt.answers[question.id];
                const isCorrect = userAnswer === question.correctKey;
                const isSelected = index === selectedQuestionIndex;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => setSelectedQuestionIndex(index)}
                    className={`h-10 w-10 rounded-full border-2 font-semibold transition flex items-center justify-center ${
                      isSelected
                        ? "border-blue-500 bg-blue-500 text-white"
                        : isCorrect
                        ? "border-green-500 bg-green-50 text-green-700"
                        : userAnswer
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    title={`ข้อที่ ${index + 1} - ${isCorrect ? "ถูก" : userAnswer ? "ผิด" : "ไม่ตอบ"}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center - Question content */}
          <section className="bg-gray-50 flex flex-col border-r border-gray-300 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-6 w-full">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">ข้อที่ {selectedQuestionIndex + 1} จากทั้งหมด {attempt.questions.length} ข้อ</span>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isCorrect
                        ? "bg-green-600 text-white"
                        : userAnswer
                        ? "bg-red-600 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {isCorrect ? "ถูก" : userAnswer ? "ผิด" : "ไม่ตอบ"}
                  </div>
                </div>
                
                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                    disabled={selectedQuestionIndex === 0}
                    className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← ก่อนหน้า
                  </button>
                  <button
                    onClick={() => setSelectedQuestionIndex(Math.min(attempt.questions.length - 1, selectedQuestionIndex + 1))}
                    disabled={selectedQuestionIndex === attempt.questions.length - 1}
                    className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>

              {/* Question Text */}
              {currentQuestion.text && (
                <div className="mb-6 text-sm leading-relaxed text-gray-900 whitespace-pre-line">
                  {currentQuestion.text}
                </div>
              )}

              {/* Choices */}
              <div className="space-y-3 mt-6">
                {currentQuestion.choices.map((choice) => {
                  const isUserChoice = userAnswer === choice.key;
                  const isCorrectChoice = choice.key === currentQuestion.correctKey;
                  
                  let bgColor = "bg-white";
                  let borderColor = "border-gray-300";
                  let textColor = "text-gray-800";
                  
                  if (isCorrectChoice) {
                    bgColor = "bg-green-100";
                    borderColor = "border-green-500";
                    textColor = "text-green-800";
                  } else if (isUserChoice && !isCorrectChoice) {
                    bgColor = "bg-red-100";
                    borderColor = "border-red-500";
                    textColor = "text-red-800";
                  }

                  return (
                    <div
                      key={choice.key}
                      className={`w-full rounded-lg border-2 px-4 py-3 ${bgColor} ${borderColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 h-7 w-7 flex items-center justify-center rounded-full border text-xs font-semibold ${
                            isCorrectChoice
                              ? "border-green-500 bg-green-500 text-white"
                              : isUserChoice
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-gray-400 text-gray-700"
                          }`}
                        >
                          {choice.key}
                        </span>
                        <span className={`${textColor} text-sm flex-1`}>
                          {choice.label}
                        </span>
                        {isUserChoice && (
                          <span className="text-xs font-semibold text-blue-600">
                            ตอบ
                          </span>
                        )}
                        {isCorrectChoice && (
                          <span className="text-xs font-semibold text-green-600">
                            เฉลย
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {currentQuestion.explanation && (
                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    คำอธิบาย
                  </div>
                  <div className="text-sm text-blue-700 whitespace-pre-line">
                    {Array.isArray(currentQuestion.explanation)
                      ? currentQuestion.explanation.join('\n')
                      : currentQuestion.explanation}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right panel - Summary */}
          <aside className="flex flex-col bg-white border-l border-gray-300">
            <div className="px-4 py-4 text-xs border-b border-gray-200 flex-1 overflow-y-auto">
              <div className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
                สรุปผลการทำ
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">คะแนน</span>
                  <span className="font-semibold text-gray-900">
                    {attempt.result.summary.correct}/{attempt.result.summary.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ความแม่นยำ</span>
                  <span className="font-semibold text-gray-900">
                    {attempt.result.summary.accuracy}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ข้อถูก</span>
                  <span className="font-semibold text-green-600">
                    {attempt.result.summary.correct}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ข้อผิด</span>
                  <span className="font-semibold text-red-600">
                    {attempt.result.summary.wrong}
                  </span>
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
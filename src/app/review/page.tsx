"use client";

import { useMemo, useEffect, useState } from "react";
import Quiz from "@/components/Quiz";
import { toUIQuestions } from "@/data/adapters";
import { generalAllRaw } from "@/data/subjects/general/all"; // ตัวอย่าง: ปรับให้เลือกตาม set

export default function ReviewWrongPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const search = new URLSearchParams(isClient ? window.location.search : "");
  const ids = (search.get("ids") ?? "").split(",").filter(Boolean);
  const setKey = search.get("set") ?? "general-all";

  // TODO: สลับดึง raw ของ set ตามจริง (นี่ demo = ใช้ generalAllRaw)
  const filtered = useMemo(() => generalAllRaw.filter(q => ids.includes(q.id)), [ids]);
  const ui = toUIQuestions(filtered, `${setKey}-review`);

  if (!isClient) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="text-center py-12">กำลังโหลด...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Quiz
        title={`ทวนข้อที่ผิด (${ui.length} ข้อ)`}
        questions={ui}
        setKey={`${setKey}-review-${Date.now()}`}
        isPremium={true}     // โหมดรีวิว เปิดเฉลยได้เลย
        // durationMin={20}  // ใส่ถ้าต้องการ
      />
    </main>
  );
}

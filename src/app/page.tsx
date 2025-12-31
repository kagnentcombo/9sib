import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <main className="relative h-[calc(100vh-6rem)] overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/main_video.mp4" type="video/mp4" />
          <source src="/main_video.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Original Hero Content restored, fitted to viewport */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-white">
        <div className="max-w-4xl text-center">
          <h1 className="mb-8 text-5xl md:text-7xl font-bold drop-shadow-2xl">
            เตรียมสอบนายสิบตำรวจ
          </h1>

          <Link
            href="/exam"
            className="inline-block rounded-lg bg-white px-10 py-4 text-xl font-bold text-gray-900 shadow-2xl transition-all hover:scale-105 hover:shadow-white/20"
          >
            เริ่มทำข้อสอบ →
          </Link>
        </div>

        {/* Info Footer */}
        <div className="absolute bottom-4 left-0 right-0 px-6 text-center text-sm text-white/80">
          <div className="mx-auto max-w-5xl space-y-4">
            <div>
              <p className="font-semibold text-white/90 mb-2">📚 ภาพรวมข้อสอบ</p>
              <p>ข้อสอบ 150 ข้อ ใช้เวลา 3 ชั่วโมง • แบ่งเป็น 6 วิชา: ความสามารถทั่วไป 30 ข้อ, ภาษาไทย 25 ข้อ, คอมพิวเตอร์ 25 ข้อ, ภาษาอังกฤษ 30 ข้อ, สังคมฯ 20 ข้อ, กฎหมาย 20 ข้อ</p>
            </div>
            <div>
              <p className="font-semibold text-white/90 mb-2">👮 คุณสมบัติผู้สมัคร</p>
              <p>เพศชาย อายุ 18–27 ปี • วุฒิ ม.6 / ปวช. / กศน. หรือเทียบเท่า • สูง ≥ 160 ซม., รอบอก ≥ 77 ซม., BMI ≤ 35 • สายตาปกติ, ไม่ตาบอดสี, ไม่มีรอยสักเกิน 16 ตร.ซม.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



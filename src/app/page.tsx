import Link from "next/link";

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl  space-y-8 ">
      {/* Hero */}
      <section className="bg-white rounded-xl shadow-sm pb-4 text-center pt-6">
<h1 className="text-2xl md:text-3xl font-bold text-[#800000]">
          เตรียมสอบนายสิบตำรวจสายปราบปราม
        </h1>
        <p className="mt-2 text-gray-600">
          ฝึกทำข้อสอบจริง พร้อมแนวข้อสอบครบ 6 วิชา – อัปเดตเนื้อหาล่าสุด
        </p>

        <Link
          href="/exam"
          className="mt-6 inline-block px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#660000] transition"
        >
          เริ่มทำข้อสอบ
        </Link>
      </section>

      {/* Overview */}
      <section className="bg-white rounded-xl shadow-sm px-6 py-2">
        <h2 className="text-xl font-semibold mb-4">ภาพรวมข้อสอบ</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• ข้อสอบ 150 ข้อ ใช้เวลา 3 ชั่วโมง</li>
          <li>• แบ่งเป็น 6 วิชา: ความสามารถทั่วไป 30 ข้อ, ภาษาไทย 25 ข้อ, คอมพิวเตอร์ 25 ข้อ, ภาษาอังกฤษ 30 ข้อ, สังคมฯ 20 ข้อ, กฎหมาย 20 ข้อ</li>
          <li>• ไม่มีเกณฑ์ผ่าน 60% เหมือนสายอำนวยการ (เรียงคะแนนสูงไปต่ำ)</li>
        </ul>
      </section>

      {/* Qualifications */}
      <section className="bg-white rounded-xl shadow-sm px-6 py-2">
        <h2 className="text-xl font-semibold mb-4">คุณสมบัติผู้สมัคร</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• เพศชาย อายุ 18–27 ปี</li>
          <li>• วุฒิ ม.6 / ปวช. / กศน. หรือเทียบเท่า</li>
          <li>• สูง ≥ 160 ซม., รอบอก ≥ 77 ซม., BMI ≤ 35</li>
          <li>• สายตาปกติ, ไม่ตาบอดสี, ไม่มีรอยสักเกิน 16 ตร.ซม.</li>
        </ul>
      </section>

    
    </main>
  );
}

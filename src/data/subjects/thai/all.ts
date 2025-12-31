import type { RawQuestion } from "@/data/types";

// วิชาภาษาไทย - ยังไม่มีข้อสอบ กรุณาเพิ่มข้อสอบ
export const thaiAllRaw: RawQuestion[] = [
  {
    id: "thai-placeholder-1",
    text: "วิชาภาษาไทยยังไม่มีข้อสอบ กรุณาติดต่อผู้ดูแลระบบ",
    choices: [
      { key: "A", label: "กรุณารอการอัพเดต" },
      { key: "B", label: "ข้อสอบจะเพิ่มในอนาคต" },
      { key: "C", label: "ติดต่อ Admin" },
      { key: "D", label: "Coming Soon" },
    ],
    correctKey: "A",
    explanation: "ข้อสอบวิชาภาษาไทยอยู่ในระหว่างการเตรียมการ",
  },
];

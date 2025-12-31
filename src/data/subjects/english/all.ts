import type { RawQuestion } from "@/data/types";

// วิชาภาษาอังกฤษ - ยังไม่มีข้อสอบ กรุณาเพิ่มข้อสอบ
export const englishAllRaw: RawQuestion[] = [
  {
    id: "english-placeholder-1",
    text: "English subject questions are not available yet. Please contact administrator.",
    choices: [
      { key: "A", label: "Please wait for updates" },
      { key: "B", label: "Questions will be added soon" },
      { key: "C", label: "Contact Admin" },
      { key: "D", label: "Coming Soon" },
    ],
    correctKey: "A",
    explanation: "English subject questions are being prepared.",
  },
];

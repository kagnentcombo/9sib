export type Subject = string;

export type Topic =
  | "อนุกรม"
  | "สัดส่วนร้อยละ"
  | "เวนน์/นับจำนวน"
  | "อัตราส่วน/แปรผัน"
  | "จำนวนจริง/พีชคณิต"
  | "ค่าเฉลี่ย/สถิติ"
  | "หารร่วมมาก/ตัวประกอบ"
  | "เวลา/งาน/อัตรา"
  | "อายุ/สมการคำพูด"
  | "เรขาคณิตพื้นฐาน"
  | "อื่น ๆ";

export type MasteryLevel = "อ่อนมาก" | "อ่อน" | "ปานกลาง" | "เก่ง" | "เก่งมาก";

export type RawChoiceKey = "A" | "B" | "C" | "D";
export type RawChoice = { key: RawChoiceKey; label?: string; img?: string; imgAlt?: string };

export type RawQuestion = {
  id: string;
  text?: string;
  image?: string;
  imageAlt?: string;
  topics?: string[];
  choices: RawChoice[];
  correctKey: RawChoiceKey;
  explanation?: string | string[];
};

export type SetMeta = {
  subject: Subject;
  year: number;
  id: string;
  title: string;
  summary?: string;
  img?: string;
};

export type SetEntry = { meta: { title: string; year: number }; questions: RawQuestion[] };

export type UserAnswer = { questionId: string; selectedKey: RawChoiceKey | null };

export type TopicStat = {
  topic: string; // เปลี่ยนเป็น string แทน Topic
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;    // 0..100
  level: MasteryLevel;
  errorShare: number;  // % ของ "ข้อผิดทั้งหมด" ที่มาจากหัวข้อนี้
  focusPercent: number;
};

export type AnalysisSummary = {
  total: number;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  level: MasteryLevel;
};

export type AnalysisResult = {
  summary: AnalysisSummary;
  byTopic: TopicStat[];
  wrongQuestionIds: string[];
};

// ใช้กับ “บันทึกประวัติการทำ”
export type AttemptRecord = {
  id: string;               // uuid
  setKey: string;           // เช่น "general-all"
  title: string;
  subject?: string;
  createdAt: number;
  durationMs: number;
  answers: Record<string, RawChoiceKey | undefined>;
  result: AnalysisResult;
};

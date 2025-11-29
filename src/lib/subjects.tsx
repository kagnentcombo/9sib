export type Subject = {
  name: string;
  slug: string;
  icon: string; // emoji หรือจะเปลี่ยนเป็น icon library ทีหลังก็ได้
};

export const subjects = [
  { name: "ความสามารถทั่วไป", slug: "general", icon: "🧠" },
  { name: "ภาษาไทย", slug: "thai", icon: "📝" },
  { name: "คอมพิวเตอร์", slug: "it", icon: "💻" },
  { name: "สังคม/กฎหมาย", slug: "social_law", icon: "⚖️" },
  { name: "ภาษาอังกฤษ", slug: "english", icon: "📚" },
  { name: "คณิตศาสตร์", slug: "math", icon: "🔢" },
];


// ปีสอบที่อยากให้มี (ปรับช่วงปีได้)
export function getYears(start = 2018, end = new Date().getFullYear()) {
  const arr: number[] = [];
  for (let y = end; y >= start; y--) arr.push(y);
  return arr;
}

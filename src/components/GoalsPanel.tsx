"use client";
import { useEffect, useState } from "react";

type Goal = { id: string; title: string; targetAcc: number; createdAt: number; done?: boolean };
const KEY = "9sib:goals";

export default function GoalsPanel() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [acc, setAcc] = useState(80);

  useEffect(() => { try {
    const raw = localStorage.getItem(KEY);
    setGoals(raw ? JSON.parse(raw) : []);
  } catch {} }, []);

  function save(list: Goal[]) {
    setGoals(list);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  }

  function add() {
    if (!title.trim()) return;
    save([{ id: crypto.randomUUID(), title, targetAcc: acc, createdAt: Date.now() }, ...goals]);
    setTitle("");
  }

  function toggle(id: string) {
    save(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">เป้าหมายการเรียน</h3>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input className="w-72 rounded border px-3 py-2 text-sm"
               placeholder="เช่น อังกฤษ ≥ 80% ภายในเดือนนี้"
               value={title} onChange={e => setTitle(e.target.value)} />
        <input type="number" min={1} max={100}
               className="w-24 rounded border px-3 py-2 text-sm"
               value={acc} onChange={e => setAcc(Number(e.target.value))} />
        <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700" onClick={add}>
          เพิ่มเป้าหมาย
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {goals.map(g => (
          <li key={g.id} className="flex items-center gap-2 rounded border p-2">
            <input type="checkbox" checked={!!g.done} onChange={() => toggle(g.id)} />
            <div className="flex-1">
              <div className="font-medium">{g.title}</div>
              <div className="text-xs text-gray-500">เป้าหมาย Accuracy ≥ {g.targetAcc}%</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

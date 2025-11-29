"use client";
import { getAllAttempts } from "@/lib/history";
import { computeBadges } from "@/lib/badges";

export default function BadgesPanel() {
  const badges = computeBadges(getAllAttempts());
  if (!badges.length) return null;

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">เหรียญความสำเร็จ</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {badges.map(b => (
          <div key={b.code} className="rounded-lg border px-3 py-2 text-sm">
            <div className="font-medium">{b.name}</div>
            <div className="text-xs text-gray-600">{b.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

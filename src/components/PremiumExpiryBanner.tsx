"use client";

interface PremiumExpiryBannerProps {
  expiresAt: Date;
  daysRemaining: number;
}

export default function PremiumExpiryBanner({ expiresAt, daysRemaining }: PremiumExpiryBannerProps) {
  // Only show if expiring within 7 days
  if (daysRemaining > 7) return null;

  const urgency = daysRemaining <= 1 ? "high" : daysRemaining <= 3 ? "medium" : "low";

  return (
    <div
      className={`rounded-lg p-4 ${
        urgency === "high"
          ? "bg-red-50 border border-red-200"
          : urgency === "medium"
          ? "bg-orange-50 border border-orange-200"
          : "bg-yellow-50 border border-yellow-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {urgency === "high" ? "⚠️" : urgency === "medium" ? "⏰" : "💡"}
        </span>
        <div className="flex-1">
          <h4
            className={`font-semibold mb-1 ${
              urgency === "high"
                ? "text-red-800"
                : urgency === "medium"
                ? "text-orange-800"
                : "text-yellow-800"
            }`}
          >
            {urgency === "high"
              ? "สมาชิก Premium ใกล้หมดอายุ!"
              : urgency === "medium"
              ? "สมาชิก Premium กำลังจะหมดอายุ"
              : "แจ้งเตือน: สมาชิก Premium ของคุณ"}
          </h4>
          <p
            className={`text-sm mb-2 ${
              urgency === "high"
                ? "text-red-700"
                : urgency === "medium"
                ? "text-orange-700"
                : "text-yellow-700"
            }`}
          >
            {urgency === "high" ? (
              <>
                สมาชิก Premium จะหมดอายุใน{" "}
                <span className="font-bold">{daysRemaining} วัน</span>
                {daysRemaining === 0 && " (วันนี้)"}
              </>
            ) : (
              <>
                จะหมดอายุในอีก{" "}
                <span className="font-semibold">{daysRemaining} วัน</span> (
                {expiresAt.toLocaleDateString("th-TH", {
                  month: "short",
                  day: "numeric",
                })})
              </>
            )}
          </p>
          <a
            href="/premium"
            className={`inline-block px-4 py-2 rounded-lg font-medium transition-colors ${
              urgency === "high"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : urgency === "medium"
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            ต่ออายุเลย
          </a>
        </div>
      </div>
    </div>
  );
}

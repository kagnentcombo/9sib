"use client";

import { ReactNode } from "react";

interface PremiumProtectedFeatureProps {
  isPremium: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

export default function PremiumProtectedFeature({
  isPremium,
  children,
  fallback,
  featureName = "ฟีเจอร์นี้",
}: PremiumProtectedFeatureProps) {
  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-40">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center p-6 max-w-md">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {featureName}สำหรับสมาชิก Premium
          </h3>
          <p className="text-gray-600 mb-4">
            อัพเกรดเป็นสมาชิก Premium เพื่อใช้งานฟีเจอร์นี้ได้เต็มรูปแบบ
          </p>
          <a
            href="/premium"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            อัพเกรดเลย
          </a>
        </div>
      </div>
    </div>
  );
}

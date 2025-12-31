"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PricingPlan {
  id: string;
  name: string;
  months: number;
  price: number;
  features: string[];
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "รายเดือน",
    months: 1,
    price: 99,
    features: [
      "ทำข้อสอบได้ไม่จำกัด",
      "ดูเฉลยข้อสอบทันที",
      "ติดตามผลคะแนน",
      "เข้าถึงข้อสอบทุกวิชา",
    ],
  },
  {
    id: "quarterly",
    name: "3 เดือน",
    months: 3,
    price: 249,
    popular: true,
    features: [
      "ทำข้อสอบได้ไม่จำกัด",
      "ดูเฉลยข้อสอบทันที",
      "ติดตามผลคะแนน",
      "เข้าถึงข้อสอบทุกวิชา",
  
    ],
  },
  {
    id: "yearly",
    name: "1 ปี",
    months: 12,
    price: 799,
    features: [
      "ทำข้อสอบได้ไม่จำกัด",
      "ดูเฉลยข้อสอบทันที",
      "ติดตามผลคะแนน",
      "เข้าถึงข้อสอบทุกวิชา",
      "รับประกันอัปเดตข้อสอบใหม่",
    ],
  },
];

export default function PremiumPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError(null);

    try {
      // Load Omise.js script if not already loaded
      if (!(window as any).Omise) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.omise.co/omise.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Omise.js"));
          document.body.appendChild(script);
        });
      }

      const OmiseCard = (window as unknown as { OmiseCard: any }).OmiseCard;
      OmiseCard.configure({
        publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
        amount: selectedPlan.price * 100,
        currency: "THB",
        defaultPaymentMethod: "credit_card",
        frameLabel: "9Sib Premium",
        submitLabel: `ชำระเงิน ฿${selectedPlan.price}`,
      });

      // Open Omise payment form
      OmiseCard.open({
        onCreateTokenSuccess: async (token: string) => {
          console.log("Token created:", token);

          // Send token to backend
          const res = await fetch("/api/checkout/premium", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              amount: selectedPlan.price,
              months: selectedPlan.months,
              description: `9Sib Premium - ${selectedPlan.name}`,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Payment failed");
          }

          // Success! Redirect to profile or show success message
          alert(`✅ ชำระเงินสำเร็จ! คุณได้เป็นสมาชิก Premium แล้ว`);
          router.push("/profile");
        },
        onFormClosed: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            อัพเกรดเป็นสมาชิก Premium
          </h1>
          <p className="text-lg text-gray-600">
            ปลดล็อกฟีเจอร์เต็มรูปแบบ ทำข้อสอบได้ไม่จำกัด พร้อมดูเฉลยทันที
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-8 transition-all ${
                selectedPlan?.id === plan.id
                  ? "border-blue-600 shadow-xl scale-105"
                  : plan.popular
                  ? "border-blue-400"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    ✨ ยอดนิยม
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-blue-600">
                    ฿{plan.price}
                  </span>
                  <span className="text-gray-500">/ {plan.months} เดือน</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  selectedPlan?.id === plan.id
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                {selectedPlan?.id === plan.id ? "✓ เลือกแพลนนี้" : "เลือกแพลน"}
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Button */}
        {selectedPlan && (
          <div className="text-center">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังประมวลผล...
                </>
              ) : (
                <>🔒 ชำระเงินอย่างปลอดภัย</>
              )}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              ชำระผ่าน Omise ระบบชำระเงินที่ปลอดภัย รองรับบัตรเครดิต/เดบิต
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            ทำไมต้อง Premium?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-semibold text-lg mb-2">ข้อสอบครบทุกวิชา</h3>
              <p className="text-gray-600">
                เข้าถึงคลังข้อสอบครบทุกวิชา อัปเดตใหม่ทุกสัปดาห์
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="font-semibold text-lg mb-2">เฉลยละเอียด</h3>
              <p className="text-gray-600">
                ดูเฉลยพร้อมคำอธิบายทันทีหลังทำข้อสอบเสร็จ
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-semibold text-lg mb-2">วิเคราะห์ผลคะแนน</h3>
              <p className="text-gray-600">
                ติดตามความก้าวหน้าและจุดที่ต้องปรับปรุง
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
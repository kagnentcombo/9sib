// src/app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PremiumExpiryBanner from "@/components/PremiumExpiryBanner";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // Fetch user data with Premium status and payment history
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isPremiumActive = user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > new Date();
  const daysRemaining = user.premiumExpiresAt
    ? Math.ceil((user.premiumExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900">โปรไฟล์</h1>

        {/* Expiry Warning Banner */}
        {isPremiumActive && user.premiumExpiresAt && (
          <PremiumExpiryBanner 
            expiresAt={user.premiumExpiresAt} 
            daysRemaining={daysRemaining} 
          />
        )}

        {/* User Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || "User avatar"}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Premium Status Card */}
        <div className={`rounded-2xl border-2 p-6 ${
          isPremiumActive
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
            : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              สถานะสมาชิก
            </h3>
            {isPremiumActive && (
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                ⭐ Premium
              </span>
            )}
          </div>

          {isPremiumActive ? (
            <div className="space-y-2">
              <p className="text-gray-700">
                คุณเป็นสมาชิก Premium ใช้งานได้ถึง{" "}
                <span className="font-semibold">
                  {user.premiumExpiresAt?.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                เหลือเวลาอีก <span className="font-semibold">{daysRemaining} วัน</span>
              </p>
              {daysRemaining < 7 && (
                <div className="mt-4">
                  <Link
                    href="/premium"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ต่ออายุสมาชิก
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-700">
                คุณยังไม่ได้เป็นสมาชิก Premium
              </p>
              <p className="text-sm text-gray-600">
                อัพเกรดเพื่อปลดล็อกฟีเจอร์เต็มรูปแบบ ทำข้อสอบได้ไม่จำกัด พร้อมดูเฉลยทันที
              </p>
              <Link
                href="/premium"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                อัพเกรดเป็น Premium
              </Link>
            </div>
          )}
        </div>

        {/* Payment History */}
        {user.payments.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ประวัติการชำระเงิน
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                      วันที่
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                      รายการ
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                      จำนวนเงิน
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-900">
                        {payment.description || "9Sib Premium"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-right font-semibold">
                        ฿{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            payment.status === "successful"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment.status === "successful"
                            ? "สำเร็จ"
                            : payment.status === "failed"
                            ? "ล้มเหลว"
                            : payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ข้อมูลบัญชี
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">วันที่สมัครสมาชิก</span>
              <span className="font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">อัปเดตล่าสุด</span>
              <span className="font-medium text-gray-900">
                {new Date(user.updatedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession(); // loading | authenticated | unauthenticated
  const user = session?.user;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">

          {/* โลโก้ */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              9S
            </div>
            <Link href="/" className="text-lg font-semibold text-gray-900">9Sib</Link>
          </div>

          {/* เมนูหลัก */}
          <ul className="hidden items-center gap-8 md:flex">
            <li><Link href="/" className="text-sm text-gray-700 hover:text-gray-900">🏠 หน้าแรก</Link></li>
            <li><Link href="/exam" className="text-sm text-gray-700 hover:text-gray-900">📚 ข้อสอบ</Link></li>
            <li><Link href="/history" className="text-sm text-gray-700 hover:text-gray-900">📜 ประวัติ</Link></li>
            <li><Link href="/premium" className="text-sm text-gray-700 hover:text-gray-900">⭐ Premium</Link></li>

            {/* ถ้ายังโหลดสถานะอยู่ */}
            {status === "loading" && (
              <li className="text-gray-500">กำลังตรวจสอบ…</li>
            )}

            {/* ถ้ายังไม่ล็อกอิน → ปุ่ม Login */}
            {status === "unauthenticated" && (
              <li>
                <button
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="rounded-lg bg-[#800000] px-3 py-1.5 text-white hover:bg-[#660000]"
                >
                  🔑 Login
                </button>
              </li>
            )}

            {/* ถ้าล็อกอินแล้ว → โชว์อวาตาร์/ชื่อ และปุ่ม Logout */}
            {status === "authenticated" && (
              <>
                <li>
                  <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                    {/* อวาตาร์ */}
                    {user?.image ? (
                      <Image src={user.image} alt="" width={28} height={28} className="rounded-full" />
                    ) : (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">👤</span>
                    )}
                    <span className="max-w-[140px] truncate">{user?.name ?? "โปรไฟล์"}</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                  >
                    ออกจากระบบ
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

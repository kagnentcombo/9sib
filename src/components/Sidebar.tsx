"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

type Props = object;

export default function Sidebar({}: Props) {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <aside className="w-64 shrink-0">

      {/* LOGO */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="Logo">
          <Image src="/logo.png" alt="9sib Logo" width={84} height={84} />
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">9Sib</div>
          <div className="text-xs text-gray-500">ข้อสอบนายสิบ</div>
        </div>
      </div>

      {/* MENU */}
      <nav className="px-4">
        <ul className="space-y-1">

          <li>
            <Link href="/" className="block rounded-lg px-3 py-2 text-lg text-gray-700 hover:bg-gray-50">
              🏠 หน้าแรก
            </Link>
          </li>

          <li>
            <Link href="/exam" className="block rounded-lg px-3 py-2 text-lg text-gray-700 hover:bg-gray-50">
              📚 ข้อสอบ
            </Link>
          </li>

          <li>
            <Link href="/history" className="block rounded-lg px-3 py-2 text-lg text-gray-700 hover:bg-gray-50">
              📜 ประวัติ
            </Link>
          </li>

          <li>
            <Link href="/premium" className="block rounded-lg px-3 py-2 text-lg text-gray-700 hover:bg-gray-50">
              ⭐ Premium
            </Link>
          </li>

          {/* LOGIN / USER SECTION — อยู่ตรงนี้ */}
          <li className="pt-3 border-t border-gray-100 mt-3">

            {status === "loading" && (
              <div className="text-sm text-gray-500 px-3 py-2">กำลังโหลด…</div>
            )}

            {status === "unauthenticated" && (
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full rounded-full bg-[#800000] px-3 py-2 text-lg font-medium text-white hover:bg-[#660000]"
              >
                Login
              </button>
            )}

            {status === "authenticated" && user && (
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="flex items-center gap-2">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name ?? "user"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                      {(user.name || "U").charAt(0)}
                    </div>
                  )}
                  <div className="text-sm text-gray-800">{user.name}</div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md border border-gray-200 bg-white px-3 py-1 text-lg text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}

          </li>
        </ul>
      </nav>

    </aside>
  );
}

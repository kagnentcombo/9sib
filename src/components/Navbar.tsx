"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const pathname = usePathname();
  const isHome = pathname === "/";

  const baseClasses = "fixed top-0 left-0 right-0 z-50";
  const bgClasses = isHome ? "bg-transparent" : "bg-[#800000]";
  const borderClasses = isHome ? "" : "shadow-sm";

  const textColor = isHome ? "text-white" : "text-white";

  return (
    <nav className={`${baseClasses} ${bgClasses} ${borderClasses}`}>
      <div className="mx-auto flex h-20 items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="9Sib Logo" width={62} height={62} className="rounded-lg shadow-lg" />
        </Link>
        <ul className="flex items-center gap-1">
          <li>
            <Link href="/" className={`${textColor} px-5 py-2.5 text-sm font-medium hover:opacity-80 rounded-lg transition`}>
              หน้าแรก
            </Link>
          </li>
          <li>
            <Link href="/exam" className={`${textColor} px-5 py-2.5 text-sm font-medium hover:opacity-80 rounded-lg transition`}>
              ข้อสอบ
            </Link>
          </li>
          <li>
            <Link href="/history" className={`${textColor} px-5 py-2.5 text-sm font-medium hover:opacity-80 rounded-lg transition`}>
              ประวัติ
            </Link>
          </li>
          <li>
            <Link href="/premium" className={`${textColor} px-5 py-2.5 text-sm font-medium hover:opacity-80 rounded-lg transition`}>
              Premium
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <span className="text-xs text-white/50">...</span>
          )}
          {status === "unauthenticated" && (
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 hover:bg-white/90 transition shadow-lg"
            >
              Login
            </button>
          )}
          {status === "authenticated" && (
            <>
              <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 transition">
                {user?.image ? (
                  <Image src={user.image} alt="" width={32} height={32} className="rounded-full border-2 border-white/30" />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                )}
                <span className="hidden sm:inline text-sm font-medium text-white">{user?.name}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}




"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}  // 👈 กลับหน้า /
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </main>
  );
}

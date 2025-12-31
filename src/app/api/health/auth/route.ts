import { NextResponse } from "next/server";

export async function GET() {
  const env = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    NEXTAUTH_SECRET_PRESENT: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID_PRESENT: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET_PRESENT: !!process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/google`,
  };

  return NextResponse.json({ ok: true, env });
}

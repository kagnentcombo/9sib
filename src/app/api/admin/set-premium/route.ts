import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * ✅ Admin API: ตั้ง isPremium = true สำหรับ email ที่ระบุ
 * 
 * POST /api/admin/set-premium
 * Body: { email: "user@example.com", isPremium: true }
 * 
 * ⚠️ ในการใช้จริง ควรเพิ่ม authentication token เพื่อยืนยันตัวตนอย่างแท้จริง
 */
export async function POST(request: NextRequest) {
  try {
    const { email, isPremium } = await request.json();

    if (!email || typeof isPremium !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid email/isPremium" },
        { status: 400 }
      );
    }

    // ✅ ค้นหา user โดย email
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // ถ้า user ยังไม่มี ให้สร้างใหม่
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          isPremium,
        },
      });
      return NextResponse.json(
        { message: "User created", user, isPremium },
        { status: 201 }
      );
    }

    // ✅ อัปเดต isPremium
    user = await prisma.user.update({
      where: { email },
      data: { isPremium },
    });

    return NextResponse.json(
      { message: "User updated", user, isPremium },
      { status: 200 }
    );
  } catch (error) {
    console.error("set-premium error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, status } = await req.json();

    await prisma.payment.update({
      where: { 
        id: paymentId,
        userId: session.user.id, // ตรวจสอบว่าเป็น payment ของ user นี้
      },
      data: { status },
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("Payment status update error:", error);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
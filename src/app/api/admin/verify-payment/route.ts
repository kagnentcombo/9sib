import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Admin route สำหรับอนุมัติ manual payments
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // ตรวจสอบสิทธิ์ admin (เพิ่ม admin field ใน User model หรือใช้ email check)
    if (!session?.user?.email?.includes("admin")) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { paymentId, action, notes } = await req.json();

    if (action === "approve") {
      // อนุมัติการชำระเงิน
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "completed" },
        include: { user: true },
      });

      // Update user premium status
      const premiumExpiry = new Date();
      premiumExpiry.setFullYear(premiumExpiry.getFullYear() + 1);

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumExpiresAt: premiumExpiry,
        },
      });

      return Response.json({ 
        success: true, 
        message: "Payment approved and user upgraded to premium",
        payment: payment 
      });

    } else if (action === "reject") {
      // ปฏิเสธการชำระเงิน
      await prisma.payment.update({
        where: { id: paymentId },
        data: { 
          status: "failed",
          description: `Rejected: ${notes || "Manual review"}` 
        },
      });

      return Response.json({ 
        success: true, 
        message: "Payment rejected" 
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Admin payment verification error:", error);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}

// GET: ดู pending payments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email?.includes("admin")) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const pendingPayments = await prisma.payment.findMany({
      where: { status: "pending_verification" },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ payments: pendingPayments });

  } catch (error) {
    console.error("Failed to fetch pending payments:", error);
    return Response.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
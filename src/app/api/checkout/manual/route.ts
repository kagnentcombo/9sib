import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePaymentReference } from "@/lib/promptpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, paymentMethod } = await req.json();

    if (paymentMethod === "promptpay") {
      // สร้าง Payment record สำหรับ PromptPay
      const reference = generatePaymentReference(session.user.id);
      
      const payment = await prisma.payment.create({
        data: {
          userId: session.user.id,
          omiseChargeId: `promptpay_${reference}`, // ใช้ field เดิม
          amount: amount,
          currency: "thb", 
          status: "pending_verification", // รอการตรวจสอบ
          description: `Premium subscription via PromptPay - Ref: ${reference}`,
        },
      });

      return Response.json({
        success: true,
        paymentMethod: "promptpay",
        reference: reference,
        amount: amount,
        instructions: {
          step1: "สแกน QR Code หรือโอนเงินผ่าน PromptPay",
          step2: `โอนเงิน ${amount} บาท`,
          step3: `ระบุเลขอ้างอิง: ${reference}`,
          step4: "รอการอนุมัติ 1-24 ชั่วโมง",
          promptPayNumber: "0123456789", // เปลี่ยนเป็นหมายเลขจริง
        },
        paymentId: payment.id,
      });
    }

    // สำหรับ payment methods อื่นๆ ในอนาคต
    return Response.json({ error: "Payment method not supported" }, { status: 400 });

  } catch (error) {
    console.error("Payment error:", error);
    return Response.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
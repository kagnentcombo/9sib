import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Verify Omise webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.OMISE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("OMISE_WEBHOOK_SECRET is not set");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get("omise-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Omise signature" },
        { status: 401 }
      );
    }

    // 2. Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 3. Parse webhook event
    const event = JSON.parse(body);
    console.log("Received Omise webhook event:", event.key);

    // 4. Handle different event types
    switch (event.key) {
      case "charge.complete": {
        const charge = event.data;

        // Find payment record
        const payment = await prisma.payment.findUnique({
          where: { omiseChargeId: charge.id },
        });

        if (!payment) {
          console.error(`Payment not found for charge: ${charge.id}`);
          return NextResponse.json(
            { error: "Payment not found" },
            { status: 404 }
          );
        }

        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: charge.status },
        });

        // If charge is successful, activate Premium
        if (charge.status === "successful") {
          const months = parseInt(charge.metadata?.premiumMonths) || 1;
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + months);

          await prisma.user.update({
            where: { id: payment.userId },
            data: {
              isPremium: true,
              premiumExpiresAt: expiryDate,
              omiseCustomerId: charge.customer || undefined,
            },
          });

          console.log(
            `✅ Premium activated for user ${payment.userId} until ${expiryDate.toISOString()}`
          );
        }
        break;
      }

      case "charge.failed": {
        const charge = event.data;

        // Find and update payment record
        const payment = await prisma.payment.findUnique({
          where: { omiseChargeId: charge.id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
          });

          console.log(`❌ Payment failed for charge: ${charge.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.key}`);
    }

    // 5. Return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

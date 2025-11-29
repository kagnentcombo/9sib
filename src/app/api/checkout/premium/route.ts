import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Omise from "omise";

// Initialize Omise with secret key
const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { token, amount, months, description } = body;

    // Validate required fields
    if (!token || !amount || !months) {
      return NextResponse.json(
        { error: "Missing required fields: token, amount, months" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Create Omise charge
    const charge = await omise.charges.create({
      amount: amount * 100, // Convert to satang (Thai cents)
      currency: "thb",
      card: token,
      description: description || `9Sib Premium - ${months} months`,
      metadata: {
        userId: user.id,
        email: user.email,
        premiumMonths: months,
      },
    });

    // 4. Create Payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        omiseChargeId: charge.id,
        amount: amount,
        currency: "thb",
        status: charge.status,
        description: description || `Premium subscription - ${months} months`,
      },
    });

    // 5. If charge is successful, update user's Premium status immediately
    if (charge.status === "successful") {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPremium: true,
          premiumExpiresAt: expiryDate,
          omiseCustomerId: (typeof charge.customer === "string" ? charge.customer : null) || user.omiseCustomerId,
        },
      });
    }

    // 6. Return success response
    return NextResponse.json({
      success: true,
      chargeId: charge.id,
      status: charge.status,
      amount: charge.amount / 100,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Omise checkout error:", error);

    return NextResponse.json(
      {
        error: "Payment processing failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

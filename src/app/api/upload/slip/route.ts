import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('slip') as File;
    const paymentId = formData.get('paymentId') as string;
    const reference = formData.get('reference') as string;

    if (!file || !paymentId) {
      return Response.json({ error: "Missing file or payment ID" }, { status: 400 });
    }

    // ตรวจสอบ file type และขนาด
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: "Only image files allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // สร้าง directory สำหรับเก็บสลิป
    const uploadsDir = join(process.cwd(), 'uploads', 'slips');
    await mkdir(uploadsDir, { recursive: true });

    // สร้างชื่อไฟล์ unique
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `slip_${reference}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // บันทึกไฟล์
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // อัปเดต payment record ใน database
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "slip_uploaded",
        description: `Payment slip uploaded: ${filename}. Reference: ${reference}`,
      },
    });

    return Response.json({ 
      success: true, 
      message: "Slip uploaded successfully",
      filename: filename 
    });

  } catch (error) {
    console.error("Slip upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
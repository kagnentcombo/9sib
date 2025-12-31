// PromptPay QR Code Generator
// ทดแทน Omise สำหรับการชำระเงินแบบ Manual

import { createHash } from 'crypto';

interface PromptPayQRData {
  phoneNumber?: string;
  nationalId?: string;
  amount: number;
  ref1?: string; // Reference 1 (เลขอ้างอิง)
  ref2?: string; // Reference 2
}

export function generatePromptPayQR(data: PromptPayQRData): string {
  const { phoneNumber, nationalId, amount, ref1, ref2 } = data;
  
  // Basic PromptPay QR generation (simplified)
  // ในการใช้งานจริงควรใช้ library เช่น promptpay-qr
  const payload = {
    version: "01",
    initMethod: "11", 
    merchant: phoneNumber || nationalId,
    amount: amount.toFixed(2),
    currency: "764", // THB
    reference: ref1 || "",
    checksum: ""
  };

  // สร้าง QR string (simplified - ใช้ library จริงในการ implement)
  return `https://qr-api.com/generate?data=${encodeURIComponent(JSON.stringify(payload))}`;
}

export function generatePaymentReference(userId: string): string {
  // สร้างเลขอ้างอิงสำหรับตรวจสอบการโอนเงิน
  const timestamp = Date.now().toString();
  const hash = createHash('sha256').update(userId + timestamp).digest('hex').substring(0, 8);
  return `EX${hash.toUpperCase()}`;
}

// Manual payment verification workflow
export interface ManualPaymentData {
  userId: string;
  amount: number;
  reference: string;
  transferDate?: Date;
  transferTime?: string;
  bankAccount?: string;
  verified: boolean;
}
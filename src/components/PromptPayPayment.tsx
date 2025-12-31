"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PaymentData {
  paymentId: string;
  reference: string;
  amount: number;
  promptPayNumber: string;
}

interface PromptPayPageProps {
  paymentData: PaymentData;
}

export default function PromptPayPaymentPage({ paymentData }: PromptPayPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const router = useRouter();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadSlip = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('slip', selectedFile);
    formData.append('paymentId', paymentData.paymentId);
    formData.append('reference', paymentData.reference);

    try {
      const response = await fetch('/api/upload/slip', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploaded(true);
        // อัปเดต payment status เป็น "slip_uploaded"
        await fetch('/api/payment/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: paymentData.paymentId,
            status: 'slip_uploaded'
          }),
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('อัปโหลดสลิปล้มเหลว กรุณาลองใหม่');
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">อัปโหลดสลิปสำเร็จ!</h2>
          <p className="mb-4 text-gray-600">
            ระบบได้รับสลิปการโอนเงินแล้ว<br/>
            การอนุมัติจะใช้เวลา 1-24 ชั่วโมง
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            ดูสถานะการชำระเงิน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* QR Code Section */}
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-center">สแกน QR Code เพื่อโอนเงิน</h2>
        
        <div className="text-center space-y-4">
          {/* QR Code Placeholder */}
          <div className="mx-auto h-64 w-64 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <div className="text-sm text-gray-600">
                QR Code สำหรับโอนเงิน<br/>
                จำนวน {paymentData.amount} บาท
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div><strong>หมายเลข PromptPay:</strong> {paymentData.promptPayNumber}</div>
            <div><strong>จำนวนเงิน:</strong> {paymentData.amount} บาท</div>
            <div><strong>เลขอ้างอิง:</strong> <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{paymentData.reference}</span></div>
          </div>
        </div>
      </div>

      {/* Upload Slip Section */}
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">อัปโหลดสลิปการโอนเงิน</h3>
        
        {!previewUrl ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="slip-upload"
            />
            <label htmlFor="slip-upload" className="cursor-pointer block text-center">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm text-gray-600">
                คลิกเพื่อเลือกรูปสลิป<br/>
                (JPG, PNG ขนาดไม่เกิน 5MB)
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Image 
                src={previewUrl} 
                alt="Preview slip" 
                width={400} 
                height={300} 
                className="mx-auto rounded-lg border object-contain max-h-64"
              />
              <button
                onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-sm"
              >
                ✕
              </button>
            </div>
            
            <button
              onClick={handleUploadSlip}
              disabled={uploading}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {uploading ? "กำลังอัปโหลด..." : "ส่งสลิปเพื่อตรวจสอบ"}
            </button>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>📌 ขั้นตอนการชำระเงิน:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>สแกน QR Code หรือโอนผ่าน PromptPay</li>
            <li>ถ่ายรูปสลิปการโอนเงิน</li>
            <li>อัปโหลดสลิปผ่านหน้านี้</li>
            <li>รอการอนุมัติ 1-24 ชั่วโมง</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
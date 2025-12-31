"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface PendingPayment {
  id: string;
  userId: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบสิทธิ์ admin (ใช้ email check แบบง่าย)
  const isAdmin = session?.user?.email?.includes("admin") || 
                  session?.user?.email === "your-admin@email.com";

  useEffect(() => {
    if (isAdmin) {
      fetchPendingPayments();
    }
  }, [isAdmin]);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch("/api/admin/verify-payment");
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: "approve" | "reject", notes?: string) => {
    try {
      const response = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action, notes }),
      });

      if (response.ok) {
        alert(`Payment ${action}d successfully`);
        fetchPendingPayments(); // Refresh list
      } else {
        alert(`Failed to ${action} payment`);
      }
    } catch (error) {
      console.error(`Payment ${action} error:`, error);
      alert(`Error: ${error}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>Admin privileges required</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pt-24">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard - Payment Verification</h1>

      {payments.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-gray-600">ไม่มีการชำระเงินที่รอการอนุมัติ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Payment Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Details</h3>
                  <p><strong>Amount:</strong> {payment.amount} THB</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      payment.status === 'slip_uploaded' ? 'bg-yellow-100 text-yellow-800' : 
                      payment.status === 'pending_verification' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                  </p>
                  <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString('th-TH')}</p>
                  <p><strong>User:</strong> {payment.user.name} ({payment.user.email})</p>
                  <p className="text-sm text-gray-600"><strong>Description:</strong> {payment.description}</p>
                </div>

                {/* Slip Preview */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Payment Slip</h4>
                  {payment.status === 'slip_uploaded' ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">Slip uploaded successfully</p>
                      <div className="text-xs text-gray-500">
                        View slip in: /uploads/slips/
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">No slip uploaded yet</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handlePaymentAction(payment.id, "approve")}
                      className="w-full rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                    >
                      ✅ Approve Payment
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt("Reason for rejection (optional):");
                        handlePaymentAction(payment.id, "reject", notes || "Manual review");
                      }}
                      className="w-full rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    >
                      ❌ Reject Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
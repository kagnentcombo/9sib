// 2C2P Payment Integration
// ทดแทน Omise ด้วย 2C2P

import axios from 'axios';
import crypto from 'crypto';

interface Payment2C2PConfig {
  merchantID: string;
  secretKey: string;
  apiUrl: string; // sandbox หรือ production
}

export class Payment2C2P {
  private config: Payment2C2PConfig;

  constructor(config: Payment2C2PConfig) {
    this.config = config;
  }

  // สร้าง payment token
  async createPayment(data: {
    amount: number;
    currency: string;
    description: string;
    orderID: string;
    returnURL: string;
  }) {
    const payload = {
      version: "9.9",
      merchantID: this.config.merchantID,
      invoiceNo: data.orderID,
      description: data.description,
      amount: (data.amount * 100).toString(), // convert to cents
      currencyCode: data.currency === 'thb' ? '764' : '840',
      returnURL: data.returnURL,
      postBackURL: `${process.env.NEXTAUTH_URL}/api/webhooks/2c2p`,
    };

    // สร้าง hash signature
    const hashData = Object.values(payload).join('');
    const signature = crypto
      .createHash('sha1')
      .update(hashData + this.config.secretKey)
      .digest('hex');

    try {
      const response = await axios.post(`${this.config.apiUrl}/payment/4.1/paymentToken`, {
        ...payload,
        hashValue: signature,
      });

      return response.data;
    } catch (error) {
      throw new Error(`2C2P payment creation failed: ${error}`);
    }
  }

  // ตรวจสอบ payment status
  async inquiryPayment(paymentToken: string) {
    const payload = {
      version: "2.3",
      merchantID: this.config.merchantID,
      paymentToken: paymentToken,
    };

    const hashData = Object.values(payload).join('');
    const signature = crypto
      .createHash('sha1')
      .update(hashData + this.config.secretKey)
      .digest('hex');

    try {
      const response = await axios.post(`${this.config.apiUrl}/payment/4.1/inquiry`, {
        ...payload,
        hashValue: signature,
      });

      return response.data;
    } catch (error) {
      throw new Error(`2C2P inquiry failed: ${error}`);
    }
  }
}

// Instance สำหรับใช้งาน
export const payment2C2P = new Payment2C2P({
  merchantID: process.env.C2P_MERCHANT_ID!,
  secretKey: process.env.C2P_SECRET_KEY!,
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://t.2c2p.com' 
    : 'https://demo2.2c2p.com'
});
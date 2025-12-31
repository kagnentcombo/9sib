import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";

const sarabun = Sarabun({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "9Sib - เตรียมสอบนายสิบตำรวจ",
  description: "ฝึกทำข้อสอบนายสิบตำรวจสายปราบปราม",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${sarabun.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          <Navbar />
          <div className="pt-24">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

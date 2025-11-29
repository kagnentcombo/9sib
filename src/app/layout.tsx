import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "9Sib",
  description: "เตรียมสอบนายสิบตำรวจ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <div className="mx-auto max-w-7xl px-4">
                  <main className="rounded-2xl bg-white shadow-sm">{children}</main>
                </div>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comp Code — Company-Wise LeetCode Preparation Dashboard",
  description:
    "Interactive, high-performance company-wise LeetCode preparation dashboard with local frequency metrics, mock interview timer, and cross-company overlap radar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

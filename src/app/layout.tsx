import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientNav from '@/components/ClientNav'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Manga Reader",
  description: "A modern manga reading experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <ClientNav />
        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

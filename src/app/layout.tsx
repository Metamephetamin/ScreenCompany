import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootShell } from "@/components/app/root-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Контрагент Риск",
  description: "Проверка ООО/ИП по ИНН/ОГРН перед сделкой",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}

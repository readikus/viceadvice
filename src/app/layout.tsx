import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Vice Advice",
  description: "Talk to Kenny Valentine. Judge the advice, not the suit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-current/10">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <h1 className="text-lg font-bold tracking-tight">Vice Advice</h1>
            <span className="text-xs opacity-60">Judge the advice, not the suit.</span>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}

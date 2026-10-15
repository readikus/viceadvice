import type { Metadata } from "next";
import { Geist, Oswald, Yellowtail } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Chunky condensed sans for labels, buttons and headlines.
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "700"],
});

// Brush script for the VICE ADVICE wordmark.
const yellowtail = Yellowtail({
  variable: "--font-yellowtail",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Vice Advice",
  description: "Talk to Kenny Valentine. Judge the advice, not the suit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${oswald.variable} ${yellowtail.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <main className="flex w-full flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}

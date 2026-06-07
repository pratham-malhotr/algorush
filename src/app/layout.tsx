import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "./providers";

import { PageTransition } from "@/components/layout/PageTransition";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoRush | No-Code Algorithmic Trading",
  description: "Build, backtest, and deploy algorithmic trading strategies without writing a single line of code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text-primary relative">
        <NoiseOverlay />
        <Providers>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
      </body>
    </html>
  );
}

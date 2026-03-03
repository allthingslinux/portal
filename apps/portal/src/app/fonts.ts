import { Geist, Geist_Mono, Inter } from "next/font/google";

// Inter - Primary sans-serif font
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Geist - Alternative sans-serif font
export const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// Geist Mono - Monospace font
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

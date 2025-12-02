import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';

export const BaseNeue = localFont({
  src: './font/BaseNeueTrial-CondSemBdObliq.woff2'
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

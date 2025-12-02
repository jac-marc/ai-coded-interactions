import "./globals.css";
import Navbar from "./navigation";
import { BaseNeue, geistSans, geistMono } from "./fonts";

// Viewport settings (must be separate from metadata in Next.js 14+)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

// Metadata settings (SEO & PWA)
export const metadata = {
  title: "3D Lens Effect",
  description: "Interactive 3D Glass Distortion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "3D Lens",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${BaseNeue.className} antialiased bg-black text-white`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}

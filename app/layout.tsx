import type { Metadata } from "next";
import { Grenze, Nova_Square } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";



const novaSquare = Nova_Square({
  variable: "--font-nova-square",
  subsets: ["latin"],
  weight: "400",});

const grenze = Grenze({
  variable: "--font-grenze",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    template: "%s | INSPRANO 2025",
    default: "INSPRANO 2025 - Registration Portal"
  },
  description: "Official registration portal for INSPRANO 2025, Government College of Engineering Kalahandi",
  icons: {
    icon: [
      { url: "/assets/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo.png", sizes: "16x16", type: "image/png" }
    ],
    apple: "/assets/logo.png",
    shortcut: "/assets/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={` ${novaSquare.variable} ${grenze.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

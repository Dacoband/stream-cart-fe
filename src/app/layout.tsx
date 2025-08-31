import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stream Cart",
  description: "Web mua sắm live stream",
  icons: {
    icon: [
      { url: "/logow.png", sizes: "32x32", type: "image/png" },
      { url: "/logow.png", sizes: "192x192", type: "image/png" },
      { url: "/logow.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logow.png" }],
    shortcut: ["/logow.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // suppressHydrationWarning={true}
      >
        <AuthProvider>
          <CartProvider>{children} </CartProvider>
        </AuthProvider>

        <Toaster />
      </body>
    </html>
  );
}

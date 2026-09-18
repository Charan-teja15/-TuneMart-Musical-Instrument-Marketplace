import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CompareProvider } from "@/contexts/CompareContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TuneMart - Buy & Sell Musical Instruments in India",
  description: "India's trusted marketplace for new and used musical instruments. Guitars, keyboards, drums, studio gear and more from verified sellers.",
  keywords: ["musical instruments", "guitars", "keyboards", "drums", "India", "marketplace", "used instruments"],
  referrer: "no-referrer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FFFCF8] text-[#0F0F12]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { HotelProvider } from "@/contexts/HotelContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Multi-Hotel AI Concierge Platform",
  description: "AI-powered hotel concierge service providing personalized assistance for multiple luxury hotels.",
  keywords: "hotel, AI concierge, hospitality, luxury hotels, guest services",
  authors: [{ name: "INITI AI" }],
  openGraph: {
    title: "Multi-Hotel AI Concierge Platform",
    description: "AI-powered hotel concierge service for luxury hotels.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multi-Hotel AI Concierge Platform",
    description: "AI-powered hotel concierge service for luxury hotels.",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <HotelProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </HotelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

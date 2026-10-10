import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { Toaster } from "@/components/ui/toaster"
import { GoogleAnalytics } from "@/components/google-analytics"
import "./globals.css"
import { NextAuthSessionProvider } from "./session-provider"

export const metadata: Metadata = {
  metadataBase: new URL('https://amicocart.com'),
  title: {
    default: "ANAMICO India - Biometric Solutions & RD Services",
    template: "%s | ANAMICO India"
  },
  description: "Leading provider of biometric devices, fingerprint scanners, IRIS devices, and RD services in India. UIDAI certified products for Aadhaar authentication, AEPS, and e-KYC solutions.",
  keywords: ["biometric devices", "fingerprint scanner", "IRIS scanner", "AEPS device", "Aadhaar authentication", "RD service", "e-KYC", "biometric solutions India", "UIDAI certified", "Mantra", "Morpho", "Startek"],
  authors: [{ name: "ANAMICO India Pvt. Ltd." }],
  creator: "ANAMICO India",
  publisher: "ANAMICO India",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://amicocart.com',
    siteName: 'ANAMICO India',
    title: 'ANAMICO India - Biometric Solutions & RD Services',
    description: 'Leading provider of biometric devices, fingerprint scanners, IRIS devices, and RD services in India. UIDAI certified products for Aadhaar authentication.',
    images: [
      {
        url: '/images/anamico-logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'ANAMICO India - Biometric Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ANAMICO India - Biometric Solutions & RD Services',
    description: 'Leading provider of biometric devices, fingerprint scanners, IRIS devices, and RD services in India.',
    images: ['/images/anamico-logo.jpeg'],
  },
  alternates: {
    canonical: 'https://amicocart.com',
  },
  verification: {
    // Add Google Search Console verification code when available
    // google: 'your-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <GoogleAnalytics />
        <NextAuthSessionProvider>
          <CartProvider>
            <WishlistProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <Toaster />
            </WishlistProvider>
          </CartProvider>
        </NextAuthSessionProvider>
        <Analytics />
      </body>
    </html>
  )
}

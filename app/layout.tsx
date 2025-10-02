import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "ANAMICO India - Biometric Solutions & RD Services",
  description: "Leading provider of biometric devices, fingerprint scanners, IRIS devices, and RD services in India",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider>
          <WishlistProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </WishlistProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}

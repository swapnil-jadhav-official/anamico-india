"use client"

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, ShoppingCart, User, Menu, Phone, Mail } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"

export function ECommerceHeader() {
  const { totalItems } = useCart()
  const { totalItems: wishlistCount } = useWishlist()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      {/* Top bar with contact info */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">+91 9818424815</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">info@anamicoindia.com</span>
              </div>
            </div>
            <div className="text-muted-foreground">ISO 27001:2013 & ISO 9001:2015 Certified</div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/anamico-logo.jpeg"
              alt="ANAMICO India"
              width={160}
              height={50}
              className="h-14 w-auto"
            />
          </Link>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors">
                Products
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/products/biometric">Biometric Devices</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/electronics">Electronics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/computers">Computers & Peripherals</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/surveillance">Surveillance Solutions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/networking">Networking Equipment</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products">View All Products</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </Link>

            <Link href="/downloads" className="text-sm font-medium hover:text-primary transition-colors">
              Downloads
            </Link>

            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About Us
            </Link>

            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Input type="search" placeholder="Search for products..." className="w-full pr-10" />
              <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Login */}
            <Button variant="default" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/login">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="relative">
                    <Input type="search" placeholder="Search products..." className="w-full pr-10" />
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>

                  <nav className="flex flex-col gap-4">
                    <Link href="/products" className="text-sm font-medium hover:text-primary">
                      Products
                    </Link>
                    <Link href="/services" className="text-sm font-medium hover:text-primary">
                      Services
                    </Link>
                    <Link href="/downloads" className="text-sm font-medium hover:text-primary">
                      Downloads
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary">
                      About Us
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-primary">
                      Contact
                    </Link>
                    <Link href="/wishlist" className="text-sm font-medium hover:text-primary">
                      Wishlist ({wishlistCount})
                    </Link>
                    <Link href="/login" className="text-sm font-medium hover:text-primary">
                      Login
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

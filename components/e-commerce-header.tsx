"use client";

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  Phone,
  Mail,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useSession, signOut } from "next-auth/react";

export function ECommerceHeader() {
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { data: session, status } = useSession();

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
                <span className="text-muted-foreground">
                  info@anamicoindia.com
                </span>
              </div>
            </div>
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
                  <Link href="/products/computers">
                    Computers & Peripherals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/surveillance">
                    Surveillance Solutions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/networking">Networking Equipment</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products">View All Products</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/services"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Services
            </Link>

            <Link
              href="/downloads"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Downloads
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pr-10"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden sm:inline-flex"
              asChild
            >
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

            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="relative flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {session?.user?.name || session?.user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="hidden sm:inline-flex"
                asChild
              >
                <Link href="/login">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <div className="flex h-full flex-col">
                  <div className="border-b p-6">
                    <Link href="/" className="flex items-center gap-2">
                      <Image
                        src="/images/anamico-logo.jpeg"
                        alt="ANAMICO India"
                        width={140}
                        height={40}
                        className="h-10 w-auto"
                      />
                    </Link>
                  </div>

                  <div className="p-6">
                    <div className="relative w-full">
                      <Input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pr-10"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full"
                        aria-label="Search"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <nav className="flex-1 space-y-1 px-6">
                    <Link
                      href="/products"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium hover:bg-accent transition-colors"
                    >
                      Products
                    </Link>
                    <Link
                      href="/services"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium hover:bg-accent transition-colors"
                    >
                      Services
                    </Link>
                    <Link
                      href="/downloads"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium hover:bg-accent transition-colors"
                    >
                      Downloads
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium hover:bg-accent transition-colors"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium hover:bg-accent transition-colors"
                    >
                      Contact
                    </Link>
                  </nav>

                  <div className="mt-auto border-t p-6">
                    <div className="space-y-4">
                      <Link
                        href="/wishlist"
                        className="group -mx-3 flex items-center justify-between rounded-lg bg-background px-3 py-2 text-base font-medium hover:bg-accent"
                      >
                        <span>Wishlist</span>
                        <Badge
                          variant="outline"
                          className="transition-colors group-hover:bg-background"
                        >
                          {wishlistCount}
                        </Badge>
                      </Link>
                      {status === "authenticated" ? (
                        <Button asChild className="w-full" variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                          <Link href="#">
                            <User className="mr-2 h-5 w-5 text-red-500" />
                            Logout
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild className="w-full">
                          <Link href="/login">
                            <User className="mr-2 h-5 w-5" />
                            Login / Register
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

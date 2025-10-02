"use client"

import Link from "next/link"
import {
  ChevronRight,
  Fingerprint,
  Monitor,
  Wifi,
  Camera,
  Printer,
  HardDrive,
  Shield,
  Package,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const categories = [
  {
    name: "Biometric Devices",
    href: "/products/biometric",
    icon: Fingerprint,
    subcategories: ["Fingerprint Scanners", "IRIS Scanners", "Face Recognition", "Multi-Modal Devices"],
  },
  {
    name: "Electronics",
    href: "/products/electronics",
    icon: Monitor,
    subcategories: ["Computers", "Laptops", "Tablets", "Accessories"],
  },
  {
    name: "Computers & Peripherals",
    href: "/products/computers",
    icon: HardDrive,
    subcategories: ["Desktops", "Servers", "Storage Devices", "Input Devices"],
  },
  {
    name: "Surveillance Solutions",
    href: "/products/surveillance",
    icon: Camera,
    subcategories: ["CCTV Cameras", "DVR/NVR", "IP Cameras", "Access Control"],
  },
  {
    name: "Networking Equipment",
    href: "/products/networking",
    icon: Wifi,
    subcategories: ["Routers", "Switches", "Modems", "Network Cables"],
  },
  {
    name: "Printers & Scanners",
    href: "/products/printers",
    icon: Printer,
    subcategories: ["Card Printers", "Barcode Printers", "Thermal Printers", "Scanners"],
  },
  {
    name: "RD Service",
    href: "/products/rd-service",
    icon: Shield,
    subcategories: [],
  },
  {
    name: "Software",
    href: "/products/software",
    icon: Package,
    subcategories: ["Attendance Software", "Access Control Software", "AEPS Software"],
  },
]

function CategoryNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {categories.map((category) => {
        const Icon = category.icon
        const isActive = pathname === category.href

        return (
          <div key={category.name}>
            <Link
              href={category.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{category.name}</span>
              {category.subcategories.length > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            </Link>
          </div>
        )
      })}

      <Link
        href="/products"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-accent transition-colors mt-4"
      >
        <Package className="h-4 w-4" />
        <span>View All Products</span>
      </Link>
    </nav>
  )
}

export function CategorySidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="md:hidden sticky top-20 z-10 bg-background border-b px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
              <Menu className="h-4 w-4" />
              Categories
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-4 px-2">Categories</h2>
              <CategoryNav />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden md:block w-64 flex-shrink-0 border-r bg-card">
        <div className="sticky top-24 p-4">
          <h2 className="font-semibold text-lg mb-4 px-2">Categories</h2>
          <CategoryNav />
        </div>
      </aside>
    </>
  )
}

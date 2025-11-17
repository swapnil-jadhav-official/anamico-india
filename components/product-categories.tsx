import { Card, CardContent } from "@/components/ui/card"
import { Fingerprint, Eye, Lock, Clock, CreditCard, Scan, Camera, Wifi, Printer, Laptop, ArrowRight } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    icon: Fingerprint,
    title: "Fingerprint Scanners",
    description: "USB single & dual finger scanners from Mantra, Morpho, Startek, Cogent, Aratek",
    count: "15+ Models",
    link: "/products?search=fingerprint",
  },
  {
    icon: Eye,
    title: "IRIS Scanners",
    description: "Single & dual IRIS scanners - Mantra, CMITech, Suprema, Cogent",
    count: "10+ Models",
    link: "/products?search=iris",
  },
  {
    icon: Scan,
    title: "Face Recognition",
    description: "Biometric face recognition RFID attendance & access control machines",
    count: "12+ Models",
    link: "/products?search=face",
  },
  {
    icon: Camera,
    title: "Surveillance Solutions",
    description: "DVRs, NVRs, dome, bullet, IP cameras for complete security",
    count: "20+ Systems",
    link: "/products/surveillance",
  },
  {
    icon: Wifi,
    title: "Networking Solutions",
    description: "Switches, routers, modems, access points, servers, LAN setup",
    count: "25+ Products",
    link: "/products/networking",
  },
  {
    icon: CreditCard,
    title: "AEPS Devices",
    description: "UIDAI Aadhaar enabled payment system devices",
    count: "8+ Models",
    link: "/products?search=aeps",
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Complete access management and guard patrol solutions",
    count: "15+ Systems",
    link: "/products?search=access%20control",
  },
  {
    icon: Clock,
    title: "Attendance Systems",
    description: "Biometric time & attendance tracking devices",
    count: "18+ Devices",
    link: "/products?search=attendance",
  },
  {
    icon: Printer,
    title: "Printers & Scanners",
    description: "Card printers, barcode readers, thermal printers",
    count: "12+ Models",
    link: "/products/printers",
  },
  {
    icon: Laptop,
    title: "IT Equipment",
    description: "Laptops, desktops, servers, Aadhaar tablets, projectors",
    count: "30+ Products",
    link: "/products/computers",
  },
]

export function ProductCategories() {
  return (
    <section id="products" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Comprehensive Product Range</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            UIDAI certified biometric devices, IT equipment, and complete security solutions
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link key={category.title} href={category.link}>
              <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                      <category.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{category.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{category.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs font-semibold text-primary">{category.count}</div>
                        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

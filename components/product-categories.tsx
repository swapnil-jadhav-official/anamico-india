import { Card, CardContent } from "@/components/ui/card"
import { Fingerprint, Eye, Lock, Clock, CreditCard, Scan, Camera, Wifi, Printer, Laptop } from "lucide-react"

const categories = [
  {
    icon: Fingerprint,
    title: "Fingerprint Scanners",
    description: "USB single & dual finger scanners from Mantra, Morpho, Startek, Cogent, Aratek",
    count: "15+ Models",
  },
  {
    icon: Eye,
    title: "IRIS Scanners",
    description: "Single & dual IRIS scanners - Mantra, CMITech, Suprema, Cogent",
    count: "10+ Models",
  },
  {
    icon: Scan,
    title: "Face Recognition",
    description: "Biometric face recognition RFID attendance & access control machines",
    count: "12+ Models",
  },
  {
    icon: Camera,
    title: "Surveillance Solutions",
    description: "DVRs, NVRs, dome, bullet, IP cameras for complete security",
    count: "20+ Systems",
  },
  {
    icon: Wifi,
    title: "Networking Solutions",
    description: "Switches, routers, modems, access points, servers, LAN setup",
    count: "25+ Products",
  },
  {
    icon: CreditCard,
    title: "AEPS Devices",
    description: "UIDAI Aadhaar enabled payment system devices",
    count: "8+ Models",
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Complete access management and guard patrol solutions",
    count: "15+ Systems",
  },
  {
    icon: Clock,
    title: "Attendance Systems",
    description: "Biometric time & attendance tracking devices",
    count: "18+ Devices",
  },
  {
    icon: Printer,
    title: "Printers & Scanners",
    description: "Card printers, barcode readers, thermal printers",
    count: "12+ Models",
  },
  {
    icon: Laptop,
    title: "IT Equipment",
    description: "Laptops, desktops, servers, Aadhaar tablets, projectors",
    count: "30+ Products",
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
            <Card
              key={category.title}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{category.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                    <div className="text-xs font-medium text-primary">{category.count}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

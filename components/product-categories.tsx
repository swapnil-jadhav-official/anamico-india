import { Card, CardContent } from "@/components/ui/card"
import { Fingerprint, Eye, Lock, Clock, CreditCard, Scan } from "lucide-react"

const categories = [
  {
    icon: Fingerprint,
    title: "Fingerprint Scanners",
    description: "High-precision optical and capacitive fingerprint devices",
    count: "15+ Models",
  },
  {
    icon: Eye,
    title: "IRIS Scanners",
    description: "Advanced iris recognition systems for maximum security",
    count: "8+ Models",
  },
  {
    icon: Scan,
    title: "Face Recognition",
    description: "AI-powered facial recognition terminals",
    count: "10+ Models",
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Complete access management solutions",
    count: "12+ Systems",
  },
  {
    icon: Clock,
    title: "Time & Attendance",
    description: "Automated attendance tracking systems",
    count: "20+ Devices",
  },
  {
    icon: CreditCard,
    title: "AEPS Devices",
    description: "AADHAR enabled payment system devices",
    count: "6+ Models",
  },
]

export function ProductCategories() {
  return (
    <section id="products" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Comprehensive Biometric Solutions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explore our wide range of certified biometric devices and systems
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.title}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
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

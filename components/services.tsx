import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Server, Headphones, Wrench } from "lucide-react"

const services = [
  {
    icon: Server,
    title: "RD Service",
    description: "Registered Device Service for AADHAR authentication with 99.9% uptime guarantee",
    features: [
      "UIDAI Certified RD Service",
      "Real-time authentication",
      "Secure data transmission",
      "Multi-device support",
    ],
  },
  {
    icon: Wrench,
    title: "Installation & Setup",
    description: "Professional installation and configuration services for all biometric systems",
    features: ["On-site installation", "System configuration", "Network integration", "Staff training"],
  },
  {
    icon: Headphones,
    title: "Technical Support",
    description: "24/7 technical support and maintenance services for uninterrupted operations",
    features: ["24/7 helpdesk support", "Remote troubleshooting", "Regular maintenance", "Software updates"],
  },
]

export function Services() {
  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Professional Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Complete support from installation to maintenance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.title} className="relative overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

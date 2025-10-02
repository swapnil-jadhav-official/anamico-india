import { Shield, Users, Building2, CheckCircle } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "ISO Certified",
    description: "ISO 27001:2013 and ISO 9001:2015 certified for information security and quality management",
  },
  {
    icon: Building2,
    title: "Government Partner",
    description: "Trusted partner for UIDAI and pan-India government projects with proven track record",
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "World-class human resources with extensive experience in IT infrastructure and biometric solutions",
  },
  {
    icon: CheckCircle,
    title: "Customer-Oriented",
    description: "Trust, transparency, and flexibility in approach with tailored solutions for specific needs",
  },
]

export function WhyChooseUs() {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Why Choose ANAMICO?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Your trusted system integrator partner for complete IT solutions and operational excellence
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

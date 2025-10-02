import { Shield, Award, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "UIDAI Certified",
    description: "All our devices are certified by UIDAI and STQC for guaranteed quality and compliance",
  },
  {
    icon: Award,
    title: "10+ Years Experience",
    description: "Decade of expertise in biometric solutions with proven track record",
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Dedicated technical team available 24/7 for assistance and troubleshooting",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Quick dispatch and delivery across India with reliable logistics partners",
  },
]

export function WhyChooseUs() {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Why Choose ANAMICO?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Your trusted partner for biometric solutions in India
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

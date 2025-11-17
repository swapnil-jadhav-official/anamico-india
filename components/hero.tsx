import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Award } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5"
    >
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              ISO 27001:2013 & ISO 9001:2015 Certified
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Complete IT Solutions & <span className="text-primary">Biometric Technology</span>
            </h1>

            <p className="text-lg text-muted-foreground text-pretty max-w-xl">
              ANAMICO India Private Limited delivers comprehensive IT solutions, biometric devices, and project
              management services to government and enterprise organizations across India.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/products">
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#contact">
                  Contact Sales
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">9+ Years</div>
                  <div className="text-sm text-muted-foreground">Industry Experience</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">UIDAI</div>
                  <div className="text-sm text-muted-foreground">Certified Partner</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              <img
                src="/modern-biometric-fingerprint-scanner-device-with-b.jpg"
                alt="Biometric Device"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card border rounded-xl p-4 shadow-lg">
              <div className="text-sm text-muted-foreground">Certified</div>
              <div className="text-lg font-semibold">ISO 27001 & 9001</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

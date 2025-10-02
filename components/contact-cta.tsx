import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin } from "lucide-react"

export function ContactCTA() {
  return (
    <section id="contact" className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to Secure Your Business?</h2>
            <p className="text-lg text-primary-foreground/90 text-pretty">
              Get in touch with our experts to find the perfect biometric solution for your needs.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-primary-foreground/70">Call Us</div>
                  <div className="font-semibold">+91 1800-XXX-XXXX</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-primary-foreground/70">Email Us</div>
                  <div className="font-semibold">info@anamico.in</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-primary-foreground/70">Visit Us</div>
                  <div className="font-semibold">Mumbai, Maharashtra, India</div>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-background text-foreground">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Request a Quote</h3>
              <div className="space-y-4">
                <Input placeholder="Your Name" />
                <Input type="email" placeholder="Email Address" />
                <Input type="tel" placeholder="Phone Number" />
                <Textarea placeholder="Tell us about your requirements" rows={4} />
                <Button className="w-full" size="lg">
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

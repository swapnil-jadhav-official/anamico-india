import { Card, CardContent } from "@/components/ui/card"
import { Building2, Calendar, Award, Target } from "lucide-react"

export function AboutCompany() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">About ANAMICO</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            A professionally managed and technology-driven organization committed to delivering trustworthy and
            cost-effective business solutions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Our Journey</h3>
              <p className="text-muted-foreground leading-relaxed">
                Initially founded in 2016 as a small proprietorship firm, ANAMICO started by offering a comprehensive
                range of IT-integrated products and services. Since then, we have grown and expanded our business
                operations significantly.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, ANAMICO is recognized as a well-established IT brand providing complete IT solutions. We are a
                Private Limited Company incorporated on June 28, 2022, and registered in Delhi, India.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Founded</div>
                    <div className="text-sm text-muted-foreground">2016</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Incorporated</div>
                    <div className="text-sm text-muted-foreground">June 2022</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Our Expertise</h3>
              <p className="text-muted-foreground leading-relaxed">
                AIPL specializes in providing full-spectrum Information Technology, Manpower, and Project Management
                services. We are a skill-based system and network integrator offering services like installation,
                consultancy, technical support, and manpower supply to projects such as UIDAI and other pan-India
                initiatives.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With extensive experience in IT infrastructure services, we cater to various industry verticals and
                technology environments. Our technical staff has experience working with small to medium businesses,
                government projects, and blue-chip firms.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Certifications</div>
                    <div className="text-sm text-muted-foreground">ISO 27001 & 9001</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Focus</div>
                    <div className="text-sm text-muted-foreground">Quality & Excellence</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold">Our Commitment</h3>
              <p className="text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
                AIPL believes in building strong business relationships and adopting innovative technologies to foster
                our growth. We prioritize trust, transparency, and flexibility in our approach to client engagements. By
                closely understanding our client's requirements and expectations, AIPL tailors its operations to meet
                their specific needs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

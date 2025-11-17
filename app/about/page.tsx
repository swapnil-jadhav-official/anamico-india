"use client";

import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Award,
  Users,
  Target,
  Zap,
  CheckCircle2,
  Building2,
  Globe,
  TrendingUp
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-accent/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4">Established 2015</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About ANAMICO India</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                ANAMICO India Private Limited is a leading provider of comprehensive IT solutions,
                biometric technology, and project management services, serving government and enterprise
                organizations across India with excellence and innovation.
              </p>
            </div>
          </div>
        </section>

        {/* Company Overview */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  With over 9 years of industry experience, ANAMICO India Private Limited has established
                  itself as a trusted partner for IT infrastructure, biometric solutions, and technical
                  manpower services.
                </p>
                <p>
                  We specialize in providing end-to-end solutions for UIDAI projects, government initiatives,
                  and enterprise deployments. Our commitment to quality, innovation, and customer satisfaction
                  has made us a preferred choice for organizations nationwide.
                </p>
                <p>
                  As a UIDAI-certified partner and ISO 27001:2013 & ISO 9001:2015 certified company,
                  we maintain the highest standards of security, quality, and operational excellence in
                  all our services.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/modern-biometric-fingerprint-scanner-device-with-b.jpg"
                alt="ANAMICO Office"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Target className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground">
                    To deliver world-class IT solutions and biometric technology that empower organizations
                    to achieve their goals efficiently and securely. We strive to be the most trusted partner
                    for government and enterprise projects across India.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold">Our Vision</h3>
                  </div>
                  <p className="text-muted-foreground">
                    To be India's leading provider of integrated IT and biometric solutions, recognized for
                    innovation, quality, and customer-centric service delivery. We aim to set new benchmarks
                    in technology implementation and project management.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our business and define our culture
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Integrity",
                description: "We conduct business with honesty, transparency, and ethical practices"
              },
              {
                icon: Award,
                title: "Excellence",
                description: "We strive for excellence in every project and customer interaction"
              },
              {
                icon: Users,
                title: "Customer Focus",
                description: "Our customers' success is our success, driving everything we do"
              },
              {
                icon: TrendingUp,
                title: "Innovation",
                description: "We continuously innovate to deliver cutting-edge solutions"
              }
            ].map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Certifications & Achievements */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Certifications & Achievements</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Recognized for quality and excellence
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">ISO 27001:2013</h3>
                  <p className="text-sm text-muted-foreground">
                    Information Security Management System
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">ISO 9001:2015</h3>
                  <p className="text-sm text-muted-foreground">
                    Quality Management System
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">UIDAI Certified</h3>
                  <p className="text-sm text-muted-foreground">
                    Authorized RD Service Provider
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Statistics */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">9+</div>
              <div className="text-sm text-muted-foreground">Years of Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Enterprise Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Pan India</div>
              <div className="text-sm text-muted-foreground">Service Coverage</div>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Building2,
                  title: "IT Infrastructure",
                  description: "Complete IT solutions including installation, consultancy, and technical support"
                },
                {
                  icon: Shield,
                  title: "Biometric Solutions",
                  description: "UIDAI-certified biometric devices and RD services for authentication"
                },
                {
                  icon: Users,
                  title: "Manpower Services",
                  description: "Skilled technical professionals for government and enterprise projects"
                },
                {
                  icon: Target,
                  title: "Project Management",
                  description: "End-to-end project execution with focus on quality and timely delivery"
                },
                {
                  icon: Globe,
                  title: "Pan India Coverage",
                  description: "Service delivery across all states and union territories"
                },
                {
                  icon: CheckCircle2,
                  title: "24/7 Support",
                  description: "Dedicated technical support for uninterrupted operations"
                }
              ].map((service) => (
                <Card key={service.title}>
                  <CardContent className="p-6">
                    <service.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

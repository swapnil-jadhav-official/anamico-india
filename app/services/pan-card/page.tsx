"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  CheckCircle,
  Link2,
  Download,
  HelpCircle,
} from "lucide-react";

interface PANService {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: React.ReactNode;
  details: string[];
  color: string;
}

const panServices: PANService[] = [
  {
    id: "pan-centre",
    title: "PAN Card Centre / Franchise",
    description: "Apply and get your PAN Card through our authorized centre",
    price: "Apply Now",
    icon: <FileText className="h-12 w-12" />,
    details: [
      "NSDL authorized PAN issuance centre",
      "Expert guidance and support",
      "Quick application processing",
      "Same day/next day PAN generation",
    ],
    color: "from-orange-400 to-orange-500",
  },
  {
    id: "apply-new",
    title: "Apply New PAN Card",
    description: "Get a new PAN card for yourself or your business",
    price: "₹499",
    icon: <Plus className="h-12 w-12" />,
    details: [
      "New PAN card issuance",
      "Individual and entity PAN",
      "Online form filling assistance",
      "Document verification",
      "E-PAN delivery",
    ],
    color: "from-orange-400 to-orange-500",
  },
  {
    id: "pan-correction",
    title: "PAN Card Correction",
    description: "Correct errors or update information on your existing PAN",
    price: "₹499",
    icon: <CheckCircle className="h-12 w-12" />,
    details: [
      "Name correction",
      "Address correction",
      "DOB correction",
      "Entity information updates",
      "Updated PAN certificate",
    ],
    color: "from-orange-400 to-orange-500",
  },
  {
    id: "lost-pan",
    title: "Lost PAN? Get Again",
    description: "Duplicate PAN card if your original is lost or damaged",
    price: "₹499",
    icon: <HelpCircle className="h-12 w-12" />,
    details: [
      "Duplicate PAN issuance",
      "PAN reissuance without changes",
      "Lost card replacement",
      "Damaged card replacement",
      "Quick delivery to your address",
    ],
    color: "from-orange-400 to-orange-500",
  },
  {
    id: "link-aadhar",
    title: "Link your Aadhar with PAN",
    description: "Link your Aadhar number with your PAN card",
    price: "₹499",
    icon: <Link2 className="h-12 w-12" />,
    details: [
      "Aadhar-PAN linking",
      "Online linking assistance",
      "Tax compliance",
      "UIDAI integration",
      "Instant confirmation",
    ],
    color: "from-orange-400 to-orange-500",
  },
  {
    id: "download-pan",
    title: "Download PAN Card",
    description: "Download your PAN card certificate and documents",
    price: "Free Download",
    icon: <Download className="h-12 w-12" />,
    details: [
      "E-PAN download",
      "Digital certificate",
      "No physical delivery delay",
      "Instant availability",
      "Multiple format options",
    ],
    color: "from-orange-400 to-orange-500",
  },
];

export default function PANCardPage() {
  const router = useRouter();

  const handleServiceClick = (serviceId: string) => {
    router.push("/contact");
  };

  return (
    <div className="min-h-screen bg-background">
      <ECommerceHeader />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              PAN Card Services
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Complete PAN Card solutions - Apply, Correct, Link & Download your PAN
              with expert guidance
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="text-sm py-2 px-4">
              ✓ NSDL Authorized
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              ✓ Official Partner
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              ✓ Fast Processing
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              ✓ Guaranteed Results
            </Badge>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our PAN Card Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose your service and get started with our expert assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {panServices.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
                onClick={() => handleServiceClick(service.id)}
              >
                {/* Card Header with Orange Gradient */}
                <div className={`bg-gradient-to-br ${service.color} p-8 text-white relative overflow-hidden`}>
                  {/* Decorative pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="mb-4 text-white">{service.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-white/90 text-sm">{service.description}</p>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-6 flex-grow flex flex-col">
                  {/* Price */}
                  <div className="mb-6 pb-6 border-b">
                    <div className="text-3xl font-bold text-primary">
                      {service.price}
                    </div>
                  </div>

                  {/* Details */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {service.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-orange-500 font-bold text-lg mt-0.5">
                          ✓
                        </span>
                        <span className="text-gray-700 text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white group-hover:shadow-lg transition-all"
                    size="lg"
                    onClick={() => handleServiceClick(service.id)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Our PAN Card Services?
              </h2>
              <ul className="space-y-4">
                {[
                  "NSDL Authorized PAN Issuance Centre",
                  "Expert guidance throughout the process",
                  "Quick application processing",
                  "Affordable pricing for all services",
                  "Online and offline support",
                  "Secure document handling",
                  "Guaranteed approval",
                  "Post-service support",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-orange-500 text-xl">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                PAN Card Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>What is a PAN Card?</strong>
                  <br />
                  A Permanent Account Number (PAN) is a 10-character alphanumeric
                  identifier issued by the Indian Income Tax Department to all
                  individuals and entities engaged in financial and
                  non-financial transactions.
                </p>
                <p>
                  <strong>Who Needs a PAN?</strong>
                  <br />
                  Anyone earning income or conducting financial transactions in India
                  requires a PAN card. It's mandatory for opening bank accounts,
                  investing in stocks, and filing income tax returns.
                </p>
                <p>
                  <strong>Processing Time:</strong>
                  <br />
                  Usually 3-5 working days for new PAN issuance. Digital PAN (e-PAN)
                  can be downloaded immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

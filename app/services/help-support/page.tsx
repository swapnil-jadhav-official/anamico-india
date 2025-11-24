"use client";

import { useState } from "react";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageCircle,
  Mail,
  Send,
  Phone,
  Clock,
  MapPin,
  HelpCircle,
  Package,
  CreditCard,
  Shield,
  Headphones,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function HelpSupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Support ticket submitted successfully! Ticket ID: ${data.ticketId}`
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(data.error || "Failed to submit ticket");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How can I track my order status?",
      answer:
        "You can track your order by logging into your account and visiting the 'Orders' section. Each order has a tracking number that shows real-time updates. You'll also receive email notifications at every stage of delivery.",
    },
    {
      question: "What is your return and refund policy?",
      answer:
        "We offer a 7-day return policy for most products. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the returned item. For services like RD Service or Digital Signatures, cancellations must be made within 24 hours of purchase.",
    },
    {
      question: "How do I raise a support ticket online?",
      answer:
        "You can raise a support ticket by filling out the form on this page. Simply provide your contact details, select a subject, and describe your issue. You'll receive a ticket ID via email which you can use to track your request status.",
    },
    {
      question: "How can I contact customer support for assistance?",
      answer:
        "We offer multiple channels for support: Call or WhatsApp us at +91 84343 84343 (available 9 AM - 6 PM, Monday to Saturday), email us at support@anamico.in, or use the live chat feature on our website. For urgent issues, phone support is the fastest option.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major payment methods including Credit/Debit Cards (Visa, Mastercard, Amex, RuPay), UPI payments, Net Banking, and popular digital wallets. All payments are processed securely through Razorpay with 256-bit SSL encryption.",
    },
    {
      question: "How long does RD Service registration take?",
      answer:
        "RD Service registration typically takes 2-5 business days after payment confirmation. You'll receive updates via email and SMS. You can check your registration status anytime using the RD Status page with your registration ID.",
    },
    {
      question: "Do you provide installation support for products?",
      answer:
        "Yes, we provide comprehensive installation support for all our products. Our technical team can guide you through remote installation via phone or screen sharing. For complex setups, we also offer on-site installation services in select locations (charges may apply).",
    },
    {
      question: "How do I update my account information?",
      answer:
        "Log in to your account and navigate to the Profile section. Here you can update your personal details, contact information, and manage your addresses. For security reasons, email changes require verification.",
    },
  ];

  const supportCategories = [
    {
      icon: Package,
      title: "Order Support",
      description: "Track orders, delivery issues, returns",
    },
    {
      icon: Shield,
      title: "RD Service Help",
      description: "Registration, status, device issues",
    },
    {
      icon: CreditCard,
      title: "Payment Issues",
      description: "Failed payments, refunds, invoices",
    },
    {
      icon: Headphones,
      title: "Technical Support",
      description: "Installation, setup, troubleshooting",
    },
    {
      icon: HelpCircle,
      title: "Account Help",
      description: "Login issues, profile updates",
    },
    {
      icon: CheckCircle,
      title: "Service Queries",
      description: "Digital signature, Pan card, registration",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-accent/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Help & Support Center
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                For assistance or support with our products or services, please
                WhatsApp or call our IVR number at{" "}
                <a
                  href="tel:+918434384343"
                  className="text-primary font-semibold hover:underline"
                >
                  +91 84343 84343
                </a>
                , or email us at{" "}
                <a
                  href="mailto:support@anamico.in"
                  className="text-primary font-semibold hover:underline"
                >
                  support@anamico.in
                </a>
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() =>
                    window.open("https://wa.me/918434384343", "_blank")
                  }
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    (window.location.href = "mailto:support@anamico.in")
                  }
                >
                  <Mail className="h-5 w-5" />
                  Email Us
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    document
                      .getElementById("support-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Send className="h-5 w-5" />
                  Submit Ticket
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Support Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              How Can We Help You?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {supportCategories.map((category, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-2">
                          {category.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    +91 84343 84343
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mon-Sat: 9 AM - 6 PM
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    support@anamico.in
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Response within 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Office Address</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Visit our support center
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mon-Sat: 9 AM - 6 PM
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Support Ticket Form */}
        <section id="support-form" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    Submit a Support Ticket
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon
                    as possible
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Subject <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Brief description of your issue"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Describe your issue in detail"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Submit Support Ticket
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Need More Help?
              </h2>
              <p className="text-muted-foreground mb-8">
                Explore our additional resources to find answers quickly
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">RD Status Check</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track your RD service registration status
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        (window.location.href = "/services/rd-status")
                      }
                    >
                      Check Status
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Downloads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access drivers, software, and documentation
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => (window.location.href = "/downloads")}
                    >
                      Go to Downloads
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get in touch with our support team directly
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => (window.location.href = "/contact")}
                    >
                      Contact Page
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ContactCTA() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Quote Request Sent!",
          description: "Thank you for your interest. We'll contact you soon.",
        });
        // Reset form
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        // Display the actual error message from the API
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to send quote request. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send quote request. Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <div className="font-semibold">+91 9818424815</div>
                  <div className="font-semibold">+91 8826353408</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-primary-foreground/70">Email Us</div>
                  <div className="font-semibold">info@anamicoindia.com</div>
                  <div className="text-sm">anamicoindia@gmail.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-primary-foreground/70">Visit Us</div>
                  <div className="font-semibold">204, WZ-663, Madipur Main Village Road</div>
                  <div className="text-sm">Near Punjabi Bagh Apartment, New Delhi - 110063</div>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-background text-foreground">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Request a Quote</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Textarea
                  placeholder="Tell us about your requirements"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

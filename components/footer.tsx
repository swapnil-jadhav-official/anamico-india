import Image from "next/image"
import { Facebook, Twitter, Linkedin, Instagram, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Image
              src="/images/anamico-logo.jpeg"
              alt="ANAMICO India"
              width={160}
              height={50}
              className="h-10 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              ISO 27001:2013 & ISO 9001:2015 certified provider of biometric solutions and IT services.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <a href="tel:+919818424815" className="hover:text-primary transition-colors">
                    +91 9818424815
                  </a>
                  <br />
                  <a href="tel:+918826353408" className="hover:text-primary transition-colors">
                    +91 8826353408
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <a href="mailto:info@anamicoindia.com" className="hover:text-primary transition-colors">
                    info@anamicoindia.com
                  </a>
                  <br />
                  <a href="mailto:anamicoindia@gmail.com" className="hover:text-primary transition-colors">
                    anamicoindia@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  204, WZ-663, Madipur Main Village Road, Near Punjabi Bagh Apartment, New Delhi - 110063
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Fingerprint Scanners
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  IRIS Scanners
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Face Recognition
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Access Control
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  AEPS Devices
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Surveillance Systems
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Networking Solutions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  RD Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  IT Equipment Repair
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Manpower Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  System Integration
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  E-KYC Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  AMC Services
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Certifications
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
            <div className="mt-6 space-y-1 text-xs text-muted-foreground">
              <div>CIN: U74999DL2022PTC400835</div>
              <div>GST: 07AAXCA2423P1Z3</div>
              <div>MSME: UDYAM-DL-11-0040646</div>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ANAMICO India Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

import Image from "next/image"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

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
              Leading provider of biometric solutions and RD services in India.
            </p>
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
                  Installation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Technical Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Maintenance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Training
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
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ANAMICO India Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

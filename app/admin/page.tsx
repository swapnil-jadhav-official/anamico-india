import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { Package, ShoppingCart, Users, Settings, BarChart3, ImageIcon, Fingerprint, Download } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Dashboard",
    description: "View key metrics and analytics.",
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    href: "/admin/dashboard",
  },
  {
    title: "Product Management",
    description: "Add, edit, and manage your products.",
    icon: <Package className="h-8 w-8 text-primary" />,
    href: "/admin/products",
  },
  {
    title: "Order Management",
    description: "View and process customer orders.",
    icon: <ShoppingCart className="h-8 w-8 text-primary" />,
    href: "/admin/orders",
  },
  {
    title: "Banner Management",
    description: "Manage landing page banners and offers.",
    icon: <ImageIcon className="h-8 w-8 text-primary" />,
    href: "/admin/banners",
  },
  {
    title: "RD Service Management",
    description: "Manage biometric device service registrations.",
    icon: <Fingerprint className="h-8 w-8 text-primary" />,
    href: "/admin/rd-service",
  },
  {
    title: "File Management",
    description: "Manage downloadable files, drivers, and software.",
    icon: <Download className="h-8 w-8 text-primary" />,
    href: "/admin/downloads",
  },
  {
    title: "User Management",
    description: "Manage customer and admin accounts.",
    icon: <Users className="h-8 w-8 text-primary" />,
    href: "/admin/users",
  },
];

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ECommerceHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">
              Select a feature below to get started.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link href={feature.href} key={feature.title}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

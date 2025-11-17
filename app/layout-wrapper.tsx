"use client";

import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      {children}
      <Footer />
    </div>
  );
}

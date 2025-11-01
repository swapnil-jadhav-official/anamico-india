"use client";

import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { ShoppingCart } from "@/components/shopping-cart";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  if (mounted && status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground">
              Review and manage your items before checkout
            </p>
          </div>
          {mounted && <ShoppingCart />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

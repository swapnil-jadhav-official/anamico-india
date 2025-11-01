"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { message } from "antd";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, totalPrice, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingData, setShippingData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  if (mounted && status === "unauthenticated") {
    redirect("/login");
  }

  // Redirect to cart if cart is empty
  if (mounted && items.length === 0) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <ECommerceHeader />
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add items to your cart before proceeding to checkout
              </p>
              <Link href="/products">
                <Button>Continue Shopping</Button>
              </Link>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleShippingSubmit = async (formData: any) => {
    try {
      setIsProcessing(true);

      // Store shipping data for next step
      setShippingData(formData);

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingData: formData,
          items: items,
          subtotal: totalPrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      const { orderId, orderData } = await response.json();

      // Clear cart after successful order creation
      clearCart();

      // Redirect to payment page
      router.push(`/checkout/payment?orderId=${orderId}`);
      message.success("Order created successfully! Proceeding to payment...");
    } catch (error) {
      console.error("Error creating order:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your order by filling in your shipping details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shipping Form */}
            <div className="lg:col-span-2">
              <ShippingForm
                onSubmit={handleShippingSubmit}
                isLoading={isProcessing}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary items={items} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

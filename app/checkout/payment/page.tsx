"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RazorpayCheckout } from "@/components/checkout/razorpay-checkout";
import { message } from "antd";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentPercent, setSelectedPaymentPercent] = useState(30); // Default 30% partial payment

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  if (mounted && status === "unauthenticated") {
    redirect("/login");
  }

  // Fetch order details
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`);
        if (res.ok) {
          const orders = await res.json();
          const currentOrder = orders.find((o: any) => o.id === orderId);
          if (currentOrder) {
            setOrderData(currentOrder);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentSuccess(true);
    message.success("Payment successful! Order awaiting admin approval...");

    // Redirect to order confirmation after 3 seconds
    setTimeout(() => {
      router.push(`/order-confirmation?orderId=${orderId}`);
    }, 3000);
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    message.error(
      error instanceof Error ? error.message : "Payment processing failed"
    );
  };

  if (!mounted || !orderData) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <ECommerceHeader />
        <main className="flex-1 p-4 sm:p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const partialAmount = Math.round((orderData.total * selectedPaymentPercent) / 100);
  const remainingAmount = orderData.total - partialAmount;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
            <p className="text-muted-foreground">
              Order #{orderData.orderNumber} - Complete payment to proceed
            </p>
          </div>

          {paymentSuccess ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                  <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                    Payment Successful!
                  </h2>
                  <p className="text-green-800 dark:text-green-200">
                    ₹{partialAmount.toLocaleString()} paid ({selectedPaymentPercent}%)
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your order is now awaiting admin approval. You'll be notified once it's confirmed.
                  </p>
                  <div className="pt-4">
                    <Link href={`/order-confirmation?orderId=${orderId}`}>
                      <Button className="bg-green-600 hover:bg-green-700">
                        View Order Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Options</CardTitle>
                    <CardDescription>
                      Select how much you want to pay now. Remaining amount will be collected after order confirmation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Percentage Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Payment Amount</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[30, 50, 100].map((percent) => (
                          <button
                            key={percent}
                            onClick={() => setSelectedPaymentPercent(percent)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedPaymentPercent === percent
                                ? "border-primary bg-primary/10"
                                : "border-input hover:border-primary"
                            }`}
                          >
                            <div className="font-semibold">{percent}%</div>
                            <div className="text-sm text-muted-foreground">
                              ₹{Math.round((orderData.total * percent) / 100).toLocaleString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Order Total:</span>
                        <span className="font-semibold">₹{orderData.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pay Now ({selectedPaymentPercent}%):</span>
                        <span className="font-semibold text-primary">
                          ₹{partialAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-muted-foreground">Remaining:</span>
                        <span className="font-semibold">₹{remainingAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900 dark:text-amber-100">
                        <p className="font-semibold mb-1">Order Processing Note</p>
                        <p>
                          After payment, your order will be reviewed by our admin team. Once approved,
                          we'll contact you regarding the remaining amount and delivery.
                        </p>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <RazorpayCheckout
                      orderId={orderId!}
                      paymentType={selectedPaymentPercent as '30' | '50' | '100'}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentFailure={handlePaymentFailure}
                      isProcessing={isLoading}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-semibold">{orderData.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Items</p>
                      <p className="font-semibold">{orderData.items?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-semibold">₹{orderData.subtotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tax (18% GST)</p>
                      <p className="font-semibold">₹{orderData.tax.toLocaleString()}</p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{orderData.total.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

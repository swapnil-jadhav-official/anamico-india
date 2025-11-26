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
  const [selectedPaymentPercent, setSelectedPaymentPercent] = useState(100); // Default 100% payment with discount

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

  // Calculate amounts with 5% discount on 100% payment
  const discount = selectedPaymentPercent === 100 ? Math.round(orderData.total * 0.05) : 0;
  const partialAmount = selectedPaymentPercent === 100
    ? orderData.total - discount
    : Math.round((orderData.total * selectedPaymentPercent) / 100);
  const remainingAmount = selectedPaymentPercent === 100 ? 0 : orderData.total - partialAmount;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 bg-background p-8 rounded-lg shadow-lg">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Processing payment...</p>
            <p className="text-sm text-muted-foreground">Please wait while we connect to the payment gateway</p>
          </div>
        </div>
      )}
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
                      <label className="text-sm font-medium">Payment Option</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* 100% Payment with 5% Discount */}
                        <button
                          onClick={() => setSelectedPaymentPercent(100)}
                          className={`p-4 rounded-lg border-2 transition-all relative ${
                            selectedPaymentPercent === 100
                              ? "border-primary bg-primary/10"
                              : "border-input hover:border-primary"
                          }`}
                        >
                          <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                            5% OFF
                          </div>
                          <div className="font-semibold">100% Payment</div>
                          <div className="text-sm text-muted-foreground">
                            ₹{(orderData.total - Math.round(orderData.total * 0.05)).toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Save ₹{Math.round(orderData.total * 0.05).toLocaleString()}!
                          </div>
                        </button>

                        {/* 10% Partial Payment */}
                        <button
                          onClick={() => setSelectedPaymentPercent(10)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedPaymentPercent === 10
                              ? "border-primary bg-primary/10"
                              : "border-input hover:border-primary"
                          }`}
                        >
                          <div className="font-semibold">10% Partial</div>
                          <div className="text-sm text-muted-foreground">
                            ₹{Math.round((orderData.total * 10) / 100).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Balance: Cash on Delivery
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Order Total:</span>
                        <span className="font-semibold">₹{orderData.total.toLocaleString()}</span>
                      </div>
                      {selectedPaymentPercent === 100 && discount > 0 && (
                        <>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount (5%):</span>
                            <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>You're saving ₹{discount.toLocaleString()}!</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground">Pay Now ({selectedPaymentPercent}%):</span>
                        <span className="font-semibold text-primary">
                          ₹{partialAmount.toLocaleString()}
                        </span>
                      </div>
                      {remainingAmount > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining (COD):</span>
                            <span className="font-semibold">₹{remainingAmount.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            Balance payable via Cash on Delivery
                          </div>
                        </>
                      )}
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
                      paymentType={selectedPaymentPercent as '10' | '100'}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentFailure={handlePaymentFailure}
                      isProcessing={isLoading}
                      onLoadingChange={setIsLoading}
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
                      <p className="text-lg font-bold">
                        ₹{orderData.total.toLocaleString()}
                      </p>
                    </div>
                    {discount > 0 && (
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between text-sm text-green-700 dark:text-green-300">
                          <span className="font-medium">Discount (5%)</span>
                          <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">Amount to Pay Now</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{partialAmount.toLocaleString()}
                      </p>
                    </div>
                    {remainingAmount > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining (Cash on Delivery)</p>
                        <p className="font-semibold">₹{remainingAmount.toLocaleString()}</p>
                      </div>
                    )}
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

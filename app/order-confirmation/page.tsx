"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  createdAt: string;
  items: any[];
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  if (mounted && sessionStatus === "unauthenticated") {
    redirect("/login");
  }

  // Fetch order details
  useEffect(() => {
    if (!orderId || !mounted) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/orders");
        if (res.ok) {
          const orders = await res.json();
          const currentOrder = orders.find((o: any) => o.id === orderId);
          if (currentOrder) {
            setOrder(currentOrder);
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [mounted, orderId, router]);

  const getPaymentPercentage = () => {
    if (!order) return 0;
    return Math.round((order.paidAmount / order.total) * 100);
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Order created, awaiting payment";
      case "payment_received":
        return "Payment received! Your order is now under admin review. We'll notify you once it's approved.";
      case "accepted":
        return "Order accepted! We're preparing your items for shipment.";
      case "rejected":
        return "Your order was rejected. Please contact support for details.";
      default:
        return status;
    }
  };

  if (!mounted) {
    return null;
  }

  if (isLoading) {
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

  if (!order) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <ECommerceHeader />
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 bg-red-50 dark:bg-red-950">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
                  <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
                    Order Not Found
                  </h2>
                  <p className="text-red-800 dark:text-red-200">
                    We couldn't find the order you're looking for.
                  </p>
                  <Button asChild>
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 mb-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <h1 className="text-3xl font-bold text-green-900 dark:text-green-100">
                  Order Confirmed!
                </h1>
                <p className="text-green-800 dark:text-green-200">
                  {getStatusDescription(order.status)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Number and Status */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl break-words">{order.orderNumber}</CardTitle>
                      <CardDescription className="text-sm">
                        Order placed on {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`text-sm sm:text-lg px-2 sm:px-3 py-1 flex-shrink-0 w-fit ${
                        order.status === "accepted"
                          ? "bg-green-600"
                          : order.status === "payment_received"
                          ? "bg-yellow-600"
                          : "bg-blue-600"
                      }`}
                    >
                      {order.status === "payment_received"
                        ? "Under Review"
                        : order.status === "accepted"
                        ? "Accepted"
                        : order.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    {order.items.length} item(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm sm:text-base break-words">{item.productName}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="font-semibold text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-base sm:text-lg break-words">{order.shippingName}</p>
                    <p className="text-sm sm:text-base text-muted-foreground break-words">{order.shippingEmail}</p>
                    <p className="text-sm sm:text-base text-muted-foreground">{order.shippingPhone}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="whitespace-pre-wrap text-xs sm:text-sm break-words">{order.shippingAddress}</p>
                    <p className="text-xs sm:text-sm font-medium mt-2 break-words">
                      {order.shippingCity}, {order.shippingState} {order.shippingPincode}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base">What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-blue-600 font-bold">1</div>
                      <div>
                        <p className="font-medium">Admin Review</p>
                        <p className="text-sm text-muted-foreground">
                          Our admin team will review your order within 24 hours
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-blue-600 font-bold">2</div>
                      <div>
                        <p className="font-medium">Approval Confirmation</p>
                        <p className="text-sm text-muted-foreground">
                          Once approved, we'll send you a confirmation email
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-blue-600 font-bold">3</div>
                      <div>
                        <p className="font-medium">Payment & Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          Remaining amount will be collected, and items will be shipped
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (18% GST)</span>
                      <span>₹{order.tax.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Amount Paid</span>
                      <span className="text-sm font-bold">{getPaymentPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${getPaymentPercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-semibold">
                        ₹{(order.paidAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold text-orange-600">
                        ₹{(order.total - (order.paidAmount || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    Remaining amount will be collected after order approval
                  </p>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/cart">Continue Shopping</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

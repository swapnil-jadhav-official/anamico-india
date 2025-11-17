"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { message, Steps } from "antd";
import { ArrowLeft, Loader2, CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import Link from "next/link";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  createdAt: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: any[];
}

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const { status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { orderId } = params;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  if (mounted && sessionStatus === "unauthenticated") {
    redirect("/login");
  }

  // Fetch order details
  useEffect(() => {
    if (!mounted || sessionStatus !== "authenticated") return;

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
            message.error("Order not found");
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        message.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [mounted, sessionStatus, orderId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-gray-600 text-sm sm:text-lg px-2 sm:px-3 py-1">Pending Payment</Badge>;
      case "payment_received":
        return <Badge className="bg-yellow-600 text-sm sm:text-lg px-2 sm:px-3 py-1">Under Review</Badge>;
      case "accepted":
        return <Badge className="bg-green-600 text-sm sm:text-lg px-2 sm:px-3 py-1">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 text-sm sm:text-lg px-2 sm:px-3 py-1">Rejected</Badge>;
      case "shipped":
        return <Badge className="bg-blue-600 text-sm sm:text-lg px-2 sm:px-3 py-1">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-green-700 text-sm sm:text-lg px-2 sm:px-3 py-1">Delivered</Badge>;
      default:
        return <Badge className="text-sm sm:text-lg px-2 sm:px-3 py-1">{status}</Badge>;
    }
  };

  const getOrderSteps = (status: string) => {
    const steps = [
      {
        title: "Payment",
        description: "Payment pending",
        status: status !== "pending" ? "finish" : "process",
      },
      {
        title: "Review",
        description: "Admin review",
        status:
          status === "accepted" || status === "shipped" || status === "delivered"
            ? "finish"
            : status === "payment_received"
            ? "process"
            : "wait",
      },
      {
        title: "Confirmed",
        description: "Order accepted",
        status:
          status === "shipped" || status === "delivered" ? "finish" : status === "accepted" ? "process" : "wait",
      },
      {
        title: "Shipped",
        description: "On the way",
        status: status === "delivered" ? "finish" : status === "shipped" ? "process" : "wait",
      },
      {
        title: "Delivered",
        description: "Order complete",
        status: status === "delivered" ? "finish" : "wait",
      },
    ];

    // If rejected, show special step
    if (status === "rejected") {
      return [
        {
          title: "Payment",
          description: "Payment pending",
          status: "finish",
        },
        {
          title: "Rejected",
          description: "Order rejected",
          status: "error",
        },
      ];
    }

    return steps;
  };

  const getPaymentPercentage = () => {
    if (!order) return 0;
    return Math.round((order.paidAmount / order.total) * 100);
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Awaiting payment. Please complete the payment to proceed.";
      case "payment_received":
        return "Payment received! Your order is under admin review. You'll be notified once it's approved.";
      case "accepted":
        return "Order confirmed! We're preparing your items for shipment.";
      case "shipped":
        return "Your order is on its way! Track your shipment for delivery updates.";
      case "delivered":
        return "Order delivered! Thank you for your purchase.";
      case "rejected":
        return "Unfortunately, your order was rejected. You will receive a full refund within 5-7 business days.";
      default:
        return status;
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      message.loading({ content: "Generating invoice...", key: "invoice" });
      const res = await fetch(`/api/orders/${orderId}/invoice`);

      if (!res.ok) {
        throw new Error("Failed to generate invoice");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${order?.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success({ content: "Invoice downloaded!", key: "invoice" });
    } catch (error) {
      console.error("Error downloading invoice:", error);
      message.error({ content: "Failed to download invoice", key: "invoice" });
    }
  };

  if (!mounted || isLoading) {
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
          <div className="max-w-4xl mx-auto">
            <Button variant="outline" asChild className="mb-4">
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">Order not found</p>
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
                {order.orderNumber}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Status Info */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <p className="text-blue-900 dark:text-blue-100">
                {getStatusDescription(order.status)}
              </p>
            </CardContent>
          </Card>

          {/* Order Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Steps
                current={
                  order.status === "pending"
                    ? 0
                    : order.status === "payment_received"
                    ? 1
                    : order.status === "accepted"
                    ? 2
                    : order.status === "shipped"
                    ? 3
                    : order.status === "delivered"
                    ? 4
                    : 0
                }
                items={getOrderSteps(order.status)}
              />
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {(order.status === "shipped" || order.status === "delivered") && order.trackingNumber && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle>Tracking Information</CardTitle>
                <CardDescription>
                  {order.status === "shipped"
                    ? "Your order is on its way!"
                    : "Your order has been delivered"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-semibold text-sm sm:text-lg break-all">{order.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Shipping Carrier</p>
                    <p className="font-semibold text-sm sm:text-base">{order.shippingCarrier}</p>
                  </div>
                  {order.shippedAt && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Shipped On</p>
                      <p className="font-semibold text-xs sm:text-base">
                        {new Date(order.shippedAt).toLocaleDateString()}<br className="sm:hidden" />{" "}
                        <span className="text-xs sm:text-sm">{new Date(order.shippedAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Delivered On</p>
                      <p className="font-semibold text-xs sm:text-base">
                        {new Date(order.deliveredAt).toLocaleDateString()}<br className="sm:hidden" />{" "}
                        <span className="text-xs sm:text-sm">{new Date(order.deliveredAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  )}
                </div>
                {order.trackingUrl && (
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Track Your Shipment →
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
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
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm sm:text-base break-words">{item.productName}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="sm:text-right flex sm:flex-col justify-between sm:justify-end gap-2">
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground sm:hidden">Unit Price:</p>
                            <p className="font-semibold text-sm sm:text-base">
                              ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Total:</p>
                            <p className="font-semibold text-sm sm:text-base">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
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
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {order.shippingAddress}
                    </p>
                    <p className="text-xs sm:text-sm font-medium mt-2 break-words">
                      {order.shippingCity}, {order.shippingState}{" "}
                      {order.shippingPincode}
                    </p>
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
                      <span className="text-sm font-bold">
                        {getPaymentPercentage()}%
                      </span>
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
                  {order.status === "pending" && (
                    <p className="text-xs text-red-600 pt-2">
                      Please complete payment to proceed with order processing
                    </p>
                  )}
                  {order.status === "payment_received" && (
                    <p className="text-xs text-yellow-600 pt-2">
                      Remaining amount will be collected after order approval
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                {order.status === "pending" && (
                  <Button className="w-full" asChild>
                    <Link href={`/checkout/payment?orderId=${order.id}`}>
                      Complete Payment
                    </Link>
                  </Button>
                )}
                {order.status !== "pending" && order.paidAmount > 0 && (
                  <Button
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleDownloadInvoice}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/orders">View All Orders</Link>
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

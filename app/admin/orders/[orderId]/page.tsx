"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { message } from "antd";
import { ArrowLeft, Check, X } from "lucide-react";
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
  items: any[];
}

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { status: sessionStatus, data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { orderId } = params;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not admin
  if (mounted && (sessionStatus === "unauthenticated" || session?.user?.role !== "admin")) {
    redirect("/login");
  }

  // Fetch order details
  useEffect(() => {
    if (!mounted || sessionStatus !== "authenticated") return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else if (res.status === 404) {
          message.error("Order not found");
          router.push("/admin/orders");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        message.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [mounted, sessionStatus, orderId, router]);

  const handleApprove = async () => {
    if (!order) return;

    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          adminNotes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to approve order");
      }

      message.success("Order approved successfully!");
      setTimeout(() => router.push("/admin/orders"), 2000);
    } catch (error) {
      console.error("Error approving order:", error);
      message.error(error instanceof Error ? error.message : "Failed to approve order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!order || !rejectionReason.trim()) {
      message.error("Please provide a rejection reason");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason,
          adminNotes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reject order");
      }

      message.success("Order rejected. Customer will be notified for refund.");
      setTimeout(() => router.push("/admin/orders"), 2000);
    } catch (error) {
      console.error("Error rejecting order:", error);
      message.error(error instanceof Error ? error.message : "Failed to reject order");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "payment_received":
        return <Badge className="bg-yellow-600 text-lg px-3 py-1">Payment Received</Badge>;
      case "accepted":
        return <Badge className="bg-green-600 text-lg px-3 py-1">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 text-lg px-3 py-1">Rejected</Badge>;
      default:
        return <Badge className="text-lg px-3 py-1">{status}</Badge>;
    }
  };

  const getPaymentPercentage = () => {
    if (!order) return 0;
    return Math.round((order.paidAmount / order.total) * 100);
  };

  if (!mounted || isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">Order not found</p>
        <Button asChild>
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order {order.orderNumber}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              {getStatusBadge(order.status)}
              <span className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.items.length} item(s) in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{(item.price * item.quantity).toLocaleString()} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold">{order.shippingName}</p>
                <p className="text-sm text-muted-foreground">{order.shippingEmail}</p>
                <p className="text-sm text-muted-foreground">{order.shippingPhone}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm whitespace-pre-wrap">{order.shippingAddress}</p>
                <p className="text-sm font-medium mt-2">
                  {order.shippingCity}, {order.shippingState} {order.shippingPincode}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
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
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg">₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Payment Received</span>
                  <span className="text-sm font-bold">{getPaymentPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${getPaymentPercentage()}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid Amount</span>
                  <span className="font-semibold">
                    ₹{order.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-semibold text-orange-600">
                    ₹{(order.total - order.paidAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Only if order is pending approval */}
          {order.status === "payment_received" && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-base">Admin Actions</CardTitle>
                <CardDescription>
                  Review and approve/reject this order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Notes */}
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes for this order..."
                    className="w-full p-2 border rounded-md text-sm mt-2"
                    rows={3}
                  />
                </div>

                {/* Approve Button */}
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : "Approve Order"}
                </Button>

                {/* Reject Button */}
                <Button
                  onClick={() => setActionType("reject")}
                  disabled={isProcessing}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      {actionType === "reject" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Order</CardTitle>
              <CardDescription>
                Customer will be notified and refunded
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this order is being rejected..."
                  className="w-full p-2 border rounded-md text-sm mt-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setActionType(null);
                    setRejectionReason("");
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {isProcessing ? "Processing..." : "Reject"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

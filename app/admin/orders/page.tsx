"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { message } from "antd";
import { Eye, Check, X } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  paidAmount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: any[];
}

export default function OrdersPage() {
  const { status: sessionStatus, data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not admin
  if (mounted && (sessionStatus === "unauthenticated" || session?.user?.role !== "admin")) {
    redirect("/login");
  }

  // Fetch pending orders
  useEffect(() => {
    if (!mounted || sessionStatus !== "authenticated") return;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/orders?status=payment_received");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.data);
        } else {
          message.error("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        message.error("Error loading orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [mounted, sessionStatus]);

  const handleApprove = async (order: Order) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          adminNotes: adminNotes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to approve order");
      }

      message.success("Order approved successfully!");

      // Remove from list
      setOrders(orders.filter((o) => o.id !== order.id));
      setSelectedOrder(null);
      setActionType(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error approving order:", error);
      message.error(error instanceof Error ? error.message : "Failed to approve order");
    }
  };

  const handleReject = async (order: Order) => {
    if (!rejectionReason.trim()) {
      message.error("Please provide a rejection reason");
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason,
          adminNotes: adminNotes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reject order");
      }

      message.success("Order rejected. Customer will be notified for refund.");

      // Remove from list
      setOrders(orders.filter((o) => o.id !== order.id));
      setSelectedOrder(null);
      setActionType(null);
      setRejectionReason("");
      setAdminNotes("");
    } catch (error) {
      console.error("Error rejecting order:", error);
      message.error(error instanceof Error ? error.message : "Failed to reject order");
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "payment_received":
        return <Badge className="bg-yellow-600">Payment Received</Badge>;
      case "accepted":
        return <Badge className="bg-green-600">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-600">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentPercentage = (paid: number, total: number) => {
    return Math.round((paid / total) * 100);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-900">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <AdminBreadcrumb />
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            Review and approve pending orders with payments received
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Orders</CardTitle>
          <CardDescription>
            {orders.length} order(s) awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search by order number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No orders matching your search" : "No pending orders"}
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            ₹{(order.paidAmount || 0).toLocaleString()} ({getPaymentPercentage(order.paidAmount || 0, order.total || 1)}%)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Remaining: ₹{((order.total || 0) - (order.paidAmount || 0)).toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{(order.total || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedOrder(order);
                              setActionType("approve");
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setActionType("reject");
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Approve Dialog */}
      {selectedOrder && actionType === "approve" && (
        <AlertDialog open={true} onOpenChange={() => setSelectedOrder(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will approve order {selectedOrder.orderNumber} and move it to processing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for this order..."
                  className="w-full p-2 border rounded-md text-sm mt-2"
                  rows={3}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSelectedOrder(null);
                setAdminNotes("");
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedOrder) {
                    handleApprove(selectedOrder);
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reject Dialog */}
      {selectedOrder && actionType === "reject" && (
        <AlertDialog open={true} onOpenChange={() => setSelectedOrder(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Customer will be notified and refunded for order {selectedOrder.orderNumber}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
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
              <div>
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full p-2 border rounded-md text-sm mt-2"
                  rows={2}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSelectedOrder(null);
                setRejectionReason("");
                setAdminNotes("");
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedOrder) {
                    handleReject(selectedOrder);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      </main>
      <Footer />
    </div>
  );
}

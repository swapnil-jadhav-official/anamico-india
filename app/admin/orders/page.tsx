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
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not admin
  if (mounted && (sessionStatus === "unauthenticated" || session?.user?.role !== "admin")) {
    redirect("/login");
  }

  // Fetch orders (with status filter)
  useEffect(() => {
    if (!mounted || sessionStatus !== "authenticated") return;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // Fetch all orders or filter by status
        const url = statusFilter === "all"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${statusFilter}`;
        const res = await fetch(url);
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
  }, [mounted, sessionStatus, statusFilter]);

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

      // Refresh orders list
      const url = statusFilter === "all"
        ? "/api/admin/orders"
        : `/api/admin/orders?status=${statusFilter}`;
      const refreshRes = await fetch(url);
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setOrders(data.data);
      }

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

      // Refresh orders list
      const url = statusFilter === "all"
        ? "/api/admin/orders"
        : `/api/admin/orders?status=${statusFilter}`;
      const refreshRes = await fetch(url);
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setOrders(data.data);
      }

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
      case "pending":
        return <Badge className="bg-gray-600">Pending Payment</Badge>;
      case "payment_received":
        return <Badge className="bg-yellow-600">Payment Received</Badge>;
      case "accepted":
        return <Badge className="bg-green-600">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-600">Rejected</Badge>;
      case "shipped":
        return <Badge className="bg-blue-600">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-green-700">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    if (status === "all") return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const getPaymentPercentage = (paid: number, total: number) => {
    const percentage = Math.round((paid / total) * 100);
    // If payment is 95% or more, consider it as 100% (due to 5% discount)
    return percentage >= 95 ? 100 : percentage;
  };

  const getRemainingAmount = (paid: number, total: number) => {
    const percentage = (paid / total) * 100;
    // If payment is 94% or more, no remaining amount (paid with discount - accounting for 5% discount)
    if (percentage >= 94) return 0;
    return total - paid;
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
            View and manage all orders
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {orders.length} order(s) {statusFilter !== "all" && `with status: ${statusFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex gap-2 flex-wrap border-b pb-4">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All Orders ({orders.length})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className={statusFilter === "pending" ? "" : "hover:bg-gray-100"}
            >
              Pending Payment
            </Button>
            <Button
              variant={statusFilter === "payment_received" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("payment_received")}
              className={statusFilter === "payment_received" ? "bg-yellow-600 hover:bg-yellow-700" : "hover:bg-yellow-50"}
            >
              Awaiting Approval
            </Button>
            <Button
              variant={statusFilter === "accepted" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("accepted")}
              className={statusFilter === "accepted" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
            >
              Accepted
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("rejected")}
              className={statusFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50"}
            >
              Rejected
            </Button>
            <Button
              variant={statusFilter === "shipped" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("shipped")}
              className={statusFilter === "shipped" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}
            >
              Shipped
            </Button>
            <Button
              variant={statusFilter === "delivered" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("delivered")}
              className={statusFilter === "delivered" ? "bg-green-700 hover:bg-green-800" : "hover:bg-green-50"}
            >
              Delivered
            </Button>
          </div>

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
              {searchTerm
                ? "No orders matching your search"
                : statusFilter === "all"
                  ? "No orders yet"
                  : `No orders with status: ${statusFilter}`}
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
                          {getRemainingAmount(order.paidAmount || 0, order.total || 1) > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Remaining (COD): ₹{getRemainingAmount(order.paidAmount || 0, order.total || 1).toLocaleString()}
                            </p>
                          ) : (
                            <p className="text-xs text-green-600">
                              Fully Paid (with discount)
                            </p>
                          )}
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
                          {order.status === "payment_received" && (
                            <>
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
                            </>
                          )}
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

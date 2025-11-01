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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { message, Pagination } from "antd";
import { Eye, Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  createdAt: string;
  items: any[];
}

export default function OrdersPage() {
  const { status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  if (mounted && sessionStatus === "unauthenticated") {
    redirect("/login");
  }

  // Fetch user's orders
  useEffect(() => {
    if (!mounted || sessionStatus !== "authenticated") return;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          // Sort by newest first
          const sortedOrders = data.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
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

  // Handle search
  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-gray-600">Pending Payment</Badge>;
      case "payment_received":
        return <Badge className="bg-yellow-600">Under Review</Badge>;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-gray-600" />;
      case "payment_received":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "accepted":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "shipped":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-700" />;
      default:
        return null;
    }
  };

  const getPaymentPercentage = (paid: number, total: number) => {
    return Math.round((paid / total) * 100);
  };

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground">
              View and track all your orders in one place
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <Input
                placeholder="Search by order number or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${orders.length} order(s) total`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't placed any orders yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/products">Start Shopping</Link>
                  </Button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders matching your search
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Link
                                href={`/orders/${order.id}`}
                                className="font-semibold hover:text-primary transition-colors"
                              >
                                {order.orderNumber}
                              </Link>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                {getStatusBadge(order.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">
                                  {getPaymentPercentage(order.paidAmount || 0, order.total)}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ₹{(order.paidAmount || 0).toLocaleString()} / ₹{order.total.toLocaleString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{order.total.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/orders/${order.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {filteredOrders.length > pageSize && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredOrders.length}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

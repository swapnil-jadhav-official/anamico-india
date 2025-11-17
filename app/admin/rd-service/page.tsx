"use client";

import { useEffect, useState } from "react";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Registration {
  id: string;
  registrationNumber: string;
  customerName: string;
  email: string;
  mobile: string;
  deviceName: string;
  deviceModel: string;
  serialNumber: string;
  rdSupport: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  adminNotes?: string;
}

export default function RDServiceAdminPage() {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    Registration[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/rd-service");

      if (!response.ok) {
        throw new Error("Failed to fetch registrations");
      }

      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: "Failed to fetch registrations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.registrationNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reg.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((reg) => reg.status === statusFilter);
    }

    setFilteredRegistrations(filtered);
  };

  const handleUpdateRegistration = async () => {
    if (!selectedRegistration) return;

    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/rd-service", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedRegistration.id,
          status: updateStatus || selectedRegistration.status,
          adminNotes: updateNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update registration");
      }

      toast({
        title: "Update Successful",
        description: "Registration has been updated successfully.",
      });
      setSelectedRegistration(null);
      setUpdateStatus("");
      setUpdateNotes("");
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating registration:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update registration. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: { label: string; variant: any };
    } = {
      pending: { label: "Pending", variant: "secondary" },
      payment_received: { label: "Payment Received", variant: "default" },
      processing: { label: "Processing", variant: "default" },
      completed: { label: "Completed", variant: "default" },
      cancelled: { label: "Cancelled", variant: "destructive" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary",
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: { label: string; variant: any; icon: any };
    } = {
      pending: {
        label: "Pending",
        variant: "secondary",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      completed: {
        label: "Completed",
        variant: "default",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      failed: {
        label: "Failed",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary",
      icon: null,
    };
    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    paymentReceived: registrations.filter(
      (r) => r.status === "payment_received"
    ).length,
    processing: registrations.filter((r) => r.status === "processing").length,
    completed: registrations.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <AdminBreadcrumb />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Payment Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paymentReceived}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>RD Service Registrations</CardTitle>
            <CardDescription>
              Manage and track all RD service device registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by registration #, name, email, or serial number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="payment_received">
                      Payment Received
                    </SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Registrations Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No registrations found
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg. Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Support</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">
                          {registration.registrationNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {registration.customerName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {registration.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {registration.mobile}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {registration.deviceName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {registration.deviceModel}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {registration.serialNumber}
                        </TableCell>
                        <TableCell>
                          {registration.rdSupport === "1"
                            ? "1 Year"
                            : registration.rdSupport === "2"
                            ? "2 Years"
                            : "3 Years"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{registration.total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(registration.paymentStatus)}
                        </TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(registration.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRegistration(registration);
                                  setUpdateStatus(registration.status);
                                  setUpdateNotes(registration.adminNotes || "");
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Registration Details -{" "}
                                  {selectedRegistration?.registrationNumber}
                                </DialogTitle>
                                <DialogDescription>
                                  View and update RD service registration
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRegistration && (
                                <div className="space-y-6">
                                  {/* Customer Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Customer Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Name:
                                        </span>
                                        <p className="font-medium">
                                          {selectedRegistration.customerName}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Email:
                                        </span>
                                        <p className="font-medium">
                                          {selectedRegistration.email}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Mobile:
                                        </span>
                                        <p className="font-medium">
                                          {selectedRegistration.mobile}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Device Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Device Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Device Name:
                                        </span>
                                        <p className="font-medium">
                                          {selectedRegistration.deviceName}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Model:
                                        </span>
                                        <p className="font-medium">
                                          {selectedRegistration.deviceModel}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Serial Number:
                                        </span>
                                        <p className="font-medium font-mono">
                                          {selectedRegistration.serialNumber}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Support:
                                        </span>
                                        <p className="font-medium">
                                          {selectedRegistration.rdSupport === "1"
                                            ? "1 Year"
                                            : selectedRegistration.rdSupport ===
                                              "2"
                                            ? "2 Years"
                                            : "3 Years"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Payment Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Total Amount:
                                        </span>
                                        <p className="font-semibold text-lg">
                                          ₹
                                          {selectedRegistration.total.toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Payment Status:
                                        </span>
                                        <div className="mt-1">
                                          {getPaymentStatusBadge(
                                            selectedRegistration.paymentStatus
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Update Status */}
                                  <div className="space-y-4 border-t pt-4">
                                    <div>
                                      <Label htmlFor="status">
                                        Update Status
                                      </Label>
                                      <Select
                                        value={updateStatus}
                                        onValueChange={setUpdateStatus}
                                      >
                                        <SelectTrigger id="status">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">
                                            Pending
                                          </SelectItem>
                                          <SelectItem value="payment_received">
                                            Payment Received
                                          </SelectItem>
                                          <SelectItem value="processing">
                                            Processing
                                          </SelectItem>
                                          <SelectItem value="completed">
                                            Completed
                                          </SelectItem>
                                          <SelectItem value="cancelled">
                                            Cancelled
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label htmlFor="notes">Admin Notes</Label>
                                      <Textarea
                                        id="notes"
                                        value={updateNotes}
                                        onChange={(e) =>
                                          setUpdateNotes(e.target.value)
                                        }
                                        placeholder="Add notes about this registration..."
                                        rows={4}
                                      />
                                    </div>

                                    <Button
                                      onClick={handleUpdateRegistration}
                                      disabled={isUpdating}
                                      className="w-full"
                                    >
                                      {isUpdating ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Updating...
                                        </>
                                      ) : (
                                        "Update Registration"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

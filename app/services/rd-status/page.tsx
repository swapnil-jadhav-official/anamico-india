"use client";

import { useState } from "react";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Search,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegistrationStatus {
  registrationNumber: string;
  customerName: string;
  email: string;
  mobile: string;
  deviceName: string;
  deviceModel: string;
  serialNumber: string;
  rdSupport: string;
  amcSupport: string;
  status: string;
  paymentStatus: string;
  registrationDate: string;
  expiryDate: string;
  validityYears: number;
  remainingDays: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export default function RDStatusPage() {
  const { toast } = useToast();
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus | null>(null);
  const [error, setError] = useState("");

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setRegistrationStatus(null);

    try {
      const response = await fetch("/api/rd-service/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check status");
      }

      const data = await response.json();
      setRegistrationStatus(data.registration);
      toast({
        title: "Status Retrieved",
        description: "Your registration details have been found successfully.",
      });
    } catch (error) {
      console.error("Error checking status:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to check registration status";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Status Check Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: { label: string; variant: any; icon: any };
    } = {
      pending: {
        label: "Pending",
        variant: "secondary",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      payment_received: {
        label: "Payment Received",
        variant: "default",
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      },
      processing: {
        label: "Processing",
        variant: "default",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      completed: {
        label: "Active",
        variant: "default",
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      },
      cancelled: {
        label: "Cancelled",
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
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getValidityStatus = () => {
    if (!registrationStatus) return null;

    if (registrationStatus.isExpired) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Service Expired</h3>
            <p className="text-sm text-red-700 mt-1">
              Your RD service has expired. Please renew to continue using the
              service.
            </p>
          </div>
        </div>
      );
    }

    if (registrationStatus.isExpiringSoon) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">
              Expiring Soon ({registrationStatus.remainingDays} days left)
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your RD service will expire soon. Renew now to avoid service
              interruption.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900">
            Service Active ({registrationStatus.remainingDays} days remaining)
          </h3>
          <p className="text-sm text-green-700 mt-1">
            Your RD service is active and valid until{" "}
            {new Date(registrationStatus.expiryDate).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ECommerceHeader />
      <main className="flex-1">
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">
            Check RD Service Status
          </h1>
          <p className="text-lg opacity-90">
            Verify your registration details and validity period
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Check Status Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Check Registration Status</CardTitle>
              <CardDescription>
                Enter your registration number and email ID to check your RD
                service status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckStatus} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">
                      Registration Number *
                    </Label>
                    <Input
                      id="registrationNumber"
                      placeholder="RD-XXXXXX"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email ID *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Status...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Check Now
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Registration Status Display */}
          {registrationStatus && (
            <div className="space-y-6">
              {/* Validity Status Alert */}
              {getValidityStatus()}

              {/* Registration Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Registration Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      Basic Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Registration Number:
                        </span>
                        <p className="font-semibold">
                          {registrationStatus.registrationNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Customer Name:
                        </span>
                        <p className="font-semibold">
                          {registrationStatus.customerName}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-semibold">
                          {registrationStatus.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mobile:</span>
                        <p className="font-semibold">
                          {registrationStatus.mobile}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Device Information */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      Device Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Device Name:
                        </span>
                        <p className="font-semibold">
                          {registrationStatus.deviceName}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-semibold">
                          {registrationStatus.deviceModel}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Serial Number:
                        </span>
                        <p className="font-semibold font-mono">
                          {registrationStatus.serialNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="mt-1">
                          {getStatusBadge(registrationStatus.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Service Details */}
                  <div>
                    <h3 className="font-semibold mb-3">Service Details</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          RD Support:
                        </span>
                        <p className="font-semibold">
                          {registrationStatus.validityYears}{" "}
                          {registrationStatus.validityYears === 1
                            ? "Year"
                            : "Years"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          AMC Support:
                        </span>
                        <p className="font-semibold">
                          {registrationStatus.amcSupport || "None"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Registration Date:
                        </span>
                        <p className="font-semibold">
                          {new Date(
                            registrationStatus.registrationDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Expiry Date:
                        </span>
                        <p
                          className={`font-semibold ${
                            registrationStatus.isExpired
                              ? "text-red-600"
                              : registrationStatus.isExpiringSoon
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {new Date(
                            registrationStatus.expiryDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Renewal Notice */}
                  {(registrationStatus.isExpired ||
                    registrationStatus.isExpiringSoon) && (
                    <>
                      <Separator />
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Need to Renew?
                        </h3>
                        <p className="text-sm text-blue-700 mb-3">
                          Contact our support team to renew your RD service and
                          continue using your device without interruption.
                        </p>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>
                            <strong>WhatsApp:</strong> +91 84343 84343
                          </p>
                          <p>
                            <strong>Email:</strong> support@anamicoindia.com
                          </p>
                          <p>
                            <strong>Business Hours:</strong> Mon-Sat, 10 AM - 6
                            PM
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Information Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Understanding RD Service Validity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Validity Periods
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>1 Year:</strong> Ideal for occasional users and
                    small businesses
                  </li>
                  <li>
                    <strong>2 Years:</strong> Recommended for regular users with
                    moderate usage
                  </li>
                  <li>
                    <strong>3 Years:</strong> Best value for heavy users and
                    enterprises
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Why RD Service Status Matters
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Ensures UIDAI compliance for biometric authentication
                  </li>
                  <li>Maintains continuous service without interruption</li>
                  <li>
                    Enables timely renewal before expiration
                  </li>
                  <li>Validates device registration with authorities</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  If Your Service Expires
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Device will stop working for authentication</li>
                  <li>
                    Cannot be used for Aadhaar-based services
                  </li>
                  <li>May require re-registration with authorities</li>
                  <li>
                    Business operations may be affected
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  How to Renew
                </h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Contact support before expiry date</li>
                  <li>Provide your registration number</li>
                  <li>Choose renewal duration (1/2/3 years)</li>
                  <li>Complete payment process</li>
                  <li>Receive updated validity confirmation</li>
                </ol>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Need Help?
                </h3>
                <p className="mb-2">
                  For any queries regarding your RD service registration or
                  renewal, our support team is ready to assist you.
                </p>
                <div className="space-y-1">
                  <p>
                    <strong>Toll-free:</strong> +91 84343 84343
                  </p>
                  <p>
                    <strong>Email:</strong> support@anamicoindia.com
                  </p>
                  <p>
                    <strong>WhatsApp:</strong> +91 84343 84343
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}

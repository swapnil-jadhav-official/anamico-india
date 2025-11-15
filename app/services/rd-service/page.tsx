"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Shield, Truck, RotateCcw } from "lucide-react";

// Indian states
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Device options
const DEVICE_OPTIONS = [
  { name: "Mantra", models: ["MFS110", "MFS100", "MIS100"] },
  { name: "Morpho", models: ["MSO 1300 E3", "MSO 1350 E3"] },
  { name: "Startek", models: ["FM220", "FM220U"] },
  { name: "Iritech", models: ["IriShield MK2120U"] },
  { name: "Precision", models: ["PB1000 L1", "PB 510"] },
  { name: "Mantra Iris", models: ["IRIS MIS100 V2"] }
];

export default function RDServicePage() {
  const [formData, setFormData] = useState({
    email: "",
    customerName: "",
    mobile: "",
    address: "",
    state: "",
    district: "",
    pincode: "",
    deviceName: "",
    deviceModel: "",
    serialNumber: "",
    gstNumber: "",
    showGst: false,
    rdSupport: "1",
    amcSupport: "",
    callbackService: false,
    deliveryType: "regular",
    acceptTerms: false,
  });

  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [pricing, setPricing] = useState({
    deviceFee: 1500,
    supportFee: 0,
    deliveryFee: 0,
    subtotal: 0,
    gst: 0,
    total: 0,
  });

  const calculatePricing = () => {
    const supportFees: { [key: string]: number } = {
      "1": 1500,
      "2": 2800,
      "3": 4000,
    };

    const amcFees: { [key: string]: number } = {
      "standard-1": 500,
      "standard-2": 900,
      "standard-3": 1200,
      "comprehensive-1": 1000,
      "comprehensive-2": 1800,
      "comprehensive-3": 2500,
    };

    const supportFee = supportFees[formData.rdSupport] || 0;
    const amcFee = formData.amcSupport ? amcFees[formData.amcSupport] || 0 : 0;
    const deliveryFee = formData.deliveryType === "express" ? 200 : 100;

    const subtotal = pricing.deviceFee + supportFee + amcFee + deliveryFee;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;

    setPricing({
      deviceFee: pricing.deviceFee,
      supportFee: supportFee + amcFee,
      deliveryFee,
      subtotal,
      gst,
      total,
    });
  };

  const handleDeviceChange = (value: string) => {
    setSelectedDevice(value);
    setFormData({ ...formData, deviceName: value, deviceModel: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    // TODO: Implement form submission
    console.log("Form submitted:", formData);
    alert("Thank you for your registration! We will contact you shortly.");
  };

  // Calculate pricing whenever relevant fields change
  const handleFieldChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Recalculate pricing
    setTimeout(() => calculatePricing(), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">RD Service Registration</h1>
          <p className="text-lg opacity-90">
            Hassle-free Registered Device Service (RDS) for Biometric Devices
          </p>
          <p className="mt-2 opacity-80">
            Supporting Morpho, Mantra, Startek, Secugen and other devices
          </p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Authentic Product</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Register Your Biometric Device</CardTitle>
                <CardDescription>
                  Please fill in all the required information to register your RD service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email ID *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => handleFieldChange("email", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerName">Customer Name *</Label>
                          <Input
                            id="customerName"
                            placeholder="Full Name"
                            value={formData.customerName}
                            onChange={(e) => handleFieldChange("customerName", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number *</Label>
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={formData.mobile}
                          onChange={(e) => handleFieldChange("mobile", e.target.value)}
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Full Address *</Label>
                        <Input
                          id="address"
                          placeholder="Complete address with landmark"
                          value={formData.address}
                          onChange={(e) => handleFieldChange("address", e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Select
                            value={formData.state}
                            onValueChange={(value) => handleFieldChange("state", value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district">District *</Label>
                          <Input
                            id="district"
                            placeholder="District"
                            value={formData.district}
                            onChange={(e) => handleFieldChange("district", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            placeholder="6-digit pincode"
                            value={formData.pincode}
                            onChange={(e) => handleFieldChange("pincode", e.target.value)}
                            pattern="[0-9]{6}"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Device Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Device Details</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deviceName">Device Name *</Label>
                          <Select
                            value={selectedDevice}
                            onValueChange={handleDeviceChange}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Device" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEVICE_OPTIONS.map((device) => (
                                <SelectItem key={device.name} value={device.name}>
                                  {device.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deviceModel">Device Model *</Label>
                          <Select
                            value={formData.deviceModel}
                            onValueChange={(value) => handleFieldChange("deviceModel", value)}
                            disabled={!selectedDevice}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedDevice &&
                                DEVICE_OPTIONS.find((d) => d.name === selectedDevice)?.models.map(
                                  (model) => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  )
                                )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="serialNumber">Machine Serial Number *</Label>
                        <Input
                          id="serialNumber"
                          placeholder="Enter device serial number"
                          value={formData.serialNumber}
                          onChange={(e) => handleFieldChange("serialNumber", e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Serial number must be from authorized OEM suppliers
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showGst"
                          checked={formData.showGst}
                          onCheckedChange={(checked) =>
                            handleFieldChange("showGst", checked)
                          }
                        />
                        <Label htmlFor="showGst" className="font-normal cursor-pointer">
                          I have GST Number
                        </Label>
                      </div>

                      {formData.showGst && (
                        <div className="space-y-2">
                          <Label htmlFor="gstNumber">GST Number</Label>
                          <Input
                            id="gstNumber"
                            placeholder="15-digit GST Number"
                            value={formData.gstNumber}
                            onChange={(e) => handleFieldChange("gstNumber", e.target.value)}
                            pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Service Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Service Selection</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rdSupport">RD Technical Support *</Label>
                        <Select
                          value={formData.rdSupport}
                          onValueChange={(value) => handleFieldChange("rdSupport", value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year - ₹1,500</SelectItem>
                            <SelectItem value="2">2 Years - ₹2,800</SelectItem>
                            <SelectItem value="3">3 Years - ₹4,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Includes Driver Installation, OS Settings (Windows only), and Portal
                          Application Assistance
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amcSupport">AMC Support (Optional)</Label>
                        <Select
                          value={formData.amcSupport}
                          onValueChange={(value) => handleFieldChange("amcSupport", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select AMC Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard-1">Standard - 1 Year (₹500)</SelectItem>
                            <SelectItem value="standard-2">Standard - 2 Years (₹900)</SelectItem>
                            <SelectItem value="standard-3">Standard - 3 Years (₹1,200)</SelectItem>
                            <SelectItem value="comprehensive-1">
                              Comprehensive - 1 Year (₹1,000)
                            </SelectItem>
                            <SelectItem value="comprehensive-2">
                              Comprehensive - 2 Years (₹1,800)
                            </SelectItem>
                            <SelectItem value="comprehensive-3">
                              Comprehensive - 3 Years (₹2,500)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Standard: Software updates, remote troubleshooting, annual wire replacement
                          <br />
                          Comprehensive: Includes repair/parts up to ₹500 with no extra charges
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="callbackService"
                          checked={formData.callbackService}
                          onCheckedChange={(checked) =>
                            handleFieldChange("callbackService", checked)
                          }
                        />
                        <Label htmlFor="callbackService" className="font-normal cursor-pointer">
                          Request Call Back Service
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Delivery Options */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Delivery Options</h3>
                    <div className="space-y-2">
                      <Label>Delivery Type *</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="regular"
                            name="deliveryType"
                            value="regular"
                            checked={formData.deliveryType === "regular"}
                            onChange={(e) => handleFieldChange("deliveryType", e.target.value)}
                            className="cursor-pointer"
                          />
                          <Label htmlFor="regular" className="font-normal cursor-pointer">
                            Regular (5-7 days) - ₹100
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="express"
                            name="deliveryType"
                            value="express"
                            checked={formData.deliveryType === "express"}
                            onChange={(e) => handleFieldChange("deliveryType", e.target.value)}
                            className="cursor-pointer"
                          />
                          <Label htmlFor="express" className="font-normal cursor-pointer">
                            Express (2-3 days) - ₹200
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Terms and Submit */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) =>
                          handleFieldChange("acceptTerms", checked)
                        }
                        required
                      />
                      <Label htmlFor="acceptTerms" className="font-normal cursor-pointer text-sm">
                        I accept the{" "}
                        <a href="#" className="text-primary hover:underline">
                          Terms & Conditions
                        </a>
                        . I understand that alteration of details once submitted will not be
                        allowed.
                      </Label>
                    </div>

                    <Button type="submit" size="lg" className="w-full" onClick={calculatePricing}>
                      Register Now
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Alteration of details once submitted will not be allowed</p>
                <p>• Device must be from authorized OEM suppliers</p>
                <p>• Serial number validation on manufacturer's server required</p>
                <p>• Refund policy for invalid serial numbers: 3-4 working days</p>
                <p>• L0 device sunset notice: June 1, 2025</p>
                <p>
                  • For serial number issues, contact us on WhatsApp: +91 84343 84343
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Device Fee</span>
                    <span>₹{pricing.deviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Support Fee</span>
                    <span>₹{pricing.supportFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₹{pricing.deliveryFee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{pricing.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (18%)</span>
                    <span>₹{pricing.gst.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{pricing.total.toLocaleString()}</span>
                  </div>
                </div>

                <Badge className="w-full justify-center py-2" variant="secondary">
                  UIDAI Compliant
                </Badge>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Support Information:</p>
                  <p>WhatsApp: +91 84343 84343</p>
                  <p>Email: support@anamicoindia.com</p>
                  <p>Business Hours: Mon-Sat, 10 AM - 6 PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Device Information Sections */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Supported Devices</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Morpho RD Service</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Support for MSO 1300 E3 and MSO 1350 E3 models. Addresses connectivity errors
                  and whitelisting requirements for UIDAI compliance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mantra RD Service</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Information on MFS110 and MIS100 devices. Comprehensive support for common error
                  codes (211, -215, 1001) and troubleshooting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Startek FM220</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  StarTek fingerprint scanner for UIDAI authentication applications. Fast and
                  reliable biometric capture.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Precision PB1000</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Coverage for PB 1000 L1 and PB 510 devices with 12-digit serial number format
                  starting with "LN" or "H".
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Iritech Devices</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Iris recognition devices for enhanced security. UIDAI compliant iris scanning
                  solutions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mantra Iris</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Advanced iris scanning technology for high-security applications. MIS100 V2
                  series support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

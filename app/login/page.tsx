"use client";

import { useEffect, useState, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OtpInput from "react-otp-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, Smartphone, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.isNewUser) {
        router.push("/register/complete");
      } else if (session?.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Check your email for the OTP code.",
        });
      } else {
        const data = await res.json();
        toast({
          variant: "destructive",
          title: "Failed to send OTP",
          description: data.error || "Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Check your WhatsApp for the OTP code.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send OTP",
          description: data.error || "Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const callbackUrl = session?.user?.role === "admin" ? "/admin/dashboard" : "/";
      const result = await signIn("password", { email, password, callbackUrl, redirect: false });
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error,
        });
      } else if (result?.ok) {
        // Redirect is handled by next-auth if successful and redirect: true
        // Since redirect: false, we handle it manually after successful login
        if (session?.user?.isNewUser) {
          router.push("/register/complete");
        } else if (session?.user?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const otpString = otp.join("");

      if (otpString.length !== 6) {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "Please enter all 6 digits of the OTP.",
        });
        setIsLoading(false);
        return;
      }

      const result = await signIn("otp", {
        email,
        otp: otpString,
        redirect: false
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect. Please try again.",
        });
        console.error("OTP login error:", result.error);
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
      } else if (result?.ok) {
        // Login successful - session will update via useSession hook
        // The useEffect will handle the redirect based on user role
        console.log("OTP login successful");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const otpString = otp.join("");

      if (otpString.length !== 6) {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "Please enter all 6 digits of the OTP.",
        });
        setIsLoading(false);
        return;
      }

      // Verify OTP from WhatsApp
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          otp: otpString,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: verifyData.error || "The OTP you entered is incorrect. Please try again.",
        });
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        setIsLoading(false);
        return;
      }

      // OTP verified, now sign in with phone
      const result = await signIn("phone", {
        phone: phoneNumber,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error,
        });
      } else if (result?.ok) {
        console.log("Phone OTP login successful");
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-balance text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          <Tabs defaultValue="phone-otp" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="otp">Email OTP</TabsTrigger>
              <TabsTrigger value="phone-otp">WhatsApp OTP</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin}>
                <Card className="border-none shadow-none">
                  <CardContent className="space-y-4 p-0 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-password">Email or Mobile</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email-password" type="text" placeholder="name@example.com / 9876543210" required className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          className="pl-10 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Forgot your password? Use the OTP tab to login via email
                      </p>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                      {isLoading ? "Loading..." : "Login"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
            <TabsContent value="otp">
              <form onSubmit={otpSent ? handleLogin : handleSendOtp}>
                <Card className="border-none shadow-none">
                  <CardContent className="space-y-4 p-0 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-otp">Email</Label>
                      <div className="relative">
                         <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email-otp" type="email" placeholder="name@example.com" required className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} disabled={otpSent || isLoading} />
                      </div>
                    </div>
                    {otpSent && (
                      <div className="grid gap-2">
                        <Label className="text-center">Enter 6-Digit OTP</Label>
                        <div className="flex justify-center">
                          <OtpInput
                            value={otp.join("")}
                            onChange={(e) => setOtp(e.split(""))}
                            numInputs={6}
                            shouldAutoFocus
                            renderInput={(props) => (
                              <input
                                {...props}
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  fontSize: "18px",
                                  borderRadius: "4px",
                                  border: "1px solid #ddd",
                                  margin: "0 8px",
                                  textAlign: "center",
                                  fontWeight: "600",
                                }}
                              />
                            )}
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          Enter the OTP sent to your email
                        </p>
                      </div>
                    )}
                    <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                      {isLoading ? "Loading..." : otpSent ? "Verify OTP & Login" : "Send OTP"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
            <TabsContent value="phone-otp">
              <form onSubmit={otpSent ? handlePhoneOtpLogin : handleSendPhoneOtp}>
                <Card className="border-none shadow-none">
                  <CardContent className="space-y-4 p-0 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone-number">Phone Number</Label>
                      <div className="relative">
                         <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone-number"
                          type="tel"
                          placeholder="10-digit mobile number"
                          required
                          className="pl-10"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          disabled={otpSent || isLoading}
                          maxLength={10}
                          pattern="[0-9]{10}"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter your 10-digit mobile number
                      </p>
                    </div>
                    {otpSent && (
                      <div className="grid gap-2">
                        <Label className="text-center">Enter 6-Digit OTP</Label>
                        <div className="flex justify-center">
                          <OtpInput
                            value={otp.join("")}
                            onChange={(e) => setOtp(e.split(""))}
                            numInputs={6}
                            shouldAutoFocus
                            renderInput={(props) => (
                              <input
                                {...props}
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  fontSize: "18px",
                                  borderRadius: "4px",
                                  border: "1px solid #ddd",
                                  margin: "0 8px",
                                  textAlign: "center",
                                  fontWeight: "600",
                                }}
                              />
                            )}
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          Enter the OTP sent to your WhatsApp
                        </p>
                      </div>
                    )}
                    <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                      {isLoading ? "Loading..." : otpSent ? "Verify OTP & Login" : "Send OTP"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
          </Tabs>
           <div className="mt-4 text-center text-sm">
            Go back to{" "}
            <Link href="/" className="underline">
              Home
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/modern-biometric-fingerprint-scanner-device-with-b.jpg"
          alt="A modern biometric fingerprint scanner, representing secure access."
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
        />
      </div>
    </div>
  );
}

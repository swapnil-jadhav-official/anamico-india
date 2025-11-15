"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, MessageSquare, Smartphone } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
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
        alert(result.error);
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
      const result = await signIn("otp", {
        email,
        otp,
        redirect: false
      });

      if (result?.error) {
        alert("Invalid OTP. Please try again.");
        console.error("OTP login error:", result.error);
      } else if (result?.ok) {
        // Login successful - session will update via useSession hook
        // The useEffect will handle the redirect based on user role
        console.log("OTP login successful");
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
            <h1 className="text-3xl font-bold">Admin Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your admin panel
            </p>
          </div>
          <Tabs defaultValue="otp" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="otp">OTP</TabsTrigger>
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
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="ml-auto inline-block text-sm underline">
                          Forgot your password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" required className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                      </div>
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
                        <Label htmlFor="otp">OTP</Label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="otp" type="text" required className="pl-10" placeholder="Enter your 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={isLoading} />
                        </div>
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

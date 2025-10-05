"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, MessageSquare, Smartphone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have validation and an API call here.
    // For this demo, we'll just redirect.
    router.push("/admin");
  };

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
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="otp">OTP</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <form onSubmit={handleLogin}>
                <Card className="border-none shadow-none">
                  <CardContent className="space-y-4 p-0 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-password">Email or Mobile</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email-password" type="text" placeholder="name@example.com / 9876543210" required className="pl-10" />
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
                        <Input id="password" type="password" required className="pl-10" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full mt-4">
                      Login
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
            <TabsContent value="otp">
              <form onSubmit={handleLogin}>
                <Card className="border-none shadow-none">
                  <CardContent className="space-y-4 p-0 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-otp">Email or Mobile</Label>
                      <div className="relative">
                         <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email-otp" type="text" placeholder="name@example.com / 9876543210" required className="pl-10" />
                      </div>
                    </div>
                    <Button type="button" variant="outline" className="w-full">
                      Send OTP
                    </Button>
                    <div className="grid gap-2">
                      <Label htmlFor="otp">OTP</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="otp" type="text" required className="pl-10" placeholder="Enter your 6-digit OTP" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Verify OTP & Login
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

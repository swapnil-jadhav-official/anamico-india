"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchUserProfile = async () => {
        try {
          const res = await fetch(`/api/user/profile?id=${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            setUserData(data);
          } else {
            setError("Failed to fetch user profile");
          }
        } catch (err) {
          setError("Error fetching user profile");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserProfile();
    } else if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "loading") {
      // Still loading session, do nothing
    }
  }, [session, status, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">No user data found.</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          <CardDescription>View and manage your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-2 gap-6">
          <div className="grid gap-1">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</Label>
            <p className="text-base font-medium">{userData.name || "N/A"}</p>
          </div>
          <div className="grid gap-1">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</Label>
            <p className="text-base font-medium">{userData.email || "N/A"}</p>
          </div>
          <div className="grid gap-1">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</Label>
            <p className="text-base font-medium">{userData.phone || "N/A"}</p>
          </div>
          <div className="grid gap-1">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</Label>
            <p className="text-base font-medium">{userData.address || "N/A"}</p>
          </div>
          <div className="grid gap-1">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</Label>
            <p className="text-base font-medium">{userData.role || "N/A"}</p>
          </div>
        </CardContent>
        <div className="flex justify-end p-6 border-t">
          <Button asChild>
            <Link href="/profile/edit">
              Edit Profile
            </Link>
          </Button>
        </div>
      </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

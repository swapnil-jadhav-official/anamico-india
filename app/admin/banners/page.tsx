"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { message } from "antd";
import { Plus, Edit, Trash2, Eye, EyeOff, Info } from "lucide-react";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  placement: string;
  imageUrl: string;
  imageUrlMobile?: string | null;
  linkUrl?: string | null;
  heading?: string | null;
  subheading?: string | null;
  ctaText?: string | null;
  textPosition?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

const PLACEMENT_INFO = {
  hero: {
    name: "Hero Banner",
    description: "Main banner at the top of the landing page",
    size: "1920 x 800 px",
    mobileSize: "800 x 600 px (optional)",
  },
  top_promo: {
    name: "Top Promotional Strip",
    description: "Thin banner strip for announcements and promos",
    size: "1920 x 100 px",
    mobileSize: "800 x 120 px (optional)",
  },
  section: {
    name: "Section Banner",
    description: "Banner between page sections",
    size: "600 x 300 px",
    mobileSize: "400 x 200 px (optional)",
  },
  offer_strip: {
    name: "Offer Strip",
    description: "Mid-page promotional banner",
    size: "1920 x 250 px",
    mobileSize: "800 x 300 px (optional)",
  },
  bottom: {
    name: "Bottom Banner",
    description: "Banner above footer section",
    size: "1920 x 400 px",
    mobileSize: "800 x 500 px (optional)",
  },
};

export default function AdminBannersPage() {
  const { status: sessionStatus, data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlacement, setSelectedPlacement] = useState<string>("all");
  const [showGuidelines, setShowGuidelines] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not admin
  if (mounted && (sessionStatus === "unauthenticated" || session?.user?.role !== "admin")) {
    redirect("/login");
  }

  // Fetch banners
  useEffect(() => {
    if (!mounted || sessionStatus !== "authenticated") return;

    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const url = selectedPlacement === "all"
          ? "/api/admin/banners"
          : `/api/admin/banners?placement=${selectedPlacement}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setBanners(data);
        } else {
          throw new Error("Failed to fetch banners");
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        message.error("Failed to load banners");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [mounted, sessionStatus, selectedPlacement]);

  const handleDelete = async (bannerId: string, bannerTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${bannerTitle}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        message.success("Banner deleted successfully");
        setBanners(banners.filter((b) => b.id !== bannerId));
      } else {
        throw new Error("Failed to delete banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      message.error("Failed to delete banner");
    }
  };

  const toggleActive = async (bannerId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        message.success(`Banner ${!currentStatus ? "activated" : "deactivated"}`);
        setBanners(banners.map((b) =>
          b.id === bannerId ? { ...b, isActive: !currentStatus } : b
        ));
      } else {
        throw new Error("Failed to update banner");
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      message.error("Failed to update banner");
    }
  };

  const getPlacementBadge = (placement: string) => {
    const info = PLACEMENT_INFO[placement as keyof typeof PLACEMENT_INFO];
    return (
      <Badge variant="outline" className="text-xs">
        {info?.name || placement}
      </Badge>
    );
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
              <p className="text-muted-foreground">
                Manage landing page banners and promotional content
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowGuidelines(!showGuidelines)}
              >
                <Info className="h-4 w-4 mr-2" />
                {showGuidelines ? "Hide" : "Show"} Guidelines
              </Button>
              <Button asChild>
                <Link href="/admin/banners/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Banner
                </Link>
              </Button>
            </div>
          </div>

          {/* Size Guidelines */}
          {showGuidelines && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-base">Banner Size Guidelines</CardTitle>
                <CardDescription>
                  Recommended image dimensions for optimal display
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(PLACEMENT_INFO).map(([key, info]) => (
                    <div key={key} className="space-y-2 p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <h4 className="font-semibold">{info.name}</h4>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                      <div className="space-y-1 text-sm">
                        <p><strong>Desktop:</strong> {info.size}</p>
                        <p className="text-muted-foreground">{info.mobileSize}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Placement Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPlacement === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlacement("all")}
            >
              All Placements
            </Button>
            {Object.entries(PLACEMENT_INFO).map(([key, info]) => (
              <Button
                key={key}
                variant={selectedPlacement === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlacement(key)}
              >
                {info.name}
              </Button>
            ))}
          </div>

          {/* Banners List */}
          {banners.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No banners found</p>
                <Button asChild>
                  <Link href="/admin/banners/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Banner
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {banners.map((banner) => (
                <Card key={banner.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Banner Preview */}
                      <div className="lg:col-span-1">
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={banner.imageUrl}
                            alt={banner.altText || banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Banner Info */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{banner.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {getPlacementBadge(banner.placement)}
                              <Badge variant={banner.isActive ? "default" : "secondary"}>
                                {banner.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline">Order: {banner.displayOrder}</Badge>
                            </div>
                          </div>
                        </div>

                        {banner.heading && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Heading:</p>
                            <p className="text-sm">{banner.heading}</p>
                          </div>
                        )}

                        {banner.linkUrl && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Link:</p>
                            <p className="text-sm text-blue-600 truncate">{banner.linkUrl}</p>
                          </div>
                        )}

                        {(banner.startDate || banner.endDate) && (
                          <div className="text-sm">
                            <p className="font-medium text-muted-foreground">Schedule:</p>
                            <p>
                              {banner.startDate && `From: ${new Date(banner.startDate).toLocaleDateString()}`}
                              {banner.startDate && banner.endDate && " | "}
                              {banner.endDate && `To: ${new Date(banner.endDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex lg:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/admin/banners/${banner.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => toggleActive(banner.id, banner.isActive)}
                        >
                          {banner.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(banner.id, banner.title)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

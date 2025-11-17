"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { message } from "antd";
import { ArrowLeft, Upload, Info } from "lucide-react";
import Link from "next/link";

const PLACEMENT_INFO = {
  hero: { name: "Hero Banner", size: "1920 x 800 px", mobileSize: "800 x 600 px" },
  top_promo: { name: "Top Promotional Strip", size: "1920 x 100 px", mobileSize: "800 x 120 px" },
  section: { name: "Section Banner", size: "600 x 300 px", mobileSize: "400 x 200 px" },
  offer_strip: { name: "Offer Strip", size: "1920 x 250 px", mobileSize: "800 x 300 px" },
  bottom: { name: "Bottom Banner", size: "1920 x 400 px", mobileSize: "800 x 500 px" },
};

export default function NewBannerPage() {
  const { status: sessionStatus, data: session } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState("hero");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlMobile, setImageUrlMobile] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [textPosition, setTextPosition] = useState("left");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Redirect if not admin
  if (sessionStatus === "unauthenticated" || session?.user?.role !== "admin") {
    redirect("/login");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !imageUrl) {
      message.error("Title and image URL are required");
      return;
    }

    try {
      setIsSaving(true);

      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          placement,
          imageUrl,
          imageUrlMobile: imageUrlMobile || undefined,
          linkUrl: linkUrl || undefined,
          altText: altText || undefined,
          heading: heading || undefined,
          subheading: subheading || undefined,
          ctaText: ctaText || undefined,
          ctaLink: ctaLink || undefined,
          textPosition,
          displayOrder,
          isActive,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create banner");
      }

      message.success("Banner created successfully!");
      router.push("/admin/banners");
    } catch (error) {
      console.error("Error creating banner:", error);
      message.error(error instanceof Error ? error.message : "Failed to create banner");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPlacementInfo = PLACEMENT_INFO[placement as keyof typeof PLACEMENT_INFO];

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <Button variant="outline" asChild className="mb-4">
              <Link href="/admin/banners">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Banners
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Create New Banner</h1>
            <p className="text-muted-foreground">
              Add a new banner to your landing page
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure banner placement and basic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title (Admin Reference) *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Summer Sale Hero Banner"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Placement *</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm mt-2"
                    required
                  >
                    {Object.entries(PLACEMENT_INFO).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                    <p className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                      <Info className="h-4 w-4" />
                      <strong>Recommended Size:</strong>
                    </p>
                    <p className="text-blue-800 dark:text-blue-200 mt-1">
                      Desktop: {selectedPlacementInfo.size}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Mobile: {selectedPlacementInfo.mobileSize} (optional)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower numbers appear first
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active (Show on landing page)
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Image URLs */}
            <Card>
              <CardHeader>
                <CardTitle>Banner Images</CardTitle>
                <CardDescription>
                  Provide image URLs for desktop and mobile views
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Desktop Image URL *</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/banner-desktop.jpg"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload images to your server or use AWS S3 URL
                  </p>
                </div>

                {imageUrl && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={imageUrl}
                      alt="Desktop preview"
                      className="w-full h-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Mobile Image URL (Optional)</label>
                  <input
                    type="url"
                    value={imageUrlMobile}
                    onChange={(e) => setImageUrlMobile(e.target.value)}
                    placeholder="https://example.com/banner-mobile.jpg"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Alt Text (for SEO)</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Text Overlay */}
            <Card>
              <CardHeader>
                <CardTitle>Text Overlay (Optional)</CardTitle>
                <CardDescription>
                  Add text content that appears on top of the banner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Heading</label>
                  <input
                    type="text"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="e.g., Summer Sale - Up to 50% Off"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Subheading</label>
                  <textarea
                    value={subheading}
                    onChange={(e) => setSubheading(e.target.value)}
                    placeholder="Additional description text"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Text Position</label>
                  <select
                    value={textPosition}
                    onChange={(e) => setTextPosition(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm mt-2"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g., Shop Now"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">CTA Button Link</label>
                  <input
                    type="url"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/products or https://example.com"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle>Banner Link (Optional)</CardTitle>
                <CardDescription>
                  Make the entire banner clickable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium">Link URL</label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products or https://example.com"
                    className="w-full p-2 border rounded-md text-sm mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule (Optional)</CardTitle>
                <CardDescription>
                  Set start and end dates for this banner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? "Creating..." : "Create Banner"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
      </div>
    </main>
  );
}

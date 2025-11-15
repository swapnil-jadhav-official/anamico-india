"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  placement: string;
  imageUrl: string;
  imageUrlMobile?: string | null;
  linkUrl?: string | null;
  altText?: string | null;
  heading?: string | null;
  subheading?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  textPosition?: string;
}

interface DynamicBannerProps {
  banner: Banner;
  className?: string;
}

export function DynamicBanner({ banner, className = "" }: DynamicBannerProps) {
  const textAlignClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[banner.textPosition || "left"];

  const BannerContent = () => (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
      {/* Banner Image */}
      <div className="relative w-full">
        <picture>
          {banner.imageUrlMobile && (
            <source media="(max-width: 768px)" srcSet={banner.imageUrlMobile} />
          )}
          <img
            src={banner.imageUrl}
            alt={banner.altText || banner.title}
            className="w-full h-auto object-cover"
          />
        </picture>

        {/* Text Overlay */}
        {(banner.heading || banner.subheading || banner.ctaText) && (
          <div className={`absolute inset-0 flex flex-col justify-center p-6 md:p-12 ${textAlignClass}`}>
            <div className="max-w-2xl space-y-4">
              {banner.heading && (
                <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                  {banner.heading}
                </h2>
              )}
              {banner.subheading && (
                <p className="text-lg md:text-xl text-white drop-shadow-md">
                  {banner.subheading}
                </p>
              )}
              {banner.ctaText && banner.ctaLink && (
                <Button
                  size="lg"
                  className="gap-2 mt-4 shadow-xl"
                  asChild
                >
                  <Link href={banner.ctaLink}>
                    {banner.ctaText}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If banner has a link URL and no CTA, make entire banner clickable
  if (banner.linkUrl && !banner.ctaLink) {
    return (
      <Link href={banner.linkUrl} className="block">
        <BannerContent />
      </Link>
    );
  }

  return <BannerContent />;
}

// Component for promotional strips (thin banners)
export function PromoBanner({ banner }: { banner: Banner }) {
  if (banner.linkUrl) {
    return (
      <Link href={banner.linkUrl} className="block">
        <div className="relative w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 px-4">
          <div className="container mx-auto flex items-center justify-center gap-2 text-center">
            {banner.heading && (
              <p className="text-sm md:text-base font-semibold">{banner.heading}</p>
            )}
            {banner.ctaText && <ArrowRight className="h-4 w-4" />}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative w-full">
      <img
        src={banner.imageUrl}
        alt={banner.altText || banner.title}
        className="w-full h-auto object-cover"
      />
    </div>
  );
}

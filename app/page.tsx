"use client";

import { useState, useEffect } from "react";
import { ECommerceHeader } from "@/components/e-commerce-header"
import { Hero } from "@/components/hero"
import { ProductCategories } from "@/components/product-categories"
import { FeaturedProducts } from "@/components/featured-products"
import { Services } from "@/components/services"
import { AboutCompany } from "@/components/about-company"
import { WhyChooseUs } from "@/components/why-choose-us"
import { ContactCTA } from "@/components/contact-cta"
import { Footer } from "@/components/footer"
import { DynamicBanner, PromoBanner } from "@/components/dynamic-banner"
import { ScrollToTop } from "@/components/scroll-to-top"

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

export default function Home() {
  const [banners, setBanners] = useState<{ [key: string]: Banner[] }>({
    hero: [],
    top_promo: [],
    section: [],
    offer_strip: [],
    bottom: [],
  });

  useEffect(() => {
    // Fetch all active banners
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banners");
        if (res.ok) {
          const data = await res.json();

          // Group banners by placement
          const grouped: { [key: string]: Banner[] } = {
            hero: [],
            top_promo: [],
            section: [],
            offer_strip: [],
            bottom: [],
          };

          data.forEach((banner: Banner) => {
            if (grouped[banner.placement]) {
              grouped[banner.placement].push(banner);
            }
          });

          setBanners(grouped);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="min-h-screen">
      <ECommerceHeader />

      {/* Top Promotional Banner */}
      {banners.top_promo.length > 0 && (
        <div className="w-full">
          {banners.top_promo.map((banner) => (
            <PromoBanner key={banner.id} banner={banner} />
          ))}
        </div>
      )}

      <main>
        {/* Hero Section with Dynamic Banners */}
        {banners.hero.length > 0 ? (
          <section className="container mx-auto px-4 py-8">
            {banners.hero.map((banner) => (
              <DynamicBanner key={banner.id} banner={banner} />
            ))}
          </section>
        ) : (
          <Hero />
        )}

        {/* Featured Products - Moved up for immediate visibility */}
        <FeaturedProducts />

        {/* Product Categories */}
        <ProductCategories />

        {/* Section Banners */}
        {banners.section.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.section.map((banner) => (
                <DynamicBanner key={banner.id} banner={banner} />
              ))}
            </div>
          </section>
        )}

        {/* Offer Strip Banner */}
        {banners.offer_strip.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            {banners.offer_strip.map((banner) => (
              <DynamicBanner key={banner.id} banner={banner} className="shadow-lg" />
            ))}
          </section>
        )}

        <WhyChooseUs />
        <Services />
        <AboutCompany />

        {/* Bottom Banner */}
        {banners.bottom.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            {banners.bottom.map((banner) => (
              <DynamicBanner key={banner.id} banner={banner} />
            ))}
          </section>
        )}

        <ContactCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

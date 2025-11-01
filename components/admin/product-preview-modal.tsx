"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CloseOutlined, LeftOutlined, RightOutlined, ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import Image from "next/image";

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    brand: string;
    category: string;
    description: string;
    regularPrice: number;
    salePrice?: number;
    stock: number;
    availability: string;
    sku: string;
    features: string[];
    technicalSpecifications: { key: string; value: string }[];
    hardwareSpecifications: { key: string; value: string }[];
    imageUrl: string | null;
    galleryImages: string[];
  };
}

export function ProductPreviewModal({ isOpen, onClose, product }: ProductPreviewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  // Combine main image and gallery images
  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...product.galleryImages,
  ];

  const currentImage = allImages[currentImageIndex] || "/placeholder.svg";
  const discount = product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-950 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white dark:bg-slate-950 z-10">
          <h2 className="text-xl sm:text-2xl font-bold">Product Preview</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <CloseOutlined style={{ fontSize: '20px' }} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image Display */}
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-700">
                {currentImage && (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-600">{discount}% OFF</Badge>
                )}
              </div>

              {/* Image Navigation */}
              {allImages.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevImage}
                      className="hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <LeftOutlined />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentImageIndex + 1} / {allImages.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextImage}
                      className="hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <RightOutlined />
                    </Button>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                          idx === currentImageIndex
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`View ${idx + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized={true}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-2">
                  {product.brand}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">₹{product.regularPrice.toLocaleString()}</span>
                  {product.salePrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{product.salePrice.toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <Badge variant="destructive" className="text-sm">
                          Save {discount}%
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Stock & SKU */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"} ({product.stock} units)
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>SKU:</strong> {product.sku}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Category:</strong> <span className="capitalize">{product.category}</span>
                </p>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button className="w-full" disabled={product.stock === 0}>
                  <ShoppingCartOutlined style={{ marginRight: '8px' }} /> Add to Cart
                </Button>
                <Button variant="outline" className="w-full">
                  <HeartOutlined style={{ marginRight: '8px' }} /> Add to Wishlist
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Features */}
          {product.features.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.map((feature, idx) => (
                  feature && (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {product.technicalSpecifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                <div className="space-y-3">
                  {product.technicalSpecifications.map((spec, idx) => (
                    spec.key && (
                      <div key={idx} className="flex justify-between py-2 border-b text-sm">
                        <dt className="text-muted-foreground">{spec.key}</dt>
                        <dd className="font-medium">{spec.value}</dd>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {product.hardwareSpecifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Hardware Specifications</h3>
                <div className="space-y-3">
                  {product.hardwareSpecifications.map((spec, idx) => (
                    spec.key && (
                      <div key={idx} className="flex justify-between py-2 border-b text-sm">
                        <dt className="text-muted-foreground">{spec.key}</dt>
                        <dd className="font-medium">{spec.value}</dd>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

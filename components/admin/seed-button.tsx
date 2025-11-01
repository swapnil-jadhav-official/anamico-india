"use client";

import { useState } from "react";
import { seedProductsData } from "@/lib/seed-data";
import { BgColorsOutlined } from "@ant-design/icons";
import { Spin } from "antd";

interface SeedButtonProps {
  onSuccess?: () => void;
}

export function SeedButton({ onSuccess }: SeedButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      let successCount = 0;
      let failCount = 0;

      for (const product of seedProductsData) {
        try {
          const response = await fetch("/api/admin/products", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...product,
              options: [],
            }),
          });

          if (response.ok) {
            successCount++;
            setMessage(`Creating products: ${successCount}/${seedProductsData.length}`);
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
          console.error("Error creating product:", err);
        }
      }

      setMessage(`✅ Seeding complete! Created: ${successCount}, Failed: ${failCount}`);

      // Call the callback to refresh products
      if (onSuccess) {
        onSuccess();
      }

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error("Error seeding products:", err);
      setError("Failed to seed products. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoading && !message && !error) {
    return (
      <button
        onClick={handleSeed}
        disabled={true}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed mb-4"
        title="Seed button is disabled for now"
      >
        <BgColorsOutlined className="text-lg" />
        <span>Seed Test Products (12) - Disabled</span>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg mb-4">
        <Spin size="small" />
        <span>{message || "Seeding products..."}</span>
      </div>
    );
  }

  if (message) {
    return (
      <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg mb-4">
        <span>{message}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg mb-4">
        <span>{error}</span>
      </div>
    );
  }

  return null;
}

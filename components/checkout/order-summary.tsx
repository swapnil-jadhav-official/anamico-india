"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CartItem } from "@/lib/cart-context";
import Link from "next/link";

interface OrderSummaryProps {
  items: CartItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + tax;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3 max-h-64 overflow-y-auto border-b pb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start text-sm">
              <div className="flex-1">
                <Link
                  href={`/products/${item.category}/${item.id}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-muted-foreground text-xs mt-1">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="font-semibold">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (18% GST)</span>
            <span className="font-medium">₹{tax.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg text-primary">
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-sm">
          <p className="text-blue-900 dark:text-blue-100">
            <span className="font-semibold">Free Shipping</span> available for orders
            above ₹500
          </p>
        </div>

        {/* Item Count Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {items.length} {items.length === 1 ? "item" : "items"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

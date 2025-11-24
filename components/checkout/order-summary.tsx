"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import type { CartItem } from "@/lib/cart-context";
import Link from "next/link";

interface OrderSummaryProps {
  items: CartItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial'>('full');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + tax;

  // Calculate discount and final amounts based on payment option
  const discount = paymentOption === 'full' ? Math.round(total * 0.05) : 0;
  const savings = discount;
  const finalTotal = paymentOption === 'full' ? total - discount : Math.round(total * 0.10);
  const remainingAmount = paymentOption === 'full' ? 0 : total - finalTotal;

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

        {/* Payment Options */}
        <div className="space-y-3 border-b pb-4">
          <Label className="text-sm font-semibold">Payment Option</Label>
          <div className="space-y-2">
            <div
              onClick={() => setPaymentOption('full')}
              className={`relative flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                paymentOption === 'full'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentOption === 'full'}
                onChange={() => setPaymentOption('full')}
                className="w-4 h-4 text-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">100% Payment</span>
                  <Badge variant="default" className="bg-green-500">
                    5% OFF
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay full amount and save ₹{savings.toLocaleString()}
                </p>
              </div>
              <span className="font-bold text-primary">
                ₹{finalTotal.toLocaleString()}
              </span>
            </div>

            <div
              onClick={() => setPaymentOption('partial')}
              className={`relative flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                paymentOption === 'partial'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentOption === 'partial'}
                onChange={() => setPaymentOption('partial')}
                className="w-4 h-4 text-primary cursor-pointer"
              />
              <div className="flex-1">
                <span className="font-medium">10% Partial Payment</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Balance via Cash on Delivery
                </p>
              </div>
              <span className="font-bold text-primary">
                ₹{finalTotal.toLocaleString()}
              </span>
            </div>
          </div>
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
            <span className="font-bold text-lg">
              ₹{total.toLocaleString()}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="font-medium">Discount (5%)</span>
              <span className="font-semibold">-₹{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-base">
            <span className="font-bold">Amount to Pay Now</span>
            <span className="font-bold text-xl text-primary">
              ₹{finalTotal.toLocaleString()}
            </span>
          </div>
          {remainingAmount > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Remaining (Cash on Delivery)</span>
              <span>₹{remainingAmount.toLocaleString()}</span>
            </div>
          )}
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

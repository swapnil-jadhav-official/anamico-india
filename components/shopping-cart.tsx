"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart as CartIcon,
  Trash2,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { message } from "antd";
import { useCart } from "@/lib/cart-context";

export function ShoppingCart() {
  const { items, removeFromCart, updateQuantity, loading } = useCart();
  const [updating, setUpdating] = useState<string | null>(null);

  console.log("ShoppingCart component - items:", items, "loading:", loading);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(productId);
    try {
      await updateQuantity(productId, newQuantity);
      message.success("Cart updated");
    } catch (error) {
      console.error("Error updating cart:", error);
      message.error("Error updating cart");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      message.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      message.error("Error removing item");
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Calculate tax based on each item's tax percentage
  const tax = Math.round(
    items.reduce((sum, item) => {
      const itemTaxPercent = (item.taxPercentage || 18) / 100;
      return sum + item.price * item.quantity * itemTaxPercent;
    }, 0)
  );

  // Calculate effective tax percentage
  const effectiveTaxPercent = subtotal > 0 ? Math.round((tax / subtotal) * 100 * 10) / 10 : 18;

  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading your cart...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-12">
            <div className="text-center space-y-4">
              <CartIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">
                Start shopping to add items to your cart
              </p>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CartIcon className="h-5 w-5" />
                  Shopping Cart ({items.length})
                </CardTitle>
                <CardDescription>
                  Review and manage your items before checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex gap-4 flex-1">
                      {item.imageUrl && (
                        <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.category}/${item.id}`}
                        >
                          <h4 className="font-semibold hover:text-primary transition-colors break-words">
                            {item.name || "Product"}
                          </h4>
                        </Link>

                        <Badge variant="outline" className="mt-1">
                          ₹{item.price.toLocaleString()}
                        </Badge>

                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={updating === item.id || item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <Input
                            type="number"
                            min="1"
                            max="999"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              handleUpdateQuantity(item.id, newQty);
                            }}
                            className="w-16 text-center"
                            disabled={updating === item.id}
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={updating === item.id}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-between sm:justify-between items-center sm:items-end gap-4 sm:gap-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p className="text-lg font-bold">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this item from your cart?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveItem(item.id)}
                              className="bg-destructive"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({effectiveTaxPercent}%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-xl text-primary">
                    ₹{total.toLocaleString()}
                  </span>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Link>
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

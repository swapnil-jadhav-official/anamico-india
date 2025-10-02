"use client"

import { ECommerceHeader } from "@/components/e-commerce-header"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <ECommerceHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some products to get started</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.category}/${item.id}`}
                          className="font-semibold hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span>₹{Math.round(totalPrice * 0.18).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{Math.round(totalPrice * 1.18).toLocaleString()}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6" size="lg">
                    Proceed to Checkout
                  </Button>

                  <Button variant="outline" className="w-full mt-3 bg-transparent" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Free Shipping</strong> on all orders
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Secure Payment</strong> - Your information is protected
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

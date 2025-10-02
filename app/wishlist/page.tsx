"use client"

import { ECommerceHeader } from "@/components/e-commerce-header"
import { Footer } from "@/components/footer"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleRemove = (product: any) => {
    removeFromWishlist(product.id)
    toast({
      title: "Removed from wishlist",
      description: `${product.name} has been removed from your wishlist.`,
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <ECommerceHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save your favorite products for later</p>
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
            <div>
              <h1 className="text-3xl font-bold">My Wishlist</h1>
              <p className="text-muted-foreground mt-1">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <Button variant="outline" onClick={clearWishlist}>
              Clear Wishlist
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => {
              const discount = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0

              return (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/products/${product.category}/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && <Badge className="absolute top-2 left-2 bg-primary">{product.badge}</Badge>}
                      {discount > 0 && <Badge className="absolute top-2 right-2 bg-destructive">{discount}% OFF</Badge>}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <Badge variant="secondary">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                  </Link>

                  <CardContent className="p-4">
                    <Link href={`/products/${product.category}/${product.id}`}>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        disabled={!product.inStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleRemove(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart } from "lucide-react"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)
  const { addToCart } = useCart()
  const { toast } = useToast()

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
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
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1" disabled={!product.inStock} onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
        <Button variant={isWishlisted ? "default" : "outline"} size="icon" onClick={handleWishlistToggle}>
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
  inStock: boolean
  featured?: boolean
  badge?: string
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const allProducts = await res.json()
          // Sort by rating and take top 8 products
          const featured = allProducts
            .sort((a: Product, b: Product) => b.rating - a.rating)
            .slice(0, 8)
          setProducts(featured)
        }
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Featured Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            UIDAI certified biometric devices trusted by thousands of businesses across India
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading featured products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.category}/${product.id}`}
                >
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full cursor-pointer">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && (
                        <Badge className="absolute top-3 right-3">{product.badge}</Badge>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.category}
                      </div>
                      <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold text-primary">
                          ₹{product.price.toLocaleString()}
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" variant="outline">
                  View All Products
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

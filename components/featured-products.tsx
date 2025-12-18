"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
  stock?: number
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
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-current" />
            Top Rated Products
          </div>
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
              {products.map((product) => {
                const isOutOfStock = !product.inStock || (typeof product.stock === 'number' && product.stock <= 0)
                return (
                <Link
                  key={product.id}
                  href={`/products/${product.category}/${product.id}`}
                >
                  <Card className={`group overflow-hidden hover:shadow-lg transition-shadow h-full cursor-pointer ${isOutOfStock ? 'opacity-60' : ''}`}>
                    <div className={`relative aspect-video overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ${isOutOfStock ? 'blur-sm' : ''}`}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'blur-sm' : ''}`}
                        />
                      ) : (
                        <ShoppingCart className={`h-16 w-16 text-muted-foreground/50 ${isOutOfStock ? 'blur-sm' : ''}`} />
                      )}
                      {product.badge && !isOutOfStock && (
                        <Badge className="absolute top-2 left-2 bg-primary">{product.badge}</Badge>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-white" />
                            <Badge className="bg-red-600 text-white">Out of Stock</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2 space-y-1">
                      <h3 className="font-semibold text-xs line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-0.5">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-2.5 w-2.5 ${
                                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <div className="text-sm font-bold text-primary">
                          ₹{product.price.toLocaleString()}
                        </div>
                        {product.originalPrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                )
              })}
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

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
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
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.category}/${product.id}`}
                >
                  <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 h-full cursor-pointer hover:-translate-y-2 hover:border-primary/50">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.badge && (
                        <Badge className="absolute top-3 right-3 shadow-lg">{product.badge}</Badge>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="text-xs text-primary font-semibold uppercase tracking-wide">
                        {product.category}
                      </div>
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950 px-2 py-0.5 rounded">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{product.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
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

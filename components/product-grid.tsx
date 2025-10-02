"use client"

import { ProductCard } from "@/components/product-card"
import { getProductsByCategory } from "@/lib/products"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface ProductGridProps {
  category?: string
}

export function ProductGrid({ category }: ProductGridProps) {
  const [sortBy, setSortBy] = useState("featured")
  let products = getProductsByCategory(category)

  // Sort products
  if (sortBy === "price-low") {
    products = [...products].sort((a, b) => a.price - b.price)
  } else if (sortBy === "price-high") {
    products = [...products].sort((a, b) => b.price - a.price)
  } else if (sortBy === "rating") {
    products = [...products].sort((a, b) => b.rating - a.rating)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} {products.length === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}

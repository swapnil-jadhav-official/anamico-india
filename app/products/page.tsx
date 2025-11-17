"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ECommerceHeader } from "@/components/e-commerce-header"
import { CategorySidebar } from "@/components/category-sidebar"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const search = searchParams?.get('search') || ""
    setSearchQuery(search)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/products')
    }
  }

  const currentSearch = searchParams?.get('search') || ""

  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <div className="flex-1 flex flex-col md:flex-row">
        <CategorySidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Search Bar - Visible on all devices */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base w-full"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12 px-6">
                    Search
                  </Button>
                </div>
              </form>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {currentSearch ? `Search Results for "${currentSearch}"` : "All Products"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {currentSearch
                  ? `Showing results for "${currentSearch}"`
                  : "Browse our complete range of biometric devices, IT equipment, and security solutions"}
              </p>
            </div>
            <ProductGrid searchQuery={currentSearch} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

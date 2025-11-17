"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ECommerceHeader } from "@/components/e-commerce-header"
import { CategorySidebar } from "@/components/category-sidebar"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchSuggestion {
  id: string
  name: string
  category: string
}

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const search = searchParams?.get('search') || ""
    setSearchQuery(search)
  }, [searchParams])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.slice(0, 5))
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/products')
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)
    router.push(`/products?search=${encodeURIComponent(suggestion.name)}`)
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
                <div className="relative flex items-center gap-2" ref={searchRef}>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      type="search"
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      className="pl-10 h-12 text-base w-full"
                      autoComplete="off"
                    />
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0 flex flex-col gap-1"
                          >
                            <span className="font-medium text-sm">{suggestion.name}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              in {suggestion.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="submit" size="icon" className="h-12 w-12 flex-shrink-0">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
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

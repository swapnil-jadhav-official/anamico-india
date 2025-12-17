"use client";

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Shield, Zap, Award, Search, Star, ShoppingCart, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useToast } from "@/hooks/use-toast"

interface SearchSuggestion {
  id: string
  name: string
  category: string
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
  inStock: boolean
  badge?: string
}

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  // Fetch hero products
  useEffect(() => {
    const fetchHeroProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const allProducts = await res.json();
          const featured = allProducts
            .sort((a: Product, b: Product) => b.rating - a.rating)
            .slice(0, 4);
          setHeroProducts(featured);
        }
      } catch (error) {
        console.error('Error fetching hero products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchHeroProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    router.push(`/products?search=${encodeURIComponent(suggestion.name)}`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (product: Product) => {
    const isWishlisted = isInWishlist(product.id);
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b"
    >
      <div className="container mx-auto px-4 py-16 md:py-28">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-semibold border border-primary/20 w-fit">
              <Shield className="h-4 w-4" />
              UIDAI & ISO Certified Partner
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Premium <span className="text-primary">Biometric Devices</span> & Solutions
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Trusted by thousands of businesses. UIDAI-approved fingerprint scanners, iris recognition systems, and digital identity solutions for secure authentication.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="w-full max-w-lg">
              <div className="relative flex items-center gap-2" ref={searchRef}>
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input
                    type="search"
                    placeholder="Search biometric devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    className="pl-12 h-12 text-base rounded-lg border-2 border-primary/20 focus:border-primary/50"
                    autoComplete="off"
                  />
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
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
                <Button type="submit" size="icon" className="h-12 w-12 flex-shrink-0 rounded-lg">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="gap-2 rounded-lg font-semibold" asChild>
                <Link href="/products">
                  Browse All Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg font-semibold" asChild>
                <Link href="#contact">
                  Get Demo
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Enterprise Partners</div>
              </div>
            </div>
          </div>

          {/* Hero Image Section */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 shadow-2xl">
              <img
                src="/modern-biometric-fingerprint-scanner-device-with-b.jpg"
                alt="Premium Biometric Devices"
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
              />
              {/* Floating Badge */}
              <div className="absolute top-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-lg p-3 shadow-lg border">
                <div className="text-xs font-semibold text-primary mb-1">Best Seller</div>
                <div className="text-sm font-bold">⭐ 4.9/5</div>
                <div className="text-xs text-muted-foreground">2,480 reviews</div>
              </div>
            </div>

            {/* Certification Badge */}
            <div className="absolute -bottom-6 -left-6 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-primary">Certified</div>
                  <div className="text-sm font-bold">ISO 27001:2013</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="pt-16 border-t">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Popular Products</h2>
            <p className="text-muted-foreground">Explore our most trusted biometric solutions</p>
          </div>

          {loadingProducts ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {heroProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.category}/${product.id}`}
                >
                  <div className="group cursor-pointer h-full">
                    {/* Product Image */}
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted border mb-3 group-hover:border-primary transition-colors">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && (
                        <Badge className="absolute top-2 left-2 bg-primary text-xs">{product.badge}</Badge>
                      )}
                      {product.originalPrice && (
                        <Badge className="absolute top-2 right-2 bg-destructive text-xs">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-primary">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          disabled={!product.inStock}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            handleWishlistToggle(product);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current text-destructive" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" className="rounded-lg" asChild>
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

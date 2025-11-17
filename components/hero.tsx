"use client";

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Shield, Zap, Award, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchSuggestion {
  id: string
  name: string
  category: string
}

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5"
    >
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              ISO 27001:2013 & ISO 9001:2015 Certified
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Complete IT Solutions & <span className="text-primary">Biometric Technology</span>
            </h1>

            <p className="text-lg text-muted-foreground text-pretty max-w-xl">
              ANAMICO India Private Limited delivers comprehensive IT solutions, biometric devices, and project
              management services to government and enterprise organizations across India.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="relative flex items-center gap-2" ref={searchRef}>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input
                    type="search"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    className="pl-10 h-12 text-base"
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
                <Button type="submit" size="lg" className="h-12 px-6">
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/products">
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#contact">
                  Contact Sales
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">9+ Years</div>
                  <div className="text-sm text-muted-foreground">Industry Experience</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">UIDAI</div>
                  <div className="text-sm text-muted-foreground">Certified Partner</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              <img
                src="/modern-biometric-fingerprint-scanner-device-with-b.jpg"
                alt="Biometric Device"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card border rounded-xl p-4 shadow-lg">
              <div className="text-sm text-muted-foreground">Certified</div>
              <div className="text-lg font-semibold">ISO 27001 & 9001</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

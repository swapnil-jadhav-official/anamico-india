"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/lib/products"

interface WishlistContextType {
  items: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("anamico-wishlist")
    if (savedWishlist) {
      setItems(JSON.parse(savedWishlist))
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("anamico-wishlist", JSON.stringify(items))
  }, [items])

  const addToWishlist = (product: Product) => {
    setItems((currentItems) => {
      const exists = currentItems.find((item) => item.id === product.id)
      if (exists) {
        return currentItems
      }
      return [...currentItems, product]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId)
  }

  const clearWishlist = () => {
    setItems([])
  }

  const totalItems = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}

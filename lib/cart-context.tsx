"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import type { Product } from "@/lib/products"

export interface CartItem extends Product {
  quantity: number
  cartItemId?: string // API cart item ID
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => void
  totalItems: number
  totalPrice: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()

  // Load cart from API or localStorage based on auth status
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true)
      try {
        if (status === "authenticated" && session?.user?.id) {
          // Load from API
          const res = await fetch("/api/cart")
          if (res.ok) {
            const apiItems = await res.json()
            console.log("Cart items from API:", apiItems)
            // API now returns full product data merged with cart item data
            const cartItems = apiItems.map((item: any) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              imageUrl: item.imageUrl,
              price: item.price,
              quantity: item.quantity,
              cartItemId: item.cartItemId,
              description: item.description || "",
              rating: item.rating || 0,
              reviews: item.reviews || 0,
              inStock: true,
            } as CartItem))
            setItems(cartItems)
          } else {
            console.error("Failed to fetch cart, status:", res.status)
            setItems([])
          }
        } else {
          // Load from localStorage
          const savedCart = localStorage.getItem("anamico-cart")
          if (savedCart) {
            setItems(JSON.parse(savedCart))
          } else {
            setItems([])
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [session?.user?.id, status])

  // Save to localStorage for unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.setItem("anamico-cart", JSON.stringify(items))
    }
  }, [items, status])

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      if (status === "authenticated" && session?.user?.id) {
        // Add to API
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            quantity,
            price: product.price,
          }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || `Failed to add item to cart: ${res.status}`)
        }

        // Reload cart from API
        const cartRes = await fetch("/api/cart")
        if (!cartRes.ok) {
          throw new Error("Failed to reload cart after adding item")
        }

        const apiItems = await cartRes.json()
        console.log("Items after adding to cart:", apiItems)
        // API now returns full product data, just map it directly
        const cartItems = apiItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
          cartItemId: item.cartItemId,
          description: item.description || "",
          rating: item.rating || 0,
          reviews: item.reviews || 0,
          inStock: true,
        } as CartItem))
        setItems(cartItems)
      } else {
        // Add to localStorage cart
        setItems((currentItems) => {
          const existingItem = currentItems.find((item) => item.id === product.id)
          if (existingItem) {
            return currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
          return [...currentItems, { ...product, quantity }]
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw error
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      const item = items.find((i) => i.id === productId)
      if (!item) return

      if (status === "authenticated" && item.cartItemId) {
        // Remove from API
        const res = await fetch(`/api/cart?id=${item.cartItemId}`, {
          method: "DELETE",
        })

        if (res.ok) {
          setItems((currentItems) =>
            currentItems.filter((item) => item.id !== productId)
          )
        }
      } else {
        // Remove from localStorage cart
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== productId)
        )
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      throw error
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      const item = items.find((i) => i.id === productId)
      if (!item) return

      if (status === "authenticated" && item.cartItemId) {
        // Update in API
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.cartItemId,
            quantity,
          }),
        })

        if (res.ok) {
          setItems((currentItems) =>
            currentItems.map((i) =>
              i.id === productId ? { ...i, quantity } : i
            )
          )
        }
      } else {
        // Update in localStorage cart
        setItems((currentItems) =>
          currentItems.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          )
        )
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      throw error
    }
  }

  const clearCart = () => {
    setItems([])
    if (status === "unauthenticated") {
      localStorage.removeItem("anamico-cart")
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

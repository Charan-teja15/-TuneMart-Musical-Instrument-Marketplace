"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { CartItem, Product } from "@/lib/types"
import { useAuth } from "@/contexts/AuthContext"
import { getDbCart, syncCartToDb } from "@/lib/api"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  shipping: number
  total: number
  count: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_KEY = "tunemart_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(CART_KEY)
        if (stored) return JSON.parse(stored)
      } catch {}
    }
    return []
  })

  // 1. When user logs in, load database cart and merge
  useEffect(() => {
    async function loadCart() {
      if (user?.id) {
        try {
          const dbItems = await getDbCart(user.id)
          if (dbItems && dbItems.length > 0) {
            setItems(dbItems)
          }
        } catch (e) {
          console.warn("Could not load cart from database:", e)
        }
      }
    }
    loadCart()
  }, [user?.id])

  // 2. Persist to localStorage and Supabase
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    if (user?.id) {
      syncCartToDb(user.id, items).catch(err => console.warn("Could not sync cart to DB:", err))
    }
  }, [items, user?.id])

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: Math.min(i.quantity + quantity, product.quantity) } : i)
      }
      return [...prev, { product, quantity: Math.min(quantity, product.quantity) }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: Math.min(quantity, i.product.quantity) } : i))
  }

  const clearCart = () => setItems([])

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const shipping = subtotal > 0 ? (subtotal > 50000 ? 0 : 499) : 0
  const total = subtotal + shipping
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, shipping, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { Product, WishlistItem } from "@/lib/types"

interface WishlistContextType {
  items: WishlistItem[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  count: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)
const KEY = "tunemart_wishlist"

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(KEY)
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const addToWishlist = (product: Product) => {
    setItems(prev => {
      if (prev.find(i => i.product.id === product.id)) return prev
      return [...prev, { product, addedAt: new Date().toISOString() }]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  const isInWishlist = (productId: string) => items.some(i => i.product.id === productId)

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}

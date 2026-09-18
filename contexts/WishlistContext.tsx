"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { Product, WishlistItem } from "@/lib/types"
import { useAuth } from "@/contexts/AuthContext"
import { getDbWishlist, toggleDbWishlist } from "@/lib/api"

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
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(KEY)
        if (stored) return JSON.parse(stored)
      } catch {}
    }
    return []
  })

  // 1. Load from Supabase on login
  useEffect(() => {
    async function loadWishlist() {
      if (user?.id) {
        try {
          const dbWishlist = await getDbWishlist(user.id)
          if (dbWishlist && dbWishlist.length > 0) {
            setItems(dbWishlist)
          }
        } catch (e) {
          console.warn("Could not load wishlist from DB:", e)
        }
      }
    }
    loadWishlist()
  }, [user?.id])

  // 3. Persist to localStorage
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const addToWishlist = (product: Product) => {
    setItems(prev => {
      if (prev.find(i => i.product.id === product.id)) return prev
      return [...prev, { product, addedAt: new Date().toISOString() }]
    })
    if (user?.id) {
      toggleDbWishlist(user.id, product.id).catch(err => console.warn("Wishlist sync error:", err))
    }
  }

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
    if (user?.id) {
      toggleDbWishlist(user.id, productId).catch(err => console.warn("Wishlist sync error:", err))
    }
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

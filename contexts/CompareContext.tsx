"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { Product } from "@/lib/types"

interface CompareContextType {
  items: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean
  count: number
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)
const KEY = "tunemart_compare"

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(KEY)
        if (stored) return JSON.parse(stored)
      } catch {}
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const addToCompare = (product: Product) => {
    setItems(prev => {
      if (prev.find(p => p.id === product.id)) return prev
      if (prev.length >= 4) return prev
      return [...prev, product]
    })
  }

  const removeFromCompare = (productId: string) => setItems(prev => prev.filter(p => p.id !== productId))
  const clearCompare = () => setItems([])
  const isInCompare = (productId: string) => items.some(p => p.id === productId)

  return (
    <CompareContext.Provider value={{ items, addToCompare, removeFromCompare, clearCompare, isInCompare, count: items.length }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error("useCompare must be used within CompareProvider")
  return ctx
}

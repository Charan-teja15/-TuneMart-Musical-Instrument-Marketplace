"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getCategories } from "@/lib/api"
import { mockCategories } from "@/lib/mock-data"
import { Category } from "@/lib/types"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)

  useEffect(() => {
    async function loadCats() {
      const live = await getCategories()
      if (live && live.length > 0) setCategories(live)
    }
    loadCats()
  }, [])

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[32px] font-bold tracking-tight mb-2">All Categories</h1>
      <p className="text-[#78716C] mb-8">Explore instruments by category</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <Link key={cat.id} href={`/products?category=${encodeURIComponent(cat.name)}`} className="group rounded-[24px] border border-[#E7E5E4] bg-white overflow-hidden hover:shadow-lg transition-all">
            <div className="aspect-[16/10] overflow-hidden bg-[#F8F7F4]">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-[18px]">{cat.name}</h3>
              <p className="text-sm text-[#78716C] mt-1">{cat.description}</p>
              <p className="text-xs font-semibold mt-3 text-[#FF6B00]">{cat.productCount} products →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

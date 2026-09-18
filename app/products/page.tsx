"use client"
import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product/ProductCard"
import { mockProducts, mockCategories } from "@/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { ProductCategory } from "@/lib/types"

function ProductsContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") as ProductCategory | null
  const initialCondition = searchParams.get("condition")
  const initialFeatured = searchParams.get("isFeatured")

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<ProductCategory | "all">((initialCategory as any) || "all")
  const [condition, setCondition] = useState<string>(initialCondition || "all")
  const [brand, setBrand] = useState("all")
  const [sort, setSort] = useState("relevance")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000])
  const [loading] = useState(false)

  const brands = useMemo(() => Array.from(new Set(mockProducts.map(p => p.brand))), [])

  const filtered = useMemo(() => {
    let result = [...mockProducts]

    if (initialFeatured === "true") {
      result = result.filter(p => p.isFeatured)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.model.toLowerCase().includes(q))
    }
    if (category !== "all") {
      result = result.filter(p => p.category === category)
    }
    if (condition !== "all") {
      result = result.filter(p => p.condition === condition)
    }
    if (brand !== "all") {
      result = result.filter(p => p.brand === brand)
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (sort === "price-low") result.sort((a, b) => a.price - b.price)
    if (sort === "price-high") result.sort((a, b) => b.price - a.price)
    if (sort === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sort === "rating") result.sort((a, b) => b.rating - a.rating)

    return result
  }, [search, category, condition, brand, sort, priceRange, initialFeatured])

  const clearFilters = () => {
    setCategory("all")
    setCondition("all")
    setBrand("all")
    setPriceRange([0, 200000])
    setSearch("")
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="lg:sticky lg:top-[104px] space-y-6">
            <div className="rounded-[20px] border border-[#E7E5E4] bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</h3>
                <button onClick={clearFilters} className="text-xs text-[#78716C] hover:text-black flex items-center gap-1"><X className="h-3 w-3" />Clear</button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-2 block">Category</label>
                  <Select value={category} onChange={(e) => setCategory(e.target.value as any)}>
                    <option value="all">All Categories</option>
                    {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-2 block">Condition</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "all", label: "All" },
                      { id: "new", label: "New" },
                      { id: "used", label: "Used" }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setCondition(opt.id)}
                        className={`h-9 rounded-full text-xs font-medium border transition-colors ${condition === opt.id ? "bg-[#0F0F12] text-white border-[#0F0F12]" : "bg-white border-[#E7E5E4] hover:bg-[#F5F5F4]"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-2 block">Brand</label>
                  <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
                    <option value="all">All Brands</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-2 block">Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}</label>
                  <div className="space-y-3">
                    <input type="range" min={0} max={200000} step={1000} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full accent-[#0F0F12]" />
                    <div className="flex gap-2">
                      <Input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])} className="h-9" />
                      <Input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])} className="h-9" />
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#F5F5F4]">
                  <div className="text-xs text-[#78716C]">{filtered.length} products found</div>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] bg-[#0F0F12] text-white p-5">
              <h4 className="font-semibold text-sm mb-2">Need help choosing?</h4>
              <p className="text-xs text-[#A8A29E] leading-relaxed mb-3">Chat with our gear experts for personalized recommendations.</p>
              <Button variant="secondary" size="sm" className="w-full">Talk to expert</Button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-[24px] font-bold tracking-tight">All Instruments</h1>
              <p className="text-sm text-[#78716C]">{filtered.length} products • Verified sellers</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A29E]" />
                <Input placeholder="Search within results..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-[160px] h-10">
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Rating</option>
              </Select>
            </div>
          </div>

          {(category !== "all" || condition !== "all" || brand !== "all") && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category !== "all" && <Badge variant="secondary" className="gap-1">{category} <button onClick={() => setCategory("all")}><X className="h-3 w-3" /></button></Badge>}
              {condition !== "all" && <Badge variant="secondary" className="gap-1 capitalize">{condition} <button onClick={() => setCondition("all")}><X className="h-3 w-3" /></button></Badge>}
              {brand !== "all" && <Badge variant="secondary" className="gap-1">{brand} <button onClick={() => setBrand("all")}><X className="h-3 w-3" /></button></Badge>}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[20px] border border-[#E7E5E4] p-4 space-y-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-[#E7E5E4] bg-white p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#F3F1EB] flex items-center justify-center mb-4"><Search className="h-6 w-6 text-[#78716C]" /></div>
              <h3 className="font-semibold">No products found</h3>
              <p className="text-sm text-[#78716C] mt-1 max-w-sm mx-auto">Try adjusting your filters or search terms. We have over 10,000 instruments - you&apos;ll find your sound.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  )
}

"use client"
import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product/ProductCard"
import { getProducts, getCategories } from "@/lib/api"
import { mockProducts, mockCategories } from "@/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { ProductCategory, Product, Category } from "@/lib/types"

function ProductsContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") as ProductCategory | null
  const initialCondition = searchParams.get("condition")
  const initialFeatured = searchParams.get("isFeatured")

  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<ProductCategory | "all">(initialCategory || "all")
  const [condition, setCondition] = useState<string>(initialCondition || "all")
  const [brand, setBrand] = useState("all")
  const [sort, setSort] = useState("relevance")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000])
  const [loading, setLoading] = useState(false)

  // Keep category in sync if URL query parameter changes
  useEffect(() => {
    const catFromUrl = searchParams.get("category") as ProductCategory | null
    if (catFromUrl) {
      setCategory(catFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [dbProds, dbCats] = await Promise.all([getProducts(), getCategories()])
        if (dbProds && dbProds.length > 0) setProducts(dbProds)
        if (dbCats && dbCats.length > 0) setCategories(dbCats)
      } catch (err) {
        console.error("Error loading products:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate dynamic price boundaries based on selected category or all products
  const categoryBounds = useMemo(() => {
    const relevantProducts = category === "all"
      ? products
      : products.filter(p => p.category === category)

    if (relevantProducts.length === 0) {
      return { min: 0, max: 200000, count: 0 }
    }

    const prices = relevantProducts.map(p => p.price)
    const min = Math.min(...prices)
    const rawMax = Math.max(...prices)
    // Round upper ceiling to nearest clean thousand
    const max = Math.max(10000, Math.ceil(rawMax / 5000) * 5000)
    return { min, max, count: relevantProducts.length }
  }, [products, category])

  // Automatically adapt price range when category changes
  const handleCategoryChange = (newCategory: ProductCategory | "all") => {
    setCategory(newCategory)
    setBrand("all")
    const relevant = newCategory === "all"
      ? products
      : products.filter(p => p.category === newCategory)

    if (relevant.length > 0) {
      const prices = relevant.map(p => p.price)
      const min = Math.min(...prices)
      const rawMax = Math.max(...prices)
      const max = Math.max(10000, Math.ceil(rawMax / 5000) * 5000)
      setPriceRange([0, max])
    } else {
      setPriceRange([0, 200000])
    }
  }

  const brands = useMemo(() => {
    const pool = category === "all" ? products : products.filter(p => p.category === category)
    return Array.from(new Set(pool.map(p => p.brand))).filter(Boolean)
  }, [products, category])

  const filtered = useMemo(() => {
    let result = [...products]

    if (initialFeatured === "true") {
      result = result.filter(p => p.isFeatured)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.model.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      )
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

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price)
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price)
    } else if (sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === "rating") {
      result.sort((a, b) => {
        const diff = (b.rating || 0) - (a.rating || 0)
        if (diff !== 0) return diff
        return (b.reviewCount || 0) - (a.reviewCount || 0)
      })
    } else if (sort === "relevance") {
      result.sort((a, b) => {
        if (search) {
          const q = search.toLowerCase()
          const aExact = a.name.toLowerCase().includes(q) ? 2 : 0
          const bExact = b.name.toLowerCase().includes(q) ? 2 : 0
          if (bExact !== aExact) return bExact - aExact
        }
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return (b.rating || 0) - (a.rating || 0)
      })
    }

    return result
  }, [products, search, category, condition, brand, sort, priceRange, initialFeatured])

  const clearFilters = () => {
    setCategory("all")
    setCondition("all")
    setBrand("all")
    setPriceRange([0, categoryBounds.max || 200000])
    setSearch("")
    setSort("relevance")
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
                  <Select value={category} onChange={(e) => handleCategoryChange(e.target.value as ProductCategory | "all")}>
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map(c => {
                      const count = products.filter(p => p.category === c.name).length
                      return (
                        <option key={c.id} value={c.name}>
                          {c.name} {count > 0 ? `(${count})` : ""}
                        </option>
                      )
                    })}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-[#78716C]">
                      Price Range
                    </label>
                    <span className="text-xs font-bold text-[#0F0F12]">
                      ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="range" 
                      min={0} 
                      max={categoryBounds.max} 
                      step={categoryBounds.max > 50000 ? 1000 : 500} 
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], Math.max(priceRange[0], parseInt(e.target.value))])} 
                      className="w-full accent-[#0F0F12] cursor-pointer" 
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] text-[#78716C] mb-1 block">Min (₹)</span>
                        <Input 
                          type="number" 
                          min={0}
                          max={priceRange[1]}
                          value={priceRange[0]} 
                          onChange={(e) => setPriceRange([Math.max(0, parseInt(e.target.value) || 0), priceRange[1]])} 
                          className="h-9 text-xs" 
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-[#78716C] mb-1 block">Max (₹)</span>
                        <Input 
                          type="number" 
                          min={priceRange[0]}
                          max={categoryBounds.max}
                          value={priceRange[1]} 
                          onChange={(e) => setPriceRange([priceRange[0], Math.min(categoryBounds.max, parseInt(e.target.value) || categoryBounds.max)])} 
                          className="h-9 text-xs" 
                        />
                      </div>
                    </div>
                    {/* Quick Price Shortcuts */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => setPriceRange([0, Math.round(categoryBounds.max * 0.35)])}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#57534E] font-medium transition-colors"
                      >
                        Under ₹{Math.round(categoryBounds.max * 0.35).toLocaleString()}
                      </button>
                      <button
                        onClick={() => setPriceRange([Math.round(categoryBounds.max * 0.35), Math.round(categoryBounds.max * 0.7)])}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#57534E] font-medium transition-colors"
                      >
                        Mid Range
                      </button>
                      <button
                        onClick={() => setPriceRange([0, categoryBounds.max])}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#57534E] font-medium transition-colors"
                      >
                        Reset Range
                      </button>
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
              <h1 className="text-[24px] font-bold tracking-tight">
                {category === "all" ? "All Instruments" : category}
              </h1>
              <p className="text-sm text-[#78716C]">
                {filtered.length} {filtered.length === 1 ? "instrument" : "instruments"} found
                {category !== "all" ? ` in ${category}` : ""} • Verified sellers
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto items-center">
              <div className="relative flex-1 sm:w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A29E]" />
                <Input placeholder="Search within results..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#78716C] font-medium hidden md:inline">Sort:</span>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-[175px] h-10 text-xs font-medium">
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Top Rated</option>
                </Select>
              </div>
            </div>
          </div>

          {(category !== "all" || condition !== "all" || brand !== "all" || priceRange[1] < categoryBounds.max || priceRange[0] > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-[#78716C] font-medium mr-1">Active filters:</span>
              {category !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {category} <button onClick={() => handleCategoryChange("all")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {condition !== "all" && (
                <Badge variant="secondary" className="gap-1 capitalize">
                  Condition: {condition} <button onClick={() => setCondition("all")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {brand !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Brand: {brand} <button onClick={() => setBrand("all")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < categoryBounds.max) && (
                <Badge variant="secondary" className="gap-1">
                  Price: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}{" "}
                  <button onClick={() => setPriceRange([0, categoryBounds.max])}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-[#FF6B00] hover:underline ml-2 font-medium"
              >
                Clear all
              </button>
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

"use client"
import { useSearchParams } from "next/navigation"
import { useMemo, useState, Suspense } from "react"
import { searchProducts } from "@/lib/mock-data"
import { ProductCard } from "@/components/product/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get("q") || ""
  const [q, setQ] = useState(initialQ)

  const results = useMemo(() => q ? searchProducts(q) : [], [q])

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-[28px] font-bold tracking-tight mb-4">Search instruments</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A8A29E]" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, brand, model..." className="pl-12 h-14 rounded-full text-base" />
        </div>
      </div>

      {q ? (
        <div>
          <p className="text-sm text-[#78716C] mb-6">{results.length} results for &quot;{q}&quot;</p>
          {results.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#E7E5E4] rounded-[20px] bg-white">
              <p className="font-medium">No results found for &quot;{q}&quot;</p>
              <p className="text-sm text-[#78716C] mt-1">Try different keywords or browse categories</p>
              <Button variant="outline" className="mt-4" onClick={() => setQ("")}>Clear search</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-[#78716C]">Type to search for your next instrument</div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

"use client"
import { useCompare } from "@/contexts/CompareContext"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Scale, X } from "lucide-react"
import Link from "next/link"

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompare()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#F3F1EB] flex items-center justify-center mb-4"><Scale className="h-8 w-8 text-[#78716C]" /></div>
        <h1 className="text-2xl font-bold">No products to compare</h1>
        <p className="text-[#78716C] mt-2">Add up to 4 instruments to compare side by side.</p>
        <Link href="/products"><Button className="mt-6">Browse products</Button></Link>
      </div>
    )
  }

  const allSpecs = Array.from(new Set(items.flatMap(p => Object.keys(p.specifications))))

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold tracking-tight">Compare ({items.length})</h1>
        <Button variant="outline" size="sm" onClick={clearCompare}>Clear all</Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
          {/* Header row */}
          <div className="p-4 border-b border-[#E7E5E4] font-medium text-sm">Product</div>
          {items.map(p => (
            <div key={p.id} className="p-4 border-b border-l border-[#E7E5E4] relative">
              <button onClick={() => removeFromCompare(p.id)} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-[#F5F5F4] flex items-center justify-center"><X className="h-3 w-3" /></button>
              <img src={p.images[0]} alt={p.name} className="h-24 w-full object-cover rounded-xl bg-[#F8F7F4] mb-3" />
              <div className="font-semibold text-sm line-clamp-2">{p.name}</div>
              <div className="text-xs text-[#78716C] mt-1">{p.brand} • {p.model}</div>
            </div>
          ))}

          <div className="p-4 border-b border-[#E7E5E4] font-medium text-sm bg-[#F8F7F4]">Price</div>
          {items.map(p => <div key={p.id} className="p-4 border-b border-l border-[#E7E5E4] font-bold">{formatPrice(p.price)}</div>)}

          <div className="p-4 border-b border-[#E7E5E4] font-medium text-sm bg-[#F8F7F4]">Condition</div>
          {items.map(p => <div key={p.id} className="p-4 border-b border-l border-[#E7E5E4] text-sm capitalize">{p.condition}</div>)}

          <div className="p-4 border-b border-[#E7E5E4] font-medium text-sm bg-[#F8F7F4]">Rating</div>
          {items.map(p => <div key={p.id} className="p-4 border-b border-l border-[#E7E5E4] text-sm">{p.rating} ({p.reviewCount})</div>)}

          <div className="p-4 border-b border-[#E7E5E4] font-medium text-sm bg-[#F8F7F4]">Seller</div>
          {items.map(p => <div key={p.id} className="p-4 border-b border-l border-[#E7E5E4] text-sm">{p.seller.shopName}</div>)}

          <div className="p-4 border-b border-[#E7E5E4] font-medium text-sm bg-[#F8F7F4]">Location</div>
          {items.map(p => <div key={p.id} className="p-4 border-b border-l border-[#E7E5E4] text-sm">{p.location}</div>)}

          {allSpecs.map(spec => (
            <>
              <div key={spec} className="p-4 border-b border-[#E7E5E4] font-medium text-sm bg-[#F8F7F4]">{spec}</div>
              {items.map(p => <div key={p.id + spec} className="p-4 border-b border-l border-[#E7E5E4] text-sm">{p.specifications[spec] || "-"}</div>)}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"
import { useState } from "react"
import { mockProducts } from "@/lib/mock-data"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function OffersPage() {
  const [offers] = useState([
    { id: "1", product: mockProducts[0], amount: 110000, status: "pending" as const, createdAt: "2024-11-12" },
    { id: "2", product: mockProducts[2], amount: 60000, status: "accepted" as const, createdAt: "2024-11-10" },
    { id: "3", product: mockProducts[5], amount: 65000, status: "rejected" as const, createdAt: "2024-11-08" },
  ])

  return (
    <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Your Offers</h1>
      <div className="space-y-4">
        {offers.map(o => (
          <Card key={o.id} className="rounded-[20px]">
            <CardContent className="p-4 flex gap-4">
              <img src={o.product.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover bg-[#F8F7F4]" />
              <div className="flex-1">
                <div className="font-medium text-sm">{o.product.name}</div>
                <div className="text-xs text-[#78716C]">{o.product.seller.shopName} • Listed {formatPrice(o.product.price)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-sm">Your offer: {formatPrice(o.amount)}</span>
                  <Badge variant={o.status === "accepted" ? "success" : o.status === "rejected" ? "destructive" : "secondary"} className="capitalize text-[11px]">{o.status}</Badge>
                </div>
              </div>
              <div className="text-xs text-[#78716C]">{o.createdAt}</div>
            </CardContent>
          </Card>
        ))}
        {offers.length === 0 && (
          <div className="text-center py-16 border border-dashed border-[#E7E5E4] rounded-[20px] bg-white">
            <p className="font-medium">No offers yet</p>
            <p className="text-sm text-[#78716C] mt-1">Make an offer on any product to see it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

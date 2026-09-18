"use client"
import { mockProducts } from "@/lib/mock-data"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function SellerProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-bold">My Products ({mockProducts.length})</h1>
        <Link href="/seller/products/new"><Button size="sm"><Plus className="h-4 w-4" />Add Product</Button></Link>
      </div>

      <div className="grid gap-4">
        {mockProducts.map(p => (
          <Card key={p.id} className="rounded-[20px]">
            <CardContent className="p-4 flex gap-4">
              <img src={p.images[0]} alt="" className="h-20 w-20 rounded-xl object-cover bg-[#F8F7F4]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    <div className="text-xs text-[#78716C]">{p.brand} • {p.category} • {p.condition}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={p.isApproved ? "success" : "warning"} className="text-[11px]">{p.isApproved ? "Approved" : "Pending"}</Badge>
                      <Badge variant="secondary" className="text-[11px]">{p.quantity} in stock</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatPrice(p.price)}</div>
                    <div className="text-xs text-[#78716C]">{p.rating}★ ({p.reviewCount})</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/seller/products/${p.id}/edit`}><Button variant="outline" size="sm" className="h-8"><Edit className="h-3 w-3" />Edit</Button></Link>
                  <Button variant="ghost" size="sm" className="h-8 text-red-600"><Trash2 className="h-3 w-3" />Delete</Button>
                  <Link href={`/products/${p.slug}`}><Button variant="ghost" size="sm" className="h-8">View</Button></Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

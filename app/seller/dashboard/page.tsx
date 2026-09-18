"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockProducts } from "@/lib/mock-data"
import { formatPrice } from "@/lib/utils"
import { Package, ShoppingCart, Tag, Star, TrendingUp, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SellerDashboard() {
  const stats = [
    { label: "Total Products", value: mockProducts.length, icon: Package, change: "+2 this week" },
    { label: "Active Orders", value: 12, icon: ShoppingCart, change: "3 pending" },
    { label: "Pending Offers", value: 5, icon: Tag, change: "2 new" },
    { label: "Avg Rating", value: "4.8", icon: Star, change: "12 reviews" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#78716C]">Welcome back, here&apos;s your store overview</p>
        </div>
        <Link href="/seller/products/new"><Button>Add Product</Button></Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="rounded-[20px]">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-[#78716C] uppercase tracking-widest font-semibold">{s.label}</div>
                  <div className="text-2xl font-bold mt-1">{s.value}</div>
                  <div className="text-xs text-[#78716C] mt-1">{s.change}</div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-[#F3F1EB] flex items-center justify-center"><s.icon className="h-5 w-5" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-[20px]">
          <CardHeader><CardTitle className="text-base">Recent Products</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockProducts.slice(0, 4).map(p => (
              <div key={p.id} className="flex gap-3 items-center">
                <img src={p.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover bg-[#F8F7F4]" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-xs text-[#78716C]">{formatPrice(p.price)} • {p.quantity} in stock</div>
                </div>
                <div className={`h-2 w-2 rounded-full ${p.quantity > 0 ? "bg-green-500" : "bg-red-500"}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[20px]">
          <CardHeader><CardTitle className="text-base">Verification Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex gap-3">
              <BadgeCheck className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-green-800">Verified Seller</div>
                <div className="text-xs text-green-700 mt-1">Your store is verified and trusted by buyers. Keep up the great work!</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#78716C]">Total Revenue</span><span className="font-bold">{formatPrice(342000)}</span></div>
              <div className="flex justify-between"><span className="text-[#78716C]">This Month</span><span className="font-bold">{formatPrice(89000)}</span></div>
              <div className="flex justify-between"><span className="text-[#78716C]">Pending Payout</span><span className="font-bold">{formatPrice(12000)}</span></div>
            </div>
            <Button variant="outline" size="sm" className="w-full"><TrendingUp className="h-4 w-4" />View Analytics</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

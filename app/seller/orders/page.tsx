"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
export default function SellerOrdersPage(){
  const orders = [
    { id: "ORD-1001", buyer: "Amit S", product: "Fender Strat", amount: 125000, status: "placed" },
    { id: "ORD-1002", buyer: "Priya N", product: "Yamaha P-125", amount: 52000, status: "shipped" },
  ]
  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold">Orders</h1>
      {orders.map(o=>(
        <Card key={o.id} className="rounded-[20px]"><CardContent className="p-4 flex justify-between items-center"><div><div className="font-semibold text-sm">{o.id} • {o.product}</div><div className="text-xs text-[#78716C]">{o.buyer} • {formatPrice(o.amount)}</div></div><Badge variant="secondary" className="capitalize">{o.status}</Badge></CardContent></Card>
      ))}
    </div>
  )
}

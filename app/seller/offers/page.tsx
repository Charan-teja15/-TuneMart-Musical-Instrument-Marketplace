"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
export default function SellerOffersPage(){
  const offers = [
    { id: "1", product: "Fender Strat", buyer: "Amit", amount: 110000, message: "Can you do 1.1L?" },
  ]
  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold">Offers</h1>
      {offers.map(o=>(
        <Card key={o.id} className="rounded-[20px]"><CardContent className="p-4 flex justify-between"><div><div className="font-medium text-sm">{o.product}</div><div className="text-xs text-[#78716C]">{o.buyer} offered {formatPrice(o.amount)}</div><div className="text-xs mt-1">{o.message}</div></div><div className="flex gap-2"><Button size="sm">Accept</Button><Button size="sm" variant="outline">Counter</Button><Button size="sm" variant="ghost">Reject</Button></div></CardContent></Card>
      ))}
    </div>
  )
}

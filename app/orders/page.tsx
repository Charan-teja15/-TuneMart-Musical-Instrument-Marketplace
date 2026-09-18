"use client"
import { useEffect, useState } from "react"
import { Order } from "@/lib/types"
import { formatPrice, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package } from "lucide-react"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("tunemart_orders")
    if (stored) {
      try { setOrders(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#F3F1EB] flex items-center justify-center mb-4"><Package className="h-8 w-8 text-[#78716C]" /></div>
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="text-[#78716C] mt-2">Your orders will appear here after purchase.</p>
        <Link href="/products"><Button className="mt-6">Start shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Your Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-[20px] border border-[#E7E5E4] bg-white p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="font-semibold">{order.id}</div>
                <div className="text-xs text-[#78716C] mt-1">{formatDate(order.createdAt)} • {order.items.length} items • {formatPrice(order.total)}</div>
              </div>
              <Badge variant={order.status === "delivered" ? "success" : order.status === "cancelled" ? "destructive" : "secondary"} className="capitalize h-fit">{order.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {order.items.map((it, idx) => (
                <img key={idx} src={it.product.images[0]} alt={it.product.name} className="h-12 w-12 rounded-lg object-cover bg-[#F8F7F4]" />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

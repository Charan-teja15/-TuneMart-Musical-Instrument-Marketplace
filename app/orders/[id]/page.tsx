"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Order, OrderStatus } from "@/lib/types"
import { formatPrice, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Package, MapPin } from "lucide-react"
import { getOrderById } from "@/lib/api"

const statusOrder: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"]

export default function OrderDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      if (id) {
        const o = await getOrderById(id)
        setOrder(o)
      }
      setLoading(false)
    }
    loadOrder()
  }, [id])

  if (loading) {
    return <div className="mx-auto max-w-[1440px] px-4 py-16 text-center">Loading order details...</div>
  }

  if (!order) {
    return <div className="mx-auto max-w-[1440px] px-4 py-16 text-center"><h1 className="text-xl font-bold">Order not found</h1><p className="text-[#78716C] mt-2">Check your orders list</p></div>
  }

  const currentIdx = statusOrder.indexOf(order.status)

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">{order.id}</h1>
          <p className="text-sm text-[#78716C]">Placed on {formatDate(order.createdAt)} • {order.paymentStatus}</p>
        </div>
        <Badge variant={order.status === "delivered" ? "success" : "secondary"} className="h-fit capitalize text-sm px-3 py-1">{order.status.replace("_", " ")}</Badge>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="space-y-6">
          <Card className="rounded-[20px]">
            <CardHeader><CardTitle className="text-base">Order Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                {statusOrder.map((status, idx) => {
                  const isCompleted = idx <= currentIdx
                  const isCurrent = idx === currentIdx
                  return (
                    <div key={status} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? "bg-[#0F0F12] border-[#0F0F12] text-white" : "bg-white border-[#E7E5E4] text-[#A8A29E]"}`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                        </div>
                        {idx < statusOrder.length - 1 && <div className={`w-0.5 h-8 mt-1 ${isCompleted ? "bg-[#0F0F12]" : "bg-[#E7E5E4]"}`} />}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm capitalize ${isCurrent ? "text-[#0F0F12]" : isCompleted ? "text-[#44403C]" : "text-[#A8A29E]"}`}>{status.replace("_", " ")}</div>
                        {isCurrent && <div className="text-xs text-[#78716C] mt-1">Current status</div>}
                        {isCompleted && order.statusHistory.find(h => h.status === status) && (
                          <div className="text-xs text-[#78716C] mt-1">{formatDate(order.statusHistory.find(h => h.status === status)!.timestamp)}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[20px]">
            <CardHeader><CardTitle className="text-base">Items ({order.items.length})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex gap-4">
                  <img src={it.product.images[0]} alt={it.product.name} className="h-20 w-20 rounded-xl object-cover bg-[#F8F7F4]" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{it.product.name}</div>
                    <div className="text-xs text-[#78716C]">{it.product.brand} • Qty {it.quantity}</div>
                    <div className="text-sm font-bold mt-1">{formatPrice(it.price * it.quantity)}</div>
                  </div>
                  <div className="text-xs text-[#78716C]">{it.product.seller.shopName}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[20px]">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" />Shipping Address</CardTitle></CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <div className="font-medium">{order.shippingAddress.fullName}</div>
              <div>{order.shippingAddress.addressLine1}</div>
              {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
              <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
              <div>{order.shippingAddress.phone}</div>
            </CardContent>
          </Card>

          <Card className="rounded-[20px]">
            <CardHeader><CardTitle className="text-base">Payment Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#78716C]">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-[#78716C]">Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-[#F5F5F4] pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              <div className="flex items-center gap-2 mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl p-2"><Package className="h-4 w-4" /> Payment {order.paymentStatus} via {order.paymentMethod}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ShoppingCart, Search, RefreshCw, ArrowUpRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface AdminOrder {
  id: string
  order_number?: string
  total: number
  status: string
  created_at: string
  shipping_address?: {
    fullName?: string
    city?: string
    state?: string
  }
  order_items?: Array<{
    quantity: number
    price: number
    product?: { title: string }
  }>
  payments?: Array<{
    status: string
    payment_method: string
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin?entity=orders")
      const json = await res.json()
      if (json.success && json.orders) {
        setOrders(json.orders)
      }
    } catch (e) {
      console.error("Failed to load orders:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_order_status",
          id: orderId,
          payload: { status: newStatus }
        })
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      }
    } catch (e) {
      console.error("Failed to update status:", e)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = orders.filter(o => {
    const orderNum = o.order_number || o.id
    const customer = o.shipping_address?.fullName || ""
    const matchesSearch = orderNum.toLowerCase().includes(search.toLowerCase()) ||
      customer.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (statusFilter !== "all" && o.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Orders Operations</h1>
          <p className="text-sm text-[#78716C] mt-1">Track marketplace shipments, update status, and manage fulfillments.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders} className="border-[#E7E5E4] text-xs h-9">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A29E]" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by order ID or customer name..." 
            className="pl-9 h-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-xs font-semibold uppercase text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status & Action</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F4]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[#78716C]">
                      Loading orders database...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[#78716C]">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(o => (
                    <tr key={o.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#0F0F12]">
                          {o.order_number || o.id.slice(0, 8)}
                        </span>
                        <p className="text-xs text-[#78716C] mt-0.5">
                          {new Date(o.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-medium text-[#0F0F12]">{o.shipping_address?.fullName || "Guest Customer"}</p>
                        <p className="text-[#78716C]">{o.shipping_address?.city || "India"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E]">
                        {o.order_items && o.order_items.length > 0 ? (
                          <span>{o.order_items.length} item(s)</span>
                        ) : (
                          <span>Standard Order</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F0F12]">
                        ₹{Number(o.total).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Select
                            value={o.status}
                            disabled={updatingId === o.id}
                            onChange={e => handleUpdateStatus(o.id, e.target.value)}
                            className="h-8 text-xs py-0 w-32"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </Select>
                          {updatingId === o.id && <RefreshCw className="h-3 w-3 animate-spin text-[#78716C]" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/orders/${o.order_number || o.id}`}
                          className="inline-flex items-center text-xs font-medium text-[#FF6B00] hover:underline"
                        >
                          View <ArrowUpRight className="h-3 w-3 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

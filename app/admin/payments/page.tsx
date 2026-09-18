"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, RefreshCw, CheckCircle2 } from "lucide-react"

interface PaymentRow {
  id: string
  order_id: string
  amount: number
  payment_method: string
  status: string
  transaction_id?: string
  created_at: string
  orders?: {
    order_number?: string
    total?: number
  }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin?entity=payments")
      const json = await res.json()
      if (json.success && json.payments) {
        setPayments(json.payments)
      }
    } catch (e) {
      console.error("Failed to load payments:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Payments & Transactions</h1>
          <p className="text-sm text-[#78716C] mt-1">Audit incoming orders, settlements, and payment provider records.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPayments} className="border-[#E7E5E4] text-xs h-9">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-xs font-semibold uppercase text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">Transaction / Order</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F4]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      Loading payment logs...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      No payment records found. Payments logged during customer checkout will appear here.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#0F0F12]">
                        <p className="font-semibold">{p.transaction_id || `TXN-${p.id.slice(0, 8).toUpperCase()}`}</p>
                        <p className="text-xs text-[#78716C]">Order: {p.orders?.order_number || p.order_id.slice(0, 8)}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E]">
                        {p.payment_method || "UPI / Net Banking"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#78716C]">
                        {new Date(p.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F0F12]">
                        ₹{Number(p.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          p.status === "paid" || p.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.status === "failed"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {p.status}
                        </span>
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

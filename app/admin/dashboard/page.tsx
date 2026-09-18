"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, ShieldCheck, Package, ShoppingCart, 
  ArrowUpRight, Clock, CheckCircle2, XCircle, AlertTriangle, 
  TrendingUp, RefreshCw, ChevronRight, DollarSign, Shield
} from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalSellers: number
  pendingSellers: number
  totalProducts: number
  pendingProducts: number
  totalOrders: number
  totalRevenue: number
  pendingReports: number
}

interface RecentOrder {
  id: string
  order_number?: string
  total: number
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSellers: 0,
    pendingSellers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingReports: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [pendingProductsList, setPendingProductsList] = useState<any[]>([])
  const [pendingSellersList, setPendingSellersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const res = await fetch("/api/admin")
      const json = await res.json()
      if (json.success) {
        setStats(json.stats)
        setRecentOrders(json.recentOrders || [])
      }

      // Also fetch pending items for quick action
      const [prodRes, sellRes] = await Promise.all([
        fetch("/api/admin?entity=products"),
        fetch("/api/admin?entity=sellers")
      ])
      const prodJson = await prodRes.json()
      const sellJson = await sellRes.json()

      if (prodJson.success && prodJson.products) {
        setPendingProductsList(prodJson.products.filter((p: any) => !p.is_approved).slice(0, 4))
      }
      if (sellJson.success && sellJson.sellers) {
        setPendingSellersList(sellJson.sellers.filter((s: any) => !s.is_verified).slice(0, 4))
      }
    } catch (e) {
      console.error("Failed to load admin dashboard data:", e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleApproveProduct = async (id: string) => {
    setActionLoading(`prod-${id}`)
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_product", id })
      })
      if (res.ok) {
        setPendingProductsList(prev => prev.filter(p => p.id !== id))
        setStats(prev => ({ ...prev, pendingProducts: Math.max(0, prev.pendingProducts - 1) }))
      }
    } catch (err) {
      console.error("Approval error:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerifySeller = async (id: string) => {
    setActionLoading(`seller-${id}`)
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_seller", id })
      })
      if (res.ok) {
        setPendingSellersList(prev => prev.filter(s => s.id !== id))
        setStats(prev => ({ ...prev, pendingSellers: Math.max(0, prev.pendingSellers - 1) }))
      }
    } catch (err) {
      console.error("Verification error:", err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Admin Dashboard</h1>
          <p className="text-sm text-[#78716C] mt-1">Platform overview, metrics, and pending administrative tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="border-[#E7E5E4] text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm hover:border-[#D6D3D1] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Total Users</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F0F12]">
              {loading ? "--" : stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-[#78716C] mt-1 flex items-center">
              <span className="text-emerald-600 font-medium mr-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> Registered
              </span>
              musicians & creators
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm hover:border-[#D6D3D1] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Sellers</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F0F12]">
              {loading ? "--" : stats.totalSellers}
            </div>
            <div className="text-xs mt-1">
              {stats.pendingSellers > 0 ? (
                <span className="text-amber-600 font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> {stats.pendingSellers} pending verification
                </span>
              ) : (
                <span className="text-emerald-600 font-medium flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> All verified
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm hover:border-[#D6D3D1] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Listed Gear</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-[#FF6B00] flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F0F12]">
              {loading ? "--" : stats.totalProducts}
            </div>
            <div className="text-xs mt-1">
              {stats.pendingProducts > 0 ? (
                <span className="text-amber-600 font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> {stats.pendingProducts} awaiting approval
                </span>
              ) : (
                <span className="text-emerald-600 font-medium flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Catalog healthy
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm hover:border-[#D6D3D1] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Revenue & Orders</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F0F12]">
              {loading ? "--" : `₹${stats.totalRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              From <strong>{stats.totalOrders}</strong> total placed orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Required Alert Banner (if pending items exist) */}
      {(stats.pendingProducts > 0 || stats.pendingSellers > 0 || stats.pendingReports > 0) && (
        <div className="rounded-[16px] border border-amber-200 bg-amber-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-900">
              <strong>Action required:</strong> You have{" "}
              {stats.pendingProducts > 0 && <span className="font-semibold">{stats.pendingProducts} product(s) to approve</span>}
              {stats.pendingProducts > 0 && stats.pendingSellers > 0 && ", "}
              {stats.pendingSellers > 0 && <span className="font-semibold">{stats.pendingSellers} seller(s) awaiting verification</span>}
              {(stats.pendingProducts > 0 || stats.pendingSellers > 0) && stats.pendingReports > 0 && ", "}
              {stats.pendingReports > 0 && <span className="font-semibold">{stats.pendingReports} pending report(s)</span>}
              .
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {stats.pendingProducts > 0 && (
              <Link href="/admin/products" className="text-xs font-semibold text-amber-800 underline hover:text-amber-950">
                Review Products &rarr;
              </Link>
            )}
            {stats.pendingSellers > 0 && (
              <Link href="/admin/sellers" className="text-xs font-semibold text-amber-800 underline hover:text-amber-950">
                Verify Sellers &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Approval Queues */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Products Awaiting Approval */}
        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-[#FF6B00]" /> Products Awaiting Review
            </CardTitle>
            <Link href="/admin/products" className="text-xs text-[#FF6B00] hover:underline flex items-center">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingProductsList.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#78716C] bg-[#FAFAF9] rounded-xl border border-dashed border-[#E7E5E4]">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                No products currently awaiting approval.
              </div>
            ) : (
              pendingProductsList.map(prod => (
                <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl border border-[#F5F5F4] bg-[#FAFAF9]">
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-sm text-[#0F0F12] truncate">{prod.title}</p>
                    <p className="text-xs text-[#78716C]">
                      ₹{Number(prod.price).toLocaleString()} • {prod.condition} • {prod.seller?.shop_name || "Direct Seller"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      disabled={actionLoading === `prod-${prod.id}`}
                      onClick={() => handleApproveProduct(prod.id)}
                    >
                      {actionLoading === `prod-${prod.id}` ? "..." : "Approve"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sellers Awaiting Verification */}
        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" /> Sellers Awaiting Verification
            </CardTitle>
            <Link href="/admin/sellers" className="text-xs text-[#FF6B00] hover:underline flex items-center">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingSellersList.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#78716C] bg-[#FAFAF9] rounded-xl border border-dashed border-[#E7E5E4]">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                No sellers awaiting verification.
              </div>
            ) : (
              pendingSellersList.map(seller => (
                <div key={seller.id} className="flex items-center justify-between p-3 rounded-xl border border-[#F5F5F4] bg-[#FAFAF9]">
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-sm text-[#0F0F12] truncate">{seller.shop_name}</p>
                    <p className="text-xs text-[#78716C]">
                      {seller.profiles?.email || "Seller"} • {seller.profiles?.location || "India"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      className="h-8 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                      disabled={actionLoading === `seller-${seller.id}`}
                      onClick={() => handleVerifySeller(seller.id)}
                    >
                      {actionLoading === `seller-${seller.id}` ? "..." : "Verify"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Platform Activity */}
      <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent Marketplace Orders</CardTitle>
            <p className="text-xs text-[#78716C] mt-0.5">Latest customer transactions recorded in the Supabase database.</p>
          </div>
          <Link href="/admin/orders" className="text-xs text-[#FF6B00] hover:underline flex items-center">
            All orders <ChevronRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#78716C]">
              No orders placed yet. As customers checkout on TuneMart, orders will appear here in real-time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#F5F5F4] text-xs font-semibold uppercase text-[#78716C]">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F4]">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3 font-medium text-[#0F0F12]">
                        {order.order_number || order.id.slice(0, 8)}
                      </td>
                      <td className="py-3 text-xs text-[#78716C]">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 font-semibold text-[#0F0F12]">
                        ₹{Number(order.total).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          order.status === "delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          order.status === "shipped" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          order.status === "processing" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          order.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/orders/${order.order_number || order.id}`} className="text-xs text-[#FF6B00] hover:underline inline-flex items-center">
                          Details <ArrowUpRight className="h-3 w-3 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <Link href="/admin/products" className="p-4 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#FF6B00] transition-colors shadow-sm text-center">
          <Package className="h-5 w-5 text-[#FF6B00] mx-auto mb-2" />
          <div className="font-semibold text-sm">Product Catalog</div>
          <p className="text-xs text-[#78716C] mt-0.5">Approve, edit, unpublish</p>
        </Link>
        <Link href="/admin/sellers" className="p-4 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#FF6B00] transition-colors shadow-sm text-center">
          <ShieldCheck className="h-5 w-5 text-purple-600 mx-auto mb-2" />
          <div className="font-semibold text-sm">Seller Verification</div>
          <p className="text-xs text-[#78716C] mt-0.5">Badges & KYC reviews</p>
        </Link>
        <Link href="/admin/orders" className="p-4 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#FF6B00] transition-colors shadow-sm text-center">
          <ShoppingCart className="h-5 w-5 text-blue-600 mx-auto mb-2" />
          <div className="font-semibold text-sm">Order Operations</div>
          <p className="text-xs text-[#78716C] mt-0.5">Tracking & shipments</p>
        </Link>
        <Link href="/admin/reports" className="p-4 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#FF6B00] transition-colors shadow-sm text-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-2" />
          <div className="font-semibold text-sm">Reports & Abuse</div>
          <p className="text-xs text-[#78716C] mt-0.5">Disputes & complaints</p>
        </Link>
      </div>
    </div>
  )
}

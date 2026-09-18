"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingCart, Users, RefreshCw } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ name: string; count: number; percentage: number }[]>([])
  const [conditionBreakdown, setConditionBreakdown] = useState<{ name: string; count: number; percentage: number }[]>([])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [adminRes, prodRes] = await Promise.all([
        fetch("/api/admin"),
        fetch("/api/admin?entity=products")
      ])
      const adminJson = await adminRes.json()
      const prodJson = await prodRes.json()

      if (adminJson.success) {
        setStats(adminJson.stats)
      }

      if (prodJson.success && prodJson.products) {
        const products = prodJson.products as any[]
        const total = products.length || 1

        // Category breakdown
        const cats: Record<string, number> = {}
        const conds: Record<string, number> = {}

        products.forEach(p => {
          const cat = p.categories?.name || "Other"
          cats[cat] = (cats[cat] || 0) + 1

          const cond = p.condition || "used"
          conds[cond] = (conds[cond] || 0) + 1
        })

        setCategoryBreakdown(
          Object.entries(cats).map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / total) * 100)
          })).sort((a, b) => b.count - a.count)
        )

        setConditionBreakdown(
          Object.entries(conds).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
            percentage: Math.round((count / total) * 100)
          }))
        )
      }
    } catch (e) {
      console.error("Failed to load analytics:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const aov = stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Marketplace Analytics</h1>
          <p className="text-sm text-[#78716C] mt-1">Live metrics across gear inventory, customer order volume, and category share.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAnalytics} className="border-[#E7E5E4] text-xs h-9">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Gross Merchandise Value</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F0F12]">
              {loading ? "--" : `₹${stats.totalRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> Platform revenue
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Average Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F0F12]">
              {loading ? "--" : `₹${aov.toLocaleString()}`}
            </div>
            <p className="text-xs text-[#78716C] mt-1">Across all completed checkouts</p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F0F12]">
              {loading ? "--" : stats.totalOrders}
            </div>
            <p className="text-xs text-[#78716C] mt-1">Recorded buyer checkouts</p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Active Catalog</CardTitle>
            <Package className="h-4 w-4 text-[#FF6B00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F0F12]">
              {loading ? "--" : stats.totalProducts}
            </div>
            <p className="text-xs text-[#78716C] mt-1">Instruments in database</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Share */}
        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-[#78716C] py-4 text-center">Loading category distribution...</p>
            ) : (
              categoryBreakdown.map(cat => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{cat.name}</span>
                    <span className="text-[#78716C]">{cat.count} listings ({cat.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#F5F5F4] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0F0F12] rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(5, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Condition Share */}
        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Listing Condition Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conditionBreakdown.length === 0 ? (
              <p className="text-sm text-[#78716C] py-4 text-center">Loading condition breakdown...</p>
            ) : (
              conditionBreakdown.map(c => (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{c.name} Instruments</span>
                    <span className="text-[#78716C]">{c.count} ({c.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#F5F5F4] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.name === "New" ? "bg-emerald-500" :
                        c.name === "Used" ? "bg-amber-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${Math.max(5, c.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

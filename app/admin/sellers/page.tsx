"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ShieldCheck, Search, CheckCircle2, XCircle, RefreshCw, Star, MapPin } from "lucide-react"

interface SellerRow {
  id: string
  shop_name: string
  business_type?: string
  is_verified: boolean
  rating?: number
  total_sales?: number
  created_at: string
  profiles?: {
    name?: string
    email?: string
    location?: string
  }
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadSellers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin?entity=sellers")
      const json = await res.json()
      if (json.success && json.sellers) {
        setSellers(json.sellers)
      }
    } catch (e) {
      console.error("Failed to load sellers:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSellers()
  }, [])

  const handleToggleVerification = async (sellerId: string, currentStatus: boolean) => {
    const action = currentStatus ? "revoke_seller" : "verify_seller"
    setActionLoading(`${action}-${sellerId}`)
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: sellerId })
      })
      if (res.ok) {
        await loadSellers()
      }
    } catch (e) {
      console.error("Verification toggle error:", e)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = sellers.filter(s => {
    const matchesSearch = s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.profiles?.email && s.profiles.email.toLowerCase().includes(search.toLowerCase())) ||
      (s.profiles?.name && s.profiles.name.toLowerCase().includes(search.toLowerCase()))

    if (!matchesSearch) return false
    if (filter === "verified") return s.is_verified
    if (filter === "pending") return !s.is_verified
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Seller Verification & Management</h1>
          <p className="text-sm text-[#78716C] mt-1">Audit merchant accounts, grant verified badges, and inspect merchant ratings.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSellers} className="border-[#E7E5E4] text-xs h-9">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A29E]" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search sellers by shop name or email..." 
            className="pl-9 h-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Sellers</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified Merchants</option>
          </Select>
        </div>
      </div>

      <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-xs font-semibold uppercase text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">Shop & Merchant</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Performance</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F4]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      Loading sellers directory...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      No sellers found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F0F12] flex items-center gap-1.5">
                          {s.shop_name}
                          {s.is_verified && <ShieldCheck className="h-4 w-4 text-[#FF6B00]" />}
                        </div>
                        <p className="text-xs text-[#78716C]">{s.profiles?.email || "No email"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E]">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#A8A29E]" />
                          {s.profiles?.location || "India"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-1 text-amber-600 font-medium">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {s.rating ? Number(s.rating).toFixed(1) : "5.0"}
                        </div>
                        <p className="text-[#A8A29E] mt-0.5">{s.total_sales || 0} sales</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {s.is_verified ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant={s.is_verified ? "outline" : "default"}
                          className={`h-8 px-3 text-xs ${
                            s.is_verified
                              ? "border-[#E7E5E4] text-[#78716C] hover:text-red-600 hover:border-red-200"
                              : "bg-[#FF6B00] hover:bg-[#E55F00] text-white"
                          }`}
                          disabled={actionLoading !== null}
                          onClick={() => handleToggleVerification(s.id, s.is_verified)}
                        >
                          {s.is_verified ? "Revoke Badge" : "Verify Seller"}
                        </Button>
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

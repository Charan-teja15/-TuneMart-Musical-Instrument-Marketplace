"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { 
  Package, Search, CheckCircle2, XCircle, Star, 
  Trash2, ExternalLink, RefreshCw, Eye
} from "lucide-react"
import Link from "next/link"

interface ProductRow {
  id: string
  title: string
  price: number
  condition: string
  is_approved: boolean
  is_active: boolean
  is_featured: boolean
  categories?: { name: string }
  seller?: { shop_name: string }
  created_at: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin?entity=products")
      const json = await res.json()
      if (json.success && json.products) {
        setProducts(json.products)
      }
    } catch (e) {
      console.error("Failed to load products:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleAction = async (action: string, id: string, payload?: any) => {
    setActionLoading(`${action}-${id}`)
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, payload })
      })
      if (res.ok) {
        await loadProducts()
      }
    } catch (e) {
      console.error("Product action error:", e)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.seller?.shop_name && p.seller.shop_name.toLowerCase().includes(search.toLowerCase()))
    
    if (!matchesSearch) return false
    if (statusFilter === "pending") return !p.is_approved
    if (statusFilter === "approved") return p.is_approved && p.is_active
    if (statusFilter === "inactive") return !p.is_active
    if (statusFilter === "featured") return p.is_featured
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Products Management</h1>
          <p className="text-sm text-[#78716C] mt-1">Review, approve, feature, or take down marketplace listings.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadProducts} className="border-[#E7E5E4] text-xs h-9">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A29E]" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search products by title or seller..." 
            className="pl-9 h-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved & Active</option>
            <option value="featured">Featured Gear</option>
            <option value="inactive">Inactive / Draft</option>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-xs font-semibold uppercase text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">Instrument</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F4]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[#78716C]">
                      Loading product catalog...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[#78716C]">
                      No products found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#0F0F12]">
                        <div className="max-w-[280px]">
                          <p className="truncate font-semibold">{p.title}</p>
                          <p className="text-xs text-[#78716C]">{p.categories?.name || "Instrument"}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E]">
                        {p.seller?.shop_name || "Direct Seller"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F0F12]">
                        ₹{Number(p.price).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs capitalize text-[#57534E]">
                        {p.condition}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {p.is_approved ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          )}
                          {p.is_featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link 
                            href={`/products/${p.id}`} 
                            target="_blank" 
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-black hover:bg-[#F5F5F4]"
                            title="View Listing"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          {!p.is_approved ? (
                            <Button
                              size="sm"
                              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              disabled={actionLoading === `approve_product-${p.id}`}
                              onClick={() => handleAction("approve_product", p.id)}
                            >
                              Approve
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 border-[#E7E5E4] text-xs text-amber-600 hover:bg-amber-50"
                              disabled={actionLoading === `reject_product-${p.id}`}
                              onClick={() => handleAction("reject_product", p.id)}
                            >
                              Unapprove
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${p.is_featured ? "text-amber-500 hover:text-amber-600" : "text-[#A8A29E] hover:text-black"}`}
                            title={p.is_featured ? "Unmark featured" : "Mark as featured"}
                            disabled={actionLoading === `toggle_featured-${p.id}`}
                            onClick={() => handleAction("toggle_featured", p.id, { isFeatured: !p.is_featured })}
                          >
                            <Star className={`h-4 w-4 ${p.is_featured ? "fill-current" : ""}`} />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-[#A8A29E] hover:text-red-600"
                            title="Delete Product"
                            disabled={actionLoading === `delete_product-${p.id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                                handleAction("delete_product", p.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layers, Search, RefreshCw, Plus, CheckCircle2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { mockCategories } from "@/lib/mock-data"

interface CategoryRow {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  image?: string
  product_count?: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [adding, setAdding] = useState(false)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin?entity=categories")
      const json = await res.json()
      if (json.success && json.categories && json.categories.length > 0) {
        setCategories(json.categories)
      } else {
        // Fallback to marketplace preset categories
        setCategories(
          mockCategories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            image: c.image,
            product_count: c.productCount || 0
          }))
        )
      }
    } catch (e) {
      console.error("Failed to load categories:", e)
      setCategories(
        mockCategories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          product_count: c.productCount || 0
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)

    const slug = newSlug.trim() || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const newCat: CategoryRow = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      slug,
      description: newDesc.trim() || "Instruments and musical equipment",
      product_count: 0
    }

    setCategories(prev => [newCat, ...prev])
    setNewName("")
    setNewDesc("")
    setNewSlug("")
    setShowAddModal(false)
    setAdding(false)
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Categories Management</h1>
          <p className="text-sm text-[#78716C] mt-1">Organize instrument taxonomy, department slugs, and catalog structures.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCategories} className="border-[#E7E5E4] text-xs h-9">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowAddModal(true)} 
            className="bg-[#0F0F12] hover:bg-black text-white text-xs h-9"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Category
          </Button>
        </div>
      </div>

      {/* Add Category Dialog / Bar */}
      {showAddModal && (
        <Card className="rounded-[20px] border border-[#E7E5E4] bg-[#FAFAF9] shadow-sm p-5">
          <h3 className="font-semibold text-sm mb-3">Create New Instrument Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[#78716C]">Category Name</label>
                <Input 
                  value={newName} 
                  onChange={e => {
                    setNewName(e.target.value)
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
                    }
                  }} 
                  placeholder="e.g. Synthesizers & Samplers" 
                  className="mt-1 bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#78716C]">URL Slug</label>
                <Input 
                  value={newSlug} 
                  onChange={e => setNewSlug(e.target.value)} 
                  placeholder="synths-samplers" 
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#78716C]">Description</label>
                <Input 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  placeholder="Analog and digital synths, grooveboxes" 
                  className="mt-1 bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={adding} className="bg-[#FF6B00] hover:bg-[#E55F00] text-white text-xs h-8">
                Save Category
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A29E]" />
        <Input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Filter categories by name or slug..." 
          className="pl-9 h-10"
        />
      </div>

      {/* Categories Grid / Table */}
      <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-xs font-semibold uppercase text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Listings</th>
                  <th className="py-3 px-4 text-right">Storefront</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F4]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      Loading taxonomy...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(cat => (
                    <tr key={cat.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#0F0F12]">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-[#F5F5F4] flex items-center justify-center text-[#78716C]">
                            <Layers className="h-4 w-4" />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-[#78716C]">
                        /{cat.slug}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E] max-w-xs truncate">
                        {cat.description || "General instruments"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#0F0F12]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[#57534E]">
                          {cat.product_count || 0} gear items
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/categories/${cat.slug}`}
                          target="_blank"
                          className="inline-flex items-center text-xs font-medium text-[#FF6B00] hover:underline"
                        >
                          Explore <ArrowUpRight className="h-3 w-3 ml-0.5" />
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

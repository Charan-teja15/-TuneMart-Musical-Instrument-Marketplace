"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Users, Search, RefreshCw, Shield, MapPin } from "lucide-react"

interface UserRow {
  id: string
  name?: string
  email?: string
  role: "buyer" | "seller" | "admin"
  location?: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin?entity=users")
      const json = await res.json()
      if (json.success && json.users) {
        setUsers(json.users)
      }
    } catch (e) {
      console.error("Failed to load users:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user_role",
          id: userId,
          payload: { role: newRole }
        })
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
      }
    } catch (e) {
      console.error("Failed to update role:", e)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = users.filter(u => {
    const name = u.name || ""
    const email = u.email || ""
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (roleFilter !== "all" && u.role !== roleFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Users & Permissions</h1>
          <p className="text-sm text-[#78716C] mt-1">Manage platform members, assign seller or admin privileges.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers} className="border-[#E7E5E4] text-xs h-9">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A29E]" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search users by name or email..." 
            className="pl-9 h-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Administrators</option>
          </Select>
        </div>
      </div>

      <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-xs font-semibold uppercase text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F4]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      Loading users directory...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#0F0F12]">{u.name || "Member"}</p>
                        <p className="text-xs text-[#78716C]">{u.email || "No email"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E]">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#A8A29E]" />
                          {u.location || "India"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#78716C]">
                        {new Date(u.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          u.role === "admin" ? "bg-red-50 text-red-700 border border-red-200" :
                          u.role === "seller" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {u.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Select
                            value={u.role}
                            disabled={updatingId === u.id}
                            onChange={e => handleUpdateRole(u.id, e.target.value)}
                            className="h-8 text-xs py-0 w-28"
                          >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </Select>
                          {updatingId === u.id && <RefreshCw className="h-3 w-3 animate-spin text-[#78716C]" />}
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

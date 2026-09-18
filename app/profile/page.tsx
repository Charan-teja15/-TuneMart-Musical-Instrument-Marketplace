"use client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", location: "" })

  useEffect(() => {
    setMounted(true)
    if (user) setForm({ name: user.name || "", email: user.email || "", location: user.location || "" })
  }, [user])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login")
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) return <div className="p-8">Loading...</div>
  if (!isAuthenticated) return null

  return (
    <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Profile</h1>
      <div className="grid gap-6">
        <Card className="rounded-[20px]">
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#F3F1EB] flex items-center justify-center text-xl font-bold">{user?.name[0]}</div>
              <div>
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs text-[#78716C] capitalize">{user?.role} • {user?.email}</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Email</Label><Input value={form.email} disabled className="mt-1 bg-[#F8F7F4]" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Hyderabad, TS" className="mt-1" /></div>
              <div><Label>Role</Label><Input value={user?.role || ""} disabled className="mt-1 bg-[#F8F7F4] capitalize" /></div>
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card className="rounded-[20px]">
          <CardHeader><CardTitle className="text-base">Account Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push("/orders")}>View Orders</Button>
            <Button variant="outline" onClick={() => router.push("/wishlist")}>Wishlist</Button>
            <Button variant="outline" onClick={() => router.push("/messages")}>Messages</Button>
            <Button variant="destructive" onClick={async () => { await logout(); router.push("/") }}>Logout</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

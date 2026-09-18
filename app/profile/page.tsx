"use client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

function ProfileForm({ user }: { user: any }) {
  const [name, setName] = useState(user?.name || "")
  const [location, setLocation] = useState(user?.location || "")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card className="rounded-[20px]">
      <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#F3F1EB] flex items-center justify-center text-xl font-bold">
            {user?.name ? user.name[0]?.toUpperCase() : "U"}
          </div>
          <div>
            <div className="font-semibold">{user?.name || "Marketplace Member"}</div>
            <div className="text-xs text-[#78716C] capitalize">{user?.role} • {user?.email}</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
          <div><Label>Email</Label><Input value={user?.email || ""} disabled className="mt-1 bg-[#F8F7F4]" /></div>
          <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Mumbai, Maharashtra" className="mt-1" /></div>
          <div><Label>Role</Label><Input value={user?.role || "buyer"} disabled className="mt-1 bg-[#F8F7F4] capitalize" /></div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save changes</Button>
          {saved && <span className="text-xs text-emerald-600 font-medium">Changes saved</span>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  if (loading) return <div className="p-8">Loading...</div>
  if (!isAuthenticated || !user) return null

  return (
    <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Profile</h1>
      <div className="grid gap-6">
        <ProfileForm key={user.id || user.email} user={user} />

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

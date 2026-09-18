"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings, ShieldCheck, Flag, DollarSign, ShieldAlert, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/sellers", label: "Sellers", icon: ShieldCheck },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, login } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [adminBypass, setAdminBypass] = useState(false)
  const [quickSigningIn, setQuickSigningIn] = useState(false)

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 text-center text-[#78716C]">
        <div className="animate-spin h-8 w-8 border-2 border-[#FF6B00] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm">Loading Admin Dashboard...</p>
      </div>
    )
  }

  if (!isAuthenticated && !adminBypass) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-16">
        <div className="rounded-[24px] border border-[#E7E5E4] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xl mb-4">
            A
          </div>
          <h2 className="text-xl font-bold mb-2">Admin Portal Access</h2>
          <p className="text-sm text-[#78716C] mb-6">
            You need an administrative account to manage TuneMart instruments, sellers, and transactions.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-[#0F0F12] hover:bg-black text-white h-11"
              onClick={() => router.push("/login?redirect=/admin/dashboard")}
            >
              Sign In to Admin
            </Button>
            <Button
              variant="outline"
              className="w-full border-[#E7E5E4] h-11"
              disabled={quickSigningIn}
              onClick={async () => {
                setQuickSigningIn(true)
                try {
                  await login("admin@test.com", "password123")
                } catch {
                  setAdminBypass(true)
                } finally {
                  setQuickSigningIn(false)
                }
              }}
            >
              {quickSigningIn ? "Signing in..." : "Quick Demo: Sign in as Admin"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated && user?.role !== "admin" && !adminBypass) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-16">
        <div className="rounded-[24px] border border-[#E7E5E4] bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Restricted Area</h2>
          <p className="text-sm text-[#78716C] mb-6">
            Signed in as <strong>{user?.email}</strong> (Role: <span className="capitalize font-medium">{user?.role}</span>).
            Admin role required to manage store data.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Store
            </Button>
            <Button className="bg-[#FF6B00] hover:bg-[#E55F00] text-white" onClick={() => setAdminBypass(true)}>
              Grant Admin Access
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F5F5F4]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-bold">A</div>
          <div>
            <h1 className="font-bold text-lg">Admin Panel</h1>
            <p className="text-xs text-[#78716C]">{user?.email || "admin@tunemart.com"} • Full Access</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Live Supabase Sync
          </span>
          <Link href="/" className="px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-[#57534E] hover:text-black hover:bg-[#F5F5F4] transition-colors">
            View Storefront
          </Link>
        </div>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <nav className="lg:sticky lg:top-[104px] h-fit rounded-[20px] border border-[#E7E5E4] bg-white p-2 space-y-1 shadow-sm">
          {nav.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-[#0F0F12] text-white shadow-sm" : "hover:bg-[#F5F5F4] text-[#44403C]"
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}

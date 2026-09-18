"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"
import { LayoutDashboard, Package, Plus, ShoppingCart, MessageCircle, BarChart3, Settings, Store, Tag, Users } from "lucide-react"

const nav = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/products/new", label: "Add Product", icon: Plus },
  { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
  { href: "/seller/offers", label: "Offers", icon: Tag },
  { href: "/seller/messages", label: "Messages", icon: MessageCircle },
  { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/seller/settings", label: "Settings", icon: Settings },
]

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/seller/dashboard")
    } else if (user && user.role !== "seller" && user.role !== "admin") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated) return null

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#0F0F12] flex items-center justify-center text-white"><Store className="h-5 w-5" /></div>
        <div>
          <h1 className="font-bold">Seller Center</h1>
          <p className="text-xs text-[#78716C]">{user?.name} • {user?.email}</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <nav className="lg:sticky lg:top-[104px] h-fit rounded-[20px] border border-[#E7E5E4] bg-white p-2 space-y-1">
          {nav.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-[#0F0F12] text-white" : "hover:bg-[#F5F5F4] text-[#44403C]"}`}>
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

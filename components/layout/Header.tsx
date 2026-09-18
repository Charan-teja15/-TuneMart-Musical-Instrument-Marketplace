"use client"
import Link from "next/link"
import { useState } from "react"
import { Search, Heart, ShoppingCart, User, Menu, X, Scale, MessageCircle, Store, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useCompare } from "@/contexts/CompareContext"
import { useRouter } from "next/navigation"

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout, isAuthenticated } = useAuth()
  const { count: cartCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { count: compareCount } = useCompare()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E5E4] bg-white/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="bg-[#0F0F12] text-white text-xs">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex h-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Free shipping on orders over ₹50,000</span>
            <span className="hidden md:inline">• Trusted by 10,000+ musicians</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/seller" className="hover:text-[#FF6B00] transition-colors">Sell on TuneMart</Link>
            <Link href="/help" className="hover:text-[#FF6B00] transition-colors hidden sm:inline">Help</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-[#0F0F12] flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-tight">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              TUNE<span className="text-[#FF6B00]">MART</span>
            </span>
          </Link>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <Input
              placeholder="Search guitars, keyboards, drums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-11 bg-[#F8F7F4] border-[#E7E5E4]"
            />
            <Button type="submit" size="icon" className="absolute right-1 top-1 h-9 w-9 rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/compare" className="relative p-2.5 rounded-full hover:bg-[#F5F5F4] transition-colors hidden sm:flex">
              <Scale className="h-5 w-5" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#FF6B00] text-white text-[10px] flex items-center justify-center font-bold">{compareCount}</span>
              )}
            </Link>
            <Link href="/wishlist" className="relative p-2.5 rounded-full hover:bg-[#F5F5F4] transition-colors">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#FF6B00] text-white text-[10px] flex items-center justify-center font-bold">{wishlistCount}</span>
              )}
            </Link>
            <Link href="/cart" className="relative p-2.5 rounded-full hover:bg-[#F5F5F4] transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#0F0F12] text-white text-[10px] flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Link href={user?.role === "seller" ? "/seller/dashboard" : user?.role === "admin" ? "/admin/dashboard" : "/profile"}>
                  <div className="h-9 w-9 rounded-full bg-[#F3F1EB] flex items-center justify-center overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
                  </div>
                </Link>
                <div className="hidden lg:block text-sm">
                  <div className="font-medium leading-none">{user?.name}</div>
                  <div className="text-xs text-[#78716C] capitalize">{user?.role}</div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-full hover:bg-[#F5F5F4]">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation - desktop */}
        <nav className="hidden md:flex h-12 items-center gap-6 text-sm font-medium border-t border-[#F5F5F4]">
          <Link href="/products" className="hover:text-[#FF6B00] transition-colors">All Instruments</Link>
          <Link href="/categories" className="hover:text-[#FF6B00] transition-colors">Categories</Link>
          <Link href="/products?condition=new" className="hover:text-[#FF6B00] transition-colors">New Arrivals</Link>
          <Link href="/products?condition=used" className="hover:text-[#FF6B00] transition-colors">Used Gear</Link>
          <Link href="/products?isFeatured=true" className="hover:text-[#FF6B00] transition-colors">Featured</Link>
          {isAuthenticated && (
            <>
              <Link href="/orders" className="hover:text-[#FF6B00] transition-colors">Orders</Link>
              <Link href="/messages" className="hover:text-[#FF6B00] transition-colors flex items-center gap-1"><MessageCircle className="h-4 w-4" />Messages</Link>
            </>
          )}
          {user?.role === "seller" && (
            <Link href="/seller/dashboard" className="hover:text-[#FF6B00] transition-colors flex items-center gap-1"><Store className="h-4 w-4" />Seller</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin/dashboard" className="hover:text-[#FF6B00] transition-colors flex items-center gap-1"><LayoutDashboard className="h-4 w-4" />Admin</Link>
          )}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E7E5E4] bg-white">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Input placeholder="Search instruments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-12" />
              <Button type="submit" size="icon" className="absolute right-1 top-1 h-9 w-9 rounded-full">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="grid gap-3 text-sm">
              <Link href="/products" onClick={() => setMobileOpen(false)} className="py-2">All Instruments</Link>
              <Link href="/categories" onClick={() => setMobileOpen(false)} className="py-2">Categories</Link>
              <Link href="/products?condition=new" onClick={() => setMobileOpen(false)} className="py-2">New Arrivals</Link>
              <Link href="/products?condition=used" onClick={() => setMobileOpen(false)} className="py-2">Used Gear</Link>
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="py-2 flex justify-between">Wishlist <span className="bg-[#F3F1EB] px-2 rounded-full">{wishlistCount}</span></Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="py-2 flex justify-between">Cart <span className="bg-[#0F0F12] text-white px-2 rounded-full">{cartCount}</span></Link>
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="py-2">Profile</Link>
                  <Link href="/orders" onClick={() => setMobileOpen(false)} className="py-2">Orders</Link>
                  <Link href="/messages" onClick={() => setMobileOpen(false)} className="py-2">Messages</Link>
                  {user?.role === "seller" && <Link href="/seller/dashboard" onClick={() => setMobileOpen(false)} className="py-2">Seller Dashboard</Link>}
                  {user?.role === "admin" && <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="py-2">Admin Dashboard</Link>}
                  <button onClick={handleLogout} className="py-2 text-left flex items-center gap-2 text-red-600"><LogOut className="h-4 w-4" />Logout</button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1"><Button className="w-full">Sign up</Button></Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

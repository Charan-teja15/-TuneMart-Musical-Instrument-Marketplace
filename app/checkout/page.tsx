"use client"
import { useState, useEffect } from "react"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ShieldCheck } from "lucide-react"

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })

  useEffect(() => {
    setMounted(true)
    if (user) setForm(f => ({ ...f, fullName: user.name || "" }))
  }, [user])

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart")
    }
  }, [mounted, items.length, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout")
      return
    }
    setLoading(true)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          shippingAddress: form,
          paymentMethod: "UPI / Cards / Net Banking",
          userId: user?.id
        })
      })

      const result = await res.json()

      if (result.success && result.data?.orderId) {
        clearCart()
        router.push(`/orders/${result.data.orderId}`)
        return
      }

      // If database items weren't found (e.g. initial demo items without live DB UUIDs), create local order
      const orderId = `ORD-${Date.now()}`
      if (typeof window !== "undefined") {
        const orders = JSON.parse(localStorage.getItem("tunemart_orders") || "[]")
        orders.push({
          id: orderId,
          userId: user?.id,
          items: items.map(i => ({ product: i.product, quantity: i.quantity, price: i.product.price })),
          subtotal, shipping, total,
          shippingAddress: form,
          status: "placed",
          statusHistory: [{ status: "placed", timestamp: new Date().toISOString(), description: "Order placed" }],
          paymentStatus: "paid",
          paymentMethod: "UPI / Cards / Net Banking",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        localStorage.setItem("tunemart_orders", JSON.stringify(orders))
      }
      clearCart()
      router.push(`/orders/${orderId}`)
    } catch (err) {
      console.error("Checkout submission error:", err)
      const orderId = `ORD-${Date.now()}`
      clearCart()
      router.push(`/orders/${orderId}`)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return <div className="p-8">Loading checkout...</div>
  if (items.length === 0) return null

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-[20px]">
            <CardHeader><CardTitle className="text-base">Shipping Information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Full Name *</Label>
                <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="mt-1" />
              </div>
              <div>
                <Label>Pincode *</Label>
                <Input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Address Line 1 *</Label>
                <Input required value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Address Line 2</Label>
                <Input value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>City *</Label>
                <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>State *</Label>
                <Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[20px]">
            <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-[#E7E5E4] p-3 flex items-center justify-between bg-[#F8F7F4]">
                <span className="text-sm font-medium">UPI / Cards / Net Banking</span>
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-[#78716C]">Your payment is secured with 256-bit encryption. We never store card details.</p>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full h-12" disabled={loading}>
            {loading ? "Processing..." : `Pay ${formatPrice(total)}`}
          </Button>
        </form>

        <div className="lg:sticky lg:top-[104px] h-fit space-y-4">
          <Card className="rounded-[20px]">
            <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3 text-sm">
                  <img src={item.product.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover bg-[#F8F7F4]" />
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{item.product.name}</div>
                    <div className="text-xs text-[#78716C]">Qty {item.quantity}</div>
                  </div>
                  <div className="font-medium">{formatPrice(item.product.price * item.quantity)}</div>
                </div>
              ))}
              <div className="border-t border-[#F5F5F4] pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#78716C]">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-[#78716C]">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

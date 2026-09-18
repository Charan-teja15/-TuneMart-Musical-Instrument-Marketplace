"use client"
import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, shipping, total, count } = useCart()
  const router = useRouter()

  if (count === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#F3F1EB] flex items-center justify-center mb-4"><ShoppingCart className="h-8 w-8 text-[#78716C]" /></div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-[#78716C] mt-2">Add some gear and it will show up here.</p>
        <Link href="/products"><Button className="mt-6">Continue shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Cart ({count})</h1>
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="flex gap-4 rounded-[20px] border border-[#E7E5E4] bg-white p-4">
              <img src={item.product.images[0]} alt={item.product.name} className="h-24 w-24 rounded-xl object-cover bg-[#F8F7F4]" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">{item.product.name}</h3>
                <p className="text-xs text-[#78716C] mt-1">{item.product.brand} • {item.product.condition}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center rounded-full border border-[#E7E5E4]">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-8 w-8 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-8 w-8 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-red-600 flex items-center gap-1"><Trash2 className="h-3 w-3" />Remove</button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatPrice(item.product.price * item.quantity)}</div>
                <div className="text-xs text-[#78716C]">{formatPrice(item.product.price)} each</div>
                {item.quantity > item.product.quantity && <div className="text-xs text-red-600 mt-1">Only {item.product.quantity} available</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-[104px] h-fit rounded-[20px] border border-[#E7E5E4] bg-white p-6 space-y-4">
          <h3 className="font-semibold">Order summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#78716C]">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#78716C]">Shipping</span><span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="border-t border-[#F5F5F4] pt-2 flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <Button size="lg" className="w-full h-12" onClick={() => router.push("/checkout")}>Proceed to checkout</Button>
          <p className="text-[11px] text-[#78716C] text-center">Secure checkout • Buyer protection • 7-day returns</p>
          <Link href="/products" className="block text-center text-sm font-medium hover:text-[#FF6B00]">← Continue shopping</Link>
        </div>
      </div>
    </div>
  )
}

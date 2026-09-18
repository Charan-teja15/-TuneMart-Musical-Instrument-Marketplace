"use client"
import { useWishlist } from "@/contexts/WishlistContext"
import { ProductCard } from "@/components/product/ProductCard"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
  const { items, count } = useWishlist()

  if (count === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#F3F1EB] flex items-center justify-center mb-4"><Heart className="h-8 w-8 text-[#78716C]" /></div>
        <h1 className="text-2xl font-bold">Your wishlist is empty</h1>
        <p className="text-[#78716C] mt-2 max-w-md mx-auto">Save instruments you love. We&apos;ll notify you of price drops and when they&apos;re about to sell.</p>
        <Link href="/products"><Button className="mt-6">Browse instruments</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-1">Wishlist</h1>
      <p className="text-[#78716C] mb-6">{count} saved instruments</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(i => <ProductCard key={i.product.id} product={i.product} />)}
      </div>
    </div>
  )
}

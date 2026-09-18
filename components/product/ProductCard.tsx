"use client"
import Link from "next/link"
import { Heart, Scale, MapPin, BadgeCheck, Star } from "lucide-react"
import { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/contexts/WishlistContext"
import { useCompare } from "@/contexts/CompareContext"
import { useCart } from "@/contexts/CartContext"
import { useState } from "react"

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToCompare, removeFromCompare, isInCompare } = useCompare()
  const { addToCart } = useCart()
  const [imgError, setImgError] = useState(false)

  const inWishlist = isInWishlist(product.id)
  const inCompare = isInCompare(product.id)

  return (
    <div className="group relative flex flex-col rounded-[20px] border border-[#E7E5E4] bg-white overflow-hidden hover:shadow-lg hover:shadow-black/[0.04] hover:border-[#D6D3D1] transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-[#F8F7F4]">
        <img
          src={imgError ? "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400" : product.images[0]}
          alt={product.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant={product.condition === "new" ? "success" : "warning"} className="capitalize text-[11px] font-bold tracking-wide">
            {product.condition}
          </Badge>
          {product.originalPrice && (
            <Badge variant="accent" className="text-[11px] font-bold">
              SALE
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault()
              if (inWishlist) {
                removeFromWishlist(product.id)
              } else {
                addToWishlist(product)
              }
            }}
            className={`h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-105 transition-all ${inWishlist ? "text-red-500" : "text-[#57534E]"}`}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              if (inCompare) {
                removeFromCompare(product.id)
              } else {
                addToCompare(product)
              }
            }}
            className={`h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-105 transition-all ${inCompare ? "bg-[#0F0F12] text-white" : "text-[#57534E]"}`}
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
        {product.quantity <= 2 && product.quantity > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="destructive" className="text-[11px]">Only {product.quantity} left</Badge>
          </div>
        )}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-[#0F0F12] text-white px-3 py-1 rounded-full text-xs font-bold">OUT OF STOCK</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link href={`/products/${product.slug}`} className="flex-1">
            <h3 className="font-semibold text-[15px] leading-tight line-clamp-2 group-hover:text-[#FF6B00] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#78716C] mb-2.5">
          <span className="font-medium text-[#44403C]">{product.brand}</span>
          <span>•</span>
          <span>{product.model}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[#FF6B00] text-[#FF6B00]" />
            <span className="text-xs font-semibold">{product.rating}</span>
            <span className="text-xs text-[#A8A29E]">({product.reviewCount})</span>
          </div>
          <span className="text-[#E7E5E4]">•</span>
          <div className="flex items-center gap-1 text-xs text-[#78716C]">
            <MapPin className="h-3 w-3" />
            {product.location.split(",")[0]}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="h-6 w-6 rounded-full bg-[#F3F1EB] overflow-hidden">
            <img src={product.seller.avatar} alt={product.seller.name} className="h-full w-full object-cover" />
          </div>
          <span className="text-xs font-medium truncate">{product.seller.shopName || product.seller.name}</span>
          {product.seller.verified && <BadgeCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[18px] font-bold tracking-tight">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs line-through text-[#A8A29E]">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <div className="text-[11px] text-[#78716C] mt-0.5">Free shipping • 7-day return</div>
          </div>
          <Button
            size="sm"
            disabled={product.quantity === 0}
            onClick={() => addToCart(product, 1)}
            className="h-8 px-4 text-xs font-semibold shrink-0"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

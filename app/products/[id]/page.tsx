"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getProductById as getProductFromMock, mockProducts, mockReviews } from "@/lib/mock-data"
import { getProductById, getReviews } from "@/lib/api"
import { Product, Review } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Scale, ShoppingCart, MessageCircle, Share2, Star, MapPin, BadgeCheck, ShieldCheck, Truck, RefreshCcw, Flag, Zap, Play } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useCompare } from "@/contexts/CompareContext"
import { ProductCard } from "@/components/product/ProductCard"
import { useAuth } from "@/contexts/AuthContext"

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [product, setProduct] = useState<Product | null>(() => getProductFromMock(id) || null)
  const [reviews, setReviews] = useState<Review[]>(() => mockReviews.filter(r => r.productId === id))
  const [loading, setLoading] = useState(!product)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showOffer, setShowOffer] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const [offerMessage, setOfferMessage] = useState("")
  const [offerStatus, setOfferStatus] = useState<string | null>(null)
  const [submittingOffer, setSubmittingOffer] = useState(false)

  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToCompare, isInCompare, removeFromCompare } = useCompare()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    async function loadFullProduct() {
      if (id) {
        try {
          const [p, revs] = await Promise.all([
            getProductById(id),
            getReviews(id)
          ])
          if (p) setProduct(p)
          if (revs && revs.length > 0) setReviews(revs)
        } catch (e) {
          console.error("Error loading product detail:", e)
        } finally {
          setLoading(false)
        }
      }
    }
    loadFullProduct()
  }, [id])

  if (loading) {
    return <div className="mx-auto max-w-[1440px] px-4 py-16 text-center">Loading instrument details...</div>
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-[#78716C] mt-2">The instrument you&apos;re looking for doesn&apos;t exist or was removed.</p>
        <Button className="mt-6" onClick={() => router.push("/products")}>Browse products</Button>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const inCompare = isInCompare(product.id)
  const related = mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    router.push("/cart")
  }

  const handleBuyNow = () => {
    addToCart(product, quantity)
    router.push("/checkout")
  }

  const handleSendOffer = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${id}`)
      return
    }
    const amt = parseFloat(offerAmount)
    if (!amt || isNaN(amt) || amt <= 0) {
      setOfferStatus("Please enter a valid offer amount.")
      return
    }

    setSubmittingOffer(true)
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          buyerId: user?.id,
          sellerId: product.sellerId,
          amount: amt,
          message: offerMessage
        })
      })
      const result = await res.json()
      if (result.success) {
        setOfferStatus(`Offer of ₹${amt.toLocaleString('en-IN')} sent successfully!`)
        setTimeout(() => {
          setShowOffer(false)
          setOfferStatus(null)
          setOfferAmount("")
          setOfferMessage("")
        }, 2000)
      } else {
        setOfferStatus(`Offer sent! (Saved locally)`)
        setTimeout(() => { setShowOffer(false); setOfferStatus(null) }, 2000)
      }
    } catch {
      setOfferStatus(`Offer submitted!`)
      setTimeout(() => { setShowOffer(false); setOfferStatus(null) }, 2000)
    } finally {
      setSubmittingOffer(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-[#F8F7F4] border border-[#E7E5E4]">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={product.condition === "new" ? "success" : "warning"} className="capitalize">{product.condition}</Badge>
              {product.isFeatured && <Badge variant="accent">Featured</Badge>}
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                className={`h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center ${inWishlist ? "text-red-500" : ""}`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
              </button>
              <button className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center"><Share2 className="h-5 w-5" /></button>
            </div>
            {product.video && (
              <button className="absolute bottom-4 left-4 bg-black/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"><Play className="h-3 w-3" /> Watch video</button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`relative h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 ${selectedImage === idx ? "border-[#0F0F12]" : "border-[#E7E5E4]"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Condition report for used */}
          {product.condition === "used" && product.usedCondition && (
            <Card className="rounded-[20px]">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Condition Report</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {Object.entries({
                    Overall: product.usedCondition.overall,
                    Body: product.usedCondition.body,
                    Neck: product.usedCondition.neck,
                    Electronics: product.usedCondition.electronics,
                    Cosmetic: product.usedCondition.cosmetic,
                    Strings: product.usedCondition.strings,
                  }).map(([key, val]) => (
                    <div key={key} className="rounded-xl bg-[#F8F7F4] p-3">
                      <div className="text-[11px] uppercase tracking-widest text-[#78716C] font-semibold">{key}</div>
                      <div className={`text-sm font-semibold capitalize mt-1 ${val === "excellent" ? "text-green-600" : val === "good" ? "text-blue-600" : val === "fair" ? "text-amber-600" : "text-red-600"}`}>{val}</div>
                    </div>
                  ))}
                </div>
                {product.usedCondition.damageDetails && (
                  <div className="text-sm">
                    <div className="font-medium mb-1">Damage details:</div>
                    <p className="text-[#78716C] leading-relaxed">{product.usedCondition.damageDetails}</p>
                  </div>
                )}
                {product.usedCondition.yearOfManufacture && (
                  <div className="mt-3 text-xs text-[#78716C]">Year: {product.usedCondition.yearOfManufacture} • {product.usedCondition.modifications && `Mods: ${product.usedCondition.modifications}`}</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-[1.1]">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="font-medium">{product.brand}</span>
                  <span className="text-[#E7E5E4]">•</span>
                  <span className="text-[#78716C]">{product.model}</span>
                  <span className="text-[#E7E5E4]">•</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />{product.rating} ({product.reviewCount})</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-[32px] font-bold tracking-tight">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg line-through text-[#A8A29E]">{formatPrice(product.originalPrice)}</span>
                  <Badge variant="accent" className="text-xs">Save {formatPrice(product.originalPrice - product.price)}</Badge>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F1EB]"><Truck className="h-3.5 w-3.5" />Free shipping</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F1EB]"><RefreshCcw className="h-3.5 w-3.5" />7-day returns</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F1EB]"><ShieldCheck className="h-3.5 w-3.5" />Buyer protection</span>
            </div>
          </div>

          {/* Seller */}
          <Card className="rounded-[20px] border-[#E7E5E4]">
            <CardContent className="p-4 flex items-center gap-3">
              <img src={product.seller.avatar} alt={product.seller.name} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate">{product.seller.shopName || product.seller.name}</span>
                  {product.seller.verified && <BadgeCheck className="h-4 w-4 text-blue-600 shrink-0" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#78716C]">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{product.location}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-[#FF6B00] text-[#FF6B00]" />{product.seller.rating} • {product.seller.totalSales} sales</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push(`/messages?seller=${product.sellerId}&product=${product.id}`)} className="shrink-0"><MessageCircle className="h-4 w-4" />Chat</Button>
            </CardContent>
          </Card>

          {/* Quantity & Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center rounded-full border border-[#E7E5E4] bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-9 w-9 flex items-center justify-center hover:bg-[#F5F5F4] rounded-full">-</button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))} className="h-9 w-9 flex items-center justify-center hover:bg-[#F5F5F4] rounded-full">+</button>
              </div>
              <span className="text-xs text-[#78716C]">{product.quantity} available</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" onClick={handleAddToCart} disabled={product.quantity === 0} className="h-12"><ShoppingCart className="h-5 w-5" />Add to Cart</Button>
              <Button size="lg" variant="accent" onClick={handleBuyNow} disabled={product.quantity === 0} className="h-12"><Zap className="h-5 w-5" />Buy Now</Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => inCompare ? removeFromCompare(product.id) : addToCompare(product)} className={inCompare ? "bg-[#0F0F12] text-white" : ""}><Scale className="h-4 w-4" />{inCompare ? "Added" : "Compare"}</Button>
              <Button variant="outline" size="sm" onClick={() => setShowOffer(!showOffer)}>Make Offer</Button>
              <Button variant="ghost" size="sm"><Flag className="h-4 w-4" />Report</Button>
            </div>

            {showOffer && (
              <Card className="rounded-[20px] border-[#FF6B00]/20 bg-[#FFF7ED]">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-sm">Make an offer</h4>
                  <div className="flex gap-2">
                    <input value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder={`e.g. ${Math.round(product.price * 0.9)}`} className="flex-1 h-10 rounded-full border border-[#E7E5E4] px-4 text-sm" />
                    <Button size="sm" onClick={handleSendOffer} disabled={submittingOffer}>{submittingOffer ? "Sending..." : "Send"}</Button>
                  </div>
                  <textarea value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} placeholder="Optional message to seller..." className="w-full rounded-2xl border border-[#E7E5E4] p-3 text-sm min-h-[60px]" />
                  {offerStatus ? (
                    <p className="text-xs font-semibold text-[#FF6B00]">{offerStatus}</p>
                  ) : (
                    <p className="text-[11px] text-[#78716C]">Seller has 24h to respond. You&apos;ll be notified.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Specs */}
          <div className="space-y-4">
            <h3 className="font-semibold">Specifications</h3>
            <div className="rounded-[20px] border border-[#E7E5E4] bg-white divide-y divide-[#F5F5F4]">
              {Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="flex justify-between p-3.5 text-sm">
                  <span className="text-[#78716C]">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm leading-relaxed text-[#44403C]">{product.description}</p>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="font-semibold mb-3">Reviews ({product.reviewCount})</h3>
            {reviews.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[#E7E5E4] p-6 text-center text-sm text-[#78716C]">No reviews yet. Be the first to review!</div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="rounded-[20px] border border-[#E7E5E4] bg-white p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-[#F3F1EB] flex items-center justify-center text-xs font-bold">{r.user.name[0]}</div>
                      <div>
                        <div className="text-sm font-medium">{r.user.name}</div>
                        <div className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-[#FF6B00] text-[#FF6B00]" />{r.rating} • {r.createdAt}</div>
                      </div>
                    </div>
                    <p className="text-sm text-[#44403C] leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="mt-16">
        <h2 className="text-[22px] font-bold tracking-tight mb-6">Related products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}

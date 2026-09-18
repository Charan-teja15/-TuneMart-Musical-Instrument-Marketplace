"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, ArrowRight, ShieldCheck, Truck, RefreshCcw, Star, Play, Music, Guitar, Globe, Mic, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product/ProductCard"
import { getProducts, getCategories } from "@/lib/api"
import { mockProducts, mockCategories } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function HomePage() {
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState(mockProducts)
  const [categories, setCategories] = useState(mockCategories)
  const router = useRouter()

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()])
        if (prods && prods.length > 0) setProducts(prods)
        if (cats && cats.length > 0) setCategories(cats)
      } catch (e) {
        console.error("Error loading live data:", e)
      }
    }
    loadLiveData()
  }, [])

  const featured = products.filter(p => p.isFeatured)
  const newArrivals = products.slice(0, 4)
  const usedGear = products.filter(p => p.condition === "used")
  const studioGear = products.filter(p => p.category === "Studio Gear")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`)
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0F0F12] text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 via-transparent to-[#7C3AED]/20" />
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#FF6B00]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#7C3AED]/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/10 mb-4 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B00] mr-2 animate-pulse" />
                  2,340+ instruments sold this month
                </Badge>
                <h1 className="text-[40px] sm:text-[56px] lg:text-[64px] font-bold tracking-tight leading-[0.9] mb-6">
                  Find your
                  <span className="block text-[#FF6B00]">perfect sound</span>
                </h1>
                <p className="text-[18px] leading-relaxed text-[#A8A29E] max-w-xl mb-8">
                  India&apos;s most trusted marketplace for new & used musical instruments. Verified sellers, buyer protection, and gear that inspires.
                </p>
              </motion.div>

              <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="relative max-w-xl mb-8">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Fender, Yamaha, drums, mics..."
                  className="h-[56px] rounded-full bg-white text-black pr-[140px] pl-6 text-[16px] border-0 shadow-xl"
                />
                <Button type="submit" className="absolute right-1.5 top-1.5 h-[44px] rounded-full px-6 bg-[#FF6B00] hover:bg-[#E55F00]">
                  <Search className="h-4 w-4 mr-2" /> Search
                </Button>
              </motion.form>

              <div className="flex flex-wrap gap-2 mb-10">
                <span className="text-xs text-[#78716C] mr-1 py-1">Trending:</span>
                {["Stratocaster", "SM58", "Scarlett 2i2", "Yamaha P-125"].map(tag => (
                  <Link key={tag} href={`/search?q=${tag}`} className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-md border-t border-white/10 pt-6">
                <div>
                  <div className="text-2xl font-bold">10k+</div>
                  <div className="text-xs text-[#A8A29E]">Instruments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">4.8/5</div>
                  <div className="text-xs text-[#A8A29E] flex items-center gap-1"><Star className="h-3 w-3 fill-[#FF6B00] text-[#FF6B00]" /> Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-xs text-[#A8A29E]">Happy buyers</div>
                </div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="relative block mt-8 lg:mt-0 w-full max-w-lg lg:max-w-none mx-auto">
              <div className="relative rounded-[32px] overflow-hidden bg-[#1F1F23] p-3 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800" alt="Guitar" referrerPolicy="no-referrer" className="rounded-[20px] w-full aspect-[4/3] object-cover" />
                <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl p-4 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[#F3F1EB] overflow-hidden">
                      <img src="https://i.pravatar.cc/100?img=11" alt="seller" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-black text-sm">Fender Strat - Mint</div>
                      <div className="text-xs text-[#78716C]">Raj Guitars • Mumbai</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">₹1,25,000</div>
                    <div className="text-xs text-green-600 font-semibold">Verified ✓</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-white text-black rounded-2xl p-3 shadow-xl rotate-3">
                <div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="h-4 w-4 text-green-600" /> Buyer Protection</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-[#E7E5E4] bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center md:justify-between gap-6 text-sm">
          <div className="flex items-center gap-2"><Truck className="h-4 w-4" /><span className="font-medium">Free shipping over ₹50k</span></div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span className="font-medium">Verified sellers only</span></div>
          <div className="flex items-center gap-2"><RefreshCcw className="h-4 w-4" /><span className="font-medium">7-day returns</span></div>
          <div className="flex items-center gap-2"><Music className="h-4 w-4" /><span className="font-medium">Secure payments</span></div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight">Browse by category</h2>
            <p className="text-[#78716C] mt-1">Find exactly what you need</p>
          </div>
          <Link href="/categories" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-[#FF6B00]">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.slice(0, 10).map(cat => (
            <Link key={cat.id} href={`/products?category=${encodeURIComponent(cat.name)}`} className="group relative rounded-[20px] overflow-hidden bg-[#F8F7F4] border border-[#E7E5E4] p-4 hover:shadow-md hover:border-[#D6D3D1] transition-all">
              <div className="aspect-square rounded-xl overflow-hidden bg-white mb-3">
                <img src={cat.image} alt={cat.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">{cat.name}</h3>
              <p className="text-xs text-[#78716C] mt-1">{cat.productCount} products</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-white border-y border-[#E7E5E4]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-[#FF6B00] flex items-center justify-center"><Star className="h-3 w-3 text-white fill-white" /></div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#FF6B00]">Featured</span>
              </div>
              <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight">Staff picks for you</h2>
            </div>
            <Link href="/products?isFeatured=true" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-[#FF6B00]">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals + Used */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[22px] font-bold tracking-tight">New arrivals</h2>
              <Link href="/products?condition=new" className="text-sm font-medium hover:text-[#FF6B00] flex items-center gap-1">See all <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newArrivals.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[22px] font-bold tracking-tight">Quality used gear</h2>
              <Link href="/products?condition=used" className="text-sm font-medium hover:text-[#FF6B00] flex items-center gap-1">See all <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {usedGear.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-6 rounded-[20px] bg-[#F3F1EB] border border-[#E7E5E4] p-5 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold text-sm">Every used instrument inspected</div>
                <div className="text-xs text-[#78716C] mt-1 leading-relaxed">Our verification includes body, neck, electronics, and cosmetic condition with real photos of any damage.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio & Recording Gear Showcase */}
      <section className="bg-[#FAF9F6] border-y border-[#E7E5E4]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-[#0F0F12] flex items-center justify-center">
                  <Sliders className="h-3 w-3 text-[#FF6B00]" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#FF6B00]">Pro Audio & Production</span>
              </div>
              <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight">Studio & Recording Gear</h2>
              <p className="text-sm text-[#78716C] mt-1">
                Audio interfaces, active reference studio monitors, dynamic vocal mics, and mastering headphones.
              </p>
            </div>
            <Link href="/products?category=Studio%20Gear" className="text-sm font-medium hover:text-[#FF6B00] flex items-center gap-1">
              View all studio gear <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {studioGear.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Seller */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="rounded-[32px] bg-[#0F0F12] text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF6B00]/20 blur-[80px] rounded-full" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight leading-[1.1]">Got gear to sell?<br />Turn it into cash fast.</h2>
              <p className="text-[#A8A29E] mt-4 max-w-md">Join 2,500+ verified sellers. List in 2 minutes, get paid securely, and reach thousands of musicians across India.</p>
              <div className="flex gap-3 mt-6">
                <Link href="/seller/products/new"><Button variant="accent" size="lg">Start selling</Button></Link>
                <Link href="/seller"><Button variant="outline" size="lg" className="bg-white/10 border-white/10 text-white hover:bg-white/15">How it works</Button></Link>
              </div>
            </div>
            <div className="flex justify-center md:justify-end mt-8 md:mt-0">
              <div className="grid grid-cols-2 gap-3 rotate-1 sm:rotate-2">
                <div className="space-y-3">
                  <div className="h-24 w-32 rounded-2xl bg-[#1F1F23] p-2"><img src="https://images.unsplash.com/photo-1558098329-a11cff621064?w=200" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-xl" alt="" /></div>
                  <div className="h-32 w-32 rounded-2xl bg-[#FF6B00] flex items-center justify-center"><Guitar className="h-8 w-8 text-white" /></div>
                </div>
                <div className="space-y-3 mt-6">
                  <div className="h-32 w-32 rounded-2xl bg-[#1F1F23] p-2"><img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-xl" alt="" /></div>
                  <div className="h-24 w-32 rounded-2xl bg-white text-black flex flex-col items-center justify-center"><div className="font-bold">₹12.5L+</div><div className="text-xs text-[#78716C]">Paid to sellers</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

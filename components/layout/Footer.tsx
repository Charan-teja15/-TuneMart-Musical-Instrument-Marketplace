import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#0F0F12] text-white mt-auto">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center">
                <span className="text-black font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                TUNE<span className="text-[#FF6B00]">MART</span>
              </span>
            </Link>
            <p className="text-sm text-[#A8A29E] max-w-xs leading-relaxed">
              India&apos;s trusted marketplace for new & used musical instruments. Buy, sell, and discover gear from verified sellers.
            </p>
            <div className="mt-6 flex gap-3">
              <div className="h-8 w-8 rounded-full bg-[#1F1F23] flex items-center justify-center text-xs">IG</div>
              <div className="h-8 w-8 rounded-full bg-[#1F1F23] flex items-center justify-center text-xs">YT</div>
              <div className="h-8 w-8 rounded-full bg-[#1F1F23] flex items-center justify-center text-xs">X</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Marketplace</h4>
            <ul className="space-y-2.5 text-sm text-[#A8A29E]">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/products?condition=used" className="hover:text-white transition-colors">Used Gear</Link></li>
              <li><Link href="/seller" className="hover:text-white transition-colors">Sell on TuneMart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2.5 text-sm text-[#A8A29E]">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm text-[#A8A29E]">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#1F1F23] flex flex-col sm:flex-row justify-between gap-4 text-xs text-[#78716C]">
          <p>© 2026 TuneMart. All rights reserved. Made for musicians in India.</p>
          <p>Secure payments • Verified sellers • Buyer protection</p>
        </div>
      </div>
    </footer>
  )
}

import { createClient } from "@/lib/supabase/client"
import {
  Product,
  Category,
  Order,
  Offer,
  Review,
  ShippingAddress,
  ProductCategory,
  ProductCondition,
  OrderStatus
} from "./types"
import { mockProducts, mockCategories, mockReviews } from "./mock-data"

interface DbProductRow {
  id: string
  title?: string
  name?: string
  slug?: string
  category?: string
  categories?: { id: string; name: string; slug: string }
  brand?: string
  model?: string
  price: number
  original_price?: number | null
  condition: string
  location?: string
  description?: string
  specifications?: Record<string, string>
  image_url?: string
  video_url?: string
  rating?: number
  review_count?: number
  seller_id?: string
  is_active?: boolean
  is_approved?: boolean
  is_featured?: boolean
  created_at?: string
  updated_at?: string
  inventory?: { quantity: number }
  product_media?: { url: string; media_type: string; is_primary: boolean; display_order: number }[]
  used_condition_reports?: {
    overall?: string
    body?: string
    neck?: string
    strings?: string
    electronics?: string
    cosmetic?: string
    damage_details?: string
    damage_images?: string[]
    year_of_manufacture?: string
  }
  seller?: {
    id?: string
    shop_name?: string
    description?: string
    location?: string
    rating?: number
    total_sales?: number
    is_verified?: boolean
    created_at?: string
    profiles?: {
      name?: string
      email?: string
      avatar_url?: string
      location?: string
    }
  }
}

export function mapDbProductToProduct(row: DbProductRow): Product {
  const images = row.product_media && row.product_media.length > 0
    ? [...row.product_media].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(m => m.url)
    : [row.image_url || "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800"]

  const sellerRow = row.seller || {}
  const profileRow = sellerRow.profiles || {}

  const seller = {
    id: sellerRow.id || row.seller_id || "seller-unknown",
    name: profileRow.name || sellerRow.shop_name || "TuneMart Seller",
    email: profileRow.email || "",
    role: "seller" as const,
    shopName: sellerRow.shop_name || "TuneMart Verified Shop",
    avatar: profileRow.avatar_url || "https://i.pravatar.cc/150?img=11",
    location: sellerRow.location || profileRow.location || row.location || "India",
    verified: sellerRow.is_verified || false,
    verificationStatus: (sellerRow.is_verified ? "verified" : "pending") as "verified" | "pending" | "rejected",
    rating: Number(sellerRow.rating || 4.8),
    totalSales: Number(sellerRow.total_sales || 0),
    bio: sellerRow.description || "",
    createdAt: sellerRow.created_at || new Date().toISOString()
  }

  return {
    id: row.id,
    name: row.title || row.name || "Instrument",
    slug: row.slug || String(row.id),
    category: (row.categories?.name || row.category || "Guitars") as ProductCategory,
    brand: row.brand || "",
    model: row.model || "",
    price: Number(row.price || 0),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    condition: (row.condition || "new") as ProductCondition,
    quantity: row.inventory ? (row.inventory.quantity ?? 1) : 1,
    location: row.location || "India",
    description: row.description || "",
    specifications: row.specifications || {},
    images,
    video: row.video_url || undefined,
    rating: Number(row.rating || 4.8),
    reviewCount: Number(row.review_count || 0),
    sellerId: row.seller_id || seller.id,
    seller,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    isApproved: row.is_approved !== false,
    isFeatured: Boolean(row.is_featured),
    usedCondition: row.used_condition_reports ? {
      overall: (row.used_condition_reports.overall || "good") as "excellent" | "good" | "fair" | "poor",
      body: (row.used_condition_reports.body || "good") as "excellent" | "good" | "fair" | "poor",
      neck: (row.used_condition_reports.neck || "good") as "excellent" | "good" | "fair" | "poor",
      strings: (row.used_condition_reports.strings || "good") as "excellent" | "good" | "fair" | "poor",
      electronics: (row.used_condition_reports.electronics || "good") as "excellent" | "good" | "fair" | "poor",
      cosmetic: (row.used_condition_reports.cosmetic || "good") as "excellent" | "good" | "fair" | "poor",
      damageDetails: row.used_condition_reports.damage_details || undefined,
      damageImages: row.used_condition_reports.damage_images || [],
      yearOfManufacture: row.used_condition_reports.year_of_manufacture || undefined
    } : undefined
  }
}

// 1. PRODUCTS
export async function getProducts(filters?: {
  categorySlug?: string
  category?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: string
  isFeatured?: boolean
  sellerId?: string
  limit?: number
}): Promise<Product[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from("products")
      .select(`
        *,
        categories (id, name, slug),
        seller:seller_profiles (
          id, shop_name, description, location, rating, total_sales, is_verified, created_at,
          profiles (name, email, avatar_url, location)
        ),
        product_media (url, media_type, is_primary, display_order),
        inventory (quantity),
        used_condition_reports (*)
      `)

    if (filters?.isFeatured) query = query.eq("is_featured", true)
    if (filters?.condition) query = query.eq("condition", filters.condition)
    if (filters?.sellerId) query = query.eq("seller_id", filters.sellerId)
    if (filters?.categorySlug) query = query.eq("categories.slug", filters.categorySlug)
    if (filters?.minPrice !== undefined) query = query.gte("price", filters.minPrice)
    if (filters?.maxPrice !== undefined) query = query.lte("price", filters.maxPrice)

    if (filters?.sort === "price-asc") query = query.order("price", { ascending: true })
    else if (filters?.sort === "price-desc") query = query.order("price", { ascending: false })
    else query = query.order("created_at", { ascending: false })

    if (filters?.limit) query = query.limit(filters.limit)

    const { data, error } = await query

    if (!error && data && data.length > 0) {
      let results = (data as unknown as DbProductRow[]).map(mapDbProductToProduct)
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        results = results.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q)
        )
      }
      return results
    }
  } catch (err) {
    console.warn("Failed to fetch products from Supabase, falling back to catalog:", err)
  }

  // Fallback to local catalog
  let filtered = [...mockProducts]
  if (filters?.isFeatured) filtered = filtered.filter(p => p.isFeatured)
  if (filters?.condition) filtered = filtered.filter(p => p.condition === filters.condition)
  if (filters?.category) filtered = filtered.filter(p => p.category === filters.category)
  if (filters?.sellerId) filtered = filtered.filter(p => p.sellerId === filters.sellerId)
  if (filters?.minPrice !== undefined) filtered = filtered.filter(p => p.price >= filters.minPrice!)
  if (filters?.maxPrice !== undefined) filtered = filtered.filter(p => p.price <= filters.maxPrice!)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q)
    )
  }
  return filtered
}

export async function getProductById(idOrSlug: string): Promise<Product | null> {
  try {
    const supabase = createClient()
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

    let query = supabase
      .from("products")
      .select(`
        *,
        categories (id, name, slug),
        seller:seller_profiles (
          id, shop_name, description, location, rating, total_sales, is_verified, created_at,
          profiles (name, email, avatar_url, location)
        ),
        product_media (url, media_type, is_primary, display_order),
        inventory (quantity),
        used_condition_reports (*)
      `)

    if (isUUID) {
      query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    } else {
      query = query.eq("slug", idOrSlug)
    }

    const { data, error } = await query.maybeSingle()
    if (!error && data) {
      return mapDbProductToProduct(data as unknown as DbProductRow)
    }
  } catch (err) {
    console.warn("Error fetching product by ID from Supabase:", err)
  }

  return mockProducts.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null
}

// 2. CATEGORIES
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*, products(count)")
      .eq("is_active", true)
      .order("name")

    if (!error && data && data.length > 0) {
      return (data as Array<{ id: string; name: string; slug: string; description?: string; image_url?: string; products?: [{ count: number }] }>).map(c => {
        let catImage = c.image_url || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800"
        if (c.slug === "drums-percussion" || c.name.toLowerCase().includes("drum")) {
          catImage = "https://images.unsplash.com/photo-1543443374-b6fe10a6ab7b?auto=format&fit=crop&w=1200&q=80"
        }
        return {
          id: c.id,
          name: c.name as ProductCategory,
          slug: c.slug,
          description: c.description || "",
          image: catImage,
          productCount: c.products ? (c.products[0]?.count || 0) : 0
        }
      })
    }
  } catch (err) {
    console.warn("Error fetching categories from Supabase:", err)
  }

  return mockCategories
}

// 3. CART (DATABASE SYNCED)
export async function getDbCart(userId: string) {
  const supabase = createClient()
  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle()
  if (!cart) return []

  const { data: items } = await supabase
    .from("cart_items")
    .select(`
      quantity,
      product:products (
        *,
        categories(name),
        product_media(url),
        inventory(quantity),
        seller:seller_profiles(shop_name)
      )
    `)
    .eq("cart_id", cart.id)

  return (items || []).map((it: { product: unknown; quantity: number }) => ({
    product: mapDbProductToProduct(it.product as DbProductRow),
    quantity: it.quantity
  }))
}

export async function syncCartToDb(userId: string, items: { product: Product; quantity: number }[]) {
  const supabase = createClient()
  let { data: cart } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle()
  if (!cart) {
    const { data: newCart } = await supabase.from("carts").insert({ user_id: userId }).select("id").single()
    cart = newCart
  }
  if (!cart) return

  await supabase.from("cart_items").delete().eq("cart_id", cart.id)
  if (items.length > 0) {
    const records = items.map(i => ({
      cart_id: cart.id,
      product_id: i.product.id,
      quantity: i.quantity
    }))
    await supabase.from("cart_items").insert(records)
  }
}

// 4. WISHLIST (DATABASE SYNCED)
export async function getDbWishlist(userId: string) {
  const supabase = createClient()
  const { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", userId).maybeSingle()
  if (!wishlist) return []

  const { data: items } = await supabase
    .from("wishlist_items")
    .select(`
      created_at,
      product:products (
        *,
        categories(name),
        product_media(url),
        inventory(quantity),
        seller:seller_profiles(shop_name)
      )
    `)
    .eq("wishlist_id", wishlist.id)

  return (items || []).map((it: { product: unknown; created_at: string }) => ({
    product: mapDbProductToProduct(it.product as DbProductRow),
    addedAt: it.created_at
  }))
}

export async function toggleDbWishlist(userId: string, productId: string) {
  const supabase = createClient()
  let { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", userId).maybeSingle()
  if (!wishlist) {
    const { data: newWishlist } = await supabase.from("wishlists").insert({ user_id: userId }).select("id").single()
    wishlist = newWishlist
  }
  if (!wishlist) return false

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlist.id)
    .eq("product_id", productId)
    .maybeSingle()

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id)
    return false
  } else {
    await supabase.from("wishlist_items").insert({
      wishlist_id: wishlist.id,
      product_id: productId
    })
    return true
  }
}

// 5. ORDERS
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          price, quantity,
          product:products (
            *,
            categories(name),
            product_media(url),
            seller:seller_profiles(shop_name)
          )
        ),
        order_status_history (status, note, created_at),
        payments (amount, payment_method, status)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data && data.length > 0) {
      return (data as Array<{
        id: string
        order_number?: string
        user_id: string
        order_items?: Array<{ price: number; quantity: number; product: unknown }>
        subtotal?: number
        shipping?: number
        total?: number
        shipping_address: unknown
        status: string
        order_status_history?: Array<{ status: string; created_at: string; note?: string }>
        payment_status?: string
        payment_method?: string
        created_at: string
        updated_at: string
      }>).map(o => ({
        id: o.order_number || o.id,
        userId: o.user_id,
        items: (o.order_items || []).map(it => ({
          product: mapDbProductToProduct(it.product as DbProductRow),
          quantity: it.quantity,
          price: Number(it.price)
        })),
        subtotal: Number(o.subtotal || 0),
        shipping: Number(o.shipping || 0),
        total: Number(o.total || 0),
        shippingAddress: o.shipping_address as ShippingAddress,
        status: o.status as OrderStatus,
        statusHistory: (o.order_status_history || []).map(h => ({
          status: h.status as OrderStatus,
          timestamp: h.created_at,
          description: h.note || `Order status updated to ${h.status}`
        })),
        paymentStatus: (o.payment_status || "paid") as "pending" | "paid" | "failed" | "refunded",
        paymentMethod: o.payment_method || "UPI / Net Banking",
        createdAt: o.created_at,
        updatedAt: o.updated_at
      }))
    }
  } catch (err) {
    console.warn("Failed to fetch orders from Supabase:", err)
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("tunemart_orders")
      if (stored) return JSON.parse(stored)
    } catch {}
  }
  return []
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          price, quantity,
          product:products (
            *,
            categories(name),
            product_media(url),
            seller:seller_profiles(shop_name)
          )
        ),
        order_status_history (status, note, created_at),
        payments (amount, payment_method, status)
      `)
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle()

    if (!error && data) {
      const d = data as {
        id: string
        order_number?: string
        user_id: string
        order_items?: Array<{ price: number; quantity: number; product: unknown }>
        subtotal?: number
        shipping?: number
        total?: number
        shipping_address: unknown
        status: string
        order_status_history?: Array<{ status: string; created_at: string; note?: string }>
        payment_status?: string
        payment_method?: string
        created_at: string
        updated_at: string
      }
      return {
        id: d.order_number || d.id,
        userId: d.user_id,
        items: (d.order_items || []).map(it => ({
          product: mapDbProductToProduct(it.product as DbProductRow),
          quantity: it.quantity,
          price: Number(it.price)
        })),
        subtotal: Number(d.subtotal || 0),
        shipping: Number(d.shipping || 0),
        total: Number(d.total || 0),
        shippingAddress: d.shipping_address as ShippingAddress,
        status: d.status as OrderStatus,
        statusHistory: (d.order_status_history || []).map(h => ({
          status: h.status as OrderStatus,
          timestamp: h.created_at,
          description: h.note || `Order status updated to ${h.status}`
        })),
        paymentStatus: (d.payment_status || "paid") as "pending" | "paid" | "failed" | "refunded",
        paymentMethod: d.payment_method || "UPI / Net Banking",
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }
    }
  } catch (err) {
    console.warn("Failed to fetch order from Supabase:", err)
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("tunemart_orders")
      if (stored) {
        const orders: Order[] = JSON.parse(stored)
        return orders.find(o => o.id === orderId) || null
      }
    } catch {}
  }
  return null
}

// 6. OFFERS
export async function getOffers(userId: string): Promise<Offer[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("offers")
      .select(`
        *,
        product:products (
          *,
          categories(name),
          product_media(url),
          seller:seller_profiles(shop_name)
        ),
        buyer:profiles!buyer_id (id, name, email, avatar_url)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (!error && data && data.length > 0) {
      return (data as Array<{
        id: string
        product_id: string
        product: unknown
        buyer_id: string
        seller_id: string
        amount: number
        message?: string
        status: "pending" | "accepted" | "rejected" | "countered"
        counter_amount?: number
        created_at: string
        updated_at: string
        buyer?: { id: string; name?: string; email?: string }
      }>).map(o => ({
        id: o.id,
        productId: o.product_id,
        product: mapDbProductToProduct(o.product as DbProductRow),
        buyerId: o.buyer_id,
        buyer: {
          id: o.buyer?.id || o.buyer_id,
          name: o.buyer?.name || "TuneMart Buyer",
          email: o.buyer?.email || "",
          role: "buyer",
          createdAt: o.created_at
        },
        sellerId: o.seller_id,
        amount: Number(o.amount),
        message: o.message || undefined,
        status: o.status,
        counterAmount: o.counter_amount ? Number(o.counter_amount) : undefined,
        createdAt: o.created_at,
        updatedAt: o.updated_at
      }))
    }
  } catch (err) {
    console.warn("Failed to fetch offers from Supabase:", err)
  }

  return []
}

// 7. REVIEWS
export async function getReviews(productId: string): Promise<Review[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id, rating, review_text, created_at, product_id, user_id,
        user:profiles!user_id (id, name, email, avatar_url)
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (!error && data && data.length > 0) {
      return (data as unknown as Array<{
        id: string
        product_id: string
        user_id: string
        rating: number
        review_text: string
        created_at: string
        user?: { id: string; name?: string; email?: string; avatar_url?: string }
      }>).map(r => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        user: {
          id: r.user?.id || r.user_id,
          name: r.user?.name || "Verified Customer",
          email: r.user?.email || "",
          role: "buyer",
          avatar: r.user?.avatar_url,
          createdAt: r.created_at
        },
        rating: r.rating,
        comment: r.review_text,
        createdAt: r.created_at
      }))
    }
  } catch (err) {
    console.warn("Failed to fetch reviews from Supabase:", err)
  }

  return mockReviews.filter(r => r.productId === productId)
}

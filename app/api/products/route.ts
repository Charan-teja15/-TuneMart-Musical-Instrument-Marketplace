import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"
import { mapDbProductToProduct } from "@/lib/api"

const CreateProductSchema = z.object({
  title: z.string().min(3),
  categoryId: z.string().uuid(),
  sellerId: z.string().uuid(),
  brand: z.string().min(1),
  model: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  condition: z.enum(["new", "used", "refurbished"]),
  quantity: z.number().int().min(1).default(1),
  location: z.string().min(2),
  description: z.string().min(10),
  images: z.array(z.string().url()).min(1),
  specifications: z.record(z.string(), z.string()).optional(),
  usedCondition: z.object({
    overall: z.string().optional(),
    body: z.string().optional(),
    neck: z.string().optional(),
    strings: z.string().optional(),
    electronics: z.string().optional(),
    cosmetic: z.string().optional(),
    damageDetails: z.string().optional()
  }).optional()
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get("categorySlug")
    const condition = searchParams.get("condition")
    const search = searchParams.get("q")
    const sort = searchParams.get("sort")
    const isFeatured = searchParams.get("featured") === "true"

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

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
      .eq("is_active", true)

    if (categorySlug) query = query.eq("categories.slug", categorySlug)
    if (condition) query = query.eq("condition", condition)
    if (isFeatured) query = query.eq("is_featured", true)

    if (sort === "price-asc") query = query.order("price", { ascending: true })
    else if (sort === "price-desc") query = query.order("price", { ascending: false })
    else query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: { code: "DB_ERROR", message: error.message } }, { status: 500 })
    }

    let products = (data || []).map(mapDbProductToProduct)

    if (search) {
      const q = search.toLowerCase()
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({ success: true, data: products })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err.message } }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid product payload", details: parsed.error.issues }
      }, { status: 400 })
    }

    const {
      title, categoryId, sellerId, brand, model, price, originalPrice,
      condition, quantity, location, description, images, specifications, usedCondition
    } = parsed.data

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert product
    const { data: product, error: prodError } = await supabase
      .from("products")
      .insert({
        title,
        slug,
        category_id: categoryId,
        seller_id: sellerId,
        brand,
        model,
        price,
        original_price: originalPrice || null,
        condition,
        location,
        description,
        specifications: specifications || {},
        is_active: true,
        is_approved: true // Approved for seller listing
      })
      .select()
      .single()

    if (prodError) {
      return NextResponse.json({ success: false, error: { code: "INSERT_ERROR", message: prodError.message } }, { status: 500 })
    }

    // Insert inventory
    await supabase.from("inventory").insert({
      product_id: product.id,
      quantity
    })

    // Insert product media
    if (images && images.length > 0) {
      const mediaRows = images.map((url, idx) => ({
        product_id: product.id,
        url,
        media_type: "image",
        is_primary: idx === 0,
        display_order: idx
      }))
      await supabase.from("product_media").insert(mediaRows)
    }

    // Insert used condition report if used/refurbished
    if (usedCondition && (condition === "used" || condition === "refurbished")) {
      await supabase.from("used_condition_reports").insert({
        product_id: product.id,
        overall: usedCondition.overall || "good",
        body: usedCondition.body || "good",
        neck: usedCondition.neck || "good",
        strings: usedCondition.strings || "good",
        electronics: usedCondition.electronics || "good",
        cosmetic: usedCondition.cosmetic || "good",
        damage_details: usedCondition.damageDetails || null
      })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err.message } }, { status: 500 })
  }
}

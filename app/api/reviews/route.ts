import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

const ReviewSchema = z.object({
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid review payload", details: parsed.error.issues }
      }, { status: 400 })
    }

    const { productId, userId, rating, comment } = parsed.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json({
        success: false,
        error: { code: "DUPLICATE_REVIEW", message: "You have already reviewed this product." }
      }, { status: 400 })
    }

    // 2. Check if user purchased the product
    const { data: ordersWithProduct } = await supabase
      .from("order_items")
      .select(`
        id,
        order:orders!inner (user_id, status)
      `)
      .eq("product_id", productId)
      .eq("order.user_id", userId)

    const hasPurchased = ordersWithProduct && ordersWithProduct.length > 0
    if (!hasPurchased) {
      // In development / demo, allow review with verified_purchase flag = false or warn
      // For strict compliance:
      return NextResponse.json({
        success: false,
        error: {
          code: "NOT_VERIFIED_PURCHASER",
          message: "Only customers who have purchased this instrument can submit a review."
        }
      }, { status: 403 })
    }

    // 3. Insert review
    const { data: review, error: revError } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        user_id: userId,
        rating,
        review_text: comment
      })
      .select()
      .single()

    if (revError) {
      return NextResponse.json({ success: false, error: { code: "INSERT_ERROR", message: revError.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: review })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err.message } }, { status: 500 })
  }
}

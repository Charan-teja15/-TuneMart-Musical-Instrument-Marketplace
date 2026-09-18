import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

const OfferSchema = z.object({
  productId: z.string().uuid(),
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  amount: z.number().positive(),
  message: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = OfferSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid offer payload", details: parsed.error.issues }
      }, { status: 400 })
    }

    const { productId, buyerId, sellerId, amount, message } = parsed.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase.from("offers").insert({
      product_id: productId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount,
      message: message || null,
      status: "pending"
    }).select().single()

    if (error) {
      return NextResponse.json({ success: false, error: { code: "DB_ERROR", message: error.message } }, { status: 500 })
    }

    // Insert notification for seller
    await supabase.from("notifications").insert({
      user_id: sellerId,
      title: "New Offer Received",
      content: `A buyer made an offer of ₹${amount.toLocaleString('en-IN')}`,
      type: "offer"
    })

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err.message } }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { offerId, status, counterAmount } = body

    if (!offerId || !status) {
      return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Missing offerId or status" } }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const updateData: any = { status, updated_at: new Date().toISOString() }
    if (counterAmount) updateData.counter_amount = counterAmount

    const { data, error } = await supabase
      .from("offers")
      .update(updateData)
      .eq("id", offerId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: { code: "DB_ERROR", message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err.message } }, { status: 500 })
  }
}

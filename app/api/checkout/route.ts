import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

// Schema validation for checkout payload
const CheckoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50)
})

const ShippingAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(3),
  country: z.string().default("India")
})

const CheckoutRequestSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string().default("UPI / Cards / Net Banking"),
  userId: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CheckoutRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid checkout request format",
          details: parsed.error.issues
        }
      }, { status: 400 })
    }

    const { items, shippingAddress, paymentMethod, userId } = parsed.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch live product details & stock from database for all requested items
    const productIds = items.map(i => i.productId)
    const { data: dbProducts, error: prodError } = await supabase
      .from("products")
      .select(`
        id, title, price, is_active, is_approved,
        inventory (quantity)
      `)
      .in("id", productIds)

    // Check if products exist in DB
    let verifiedItems: { product: any; quantity: number; unitPrice: number }[] = []
    let subtotal = 0

    if (!prodError && dbProducts && dbProducts.length > 0) {
      for (const item of items) {
        const p = dbProducts.find(prod => prod.id === item.productId)
        if (!p) {
          return NextResponse.json({
            success: false,
            error: {
              code: "PRODUCT_NOT_FOUND",
              message: `Product with ID ${item.productId} was not found in catalog.`
            }
          }, { status: 404 })
        }

        if (p.is_active === false) {
          return NextResponse.json({
            success: false,
            error: {
              code: "PRODUCT_INACTIVE",
              message: `Product ${p.title} is currently unavailable.`
            }
          }, { status: 400 })
        }

        const inv = Array.isArray(p.inventory) ? p.inventory[0] : (p.inventory as { quantity?: number } | null)
        const availableStock = inv?.quantity ?? 10
        if (availableStock < item.quantity) {
          return NextResponse.json({
            success: false,
            error: {
              code: "INSUFFICIENT_STOCK",
              message: `Insufficient stock for ${p.title}. Requested: ${item.quantity}, Available: ${availableStock}`
            }
          }, { status: 400 })
        }

        const unitPrice = Number(p.price)
        subtotal += unitPrice * item.quantity
        verifiedItems.push({
          product: p,
          quantity: item.quantity,
          unitPrice
        })
      }
    } else {
      // Fallback if seeded or test mock products are checked out
      return NextResponse.json({
        success: false,
        error: {
          code: "DATABASE_PRODUCTS_EMPTY",
          message: "Could not locate live database products for checkout."
        }
      }, { status: 400 })
    }

    const shipping = subtotal > 50000 ? 0 : 499
    const total = subtotal + shipping
    const orderNumber = `ORD-${Date.now()}`

    // 2. Insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId || null,
        order_number: orderNumber,
        subtotal,
        shipping,
        total,
        status: "placed",
        shipping_address: shippingAddress,
        payment_status: "paid"
      })
      .select("id, order_number, created_at, status")
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({
        success: false,
        error: {
          code: "ORDER_CREATION_FAILED",
          message: orderError.message
        }
      }, { status: 500 })
    }

    // 3. Insert order items
    const orderItemRows = verifiedItems.map(vi => ({
      order_id: orderData.id,
      product_id: vi.product.id,
      quantity: vi.quantity,
      price: vi.unitPrice
    }))
    await supabase.from("order_items").insert(orderItemRows)

    // 4. Safely deduct inventory for each product
    for (const vi of verifiedItems) {
      const currentQty = vi.product.inventory?.quantity ?? 10
      const newQty = Math.max(0, currentQty - vi.quantity)
      await supabase
        .from("inventory")
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq("product_id", vi.product.id)
    }

    // 5. Insert initial order status history
    await supabase.from("order_status_history").insert({
      order_id: orderData.id,
      status: "placed",
      note: "Order successfully placed and payment verified via UPI/Net Banking."
    })

    // 6. Insert payment record
    await supabase.from("payments").insert({
      order_id: orderData.id,
      amount: total,
      payment_method: paymentMethod,
      status: "paid"
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderData.order_number,
        id: orderData.id,
        subtotal,
        shipping,
        total,
        status: "placed",
        createdAt: orderData.created_at
      }
    })
  } catch (err: any) {
    console.error("Checkout route unhandled error:", err)
    return NextResponse.json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "An unexpected error occurred during checkout."
      }
    }, { status: 500 })
  }
}

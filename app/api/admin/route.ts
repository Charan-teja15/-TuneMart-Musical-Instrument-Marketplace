import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { searchParams } = new URL(req.url)
    const entity = searchParams.get("entity")

    // If specific entity requested:
    if (entity === "users") {
      const { data: users, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return NextResponse.json({ success: true, users })
    }

    if (entity === "sellers") {
      const { data: sellers, error } = await supabase
        .from("seller_profiles")
        .select("*, profiles(name, email, avatar_url, location)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return NextResponse.json({ success: true, sellers })
    }

    if (entity === "products") {
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          categories(name),
          seller:seller_profiles(shop_name),
          product_media(url, is_primary),
          inventory(quantity)
        `)
        .order("created_at", { ascending: false })
      if (error) throw error
      return NextResponse.json({ success: true, products })
    }

    if (entity === "orders") {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*, product:products(title, price)),
          payments(*)
        `)
        .order("created_at", { ascending: false })
      if (error) throw error
      return NextResponse.json({ success: true, orders })
    }

    if (entity === "reports") {
      const { data: reports, error } = await supabase
        .from("reports")
        .select(`
          *,
          reporter:profiles!reporter_id(name, email)
        `)
        .order("created_at", { ascending: false })
      if (error) throw error
      return NextResponse.json({ success: true, reports })
    }

    if (entity === "categories") {
      const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })
      if (error) throw error
      return NextResponse.json({ success: true, categories })
    }

    if (entity === "payments") {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*, orders(order_number, total, shipping_address)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return NextResponse.json({ success: true, payments })
    }

    // Default: Aggregate stats for the Dashboard overview
    const [
      { count: usersCount },
      { data: sellers, count: sellersCount },
      { data: products, count: productsCount },
      { data: orders, count: ordersCount },
      { data: reports, count: reportsCount }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("seller_profiles").select("id, is_verified", { count: "exact" }),
      supabase.from("products").select("id, is_approved, price, is_active", { count: "exact" }),
      supabase.from("orders").select("id, total, status, created_at, order_number", { count: "exact" }).order("created_at", { ascending: false }).limit(6),
      supabase.from("reports").select("id, status", { count: "exact" })
    ])

    const totalRevenue = (orders || []).reduce((acc, curr) => acc + Number(curr.total || 0), 0)
    const pendingSellers = (sellers || []).filter(s => !s.is_verified).length
    const pendingProducts = (products || []).filter(p => !p.is_approved).length
    const pendingReports = (reports || []).filter(r => r.status === "pending").length

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: usersCount || 0,
        totalSellers: sellersCount || 0,
        pendingSellers,
        totalProducts: productsCount || 0,
        pendingProducts,
        totalOrders: ordersCount || 0,
        totalRevenue,
        pendingReports
      },
      recentOrders: orders || []
    })
  } catch (error) {
    console.error("Admin GET error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getAdminClient()
    const body = await req.json()
    const { action, id, payload } = body

    if (!action || !id) {
      return NextResponse.json({ success: false, error: "action and id are required" }, { status: 400 })
    }

    // 1. Product Actions
    if (action === "approve_product") {
      const { error } = await supabase.from("products").update({ is_approved: true, is_active: true }).eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: "Product approved" })
    }

    if (action === "reject_product") {
      const { error } = await supabase.from("products").update({ is_approved: false, is_active: false }).eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: "Product rejected/unapproved" })
    }

    if (action === "toggle_featured") {
      const isFeatured = Boolean(payload?.isFeatured)
      const { error } = await supabase.from("products").update({ is_featured: isFeatured }).eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: `Product featured status set to ${isFeatured}` })
    }

    if (action === "delete_product") {
      const { error } = await supabase.from("products").delete().eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: "Product deleted" })
    }

    // 2. Seller Actions
    if (action === "verify_seller") {
      const { error } = await supabase.from("seller_profiles").update({ is_verified: true }).eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: "Seller verified" })
    }

    if (action === "revoke_seller") {
      const { error } = await supabase.from("seller_profiles").update({ is_verified: false }).eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: "Seller verification revoked" })
    }

    // 3. Order Actions
    if (action === "update_order_status") {
      const newStatus = payload?.status
      if (!newStatus) return NextResponse.json({ success: false, error: "Missing new status" }, { status: 400 })

      const { error: orderError } = await supabase.from("orders").update({ status: newStatus }).eq("id", id)
      if (orderError) throw orderError

      // Insert audit entry in order_status_history
      await supabase.from("order_status_history").insert({
        order_id: id,
        status: newStatus,
        note: `Status updated to ${newStatus} by admin`
      })

      return NextResponse.json({ success: true, message: `Order updated to ${newStatus}` })
    }

    // 4. User Actions
    if (action === "update_user_role") {
      const newRole = payload?.role
      if (!newRole) return NextResponse.json({ success: false, error: "Missing new role" }, { status: 400 })

      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: `User role updated to ${newRole}` })
    }

    // 5. Report Actions
    if (action === "resolve_report") {
      const resolutionNote = payload?.note || "Resolved by admin"
      const { error } = await supabase.from("reports").update({
        status: "resolved",
        resolution_notes: resolutionNote
      }).eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: "Report resolved" })
    }

    if (action === "dismiss_report") {
      const { error } = await supabase.from("reports").update({
        status: "dismissed"
      }).eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true, message: "Report dismissed" })
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 })
  } catch (error) {
    console.error("Admin PATCH error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Missing userId" } }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: { code: "DB_ERROR", message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err.message } }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Missing notification id" } }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
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

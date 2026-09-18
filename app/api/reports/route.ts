import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

const ReportSchema = z.object({
  reporterId: z.string().uuid().optional(),
  targetType: z.enum(["product", "seller", "user", "review"]),
  targetId: z.string(),
  reason: z.string().min(3),
  description: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ReportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid report data", details: parsed.error.issues }
      }, { status: 400 })
    }

    const { reporterId, targetType, targetId, reason, description } = parsed.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase.from("reports").insert({
      reporter_id: reporterId || null,
      target_type: targetType,
      target_id: targetId,
      reason,
      description: description || null,
      status: "pending"
    }).select().single()

    if (error) {
      return NextResponse.json({ success: false, error: { code: "DB_ERROR", message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err.message } }, { status: 500 })
  }
}

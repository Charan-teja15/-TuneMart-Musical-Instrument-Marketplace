import { NextResponse } from "next/server"
import { getCategories } from "@/lib/api"

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ success: true, data: categories })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err.message } }, { status: 500 })
  }
}

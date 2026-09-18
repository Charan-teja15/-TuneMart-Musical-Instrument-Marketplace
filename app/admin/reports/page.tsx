"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export default function AdminPage(){
  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold capitalize">reports</h1>
      <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-base capitalize">reports Management</CardTitle></CardHeader><CardContent><p className="text-sm text-[#78716C]">Admin functionality for reports. This would connect to Supabase with real data, including tables for listing, approval actions, filters, and audit logs.</p><div className="mt-4 grid sm:grid-cols-2 gap-3"><div className="rounded-xl bg-[#F8F7F4] p-3 text-sm"><div className="font-semibold">Total</div><div className="text-2xl font-bold mt-1">--</div></div><div className="rounded-xl bg-[#F8F7F4] p-3 text-sm"><div className="font-semibold">Pending</div><div className="text-2xl font-bold mt-1">--</div></div></div></CardContent></Card>
    </div>
  )
}

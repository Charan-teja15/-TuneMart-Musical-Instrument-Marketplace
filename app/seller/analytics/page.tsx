"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export default function SellerAnalyticsPage(){
  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold">Analytics</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-sm">Views</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">12.4k</div><div className="text-xs text-green-600">+12% this month</div></CardContent></Card>
        <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-sm">Conversion</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">3.2%</div><div className="text-xs text-green-600">+0.5% this month</div></CardContent></Card>
        <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-sm">Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹3.4L</div><div className="text-xs text-[#78716C]">Last 30 days</div></CardContent></Card>
      </div>
    </div>
  )
}

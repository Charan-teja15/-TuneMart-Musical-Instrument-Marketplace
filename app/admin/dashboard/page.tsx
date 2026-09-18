"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockProducts, mockSellers } from "@/lib/mock-data"
export default function AdminDashboard(){
  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Total Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1,234</div><div className="text-xs text-green-600">+8% this month</div></CardContent></Card>
        <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Sellers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{mockSellers.length}</div><div className="text-xs text-[#78716C]">2 pending verification</div></CardContent></Card>
        <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Products</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{mockProducts.length}</div><div className="text-xs text-[#78716C]">3 pending approval</div></CardContent></Card>
        <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-xs uppercase tracking-widest text-[#78716C]">Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹12.5L</div><div className="text-xs text-green-600">+15% this month</div></CardContent></Card>
      </div>
      <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span>New seller registration: Traditional Sounds</span><span className="text-xs text-[#78716C]">2h ago</span></div><div className="flex justify-between"><span>Product pending approval: Yamaha Saxophone</span><span className="text-xs text-[#78716C]">5h ago</span></div><div className="flex justify-between"><span>Order placed: ORD-1001</span><span className="text-xs text-[#78716C]">1d ago</span></div></CardContent></Card>
    </div>
  )
}

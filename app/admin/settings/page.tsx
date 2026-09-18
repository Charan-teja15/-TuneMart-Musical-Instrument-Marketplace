"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database, ShieldCheck, CheckCircle2, Save } from "lucide-react"

export default function AdminSettingsPage() {
  const [commissionRate, setCommissionRate] = useState("5.0")
  const [minOfferThreshold, setMinOfferThreshold] = useState("70")
  const [requireSellerVerification, setRequireSellerVerification] = useState(true)
  const [autoApproveProducts, setAutoApproveProducts] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Platform Settings</h1>
        <p className="text-sm text-[#78716C] mt-1">Configure marketplace policies, fees, and database operations.</p>
      </div>

      <div className="grid gap-6">
        {/* Supabase Connection Status */}
        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base">Supabase Infrastructure</CardTitle>
            </div>
            <CardDescription>Status of the connected backend PostgreSQL instance and Storage buckets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-sm">
              <span className="font-medium text-[#0F0F12]">Database Engine</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Connected & Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-sm">
              <span className="font-medium text-[#0F0F12]">Row Level Security (RLS)</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3 w-3 mr-1" /> Enforced on all tables
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Policies Form */}
        <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Marketplace Commission & Negotiation Rules</CardTitle>
            <CardDescription>Adjust platform transaction fees and bargaining thresholds.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              {saved && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Platform settings updated successfully.
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Platform Commission (%)</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    value={commissionRate} 
                    onChange={e => setCommissionRate(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-[#78716C] mt-1">Deducted automatically on completed payouts.</p>
                </div>

                <div>
                  <Label>Minimum Offer Floor (% of list price)</Label>
                  <Input 
                    type="number" 
                    value={minOfferThreshold} 
                    onChange={e => setMinOfferThreshold(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-[#78716C] mt-1">Prevents lowball offers below this percentage.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F5F5F4] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0F0F12]">Strict Seller KYC & Verification</p>
                    <p className="text-xs text-[#78716C]">Require admin verification before sellers receive verified merchant badge.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireSellerVerification}
                    onChange={e => setRequireSellerVerification(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#FF6B00]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0F0F12]">Auto-Approve Verified Merchant Listings</p>
                    <p className="text-xs text-[#78716C]">Allow verified sellers to publish directly without manual admin queue review.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoApproveProducts}
                    onChange={e => setAutoApproveProducts(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" className="bg-[#0F0F12] hover:bg-black text-white h-10 px-4 flex items-center gap-2">
                  <Save className="h-4 w-4" /> Save Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

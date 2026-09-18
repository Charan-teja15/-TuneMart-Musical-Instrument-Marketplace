"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
export default function SellerSettingsPage(){
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-[22px] font-bold">Settings</h1>
      <Card className="rounded-[20px]"><CardHeader><CardTitle className="text-base">Shop Information</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Shop Name</Label><Input defaultValue="Raj Guitars & More" className="mt-1" /></div><div><Label>Bio</Label><Input defaultValue="Professional musician and luthier" className="mt-1" /></div><Button>Save</Button></CardContent></Card>
    </div>
  )
}

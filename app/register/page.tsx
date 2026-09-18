"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/types"

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" as UserRole })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register(form.email, form.password, form.name, form.role)
      router.push(form.role === "seller" ? "/seller/dashboard" : form.role === "admin" ? "/admin/dashboard" : "/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-[24px]">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#0F0F12] flex items-center justify-center mb-4 text-white font-bold text-xl">T</div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join thousands of musicians on TuneMart</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}
            <div>
              <Label>Full Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Amit Sharma" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="mt-1" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" className="mt-1" />
            </div>
            <div>
              <Label>I want to</Label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="mt-1">
                <option value="buyer">Buy instruments</option>
                <option value="seller">Sell instruments</option>
                <option value="admin">Admin (demo)</option>
              </Select>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
            <div className="text-center text-sm text-[#78716C]">
              Already have an account? <Link href="/login" className="font-medium text-black hover:text-[#FF6B00]">Sign in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

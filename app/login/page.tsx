"use client"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-[24px]">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#0F0F12] flex items-center justify-center mb-4 text-white font-bold text-xl">T</div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Login to your TuneMart account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}
            <div>
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
            </div>
            <div className="flex justify-between text-xs">
              <Link href="/forgot-password" className="text-[#78716C] hover:text-black">Forgot password?</Link>
              <span className="text-[#A8A29E]">Demo: any email works</span>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
            <div className="text-center text-sm text-[#78716C]">
              Don&apos;t have an account? <Link href="/register" className="font-medium text-black hover:text-[#FF6B00]">Sign up</Link>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#F5F5F4] text-[11px]">
              <div className="rounded-xl bg-[#F8F7F4] p-2 text-center"><div className="font-semibold">buyer@test.com</div><div className="text-[#78716C]">Buyer role</div></div>
              <div className="rounded-xl bg-[#F8F7F4] p-2 text-center"><div className="font-semibold">seller@test.com</div><div className="text-[#78716C]">Seller role</div></div>
              <div className="rounded-xl bg-[#F8F7F4] p-2 text-center"><div className="font-semibold">admin@test.com</div><div className="text-[#78716C]">Admin role</div></div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

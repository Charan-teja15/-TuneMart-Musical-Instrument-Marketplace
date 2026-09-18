"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-[24px]">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>Enter your email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">✓</div>
              <p className="font-medium">Check your email</p>
              <p className="text-sm text-[#78716C] mt-1">We sent a reset link to {email}</p>
              <Link href="/login"><Button variant="outline" className="mt-6 w-full">Back to login</Button></Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
              </div>
              <Button type="submit" className="w-full h-11">Send reset link</Button>
              <div className="text-center text-sm"><Link href="/login" className="text-[#78716C] hover:text-black">← Back to login</Link></div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

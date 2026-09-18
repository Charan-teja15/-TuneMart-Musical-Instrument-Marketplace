"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
export default function SellerIndex(){ const r=useRouter(); useEffect(()=>{r.replace("/seller/dashboard")},[r]); return null }

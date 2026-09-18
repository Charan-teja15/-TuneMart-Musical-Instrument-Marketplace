"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
export default function AdminIndex(){ const r=useRouter(); useEffect(()=>{r.replace("/admin/dashboard")},[r]); return null }

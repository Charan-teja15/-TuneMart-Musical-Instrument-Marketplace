"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { User, UserRole } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USERS_KEY = "tunemart_users"
const CURRENT_USER_KEY = "tunemart_current_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient()
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const mockUser: User = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!.split("@")[0],
              role: (session.user.user_metadata?.role as UserRole) || "buyer",
              createdAt: session.user.created_at,
              location: session.user.user_metadata?.location,
              verified: true,
            }
            setUser(mockUser)
            setLoading(false)
            return
          }
        }
        // fallback to localStorage
        const stored = localStorage.getItem(CURRENT_USER_KEY)
        if (stored) {
          setUser(JSON.parse(stored))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) {
          const u: User = {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || email.split("@")[0],
            role: (data.user.user_metadata?.role as UserRole) || "buyer",
            createdAt: data.user.created_at,
            verified: true,
          }
          setUser(u)
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u))
          return
        }
      }
      // Mock fallback
      const usersRaw = localStorage.getItem(MOCK_USERS_KEY)
      const users: (User & { password: string })[] = usersRaw ? JSON.parse(usersRaw) : []
      const found = users.find(u => u.email === email && u.password === password)
      if (!found) {
        // Allow demo logins
        if (email.includes("admin")) {
          const adminUser: User = { id: "admin-1", email, name: "Admin User", role: "admin", createdAt: new Date().toISOString(), verified: true }
          setUser(adminUser)
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser))
          return
        }
        if (email.includes("seller") || email.includes("raj")) {
          const sellerUser: User = { id: "seller-1", email, name: "Rajesh Kumar", role: "seller", createdAt: new Date().toISOString(), verified: true }
          setUser(sellerUser)
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sellerUser))
          return
        }
        const buyerUser: User = { id: "buyer-1", email, name: email.split("@")[0], role: "buyer", createdAt: new Date().toISOString() }
        setUser(buyerUser)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(buyerUser))
        return
      }
      const { password: _, ...userWithoutPass } = found
      setUser(userWithoutPass)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPass))
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: UserRole = "buyer") => {
    setLoading(true)
    try {
      const supabase = createClient()
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } }
        })
        if (error) throw error
        if (data.user) {
          const u: User = {
            id: data.user.id,
            email: data.user.email!,
            name,
            role,
            createdAt: data.user.created_at,
            verified: false,
          }
          setUser(u)
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u))
          return
        }
      }
      const usersRaw = localStorage.getItem(MOCK_USERS_KEY)
      const users: any[] = usersRaw ? JSON.parse(usersRaw) : []
      if (users.find(u => u.email === email)) throw new Error("User already exists")
      const newUser = { id: `user-${Date.now()}`, email, name, role, password, createdAt: new Date().toISOString() }
      users.push(newUser)
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
      const { password: _, ...userWithoutPass } = newUser
      setUser(userWithoutPass)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPass))
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

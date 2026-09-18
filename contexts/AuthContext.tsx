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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as UserRole,
              createdAt: profile.created_at,
              location: profile.location,
              verified: true, // we might need to handle this via seller_profiles join
            })
          }
        } else {
          setUser(null)
        }
      } catch (e) {
        console.error("Auth init error:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: UserRole = "buyer") => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } }
      })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
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

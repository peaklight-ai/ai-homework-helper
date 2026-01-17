'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient, User, Session } from '@supabase/supabase-js'

// =============================================================================
// SUPABASE CONTEXT
// =============================================================================
// Provides Supabase client and auth state to all components
// =============================================================================

interface SupabaseContextType {
  supabase: SupabaseClient
  user: User | null
  session: Session | null
  isLoading: boolean
  // Student session (for students logged in with code)
  studentId: string | null
  studentName: string | null
  setStudentSession: (studentId: string | null, studentName: string | null) => void
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Student session (stored in localStorage, not Supabase Auth)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Load student session from localStorage
    const savedStudentId = localStorage.getItem('studentId')
    const savedStudentName = localStorage.getItem('studentName')
    if (savedStudentId && savedStudentName) {
      setStudentId(savedStudentId)
      setStudentName(savedStudentName)
    }

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const setStudentSession = (id: string | null, name: string | null) => {
    setStudentId(id)
    setStudentName(name)
    if (id && name) {
      localStorage.setItem('studentId', id)
      localStorage.setItem('studentName', name)
    } else {
      localStorage.removeItem('studentId')
      localStorage.removeItem('studentName')
    }
  }

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        session,
        isLoading,
        studentId,
        studentName,
        setStudentSession
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

// =============================================================================
// AUTH HOOKS
// =============================================================================

export function useUser() {
  const { user, isLoading } = useSupabase()
  return { user, isLoading }
}

export function useSession() {
  const { session, isLoading } = useSupabase()
  return { session, isLoading }
}

export function useStudentSession() {
  const { studentId, studentName, setStudentSession } = useSupabase()
  return { studentId, studentName, setStudentSession }
}

// =============================================================================
// AUTH ACTIONS
// =============================================================================

export function useAuth() {
  const { supabase } = useSupabase()

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return { signUp, signIn, signOut }
}

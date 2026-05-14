"use client"

/**
 * auth-provider.jsx
 * ─────────────────
 * Drop-in replacement for NextAuth's SessionProvider + hooks.
 * Uses Supabase Auth under the hood so the rest of the codebase
 * keeps using the exact same API:
 *   const { data: session, status } = useSession()
 *   signIn('google')
 *   signOut()
 */

import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

const AuthContext = createContext(null)

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)   // NextAuth-shaped session obj
  const [status, setStatus] = useState("loading")
  const supabase = createClient()

  useEffect(() => {
    const syncUser = async (sbSession) => {
      if (!sbSession?.user) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add_user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: sbSession.user.user_metadata?.full_name || sbSession.user.email,
            email: sbSession.user.email,
          }),
        });
        const data = await res.json();
        if (data.ok && data.role) {
          setSession(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              user: { ...prev.user, role: data.role }
            };
          });
        }
      } catch (e) {
        console.error("Failed to sync user to backend:", e);
      }
    };

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
      setSession(toNextAuthShape(sbSession))
      setStatus(sbSession ? "authenticated" : "unauthenticated")
      if (sbSession) syncUser(sbSession);
    })

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sbSession) => {
        setSession(prev => {
          const nextShape = toNextAuthShape(sbSession);
          if (nextShape && prev?.user?.role) {
            nextShape.user.role = prev.user.role;
          }
          return nextShape;
        });
        setStatus(sbSession ? "authenticated" : "unauthenticated")

        // Sync user to our FastAPI backend on any authenticated event
        if (sbSession?.user && (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED" || _event === "INITIAL_SESSION")) {
          syncUser(sbSession);
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, status, supabase }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Convert a Supabase session object into the NextAuth session shape
 * so all existing components keep working without changes.
 */
function toNextAuthShape(sbSession) {
  if (!sbSession) return null
  return {
    user: {
      name:  sbSession.user.user_metadata?.full_name ?? sbSession.user.email,
      email: sbSession.user.email,
      image: sbSession.user.user_metadata?.avatar_url ?? null,
    },
    accessToken: sbSession.access_token,  // kept for backend Authorization headers
  }
}

// ── Public hooks & helpers ─────────────────────────────────────────────────

/** Drop-in for NextAuth's useSession */
export function useSession() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useSession must be used inside <AuthProvider>")
  return { data: ctx.session, status: ctx.status }
}

/** Drop-in for NextAuth's signIn('google') */
export async function signIn(provider = "google") {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

/** Drop-in for NextAuth's signOut() */
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = "/"
}

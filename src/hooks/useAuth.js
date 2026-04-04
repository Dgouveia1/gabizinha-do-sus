import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

// Called ONCE from the root layout — initializes auth listener
export function useAuthInit() {
  const { setSession, setLoading, clearAuth } = useAuthStore()
  const { setOnboardingPending } = useUIStore()

  useEffect(() => {
    let mounted = true

    // 1. Sync initial session (sets loading → false when done)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      if (session) {
        await syncUserProfile(session.user)
      }
      setLoading(false)
    })

    // 2. React to future auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        setSession(session)

        if (session) {
          await syncUserProfile(session.user)

          // Trigger onboarding for brand-new users
          if (event === 'SIGNED_IN') {
            const { data: profile } = await supabase
              .from('users')
              .select('created_at')
              .eq('id', session.user.id)
              .single()

            if (profile) {
              const isNew = Date.now() - new Date(profile.created_at).getTime() < 30_000
              if (isNew) setOnboardingPending(true)
            }
          }
        } else {
          clearAuth()
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])
}

async function syncUserProfile(sessionUser) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', sessionUser.id)
    .single()

  // Always set user — fall back to session info if profile row is missing
  useAuthStore.getState().setUser(data || {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || '',
    avatar_url: sessionUser.user_metadata?.avatar_url || '',
  })
}

export async function signInWithEmail(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error
}

export async function signUpWithEmail(email, password, name) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })
  return error
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' },
  })
  return error
}

export async function signOut() {
  await supabase.auth.signOut()
}

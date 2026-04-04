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
        await syncUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // 2. React to future auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        setSession(session)

        if (session) {
          await syncUserProfile(session.user.id)

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

async function syncUserProfile(userId) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (data) {
    useAuthStore.getState().setUser(data)
  }
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

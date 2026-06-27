'use client'

// Sign-up page — shown when a new user clicks "Sign up" in the navbar.
// Uses the same Supabase Auth UI as the login page but starts in sign_up view.
import dynamic from 'next/dynamic'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import PageTransition from '@/components/PageTransition'
import { BuilderLabLogo } from '@/components/BuilderLabLogo'
import { colors } from '@/lib/design-tokens'
import { useEffect, useState } from 'react'
import { Analytics } from "@vercel/analytics/next"

// Load Auth component only on the client side to avoid SSR hydration mismatch
const Auth = dynamic(
  () => import('@supabase/auth-ui-react').then(mod => mod.Auth),
  { ssr: false }
)

export default function SignupPage() {

  // Browser-side Supabase client — needed for auth
  const supabase = createBrowserSupabaseClient()

  // Listen for auth state changes and redirect to feed after sign-up
  useEffect(() => {

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Force a full page reload so server components also see the new session
          window.location.href = '/feed'
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <PageTransition>
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: colors.bg.base }}
      >
        <div
          className="w-full max-w-md p-8 rounded-2xl"
          style={{
            backgroundColor: colors.bg.elevated,
            border: `1px solid ${colors.border.mkt}`,
          }}
        >
          {/* Logo + tagline */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <BuilderLabLogo markSize={32} />
            </div>
            <p style={{ fontSize: '14px', color: colors.text.muted2 }}>
              Create your BuilderLab account
            </p>
          </div>

          {/* Supabase Auth UI pre-set to the sign-up form */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0D9488',
                    brandAccent: '#0F766E',
                    inputBackground: '#0C1120',
                    inputBorder: '#1E2840',
                    inputText: '#F1F5F9',
                    inputLabelText: '#94A3B8',
                  }
                }
              }
            }}
            // Start on the sign-up form instead of sign-in
            view="sign_up"
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  link_text: 'Already have an account? Sign in',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign up',
                  link_text: "Don't have an account? Sign up",
                },
                forgotten_password: {
                  email_label: 'Email',
                  button_label: 'Send the reset link',
                  link_text: 'Forgot password?',
                },
              }
            }}
          />
        </div>
      </div>
      <Analytics />
    </PageTransition>
  )
}

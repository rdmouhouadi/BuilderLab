'use client'

// Sign-in page — shown when an existing user clicks "Sign in" in the navbar.
// Uses next/dynamic with ssr:false to avoid a server/client HTML mismatch,
// because the Supabase Auth UI component reads browser-only state on mount.
import dynamic from 'next/dynamic'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import PageTransition from '@/components/PageTransition'
import { BuilderLabLogo } from '@/components/BuilderLabLogo'
import { colors } from '@/lib/design-tokens'
import { useEffect, useState } from 'react'
import { Analytics } from "@vercel/analytics/next"

// Load the Auth component only in the browser to prevent SSR hydration errors
const Auth = dynamic(
  () => import('@supabase/auth-ui-react').then(mod => mod.Auth),
  { ssr: false }
)

export default function LoginPage() {

  // Browser-side Supabase client — required for auth interactions
  const supabase = createBrowserSupabaseClient()

  // Listen for auth state changes; redirect to feed as soon as the user signs in
  useEffect(() => {

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Force a full page reload so server components also refresh with the new session
          window.location.href = '/feed'
        }
      }
    )

    // Clean up the listener when the component unmounts
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
              Log in to collaborate on projects
            </p>
          </div>

          {/* Supabase Auth UI pre-set to the sign-in form.
              It handles form state, validation, errors, and password reset automatically. */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              // ThemeSupa is the official Supabase theme; we override its color variables
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
            // Start on the sign-in form
            view="sign_in"
            // After login, Supabase redirects here; /auth/callback exchanges the code for a session
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

// app/login/page.tsx
'use client'

// dynamic avec ssr: false dit à Next.js :
// "ne rends jamais ce composant côté serveur"
// ça évite le conflit entre le HTML serveur et client
import dynamic from 'next/dynamic'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ThemeSupa } from '@supabase/auth-ui-shared'

// On charge le composant Auth uniquement côté navigateur
const Auth = dynamic(
  () => import('@supabase/auth-ui-react').then(mod => mod.Auth),
  { ssr: false }
)

export default function LoginPage() {
  // Client Supabase côté navigateur — nécessaire pour l'auth
  const supabase = createBrowserSupabaseClient()

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0F1117' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{
          backgroundColor: '#161B28',
          border: '1px solid #1E2840'
        }}
      >
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#0D9488' }}
            />
            <span
              className="text-xl font-semibold"
              style={{ color: '#F1F5F9' }}
            >
              BuilderLab
            </span>
          </div>
          <p className="text-sm" style={{ color: '#64748B' }}>
            Connecte-toi pour collaborer sur des projets
          </p>
        </div>

        {/* Composant Auth de Supabase
            Gère automatiquement : formulaire, validation,
            erreurs, inscription, connexion, mot de passe oublié */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            // ThemeSupa = thème officiel Supabase
            // on le personnalise avec nos couleurs
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
          view="sign_in"
          // Après connexion, Supabase redirige ici
          // notre route /auth/callback échange le code contre une session
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
          // Pas de connexion sociale pour l'instant
          providers={[]}
          localization={{
            // Traduction française de tous les textes
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                link_text: "Pas de compte ? S'inscrire",
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: "S'inscrire",
                link_text: 'Déjà un compte ? Se connecter',
              },
              forgotten_password: {
                email_label: 'Email',
                button_label: 'Envoyer le lien de réinitialisation',
                link_text: 'Retour à la connexion',
              },
            }
          }}
        />
      </div>
    </div>
  )
}
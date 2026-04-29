// app/login/page.tsx
// Page de connexion ET d'inscription
// On utilise le composant Auth de Supabase qui gère
// tout automatiquement : formulaire, validation, erreurs

// 'use client' est obligatoire ici car on utilise
// des composants interactifs (formulaires, état)
// Sans ça Next.js essaierait de les rendre côté serveur
// ce qui causerait des erreurs
'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  // On crée le client navigateur pour l'auth
  const supabase = createBrowserSupabaseClient()

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
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
            Il gère automatiquement :
            - Formulaire de connexion
            - Formulaire d'inscription
            - Réinitialisation du mot de passe
            - Validation des champs
            - Messages d'erreur */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            // ThemeSupa est le thème officiel de Supabase
            // On le personnalise avec nos couleurs
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0D9488',           // Couleur principale — boutons
                  brandAccent: '#0F766E',     // Couleur au hover
                  inputBackground: '#0C1120', // Fond des inputs
                  inputBorder: '#1E2840',     // Bordure des inputs
                  inputText: '#F1F5F9',       // Texte dans les inputs
                  inputLabelText: '#94A3B8',  // Labels des inputs
                }
              }
            }
          }}
          // Afficher connexion ET inscription dans la même page
          view="sign_in"
          // Après connexion, rediriger vers le feed
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
          // Afficher uniquement email + mot de passe
          // pas de connexion sociale pour l'instant
          providers={[]}
          localization={{
            // Traduire les textes en français
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
            }
          }}
        />
      </div>
    </div>
  )
}
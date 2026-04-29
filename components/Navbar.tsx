// components/Navbar.tsx
// 'use client' obligatoire car on utilise :
// - useState pour le menu mobile
// - useEffect pour écouter la session Supabase
// - useRouter pour la redirection après déconnexion
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'
import { LayoutGrid, Users } from 'lucide-react'



export default function Navbar() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const capsuleRef = useRef<HTMLSpanElement>(null);

  // État de l'utilisateur connecté
  // null = pas connecté, User = connecté
  const [user, setUser] = useState<User | null>(null)

  // État du menu mobile (ouvert/fermé)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // On récupère la session au chargement de la page
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // onAuthStateChange écoute les changements de session en temps réel
    // Si l'utilisateur se connecte ou se déconnecte,
    // la navbar se met à jour automatiquement
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    // Nettoyage — on arrête d'écouter quand le composant est démonté
    // sans ça on aurait des fuites mémoire
    return () => subscription.unsubscribe()
  }, [])

  // Fonction de déconnexion
  async function handleSignOut() {
    await supabase.auth.signOut()
    // window.location.href force un rechargement complet de la page
    // plus fiable que router.refresh() qui cause des conflits
    // avec l'initialisation du router Next.js
    router.push('/')
    //window.location.href = '/'
    }

  return (
    <nav
      className="w-full px-4 py-3 flex items-center justify-between"
      style={{
        backgroundColor: '#161B28',
        borderBottom: '1px solid #1E2840',
        position: 'sticky', // La navbar reste en haut en scrollant
        top: 0,
        zIndex: 50,        // Au dessus de tout le reste
      }}
    >
      {/* Logo — cliquable, ramène au feed */}
      <Link href="/" className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: '#0D9488' }}
        />
        <span
          className="text-base font-semibold"
          style={{ color: '#F1F5F9' }}
        >
          BuilderLab
        </span>
      </Link>

      {/* Liens de navigation — version desktop */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: '#94A3B8' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F1F5F9')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
        >
          {/* Icône grille pour Projects */}
          <LayoutGrid className="w-4 h-4" />
          Projects
        </Link>

        {/* Ce lien n'apparaît que si l'utilisateur est connecté */}
        {user && (
          <Link 
            href="/connections" 
            className="flex items-center gap-1.5 text-sm transition-colors" 
            style={{ color: '#94A3B8' }} 
            onMouseEnter={e => (e.currentTarget.style.color = '#F1F5F9')} 
            onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')} 
          >
            {/* Icône users pour Connections */}
            <Users className="w-4 h-4" />
            Connections
          </Link>
        )}
        
      </div>

      {/* Actions à droite */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          // Utilisateur connecté — on affiche son email + boutons
          <>
            {/* Bouton poster un projet */}
            <Link
              href="/post"
              className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: '#0D9488',
                color: 'white',
                border: '1px solid rgba(13,148,136,0.28)',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#09746b';
                //;(e.currentTarget as HTMLElement).style.color = 'white'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#0D9488';
                //;(e.currentTarget as HTMLElement).style.color = 'white'
              }}
            >
              + Post a project
            </Link>

            {/* Lien vers le profil — affiche les initiales de l'email */}
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white transition-opacity"
              style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
              title={user.email ?? 'Mon profil'}
            >
              {/* On prend la première lettre de l'email comme avatar */}
              {user.email?.[0].toUpperCase() ?? '?'}
            </Link>

            {/* Bouton déconnexion */}
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: '#64748B',
                border: '1px solid #1E2840',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#F1F5F9'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#94A3B8'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#64748B'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#1E2840'
              }}
            >
              Log out
            </button>
          </>
        ) : (
          // Utilisateur non connecté — bouton de connexion
          <Link
            href="/login"
            className="text-sm px-4 py-1.5 rounded-lg font-medium text-white transition-all"
            style={{ backgroundColor: '#0D9488' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0F766E')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0D9488')}
          >
            Log in
          </Link>
        )}
      </div>

      {/* Bouton menu hamburger — version mobile uniquement */}
      <button
        className="md:hidden text-sm px-2 py-1 rounded"
        style={{ color: '#94A3B8' }}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {/* On change l'icône selon l'état du menu */}
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Menu mobile — visible uniquement si menuOpen = true */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 w-full px-4 py-4 flex flex-col gap-3 md:hidden"
          style={{
            backgroundColor: '#161B28',
            borderBottom: '1px solid #1E2840',
          }}
        >
          <Link href="/" style={{ color: '#94A3B8' }} className="text-sm">
            Projets
          </Link>
          {user && (
            <Link href="/connections" style={{ color: '#94A3B8' }} className="text-sm">
              Connexions
            </Link>
          )}
          {user ? (
            <>
              <Link href="/post" style={{ color: '#5EEAD4' }} className="text-sm">
                + Poster un projet
              </Link>
              <Link href="/profile" style={{ color: '#94A3B8' }} className="text-sm">
                Mon profil
              </Link>
              <button
                onClick={handleSignOut}
                className="text-left text-sm"
                style={{ color: '#64748B' }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" style={{ color: '#5EEAD4' }} className="text-sm">
              Se connecter
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
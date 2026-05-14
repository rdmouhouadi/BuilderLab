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
import { Layers, Users } from 'lucide-react'

//new
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'



export default function Navbar() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const capsuleRef = useRef<HTMLSpanElement>(null);

  // État de l'utilisateur connecté
  // null = pas connecté, User = connecté
  const [user, setUser] = useState<User | null>(null)

  // État du menu mobile (ouvert/fermé)
  const [menuOpen, setMenuOpen] = useState(false)

  const pathname = usePathname()

  // Les deux onglets de navigation
  const navItems = [
  { href: '/',            label: 'Projects',    icon: Layers },
  { href: '/connections', label: 'Connections', icon: Users  },
]

  // Nombre de demandes en attente - pour le badge sur Connections
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch le nombre de demandes pending sur les projets du user
  // Définie AVANT le useEffect qui l'appelle
  async function fetchPendingCount(userId: string) {
    // On récupère d'abord les projets appartenant à cet utilisateur
    const { data: userProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', userId)

    // Si aucun projet, le count est 0
    if (!userProjects || userProjects.length === 0) {
      setPendingCount(0)
      return
    }

    // On compte les connexions pending sur ces projets
    const { count } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .in('project_id', userProjects.map(p => p.id))

    setPendingCount(count ?? 0)
  }

  useEffect(() => {
    // On récupère la session au chargement de la page
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)

      // si connecté, on fetch le nombre de pending requests
      // sur les projets de l'utilisateur
      if (data.user) {
        fetchPendingCount(data.user.id)
      }
    })

    // onAuthStateChange écoute les changements de session en temps réel
    // Si l'utilisateur se connecte ou se déconnecte,
    // la navbar se met à jour automatiquement
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchPendingCount(session.user.id)
        } else {
          setPendingCount(0)
        }
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

      {/* Navigation desktop — capsule animée avec Framer Motion */}
      <div
        className="hidden md:flex items-center gap-1 p-1 rounded-xl relative"
        style={{ backgroundColor: '#0C1120', border: '1px solid #1E2840' }}
      >
        {navItems.map(item => {
          // L'onglet est actif si le pathname correspond exactement
          const isActive = pathname === item.href

          // On ne montre Connections que si connecté
          if (item.href === '/connections' && !user) return null

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-4 py-1.5 rounded-lg text-sm flex items-center gap-1.5 z-10 transition-colors"
              style={{
                // Le texte est blanc si actif, gris sinon
                color: isActive ? '#F1F5F9' : '#64748B',
              }}
              // Groupe pour gérer le hover sur chaque onglet
              onMouseEnter={e => {
                if (!isActive) {
                  const el = e.currentTarget
                  // On affiche la capsule grise au hover
                  el.querySelector('.hover-capsule')?.classList.remove('opacity-0')
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.querySelector('.hover-capsule')?.classList.add('opacity-0')
              }}
            >
              {/* Capsule grise au hover sur l'onglet inactif */}
              {!isActive && (
                <span
                  className="hover-capsule opacity-0 absolute inset-0 rounded-lg transition-opacity duration-150"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
              )}

              {/* Capsule verte animée sur l'onglet actif
                  layoutId permet à Framer Motion de faire glisser
                  la capsule d'un onglet à l'autre avec une animation fluide */}
              {isActive && (
                <motion.span
                  layoutId="active-nav-capsule"
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: '#0D9488' }}
                  // La capsule apparaît avec un fondu à la première render
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              {/* Icône + label — au dessus de la capsule grâce au z-10 */}
              <item.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{item.label}</span>

              {/* Badge pending — visible seulement sur Connections et si pending > 0 */}
              {item.href === '/connections' && pendingCount > 0 && (
                <span
                  className="relative z-10 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold ml-0.5"
                  style={{
                    backgroundColor: '#EF4444',
                    fontSize: '9px',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          )
        })}
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

      {/* Menu mobile — version simplifiée sans capsule animée */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 w-full px-4 py-4 flex flex-col gap-1 md:hidden"
          style={{
            backgroundColor: '#161B28',
            borderBottom: '1px solid #1E2840',
          }}
        >
          {navItems.map(item => {
            if (item.href === '/connections' && !user) return null
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgba(13,148,136,0.14)' : 'transparent',
                  color: isActive ? '#5EEAD4' : '#94A3B8',
                }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Séparateur */}
          <div className="my-2" style={{ borderTop: '1px solid #1E2840' }} />

          {user ? (
            <>
              <Link
                href="/post"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                style={{ color: '#5EEAD4' }}
              >
                + Post a project
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                style={{ color: '#94A3B8' }}
              >
                My profile
              </Link>
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false) }}
                className="text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                style={{ color: '#64748B' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{ color: '#5EEAD4' }}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
    )
  }
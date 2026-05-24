// components/Navbar.tsx

// 'use client' obligatoire car on utilise :
// - useState pour le menu mobile
// - useEffect pour écouter la session Supabase
// - useRouter pour la redirection après déconnexion
'use client'

import {
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react'

import {
  useRouter,
  usePathname,
} from 'next/navigation'

import Link from 'next/link'

import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

import type { User } from '@supabase/supabase-js'
import type { Notification } from '@/types'

import {
  Layers,
  Users,
  Bell,
  Archive,
} from 'lucide-react'

// Framer Motion — utilisé pour la capsule animée
import { motion } from 'framer-motion'

export default function Navbar() {
  const router = useRouter()

  // Permet de connaître la route active
  // pour surligner l'onglet correspondant
  const pathname = usePathname()

  // Supabase client browser
  // useMemo évite de recréer une nouvelle instance
  // du client à chaque render du composant
  const supabase = useMemo(
    () => createBrowserSupabaseClient(),
    []
  )

  // État de l'utilisateur connecté
  // null = pas connecté, User = connecté
  const [user, setUser] = useState<User | null>(null)

  // État du menu mobile (ouvert/fermé)
  const [menuOpen, setMenuOpen] = useState(false)

  // Nombre de demandes en attente
  // visible sous forme de badge sur Connections
  const [pendingCount, setPendingCount] = useState(0)

  // Notifications — état et données
  const [notifications, setNotifications] =
    useState<Notification[]>([])

  // Dropdown notifications ouvert/fermé
  const [notifOpen, setNotifOpen] =
    useState(false)

  // Nombre de notifications non lues
  const [unreadCount, setUnreadCount] =
    useState(0)

  // Profil utilisateur — utilisé pour récupérer
  // les vraies initiales prénom + nom
  const [userProfile, setUserProfile] =
    useState<{
      first_name: string | null
      last_name: string | null
    } | null>(null)

  // Ref du dropdown notifications
  // utilisé pour détecter les clics à l'extérieur
  const notifRef =
    useRef<HTMLDivElement>(null)

  // Ref du menu mobile
  // utilisé pour fermer le menu au clic extérieur
  const mobileMenuRef =
    useRef<HTMLDivElement>(null)

  // Les deux onglets de navigation
  const navItems = [
    {
      href: '/',
      label: 'Projects',
      icon: Layers,
    },
    {
      href: '/archive',
      label: 'Archive',
      icon: Archive,
    },
    {
      href: '/connections',
      label: 'Connections',
      icon: Users,
    },
  ]

  // Calcule les initiales depuis le profil
  // Fallback sur la première lettre de l'email si pas de profil
  const navInitials = userProfile
    ? (
        [
          userProfile.first_name?.[0],
          userProfile.last_name?.[0],
        ]
          .filter(Boolean)
          .join('')
          .toUpperCase()
      ) || (user?.email?.[0].toUpperCase() ?? '?')
    : (user?.email?.[0].toUpperCase() ?? '?')

  // Convertit une date en label humain
  // Exemple :
  // - 2m ago
  // - 4h ago
  // - 3d ago
  function getTimeLabel(dateString: string) {
    const diff =
      Date.now() -
      new Date(dateString).getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'

    if (minutes < 60) {
      return `${minutes}m ago`
    }

    if (hours < 24) {
      return `${hours}h ago`
    }

    return `${days}d ago`
  }

  // Fetch le nombre de demandes pending sur les projets du user
  // Définie AVANT le useEffect qui l'appelle
  async function fetchPendingCount(
    userId: string
  ) {
    // On récupère d'abord les projets appartenant à cet utilisateur
    const {
      data: userProjects,
      error,
    } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', userId)

    // Gestion des erreurs Supabase
    if (error) {
      console.error(
        'Error fetching user projects:',
        error
      )

      return
    }

    // Si aucun projet, le count est 0
    if (
      !userProjects ||
      userProjects.length === 0
    ) {
      setPendingCount(0)

      return
    }

    // On compte les connexions pending sur ces projets
    const {
      count,
      error: countError,
    } = await supabase
      .from('connections')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'pending')
      .in(
        'project_id',
        userProjects.map(p => p.id)
      )

    // Gestion des erreurs Supabase
    if (countError) {
      console.error(
        'Error fetching pending count:',
        countError
      )

      return
    }

    setPendingCount(count ?? 0)
  }

  // Fetch les notifications de l'utilisateur connecté
  async function fetchNotifications(
    userId: string
  ) {
    const {
      data,
      error,
    } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {
        ascending: false,
      })
      .limit(5)

    // Gestion des erreurs Supabase
    if (error) {
      console.error(
        'Error fetching notifications:',
        error
      )

      return
    }

    if (data) {
      setNotifications(data)

      setUnreadCount(
        data.filter(n => !n.read).length
      )
    }
  }

  // Marque toutes les notifications comme lues
  // Appelé quand on ouvre le dropdown
  // pour éviter de laisser un badge rouge après consultation
  async function markAllRead() {
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    // Gestion des erreurs Supabase
    if (error) {
      console.error(
        'Error marking notifications as read:',
        error
      )

      return
    }

    // Mise à jour locale instantanée
    // évite un refetch inutile
    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        read: true,
      }))
    )

    setUnreadCount(0)
  }

  // Fetch le profil utilisateur
  // utilisé pour récupérer prénom + nom
  async function fetchUserProfile(
    userId: string
  ) {
    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    // Gestion des erreurs Supabase
    if (error) {
      console.error(
        'Error fetching user profile:',
        error
      )

      return
    }

    setUserProfile(data)
  }

  useEffect(() => {
    // Initialise l'utilisateur au chargement
    async function initializeUser() {
      const {
        data,
        error,
      } = await supabase.auth.getUser()

      // Gestion des erreurs Supabase
      if (error) {
        console.error(
          'Error getting user:',
          error
        )

        return
      }

      setUser(data.user)

      if (data.user) {
        fetchPendingCount(data.user.id)

        fetchNotifications(data.user.id)

        fetchUserProfile(data.user.id)
      }
    }

    initializeUser()

    // Écoute les changements de session Supabase
    // login / logout / refresh token
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchPendingCount(session.user.id)

          fetchNotifications(
            session.user.id
          )

          fetchUserProfile(
            session.user.id
          )
        } else {
          // Reset des états au logout
          setPendingCount(0)

          setNotifications([])

          setUnreadCount(0)

          setUserProfile(null)
        }
      }
    )

    // Cleanup du listener Supabase
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    // Ferme les dropdowns/menu quand on clique ailleurs
    function handleClickOutside(
      e: MouseEvent
    ) {
      // Ferme le dropdown notifications
      if (
        notifRef.current &&
        !notifRef.current.contains(
          e.target as Node
        )
      ) {
        setNotifOpen(false)
      }

      // Ferme le menu mobile
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(
          e.target as Node
        )
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  // Fonction de déconnexion
  async function handleSignOut() {
    const { error } =
      await supabase.auth.signOut()

    // Gestion des erreurs Supabase
    if (error) {
      console.error(
        'Error signing out:',
        error
      )

      return
    }

    // Redirection après logout
    router.push('/')
  }

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-[#1E2840] bg-[#161B28] px-4 py-3"
    >
      <div className="relative flex items-center justify-between">
        {/* Logo — cliquable, ramène au feed */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />

          <span className="text-base font-semibold text-slate-100">
            BuilderLab
          </span>
        </Link>

        {/* Navigation desktop — capsule animée avec Framer Motion */}
        <div
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-xl border border-[#1E2840] bg-[#0C1120] p-1 md:flex"
        >
          {navItems.map(item => {
            // L'onglet est actif si le pathname correspond exactement
            const isActive =
              pathname === item.href

            // On ne montre Connections que si connecté
            if (
              item.href === '/connections' &&
              !user
            ) {
              return null
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'text-slate-100'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {/* Capsule grise au hover sur l'onglet inactif */}
                {!isActive && (
                  <span
                    className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-150 hover:opacity-100"
                    style={{
                      backgroundColor:
                        'rgba(255,255,255,0.05)',
                    }}
                  />
                )}

                {/* Capsule verte animée sur l'onglet actif
                    layoutId permet à Framer Motion de faire glisser
                    la capsule d'un onglet à l'autre avec une animation fluide */}
                {isActive && (
                  <motion.span
                    layoutId="active-nav-capsule"
                    className="absolute inset-0 rounded-lg bg-teal-600"
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
                <item.icon className="relative z-10 h-4 w-4" />

                <span className="relative z-10">
                  {item.label}
                </span>

                {/* Badge pending — visible seulement sur Connections et si pending > 0 */}
                {item.href ===
                  '/connections' &&
                  pendingCount > 0 && (
                    <span
                      className="relative z-10 ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                    >
                      {pendingCount > 9
                        ? '9+'
                        : pendingCount}
                    </span>
                  )}
              </Link>
            )
          })}
        </div>

        {/* Actions à droite */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {/* Cloche de notifications — visible seulement si connecté */}
              <div
                className="relative"
                ref={notifRef}
              >
                {/* Bouton cloche */}
                <button
                  aria-label="Notifications"
                  onClick={() => {
                    setNotifOpen(!notifOpen)

                    // Quand on ouvre le dropdown
                    // on marque tout comme lu
                    if (!notifOpen) {
                      markAllRead()
                    }
                  }}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    notifOpen
                      ? 'border-teal-700 bg-teal-900/20'
                      : 'border-transparent hover:bg-white/5 hover:border-[#1E2840]'
                  }`}
                >
                  {/* Icône cloche */}
                  <Bell
                    className={`h-4 w-4 ${
                      notifOpen
                        ? 'text-teal-300'
                        : 'text-slate-400'
                    }`}
                  />

                  {/* Badge rouge avec le nombre de non lues */}
                  {unreadCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                    >
                      {unreadCount > 9
                        ? '9+'
                        : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown aperçu des notifications */}
                {notifOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#1E2840] bg-[#161B28] shadow-2xl"
                  >
                    {/* Header dropdown */}
                    <div className="flex items-center justify-between border-b border-[#1E2840] px-4 py-3">
                      <span className="text-sm font-semibold text-slate-100">
                        Notifications
                      </span>

                      {unreadCount > 0 && (
                        <span className="text-xs text-teal-500">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {/* Aucun résultat */}
                    {notifications.length ===
                    0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-xs text-slate-500">
                          No notifications
                          yet.
                        </p>
                      </div>
                    ) : (
                      // Liste des notifications
                      <div className="flex flex-col">
                        {notifications.map(
                          notif => (
                            <Link
                              key={notif.id}
                              href={
                                notif.link ??
                                '/notifications'
                              }
                              onClick={() =>
                                setNotifOpen(
                                  false
                                )
                              }
                              className={`flex items-start gap-3 border-b border-[#1E2840] px-4 py-3 transition-colors hover:bg-white/5 ${
                                notif.read
                                  ? ''
                                  : 'bg-teal-900/10'
                              }`}
                            >
                              {/* Icône selon le type */}
                              <span className="mt-0.5 flex-shrink-0 text-base">
                                {notif.type ===
                                  'connection_request' &&
                                  '👋'}

                                {notif.type ===
                                  'connection_accepted' &&
                                  '✅'}

                                {notif.type ===
                                  'new_member' &&
                                  '🎉'}

                                {notif.type ===
                                  'new_message' &&
                                  '💬'}

                                {notif.type ===
                                  'new_project_published' &&
                                  '✅'}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="mb-0.5 truncate text-xs font-medium text-slate-100">
                                  {notif.title}
                                </p>

                                {notif.body && (
                                  <p className="line-clamp-2 text-xs text-slate-400">
                                    {notif.body}
                                  </p>
                                )}

                                {/* Temps écoulé depuis la notification */}
                                <p className="mt-1 text-xs text-slate-500">
                                  {getTimeLabel(
                                    notif.created_at
                                  )}
                                </p>
                              </div>

                              {/* Point bleu si notification non lue */}
                              {!notif.read && (
                                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-teal-500" />
                              )}
                            </Link>
                          )
                        )}
                      </div>
                    )}

                    {/* Lien vers la page complète notifications */}
                    <Link
                      href="/notifications"
                      onClick={() =>
                        setNotifOpen(false)
                      }
                      className="flex items-center justify-center border-t border-[#1E2840] px-4 py-3 text-xs font-medium text-teal-500 transition-colors hover:text-teal-300"
                    >
                      See all notifications →
                    </Link>
                  </div>
                )}
              </div>

              {/* Bouton poster un projet */}
              <Link
                href="/post"
                className="rounded-lg border border-teal-700/30 bg-teal-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
              >
                + Post a project
              </Link>

              {/* Lien vers le profil — affiche les initiales */}
              <Link
                href="/profile"
                aria-label="Profile"
                title={
                  user.email ??
                  'My profile'
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-sky-500 text-xs font-semibold text-white"
              >
                {navInitials}
              </Link>

              {/* Bouton déconnexion */}
              <button
                aria-label="Log out"
                onClick={handleSignOut}
                className="rounded-lg border border-[#1E2840] px-3 py-1.5 text-sm text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-100"
              >
                Log out
              </button>
            </>
          ) : (
            // Utilisateur non connecté — bouton de connexion
            <Link
              href="/login"
              className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Bouton menu hamburger — version mobile uniquement */}
        <button
          aria-label="Toggle mobile menu"
          className="rounded px-2 py-1 text-slate-400 md:hidden"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          {/* On change l'icône selon l'état du menu */}
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu mobile — version simplifiée sans capsule animée */}
      {menuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute left-0 top-full flex w-full flex-col gap-1 border-b border-[#1E2840] bg-[#161B28] px-4 py-4 md:hidden"
        >
          {navItems.map(item => {
            if (
              item.href === '/connections' &&
              !user
            ) {
              return null
            }

            const isActive =
              pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMenuOpen(false)
                }
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-900/20 text-teal-300'
                    : 'text-slate-400'
                }`}
              >
                <item.icon className="h-4 w-4" />

                {item.label}
              </Link>
            )
          })}

          {/* Séparateur */}
          <div className="my-2 border-t border-[#1E2840]" />

          {user ? (
            <>
              <Link
                href="/post"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-xl px-3 py-2.5 text-sm text-teal-300"
              >
                + Post a project
              </Link>

              <Link
                href="/profile"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-xl px-3 py-2.5 text-sm text-slate-400"
              >
                My profile
              </Link>

              <button
                onClick={() => {
                  handleSignOut()

                  setMenuOpen(false)
                }}
                className="rounded-xl px-3 py-2.5 text-left text-sm text-slate-500"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() =>
                setMenuOpen(false)
              }
              className="rounded-xl px-3 py-2.5 text-sm text-teal-300"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app'
import { AppShell } from '@/components/layout/AppShell'
import { SidePanel } from '@/components/layout/SidePanel'
import { AuthScreens } from '@/components/auth/AuthScreens'
import AdminPanel from '@/components/auth/AdminPanel'
import DashboardPage from '@/components/dashboard/DashboardPage'
import MembersPage from '@/components/members/MembersPage'
import ProfilePage from '@/components/profile/ProfilePage'
import EventsPage from '@/components/events/EventsPage'
import MapPage from '@/components/map/MapPage'
import ReportsPage from '@/components/reports/ReportsPage'

// Demo data — mismo que el HTML original
import { DEMO_PERSONS, DEMO_LINKS, DEMO_EVENTS } from '@/lib/demoData'

interface AuthState {
  loggedIn: boolean
  isAdmin: boolean
  user: { name: string; email: string } | null
}

export default function Home() {
  const { screen, setScreen, setPersons, setLinks, setEvents, setProfile } = useAppStore()
  const [auth, setAuth] = useState<AuthState>({ loggedIn: false, isAdmin: false, user: null })

  // Load demo data on mount
  useEffect(() => {
    setPersons(DEMO_PERSONS)
    setLinks(DEMO_LINKS)
    setEvents(DEMO_EVENTS)
  }, [])

  const handleLogin = (isAdmin: boolean, user: { name: string; email: string }) => {
    setAuth({ loggedIn: true, isAdmin, user })
    setProfile({ id: 'me', family_id: null, role: isAdmin ? 'admin' : 'member', name: user.name, last: '', email: user.email, created_at: new Date().toISOString() })
    setScreen('dashboard')
  }

  const handleLogout = () => {
    setAuth({ loggedIn: false, isAdmin: false, user: null })
    setProfile(null)
  }

  if (!auth.loggedIn) {
    return <AuthScreens onLogin={handleLogin} />
  }

  if (auth.isAdmin && screen === 'admin') {
    return <AdminPanel onBack={() => setScreen('dashboard')} onLogout={handleLogout} />
  }

  return (
    <AppShell>
      {screen === 'dashboard' && <DashboardPage />}
      {screen === 'tree'      && <TreePageLazy />}
      {screen === 'members'   && <MembersPage />}
      {screen === 'profile'   && <ProfilePage />}
      {screen === 'events'    && <EventsPage />}
      {screen === 'map'       && <MapPage />}
      {screen === 'reports'   && <ReportsPage />}
      <SidePanel />
    </AppShell>
  )
}

// Lazy-load the existing tree page to avoid circular imports
function TreePageLazy() {
  const [Comp, setComp] = useState<React.ComponentType | null>(null)
  useEffect(() => {
    import('./tree/page').then(m => setComp(() => m.default))
  }, [])
  if (!Comp) return <div className="flex items-center justify-center h-full text-ink3 text-sm">Cargando árbol…</div>
  return <Comp />
}

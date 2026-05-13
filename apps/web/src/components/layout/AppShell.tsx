'use client'
import { useAppStore } from '@/store/app'
import clsx from 'clsx'

const NAV = [
  ['dashboard', '📊', 'Inicio'],
  ['tree',      '🌳', 'Árbol'],
  ['members',   '👥', 'Miembros'],
  ['events',    '📅', 'Eventos'],
  ['map',       '🗺️', 'Mapa'],
  ['reports',   '📈', 'Reportes'],
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const { screen, setScreen, profile, persons } = useAppStore()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Topbar */}
      <header className="h-[52px] bg-bg1 border-b border-bdr flex items-center px-4 gap-1 shrink-0 z-50">
        <div className="flex items-center gap-2.5 pr-5 border-r border-bdr mr-2">
          <div className="w-[30px] h-[30px] rounded-full border border-gold/60 flex items-center justify-center text-sm bg-gold/8">
            🌿
          </div>
          <div>
            <div className="font-serif text-[19px] text-gold4 leading-none">Raíces</div>
            <div className="text-[9px] text-ink3 tracking-[2px] uppercase">Genealogía</div>
          </div>
        </div>

        <nav className="flex gap-0.5 overflow-x-auto scrollbar-none">
          {NAV.map(([s, ic, label]) => (
            <button
              key={s}
              onClick={() => setScreen(s as any)}
              className={clsx(
                'flex items-center gap-1.5 px-3 h-8 rounded-[8px] text-[12px] font-normal whitespace-nowrap transition-all border',
                screen === s
                  ? 'bg-gold/10 text-gold3 border-gold/20'
                  : 'text-ink3 border-transparent hover:bg-bg3 hover:text-ink'
              )}
            >
              {ic} {label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {profile?.role === 'admin' && (
            <button
              onClick={() => setScreen('admin')}
              className="text-[11px] px-2 py-1 border border-bdr2 rounded-[8px] text-ink3 hover:border-gold hover:text-gold transition-colors"
            >
              ⚙️ Admin
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-bdr2 rounded-[8px]">
            <div className="w-6 h-6 rounded-full bg-gold/15 text-gold3 text-[10px] font-serif flex items-center justify-center">
              {(profile?.name?.[0] ?? 'R')}
            </div>
            <span className="text-[11px] text-ink2">{profile?.name ?? 'Usuario'}</span>
            <span className={clsx(
              'text-[9px] px-1.5 py-0.5 rounded-full border',
              profile?.role === 'admin'
                ? 'bg-gold/10 text-gold3 border-gold/20'
                : 'bg-bg2 text-ink3 border-bdr'
            )}>
              {profile?.role === 'admin' ? 'Admin' : 'Miembro'}
            </span>
          </div>
          <button className="text-[10px] px-2.5 py-1 border border-bdr2 rounded-[8px] text-ink3 hover:text-red2 hover:border-red2 transition-colors">
            Salir
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        {/* Main content */}
        <main className="flex-1 overflow-auto bg-bg">
          {children}
        </main>
      </div>
    </div>
  )
}

function Sidebar() {
  const { persons, selectedId, setScreen, openSidepanel } = useAppStore()
  const [q, setQ] = useState('')

  const filtered = persons.filter(p =>
    `${p.name} ${p.last}`.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <aside className="w-[234px] shrink-0 bg-bg1 border-r border-bdr flex flex-col overflow-hidden">
      <div className="px-2.5 py-2 border-b border-bdr flex items-center gap-1.5">
        <svg className="w-3 h-3 text-ink3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="bg-transparent border-none outline-none text-[12px] text-ink placeholder:text-ink4 w-full"
          placeholder="Buscar…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div className="text-[9px] font-semibold text-ink3 tracking-[1.8px] uppercase px-3 pt-2.5 pb-1">
        Familia · {persons.length} miembros
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-px">
        {filtered.map(p => {
          const idx = p.id.charCodeAt(1) % 6
          const colors = [
            ['#bf8c20', 'rgba(191,140,32,.18)'],
            ['#2a7a40', 'rgba(42,122,64,.18)'],
            ['#2a5aac', 'rgba(42,90,172,.18)'],
            ['#7a3aac', 'rgba(122,58,172,.18)'],
            ['#ac3030', 'rgba(172,48,48,.18)'],
            ['#1a8a8a', 'rgba(26,138,138,.18)'],
          ]
          const [fg, bg] = colors[idx]
          return (
            <button
              key={p.id}
              onClick={() => { openSidepanel(p.id); setScreen('profile') }}
              className={clsx(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-[8px] border text-left transition-all',
                selectedId === p.id
                  ? 'bg-bg2 border-bdr2'
                  : 'border-transparent hover:bg-bg2 hover:border-bdr'
              )}
            >
              {p.photo_url ? (
                <img src={p.photo_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] shrink-0 font-serif" style={{ background: bg, color: fg }}>
                  {(p.name[0] ?? '') + (p.last[0] ?? '')}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-ink truncate">{p.name} {p.last}</div>
                <div className="text-[10px] text-ink3">{p.city ?? ''}{p.is_root ? ' · ★' : ''}{p.died ? ' · †' : ''}</div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-2 border-t border-bdr">
        <button
          onClick={() => {/* open add member modal */}}
          className="w-full py-2 rounded-[8px] border border-dashed border-bdr2 text-gold text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-gold/7 hover:border-gold transition-colors"
        >
          + Agregar miembro
        </button>
      </div>
    </aside>
  )
}

import { useState } from 'react'

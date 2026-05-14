'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/app'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, EventPill } from '@/components/ui/Badge'
import { fdt, age, ac, ini, LINK_LABELS, LINK_COLORS, INV_REL, EP_COLORS } from '@/lib/utils'

const TABS = [
  ['personal', '👤', 'Personal'],
  ['identidad', '🪪', 'Identidad'],
  ['parentesco', '🔗', 'Parentesco'],
  ['eventos', '📅', 'Eventos'],
  ['timeline', '⏱', 'Línea de tiempo'],
] as const

type Tab = typeof TABS[number][0]

export default function ProfilePage() {
  const { persons, links, events, selectedId, setScreen, profile } = useAppStore()
  const [tab, setTab] = useState<Tab>('personal')
  const [tlFilter, setTlFilter] = useState('todos')

  const p = persons.find(x => x.id === selectedId) ?? persons[0]
  if (!p) return null

  const idx = p.id.charCodeAt(p.id.length - 1) % 8
  const [fg, bg] = ac(idx)

  const rels = links
    .filter(l => l.from_id === p.id || l.to_id === p.id)
    .map(l => {
      const oid = l.from_id === p.id ? l.to_id : l.from_id
      const op = persons.find(x => x.id === oid)
      if (!op) return null
      const rel = l.from_id === p.id ? (LINK_LABELS[l.type] ?? l.type) : (INV_REL[l.type] ?? LINK_LABELS[l.type] ?? l.type)
      const col = LINK_COLORS[l.type] ?? '#888'
      return { ...op, rel, col, linkId: l.id }
    })
    .filter(Boolean) as (typeof persons[0] & { rel: string; col: string; linkId: string })[]

  const evs = events.filter(e => e.person_id === p.id)

  // Timeline items
  const tlItems: { type: string; date: string; dateLabel: string; title: string; desc: string; place: string; evId?: string }[] = []
  if (p.born) tlItems.push({ type: 'nacimiento', date: p.born, dateLabel: fdt(p.born), title: 'Nacimiento', desc: '', place: p.born_place ?? '' })
  evs.forEach(ev => tlItems.push({ type: ev.type, date: ev.date ?? '', dateLabel: fdt(ev.date), title: ev.type.charAt(0).toUpperCase() + ev.type.slice(1), desc: ev.description ?? '', place: ev.place ?? '', evId: ev.id }))
  if (p.died) tlItems.push({ type: 'fallecimiento', date: p.died, dateLabel: fdt(p.died), title: 'Fallecimiento', desc: '', place: p.died_place ?? '' })
  tlItems.sort((a, b) => a.date > b.date ? 1 : -1)
  const tlTypes = [...new Set(tlItems.map(i => i.type))]
  const filtered = tlFilter === 'todos' ? tlItems : tlItems.filter(i => i.type === tlFilter)

  return (
    <div className="animate-[fu_.32s_cubic-bezier(.22,.68,0,1.15)_both]">
      {/* Breadcrumb */}
      <div className="px-6 pt-3 text-[10px] text-ink3 flex gap-1">
        <button onClick={() => setScreen('members')} className="hover:text-gold transition-colors">Miembros</button>
        <span>›</span>
        <span>{p.name} {p.last}</span>
      </div>

      {/* Hero */}
      <div className="flex gap-4 items-start px-6 py-5 bg-gradient-to-br from-bg1 to-bg3 border-b border-bdr">
        <div className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl flex-shrink-0 border-2 border-gold/35" style={{ background: bg, color: fg }}>
          {ini(p.name, p.last)}
        </div>
        <div className="flex-1">
          <div className="font-serif text-[22px] text-ink font-normal leading-tight">{p.name} {p.last}</div>
          <div className="text-[11px] text-ink3 mt-0.5">@{(p.name.slice(0,3)+p.last.slice(0,3)).toLowerCase()} · {p.cedula ?? ''}</div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {p.is_root && <Badge variant="gold">★ Cabeza familiar</Badge>}
            <Badge>{p.gender === 'M' ? 'Masculino' : 'Femenino'}</Badge>
            <Badge>{p.country ?? '—'}</Badge>
            {age(p.born) && <Badge>{age(p.born)}</Badge>}
            {p.died && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red/10 text-red2 border-red/20">† {p.died.slice(0,4)}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-bdr2 text-[11px] text-ink2 hover:border-gold hover:text-gold transition-colors">✏️ Editar</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bdr px-6">
        {TABS.map(([t, ic, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[12px] border-b-2 transition-all flex items-center gap-1.5 ${tab === t ? 'text-gold3 border-gold font-medium' : 'text-ink3 border-transparent hover:text-ink'}`}
          >
            {ic} {l}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-6 py-4 overflow-auto">

        {/* PERSONAL */}
        {tab === 'personal' && (
          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="bg-card border border-bdr rounded-[12px] p-4">
              <h3 className="font-serif text-[16px] text-ink mb-3 font-normal">Datos personales</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Nombres', p.name], ['Apellidos', p.last],
                  ['Género', p.gender === 'M' ? 'Masculino' : 'Femenino'], ['Teléfono', p.phone ?? '—'],
                  ['Email', p.email ?? '—'], ['Dirección', p.address ?? '—'],
                  ['País', p.country ?? '—'], ['Ciudad', p.city ?? '—'],
                  ['Profesión', p.profession ?? '—'],
                ].map(([l, v]) => (
                  <div key={String(l)} className="bg-bg2 rounded-[8px] p-2">
                    <div className="text-[9px] text-ink3">{l}</div>
                    <div className="text-[12px] text-ink mt-0.5">{v}</div>
                  </div>
                ))}
                {p.notes && (
                  <div className="bg-bg2 rounded-[8px] p-2 col-span-2">
                    <div className="text-[9px] text-ink3">Notas</div>
                    <div className="text-[12px] text-ink mt-0.5">{p.notes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-card border border-bdr rounded-[8px] p-3">
                <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mb-2">GPS</div>
                <div className="text-[11px] text-ink3">Lat: {p.lat ?? '—'} · Lng: {p.lng ?? '—'}</div>
                <div className="mt-2 bg-bg2 rounded-[8px] h-20 flex items-center justify-center text-[11px] text-ink3 border border-bdr">
                  📍 {p.city}, {p.country}
                </div>
              </div>
              <div className="bg-card border border-bdr rounded-[8px] p-3">
                <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mb-2">Vínculos directos</div>
                {rels.slice(0, 5).map(r => (
                  <div key={r.linkId} className="flex items-center justify-between py-1.5 border-b border-bdr text-[11px]">
                    <span>{r.name} {r.last}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] border" style={{ background: r.col + '15', color: r.col, borderColor: r.col + '33' }}>{r.rel}</span>
                  </div>
                ))}
                {rels.length === 0 && <div className="text-[11px] text-ink3">Sin vínculos</div>}
              </div>
            </div>
          </div>
        )}

        {/* IDENTIDAD */}
        {tab === 'identidad' && (
          <div className="bg-card border border-bdr rounded-[12px] p-4 max-w-[620px]">
            <h3 className="font-serif text-[16px] text-ink mb-3 font-normal">Documentos de Identidad</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Cédula / Pasaporte', p.cedula ?? '—'], ['Nacionalidad', p.nationality ?? 'Ecuador'],
                ['Fecha nacimiento', fdt(p.born)], ['Lugar nacimiento', p.born_place ?? '—'],
                ['Fecha fallecimiento', p.died ? fdt(p.died) : '—'], ['Lugar fallecimiento', p.died_place ?? '—'],
                ['Profesión', p.profession ?? '—'],
              ].map(([l, v]) => (
                <div key={String(l)} className="flex flex-col gap-1">
                  <label className="text-[10px] font-medium text-ink3">{l}</label>
                  <div className="bg-bg2 border border-bdr2 rounded-[8px] px-2.5 py-2 text-[12px] text-ink">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARENTESCO */}
        {tab === 'parentesco' && (
          <div className="max-w-[620px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-[16px] text-ink font-normal">Vínculos familiares</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[11px] font-medium hover:bg-gold2 transition-colors">+ Vínculo</button>
            </div>
            {rels.length === 0 && (
              <div className="text-center py-10 text-ink3">
                <div className="text-[32px] mb-2">🔗</div>
                <div>Sin vínculos</div>
              </div>
            )}
            {rels.map(r => (
              <div key={r.linkId} className="flex items-center gap-3 p-3 bg-card border border-bdr rounded-[8px] mb-2 transition-all hover:border-bdr2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-serif flex-shrink-0"
                  style={{ background: ac(r.id.charCodeAt(r.id.length-1)%8)[1], color: ac(r.id.charCodeAt(r.id.length-1)%8)[0] }}>
                  {ini(r.name, r.last)}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{r.name} {r.last}</div>
                  <div className="text-[10px] text-ink3">n. {r.born?.slice(0,4) ?? '?'} · {r.city}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] border" style={{ background: r.col + '15', color: r.col, borderColor: r.col + '33' }}>{r.rel}</span>
              </div>
            ))}
          </div>
        )}

        {/* EVENTOS */}
        {tab === 'eventos' && (
          <div className="max-w-[620px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-[16px] text-ink font-normal">Eventos de {p.name}</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[11px] font-medium hover:bg-gold2 transition-colors">+ Evento</button>
            </div>
            {evs.length === 0 && (
              <div className="text-center py-10 text-ink3">
                <div className="text-[32px] mb-2">📅</div>
                <div>Sin eventos</div>
              </div>
            )}
            {evs.map(ev => (
              <div key={ev.id} className="bg-card border border-bdr rounded-[8px] p-3 mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <EventPill type={ev.type} />
                      <span className="text-[12px] font-medium">{ev.place}</span>
                    </div>
                    <div className="text-[11px] text-ink3">{fdt(ev.date)}{ev.description ? ' · ' + ev.description : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE */}
        {tab === 'timeline' && (
          <div className="max-w-[680px]">
            {/* Filter bar */}
            <div className="flex gap-1.5 flex-wrap mb-5 items-center">
              <button onClick={() => setTlFilter('todos')} className={`px-3 py-1.5 rounded-[8px] text-[11px] border transition-colors ${tlFilter === 'todos' ? 'bg-gold text-[#0a0800] border-transparent' : 'border-bdr2 text-ink2 hover:border-gold hover:text-gold'}`}>
                Todos ({tlItems.length})
              </button>
              {tlTypes.map(t => {
                const m = EP_COLORS[t] ?? EP_COLORS.otro
                return (
                  <button key={t} onClick={() => setTlFilter(t)} className={`px-3 py-1.5 rounded-[8px] text-[11px] border transition-colors ${tlFilter === t ? 'bg-gold text-[#0a0800] border-transparent' : 'border-bdr2 text-ink2 hover:border-gold hover:text-gold'}`}
                    style={tlFilter !== t ? { borderColor: m.dot, color: m.dot } : {}}>
                    {m.label} ({tlItems.filter(i => i.type === t).length})
                  </button>
                )
              })}
              <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[11px] font-medium hover:bg-gold2 transition-colors">+ Evento</button>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-8 text-ink3 text-[12px]">No hay eventos de este tipo</div>
            )}

            {/* Timeline */}
            <div className="relative pl-7">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-bdr2 rounded-full" />
              {filtered.map((ev, i) => {
                const m = EP_COLORS[ev.type] ?? EP_COLORS.otro
                return (
                  <div key={`${ev.evId ?? ev.type}-${i}`} className="relative mb-3">
                    <div className="absolute left-[-24px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-bg1" style={{ background: m.dot, boxShadow: `0 0 0 2px ${m.dot}` }} />
                    <div className="bg-card border border-bdr rounded-[8px] p-3 transition-all" style={{ ':hover': { borderColor: m.dot } as any }}>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ background: m.bg, color: m.tc, borderColor: m.dot + '33' }}>{m.label}</span>
                        <span className="text-[11px] text-ink3">{ev.dateLabel || '—'}</span>
                        {i === 0 && ev.type === 'nacimiento' && <span className="text-[10px] text-ink3 ml-auto">{age(p.born)}</span>}
                      </div>
                      <div className="text-[13px] font-medium text-ink">{ev.title}</div>
                      {ev.desc && <div className="text-[12px] text-ink2 mt-1 leading-relaxed">{ev.desc}</div>}
                      {ev.place && (
                        <div className="text-[11px] text-ink3 mt-1.5 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {ev.place}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

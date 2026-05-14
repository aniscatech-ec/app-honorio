'use client'
import { useAppStore } from '@/store/app'
import { Avatar } from '@/components/ui/Avatar'
import { EventPill } from '@/components/ui/Badge'
import { fdt, age, ac, ini, LINK_LABELS, LINK_COLORS, INV_REL } from '@/lib/utils'

export function SidePanel() {
  const { persons, links, events, selectedId, sidepanelOpen, closeSidepanel, setScreen, openSidepanel } = useAppStore()

  const p = persons.find(x => x.id === selectedId)
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
      return { ...op, rel, col }
    })
    .filter(Boolean) as (typeof persons[0] & { rel: string; col: string })[]

  const evs = events.filter(e => e.person_id === p.id)

  return (
    <div
      className={`fixed right-0 top-[52px] bottom-0 w-[260px] bg-bg1 border-l border-bdr2 flex flex-col z-[200] shadow-[-6px_0_32px_rgba(0,0,0,.55)] transition-transform duration-[220ms] ease-[cubic-bezier(.22,.68,0,1.1)] ${sidepanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="px-3.5 pt-3.5 pb-2.5 border-b border-bdr flex items-center justify-between shrink-0">
        <span className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.4px]">Perfil rápido</span>
        <button onClick={closeSidepanel} className="w-6 h-6 rounded-[6px] border border-bdr2 flex items-center justify-center text-ink3 text-[13px] hover:border-red2 hover:text-red2 transition-colors">✕</button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Avatar */}
        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center font-serif text-[21px] mx-auto mb-2.5 border-2 border-gold/30" style={{ background: bg, color: fg }}>
          {ini(p.name, p.last)}
        </div>
        <div className="font-serif text-[15px] text-ink text-center leading-snug">{p.name}<br /><span className="text-[12px] text-ink3">{p.last}</span></div>
        <div className="text-[10px] text-ink3 text-center mt-0.5">{p.profession ?? '—'} · {p.city ?? '—'}</div>

        {p.is_root && <div className="text-center mt-1.5"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gold/13 text-gold3 border border-gold/22">★ Raíz familiar</span></div>}
        {p.died && <div className="text-center mt-1"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-red/10 text-red2 border border-red/20">† {fdt(p.died)}</span></div>}

        {/* KV */}
        <div className="flex flex-col gap-1.5 mt-3">
          {[
            ['Nacimiento', p.born ? fdt(p.born) : '—'],
            ['Edad', age(p.born) || '—'],
            ['País', p.country ?? '—'],
            ['Cédula', p.cedula ?? '—'],
            ['Teléfono', p.phone ?? '—'],
            ['Email', p.email ?? '—'],
          ].map(([l, v]) => (
            <div key={String(l)} className="bg-bg2 rounded-[6px] px-2.5 py-1.5">
              <div className="text-[9px] text-ink3 uppercase tracking-[1.3px]">{l}</div>
              <div className="text-[11px] text-ink mt-0.5">{v}</div>
            </div>
          ))}
        </div>

        {/* Vínculos */}
        {rels.length > 0 && (
          <>
            <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mt-3 mb-1.5">Vínculos ({rels.length})</div>
            {rels.slice(0, 6).map(r => (
              <div key={r.id} className="flex items-center gap-1.5 py-1.5 border-b border-bdr">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-serif shrink-0" style={{ background: ac(r.id.charCodeAt(r.id.length-1)%8)[1], color: ac(r.id.charCodeAt(r.id.length-1)%8)[0] }}>
                  {ini(r.name, r.last)}
                </div>
                <div className="flex-1 min-w-0 text-[11px] truncate">{r.name} {r.last}</div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] whitespace-nowrap border" style={{ background: r.col+'15', color: r.col, borderColor: r.col+'33' }}>{r.rel}</span>
              </div>
            ))}
          </>
        )}

        {/* Eventos */}
        {evs.length > 0 && (
          <>
            <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mt-3 mb-1.5">Eventos ({evs.length})</div>
            {evs.slice(0, 4).map(ev => (
              <div key={ev.id} className="flex items-center gap-1.5 py-1.5 border-b border-bdr">
                <EventPill type={ev.type} />
                <span className="text-[10px] text-ink3">{ev.date?.slice(0,4) ?? '—'}</span>
                <span className="text-[10px] text-ink flex-1 truncate">{ev.place ?? ''}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-bdr flex flex-col gap-1.5 shrink-0">
        <button onClick={() => { setScreen('profile') }} className="w-full py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[11px] font-medium hover:bg-gold2 transition-colors flex items-center justify-center gap-1.5">
          👤 Ver perfil completo
        </button>
        <button className="w-full py-1.5 rounded-[8px] border border-bdr2 text-[11px] text-ink2 hover:border-gold hover:text-gold transition-colors">
          👶 Agregar hijo/a
        </button>
        <button className="w-full py-1.5 rounded-[8px] border border-bdr2 text-[11px] text-ink2 hover:border-gold hover:text-gold transition-colors">
          💑 Agregar pareja
        </button>
      </div>
    </div>
  )
}

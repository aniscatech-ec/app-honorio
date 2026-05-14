'use client'
import { useAppStore } from '@/store/app'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { fdt, ac } from '@/lib/utils'

export default function MembersPage() {
  const { persons, setScreen, openSidepanel } = useAppStore()

  return (
    <div className="animate-[fu_.32s_cubic-bezier(.22,.68,0,1.15)_both]">
      <div className="flex items-start justify-between px-6 pt-5 pb-0">
        <div>
          <h1 className="font-serif text-[25px] text-ink font-normal">Miembros</h1>
          <p className="text-[11px] text-ink3 mt-1">{persons.length} personas registradas</p>
        </div>
        <div className="flex gap-2 mt-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[12px] font-medium hover:bg-gold2 transition-colors">
            + Nuevo
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-3 gap-3">
        {persons.map(p => {
          const idx = p.id.charCodeAt(p.id.length - 1) % 8
          const [fg, bg] = ac(idx)
          return (
            <div
              key={p.id}
              className="bg-card border border-bdr rounded-[12px] p-4 cursor-pointer transition-all hover:shadow-[0_4px_16px_rgba(191,140,32,.1)]"
              onClick={() => { openSidepanel(p.id); setScreen('profile') }}
            >
              <div className="flex items-start gap-2.5 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-serif text-[19px] flex-shrink-0" style={{ background: bg, color: fg }}>
                  {(p.name[0] ?? '') + (p.last[0] ?? '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[15px] text-ink">{p.name}</div>
                  <div className="text-[11px] text-ink3">{p.last}</div>
                </div>
                {p.is_root && <Badge variant="gold">★</Badge>}
              </div>

              {[
                ['📅', fdt(p.born)],
                ['📍', `${p.city ?? ''}, ${p.country ?? ''}`],
                ['💼', p.profession ?? '—'],
                ['🪪', p.cedula ?? '—'],
              ].map(([ic, v]) => (
                <div key={String(ic)} className="flex items-center gap-1.5 text-[11px] mb-0.5">
                  <span className="opacity-50">{ic}</span>
                  <span className="text-ink3">{v}</span>
                </div>
              ))}

              <div className="h-px bg-bdr my-3" />
              <button
                className="w-full py-1.5 rounded-[8px] border border-bdr2 text-[11px] text-ink2 hover:border-gold hover:text-gold transition-colors"
                onClick={e => { e.stopPropagation(); openSidepanel(p.id); setScreen('profile') }}
              >
                Ver perfil
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

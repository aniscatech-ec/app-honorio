'use client'
import { useAppStore } from '@/store/app'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, EventPill } from '@/components/ui/Badge'
import { fdt, age, ac, ini } from '@/lib/utils'

export default function DashboardPage() {
  const { persons, events, links, setScreen, openSidepanel } = useAppStore()

  const byCountry = persons.reduce<Record<string, number>>((a, p) => {
    if (p.country) a[p.country] = (a[p.country] ?? 0) + 1
    return a
  }, {})

  const byGender = persons.reduce<Record<string, number>>((a, p) => {
    const k = p.gender === 'M' ? 'Masculino' : 'Femenino'
    a[k] = (a[k] ?? 0) + 1
    return a
  }, {})

  const root = persons.find(p => p.is_root) ?? persons[0]
  const rootIdx = root ? root.id.charCodeAt(root.id.length - 1) % 8 : 0
  const [rfg, rbg] = ac(rootIdx)

  return (
    <div className="animate-[fu_.32s_cubic-bezier(.22,.68,0,1.15)_both]">
      {/* Page header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-0 shrink-0">
        <div>
          <h1 className="font-serif text-[25px] text-ink font-normal leading-tight">
            Bienvenido, {persons[0]?.name?.split(' ')[0] ?? 'Familia'}
          </h1>
          <p className="text-[11px] text-ink3 mt-1">
            Familia {persons[0]?.last?.split(' ')[0] ?? ''} · {new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 items-center mt-1">
          <button onClick={() => setScreen('tree')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-bdr2 text-[12px] text-ink2 hover:border-gold hover:text-gold transition-colors">
            🌳 Ver árbol
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[12px] font-medium hover:bg-gold2 transition-colors">
            + Nuevo miembro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-[11px] px-6 pt-4">
        {[
          ['Miembros', persons.length, 'Total registrados'],
          ['Generaciones', 3, 'Ascendencia activa'],
          ['Eventos', events.length, 'Registrados'],
          ['Países', Object.keys(byCountry).length, 'Distribución'],
        ].map(([l, v, t]) => (
          <div key={String(l)} className="bg-card border border-bdr rounded-[8px] px-4 py-3">
            <div className="font-serif text-[30px] text-gold3 leading-none">{String(v)}</div>
            <div className="text-[11px] text-ink3 mt-1">{String(l)}</div>
            <div className="text-[10px] text-grn3 mt-0.5">{String(t)}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="px-6 pt-3 pb-6 grid grid-cols-[1fr_280px] gap-[14px] items-start">
        <div className="flex flex-col gap-3">
          {/* Recent members table */}
          <div className="bg-card border border-bdr rounded-[12px] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-[16px] text-ink font-normal">Miembros recientes</h2>
              <button onClick={() => setScreen('members')} className="text-[12px] text-ink3 hover:text-gold transition-colors">Ver todos →</button>
            </div>
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-bdr2">
                  {['Nombre','Nacimiento','País','Estado'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold text-ink3 uppercase tracking-[1.2px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {persons.slice(0, 5).map(p => {
                  const idx = p.id.charCodeAt(p.id.length - 1) % 8
                  const [fg, bg] = ac(idx)
                  return (
                    <tr key={p.id} className="border-b border-bdr hover:bg-bg2 cursor-pointer transition-colors" onClick={() => { openSidepanel(p.id); setScreen('profile') }}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar person={p} size={26} fontSize={11} idx={idx} />
                          <div>
                            <div className="font-medium">{p.name} {p.last}</div>
                            <div className="text-[10px] text-ink3">{p.cedula ?? ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-ink3">{fdt(p.born)}</td>
                      <td className="px-3 py-2.5 text-ink3">{p.country}</td>
                      <td className="px-3 py-2.5">
                        {p.is_root ? <Badge variant="gold">★ Raíz</Badge> : <Badge variant="green">Activo</Badge>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Recent events */}
          <div className="bg-card border border-bdr rounded-[12px] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-[16px] text-ink font-normal">Últimos eventos</h2>
              <button onClick={() => setScreen('events')} className="text-[12px] text-ink3 hover:text-gold transition-colors">Ver todos →</button>
            </div>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-bdr2" />
              {[...events].reverse().slice(0, 4).map(ev => {
                const p = persons.find(x => x.id === ev.person_id)
                return (
                  <div key={ev.id} className="relative mb-3">
                    <div className="absolute left-[-18px] top-3 w-2.5 h-2.5 rounded-full bg-card border-2 border-bdr2" />
                    <div className="bg-card border border-bdr rounded-[8px] p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <EventPill type={ev.type} />
                        <span className="text-[11px] font-medium">{p?.name} {p?.last}</span>
                      </div>
                      <div className="text-[11px] text-ink3">{ev.place} · {fdt(ev.date)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-3">
          {/* Root card */}
          {root && (
            <div className="bg-card border border-bdr rounded-[8px] p-3">
              <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mb-2">Cabeza de familia</div>
              <div className="flex items-center gap-2.5 mt-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg flex-shrink-0" style={{ background: rbg, color: rfg }}>
                  {ini(root.name, root.last)}
                </div>
                <div>
                  <div className="text-[13px] font-medium">{root.name} {root.last}</div>
                  <div className="text-[11px] text-ink3">{root.city} · {age(root.born)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Geo distribution */}
          <div className="bg-card border border-bdr rounded-[8px] p-3">
            <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mb-2">Distribución geográfica</div>
            {Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
              <div key={c} className="flex items-center gap-2 mb-2">
                <div className="text-[11px] text-ink w-[90px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">{c}</div>
                <div className="flex-1 h-[7px] bg-bg3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold3 transition-all" style={{ width: `${(n / persons.length) * 100}%` }} />
                </div>
                <div className="text-[10px] text-ink3 w-4 text-right">{n}</div>
              </div>
            ))}
          </div>

          {/* By gender */}
          <div className="bg-card border border-bdr rounded-[8px] p-3">
            <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mb-2">Por género</div>
            <div className="flex gap-2.5">
              {Object.entries(byGender).map(([g, n]) => (
                <div key={g} className="flex-1 text-center bg-bg2 rounded-[8px] py-2.5">
                  <div className="text-[22px]">{g === 'Masculino' ? '👨' : '👩'}</div>
                  <div className="font-serif text-[20px] text-gold3">{n}</div>
                  <div className="text-[10px] text-ink3">{g}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

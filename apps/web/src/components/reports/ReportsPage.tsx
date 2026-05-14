'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/app'
import { Avatar } from '@/components/ui/Avatar'
import { fdt, ac, ini } from '@/lib/utils'

const TABS = [['resumen','Resumen'],['cabezas','Cabezas'],['geografia','Geografía'],['cronologia','Cronología']] as const
type Tab = typeof TABS[number][0]

export default function ReportsPage() {
  const { persons, events, links, setScreen, openSidepanel } = useAppStore()
  const [tab, setTab] = useState<Tab>('resumen')

  const byCountry = persons.reduce<Record<string,number>>((a,p) => { if(p.country) a[p.country]=(a[p.country]??0)+1; return a }, {})
  const byGender  = persons.reduce<Record<string,number>>((a,p) => { const k=p.gender==='M'?'Masculino':'Femenino'; a[k]=(a[k]??0)+1; return a }, {})
  const byEvent   = events.reduce<Record<string,number>>((a,e) => { a[e.type]=(a[e.type]??0)+1; return a }, {})
  const heads     = persons.filter(p => p.is_root)

  const CHILD_T = new Set(['hijo','hija','hijastro','hijastra','adoptado','adoptada'])

  return (
    <div className="animate-[fu_.32s_cubic-bezier(.22,.68,0,1.15)_both]">
      <div className="flex items-start justify-between px-6 pt-5 pb-0">
        <div>
          <h1 className="font-serif text-[25px] text-ink font-normal">Reportes</h1>
          <p className="text-[11px] text-ink3 mt-1">Análisis de la familia</p>
        </div>
        <div className="flex gap-2 mt-1">
          <button className="px-3 py-1.5 rounded-[8px] border border-bdr2 text-[11px] text-ink2 hover:border-gold hover:text-gold transition-colors">⬇ PDF</button>
          <button className="px-3 py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[11px] font-medium hover:bg-gold2 transition-colors">⬇ Excel</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bdr px-6 mt-4">
        {TABS.map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[12px] border-b-2 transition-all ${tab===t ? 'text-gold3 border-gold font-medium' : 'text-ink3 border-transparent hover:text-ink'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="px-6 py-4">

        {/* RESUMEN */}
        {tab === 'resumen' && (
          <>
            <div className="grid grid-cols-4 gap-[11px] mb-4">
              {[['Miembros',persons.length],['Vínculos',links.length],['Eventos',events.length],['Países',Object.keys(byCountry).length]].map(([l,v]) => (
                <div key={String(l)} className="bg-card border border-bdr rounded-[8px] px-4 py-3">
                  <div className="font-serif text-[30px] text-gold3 leading-none">{v}</div>
                  <div className="text-[11px] text-ink3 mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-bdr rounded-[12px] p-4">
                <h3 className="font-serif text-[16px] text-ink mb-3 font-normal">Por género</h3>
                {Object.entries(byGender).map(([g,n]) => (
                  <div key={g} className="flex items-center gap-2 mb-2">
                    <div className="text-[11px] text-ink w-[90px] shrink-0">{g}</div>
                    <div className="flex-1 h-[7px] bg-bg3 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold3" style={{width:`${(n/persons.length)*100}%`}} />
                    </div>
                    <div className="text-[10px] text-ink3 w-4 text-right">{n}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-bdr rounded-[12px] p-4">
                <h3 className="font-serif text-[16px] text-ink mb-3 font-normal">Por tipo de evento</h3>
                {Object.entries(byEvent).map(([t,n]) => (
                  <div key={t} className="flex items-center gap-2 mb-2">
                    <div className="text-[11px] text-ink w-[90px] shrink-0 truncate">{t}</div>
                    <div className="flex-1 h-[7px] bg-bg3 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold3" style={{width:`${(n/events.length)*100}%`}} />
                    </div>
                    <div className="text-[10px] text-ink3 w-4 text-right">{n}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CABEZAS */}
        {tab === 'cabezas' && (
          <div className="bg-card border border-bdr rounded-[12px] p-4">
            <h3 className="font-serif text-[16px] text-ink mb-3 font-normal">Cabezas de Familia</h3>
            {heads.length === 0 && <div className="text-center py-7 text-ink3">Ningún miembro marcado como raíz</div>}
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-bdr2">
                  {['Nombre','Nacimiento','País','Cédula','Hijos directos'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold text-ink3 uppercase tracking-[1.2px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heads.map(p => {
                  const idx = p.id.charCodeAt(p.id.length-1)%8
                  const childCount = links.filter(l => CHILD_T.has(l.type) && l.from_id === p.id).length
                  return (
                    <tr key={p.id} className="border-b border-bdr hover:bg-bg2 cursor-pointer" onClick={() => { openSidepanel(p.id); setScreen('profile') }}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar person={p} size={28} fontSize={12} idx={idx} />
                          <div>
                            <div className="font-medium">{p.name} {p.last}</div>
                            <div className="text-[10px] text-ink3">{p.profession ?? ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-ink3">{fdt(p.born)}</td>
                      <td className="px-3 py-2.5">{p.country}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-ink3">{p.cedula ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-grn/20 text-grn3 border border-grn/30">{childCount}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* GEOGRAFÍA */}
        {tab === 'geografia' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-bdr rounded-[12px] p-4">
              <h3 className="font-serif text-[16px] text-ink mb-3 font-normal">Por país</h3>
              {Object.entries(byCountry).sort((a,b)=>b[1]-a[1]).map(([c,n]) => (
                <div key={c} className="flex items-center gap-2 mb-2">
                  <div className="text-[11px] text-ink w-[90px] shrink-0">{c}</div>
                  <div className="flex-1 h-[7px] bg-bg3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold3" style={{width:`${(n/persons.length)*100}%`}} />
                  </div>
                  <div className="text-[10px] text-ink3 w-4 text-right">{n}</div>
                </div>
              ))}
            </div>
            <div className="bg-card border border-bdr rounded-[12px] p-4">
              <h3 className="font-serif text-[16px] text-ink mb-3 font-normal">Por ciudad</h3>
              <table className="w-full text-[12px] border-collapse">
                <thead><tr className="border-b border-bdr2">
                  {['País','Ciudad','N'].map(h => <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold text-ink3 uppercase tracking-[1.2px]">{h}</th>)}
                </tr></thead>
                <tbody>
                  {Object.entries(persons.reduce<Record<string,number>>((a,p) => {
                    const k = `${p.country}|${p.city}`; a[k]=(a[k]??0)+1; return a
                  }, {})).map(([k,n]) => {
                    const [c,ci] = k.split('|')
                    return (
                      <tr key={k} className="border-b border-bdr">
                        <td className="px-3 py-2">{c}</td>
                        <td className="px-3 py-2 text-ink3">{ci}</td>
                        <td className="px-3 py-2"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-gold/13 text-gold3 border border-gold/22">{n}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CRONOLOGÍA */}
        {tab === 'cronologia' && (
          <div className="bg-card border border-bdr rounded-[12px] p-4">
            <h3 className="font-serif text-[16px] text-ink mb-3 font-normal">Cronología familiar</h3>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-bdr2" />
              {[...events].sort((a,b) => (a.date??'') > (b.date??'') ? 1 : -1).map(ev => {
                const p = persons.find(x => x.id === ev.person_id)
                return (
                  <div key={ev.id} className="relative mb-2">
                    <div className="absolute left-[-18px] top-2 w-2.5 h-2.5 rounded-full bg-card border-2 border-bdr2" />
                    <div className="flex items-center gap-2 py-1.5">
                      <span className="font-serif text-[14px] text-gold3 w-10 shrink-0">{ev.date?.slice(0,4)}</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize bg-bg2 text-ink3 border border-bdr">{ev.type}</span>
                      <span className="text-[11px]">{p?.name} {p?.last}{ev.description ? ' — '+ev.description : ''}</span>
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

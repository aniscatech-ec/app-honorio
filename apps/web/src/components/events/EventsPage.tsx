'use client'
import { useAppStore } from '@/store/app'
import { EventPill } from '@/components/ui/Badge'
import { fdt } from '@/lib/utils'

export default function EventsPage() {
  const { persons, events, setScreen } = useAppStore()

  return (
    <div className="animate-[fu_.32s_cubic-bezier(.22,.68,0,1.15)_both]">
      <div className="flex items-start justify-between px-6 pt-5 pb-0">
        <div>
          <h1 className="font-serif text-[25px] text-ink font-normal">Eventos Familiares</h1>
          <p className="text-[11px] text-ink3 mt-1">{events.length} eventos registrados</p>
        </div>
        <button className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[12px] font-medium hover:bg-gold2 transition-colors">
          + Evento
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-bdr2" />
          {[...events].sort((a, b) => (b.date ?? '') > (a.date ?? '') ? 1 : -1).map(ev => {
            const p = persons.find(x => x.id === ev.person_id)
            return (
              <div key={ev.id} className="relative mb-3">
                <div className="absolute left-[-18px] top-3 w-2.5 h-2.5 rounded-full bg-card border-2 border-bdr2" />
                <div className="bg-card border border-bdr rounded-[8px] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <EventPill type={ev.type} />
                        <span className="text-[12px] font-medium">{ev.place}</span>
                        <span className="text-[10px] text-ink3">· {ev.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-ink3">{p?.name} {p?.last}</span>
                      </div>
                      {ev.description && (
                        <div className="text-[11px] text-ink3 mt-1">{ev.description}</div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button className="w-7 h-7 rounded-[8px] border border-bdr flex items-center justify-center text-ink3 hover:border-gold hover:text-gold transition-colors text-[12px]">✏️</button>
                      <button className="w-7 h-7 rounded-[8px] border border-bdr flex items-center justify-center text-red2 hover:border-red2 transition-colors text-[12px]">🗑</button>
                    </div>
                  </div>

                  {/* Upload zone */}
                  <div className="mt-3 border border-dashed border-bdr2 rounded-[8px] p-3 text-center cursor-pointer hover:border-gold2 hover:bg-gold/4 transition-colors">
                    <div className="text-[11px] text-ink3">🖼️ 🎬 📄 Adjuntar fotos, videos o documentos</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

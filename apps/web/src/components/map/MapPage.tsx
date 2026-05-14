'use client'
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/app'
import { ac, ini } from '@/lib/utils'

export default function MapPage() {
  const { persons, setScreen, openSidepanel } = useAppStore()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  const byCountry = persons.reduce<Record<string, number>>((a, p) => {
    if (p.country) a[p.country] = (a[p.country] ?? 0) + 1
    return a
  }, {})

  const geoPersons = persons.filter(p => p.lat && p.lng)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }

    // Dynamically import Leaflet
    import('leaflet').then(L => {
      if (!mapRef.current) return

      const center: [number, number] = geoPersons.length
        ? [geoPersons[0].lat!, geoPersons[0].lng!]
        : [-1.8, -78.2]

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(center, geoPersons.length > 1 ? 5 : 6)
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      geoPersons.forEach(p => {
        const colorIdx = p.id.charCodeAt(p.id.length - 1) % 8
        const [fg] = ac(colorIdx)
        const initials = ini(p.name, p.last)

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:32px;height:32px;border-radius:50%;background:${fg};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;color:#fff;cursor:pointer">${initials}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        })

        const marker = L.marker([p.lat!, p.lng!], { icon }).addTo(map)
        marker.bindPopup(`
          <div style="font-family:'DM Sans',sans-serif;min-width:140px">
            <div style="font-weight:600;font-size:13px;margin-bottom:3px">${p.name} ${p.last}</div>
            <div style="font-size:11px;color:#666">${p.city ?? ''}${p.country ? ', ' + p.country : ''}</div>
            ${p.born ? `<div style="font-size:10px;color:#888;margin-top:2px">n. ${p.born.slice(0,4)}</div>` : ''}
          </div>
        `, { maxWidth: 200 })
      })

      if (geoPersons.length > 1) {
        const bounds = L.latLngBounds(geoPersons.map(p => [p.lat!, p.lng!] as [number, number]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
      }
    })

    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null } }
  }, [persons])

  return (
    <div className="animate-[fu_.32s_cubic-bezier(.22,.68,0,1.15)_both]">
      <div className="px-6 pt-5 pb-0">
        <h1 className="font-serif text-[25px] text-ink font-normal">Distribución Geográfica</h1>
        <p className="text-[11px] text-ink3 mt-1">{geoPersons.length} miembros georeferenciados</p>
      </div>

      <div className="px-6 py-4 grid grid-cols-[1fr_280px] gap-[14px] items-start">
        {/* Map */}
        <div className="rounded-[12px] overflow-hidden border border-bdr shadow-[0_4px_16px_rgba(0,0,0,.08)]">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
          <div ref={mapRef} style={{ height: 420, width: '100%', background: 'var(--bg2)' }} />
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-3">
          <div className="bg-card border border-bdr rounded-[8px] p-3">
            <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mb-2">Por país</div>
            {Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
              <div key={c} className="flex items-center gap-2 mb-2">
                <div className="text-[11px] text-ink w-[90px] shrink-0 truncate">{c}</div>
                <div className="flex-1 h-[7px] bg-bg3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold3" style={{ width: `${(n / persons.length) * 100}%` }} />
                </div>
                <div className="text-[10px] text-ink3 w-4 text-right">{n}</div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-bdr rounded-[8px] p-3">
            <div className="text-[9px] font-semibold text-ink3 uppercase tracking-[1.6px] mb-2">Miembros</div>
            {persons.map(p => {
              const colorIdx = p.id.charCodeAt(p.id.length - 1) % 8
              const [fg, bg] = ac(colorIdx)
              return (
                <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-bdr cursor-pointer" onClick={() => { openSidepanel(p.id); setScreen('profile') }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-serif flex-shrink-0" style={{ background: bg, color: fg }}>
                    {ini(p.name, p.last)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium truncate">{p.name}</div>
                    <div className="text-[9px] text-ink3">{p.city}, {p.country}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: fg }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

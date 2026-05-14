'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/app'
import { ac } from '@/lib/utils'
import type { Person } from '@/types'

interface PendingUser {
  id: string; name: string; last: string; email: string
  fatherName?: string; motherName?: string; born?: string
  city?: string; status: 'pending' | 'approved' | 'rejected'
  createdAt: string; pass?: string
}

const DEMO_PENDING: PendingUser[] = [
  { id:'u1', name:'Diego', last:'Jiménez Cadena', email:'diego@example.com', fatherName:'Orfe Jiménez', motherName:'Ruth Cadena', born:'1995-04-12', city:'Quito', status:'pending', createdAt:'2026-03-20' },
  { id:'u2', name:'Valeria', last:'Mendoza Torres', email:'valeria@example.com', fatherName:'Juan Pablo Mendoza', born:'2001-08-30', city:'Guayaquil', status:'pending', createdAt:'2026-03-21' },
  { id:'u3', name:'Sofía', last:'Vargas Mora', email:'sofia@example.com', motherName:'Carmen Vargas', born:'1992-11-15', city:'Ambato', status:'approved', pass:'Familia2026!', createdAt:'2026-03-18' },
]

interface AdminProps { onBack: () => void; onLogout: () => void }

export default function AdminPanel({ onBack, onLogout }: AdminProps) {
  const { persons, addPerson } = useAppStore()
  const [tab, setTab] = useState<'requests'|'config'>('requests')
  const [filter, setFilter] = useState<'todos'|'pending'|'approved'|'rejected'>('todos')
  const [users, setUsers] = useState<PendingUser[]>(DEMO_PENDING)
  const [approveId, setApproveId] = useState<string|null>(null)
  const [approvePass, setApprovePass] = useState(`Familia${new Date().getFullYear()}!`)

  const pending = users.filter(u => u.status === 'pending')
  const list = filter === 'todos' ? users : users.filter(u => u.status === filter)

  const confirmApprove = () => {
    const u = users.find(x => x.id === approveId)
    if (!u) return
    setUsers(prev => prev.map(x => x.id === approveId ? { ...x, status: 'approved', pass: approvePass } : x))
    // Add to persons
    addPerson({
      id: 'p' + Math.random().toString(36).slice(2,8),
      family_id: '', name: u.name, last: u.last, gender: 'M',
      born: u.born ?? null, died: null, born_place: null, died_place: null,
      nationality: null, address: null, phone: null, email: u.email,
      country: null, city: u.city ?? null, lat: null, lng: null,
      is_root: false, cedula: null, profession: null, notes: null,
      photo_url: null, created_at: new Date().toISOString(), created_by: 'admin',
    })
    setApproveId(null)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="h-[52px] bg-bg1 border-b border-bdr flex items-center px-5 gap-3 shrink-0">
        <div className="w-7 h-7 rounded-full border border-gold/60 flex items-center justify-center text-sm bg-gold/8">🌿</div>
        <span className="font-serif text-[16px] text-gold4">Raíces · Admin</span>
        <div className="ml-auto flex items-center gap-2">
          {pending.length > 0 && (
            <span className="bg-red2 text-white rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {pending.length} pendiente{pending.length > 1 ? 's' : ''}
            </span>
          )}
          <button onClick={onBack} className="px-3 py-1.5 border border-bdr2 rounded-[8px] text-[11px] text-ink2 hover:border-gold hover:text-gold transition-colors">← Ir al árbol</button>
          <button onClick={onLogout} className="px-3 py-1.5 border border-bdr2 rounded-[8px] text-[10px] text-ink3 hover:text-red2 hover:border-red2 transition-colors">Cerrar sesión</button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-bdr mb-5">
          {[['requests','📋 Solicitudes'],['config','⚙️ Configurar campos']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-4 py-2.5 text-[12px] border-b-2 transition-all ${tab===t ? 'text-gold3 border-gold font-medium' : 'text-ink3 border-transparent hover:text-ink'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'requests' && (
          <div className="max-w-[760px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[18px] text-ink font-normal">Solicitudes de acceso</h2>
              <div className="flex gap-1.5">
                {(['todos','pending','approved','rejected'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-[8px] text-[10px] border transition-colors ${filter===f ? 'bg-gold text-[#0a0800] border-transparent' : 'border-bdr2 text-ink2 hover:border-gold hover:text-gold'}`}>
                    {f==='todos'?'Todos':f==='pending'?'Pendientes':f==='approved'?'Aprobados':'Rechazados'}
                  </button>
                ))}
              </div>
            </div>

            {list.length === 0 && <div className="text-center py-10 text-ink3">No hay solicitudes</div>}
            {list.map(u => (
              <div key={u.id} className="bg-card border border-bdr rounded-[8px] px-4 py-3.5 flex items-center gap-3.5 mb-2 hover:border-bdr2 transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-serif shrink-0" style={{ background: ac(0)[1], color: ac(0)[0] }}>
                  {(u.name[0]??'')+(u.last[0]??'')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{u.name} {u.last}</div>
                  <div className="text-[11px] text-ink3 mt-0.5">{u.email}{u.fatherName ? ' · Padre: '+u.fatherName : ''}{u.motherName ? ' · Madre: '+u.motherName : ''}</div>
                  <div className="text-[10px] text-ink4 mt-0.5">Solicitado: {u.createdAt}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap ${u.status==='pending' ? 'bg-gold/12 text-gold3 border-gold/22' : u.status==='approved' ? 'bg-grn/12 text-grn3 border-grn/22' : 'bg-red/12 text-red2 border-red/22'}`}>
                  {u.status==='pending'?'⏳ Pendiente':u.status==='approved'?'✓ Aprobado':'✗ Rechazado'}
                </span>
                {u.status === 'pending' && (
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setApproveId(u.id)} className="px-3 py-1 rounded-[8px] bg-gold text-[#0a0800] text-[11px] font-medium hover:bg-gold2 transition-colors">✓ Aprobar</button>
                    <button onClick={() => setUsers(prev => prev.map(x => x.id===u.id ? {...x,status:'rejected'} : x))}
                      className="px-3 py-1 rounded-[8px] text-[11px] font-medium border bg-red/12 text-red2 border-red/25 hover:bg-red/20 transition-colors">✗ Rechazar</button>
                  </div>
                )}
                {u.status === 'approved' && u.pass && (
                  <div className="font-mono text-[11px] text-gold3 bg-bg2 px-2.5 py-1 rounded-[8px] border border-bdr2">🔑 {u.pass}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'config' && (
          <div className="max-w-[560px]">
            <h2 className="font-serif text-[18px] text-ink mb-1 font-normal">Campos del formulario</h2>
            <p className="text-[12px] text-ink3 mb-4">Activa o desactiva los campos del formulario de registro.</p>
            {[
              { label: 'Nombres', required: true, fixed: true, enabled: true },
              { label: 'Apellidos', required: true, fixed: true, enabled: true },
              { label: 'Correo electrónico', required: true, fixed: true, enabled: true },
              { label: 'Nombre del padre', required: false, fixed: false, enabled: true },
              { label: 'Nombre de la madre', required: false, fixed: false, enabled: true },
              { label: 'Fecha de nacimiento', required: false, fixed: false, enabled: true },
              { label: 'Ciudad', required: false, fixed: false, enabled: false },
              { label: 'Teléfono', required: false, fixed: false, enabled: false },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2.5 px-3 py-2.5 bg-bg2 rounded-[8px] mb-1.5 border border-bdr">
                <span className="text-ink3 text-[16px] cursor-grab">⠿</span>
                <div className="flex-1">
                  <div className="text-[12px] font-medium text-ink">{f.label}</div>
                  <div className="text-[10px] text-ink3">{f.required ? 'Requerido' : 'Opcional'}{f.fixed ? ' · No se puede desactivar' : ''}</div>
                </div>
                <div className="relative w-[34px] h-[18px] shrink-0">
                  <input type="checkbox" defaultChecked={f.enabled} disabled={f.fixed} className="peer opacity-0 w-0 h-0 absolute" />
                  <span className="absolute inset-0 rounded-full bg-bdr2 peer-checked:bg-gold transition-colors cursor-pointer" />
                  <span className="absolute w-3 h-3 bg-white rounded-full top-[3px] left-[3px] peer-checked:translate-x-4 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve modal */}
      {approveId && (
        <div className="fixed inset-0 bg-black/72 z-[500] flex items-center justify-center p-5 backdrop-blur-[4px]" onClick={e => { if(e.target===e.currentTarget) setApproveId(null) }}>
          <div className="bg-card2 border border-bdr2 rounded-[14px] w-full max-w-[400px] shadow-[0_32px_80px_rgba(0,0,0,.8)]">
            <div className="flex items-center justify-between px-5 pt-5">
              <h2 className="font-serif text-[20px] text-ink font-normal">✓ Aprobar solicitud</h2>
              <button onClick={() => setApproveId(null)} className="w-7 h-7 rounded-[8px] border border-bdr flex items-center justify-center text-ink3 hover:border-red-400 hover:text-red-400 transition-colors">✕</button>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-col gap-1 mb-3">
                <label className="text-[10px] font-medium text-ink3">Asignar contraseña <span className="text-red2">*</span></label>
                <input value={approvePass} onChange={e => setApprovePass(e.target.value)}
                  className="bg-bg2 border border-bdr2 rounded-[8px] px-2.5 py-2 text-[12px] text-ink outline-none focus:border-gold2" />
              </div>
              <div className="text-[10px] text-ink3">El usuario podrá cambiarla después de su primer ingreso.</div>
            </div>
            <div className="px-5 py-3 border-t border-bdr flex justify-end gap-2">
              <button onClick={() => setApproveId(null)} className="px-4 py-1.5 rounded-[8px] border border-bdr2 text-[12px] text-ink2 hover:border-gold hover:text-gold transition-colors">Cancelar</button>
              <button onClick={confirmApprove} className="px-4 py-1.5 rounded-[8px] bg-gold text-[#0a0800] text-[12px] font-medium hover:bg-gold2 transition-colors">✓ Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

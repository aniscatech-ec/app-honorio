'use client'
import { useState } from 'react'
import FamilyTree from '@/components/tree/FamilyTree'
import { useAppStore } from '@/store/app'
import clsx from 'clsx'

const VIEWS = [
  ['general', '🌳 General'],
  ['lineage',  '📜 Linaje'],
  ['fan',      '🌸 Abanico'],
  ['list',     '📋 Lista'],
] as const

export default function TreePage() {
  const { treeView, setTreeView, persons, rootId, setRootId } = useAppStore()
  const [addModal, setAddModal] = useState<{ refId: string; rel: string } | null>(null)

  const rootPerson = persons.find(p => p.id === (rootId ?? persons.find(x => x.is_root)?.id))

  return (
    <div className="flex flex-col h-full animate-fu">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 shrink-0">
        <div>
          <h1 className="font-serif text-[25px] text-ink font-normal leading-tight">Árbol Genealógico</h1>
          <p className="text-[11px] text-ink3 mt-1">
            Raíz: {rootPerson ? `${rootPerson.name} ${rootPerson.last}` : '—'}
          </p>
        </div>
        <button
          onClick={() => {/* open link modal */}}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-bdr2 text-[12px] text-ink2 hover:border-gold hover:text-gold transition-colors mt-1"
        >
          🔗 Vincular
        </button>
      </div>

      {/* View selector + root selector */}
      <div className="flex items-center gap-2 px-6 py-2.5 flex-wrap">
        {VIEWS.map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTreeView(v as any)}
            className={clsx(
              'px-3 py-1.5 rounded-[8px] text-[12px] font-medium border transition-colors',
              treeView === v
                ? 'bg-gold text-[#0a0800] border-transparent'
                : 'border-bdr2 text-ink2 bg-transparent hover:border-gold hover:text-gold'
            )}
          >
            {label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-ink3">Raíz:</span>
          <select
            className="bg-bg2 border border-bdr2 rounded-[8px] px-2 py-1 text-[11px] text-ink outline-none focus:border-gold"
            value={rootId ?? ''}
            onChange={e => setRootId(e.target.value)}
          >
            {persons.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.last}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tree canvas — takes remaining height */}
      <div className="flex-1 px-6 pb-4 min-h-0">
        {treeView === 'general' && (
          <FamilyTree
            onAddRelative={(refId, rel) => setAddModal({ refId, rel })}
            onSelectPerson={() => {}}
          />
        )}
        {treeView === 'list' && <TreeListView />}
        {treeView === 'lineage' && <TreeLineageView />}
        {treeView === 'fan' && (
          <div className="h-full flex items-center justify-center text-ink3 text-sm">
            Vista de abanico — próximamente
          </div>
        )}
      </div>
    </div>
  )
}

function TreeListView() {
  const { persons, links } = useAppStore()
  const relOf = (pid: string) => {
    const l = links.find(x => x.from_id === pid || x.to_id === pid)
    return l?.type ?? '—'
  }
  return (
    <div className="bg-card border border-bdr rounded-[12px] overflow-auto h-full">
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr className="border-b border-bdr2">
            {['Nombre', 'Cédula', 'Nacimiento', 'Ubicación', 'Parentesco', 'Género'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold text-ink3 uppercase tracking-[1.2px] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {persons.map(p => (
            <tr key={p.id} className="border-b border-bdr hover:bg-bg2 cursor-pointer transition-colors">
              <td className="px-3 py-2.5 font-medium">{p.name} {p.last}</td>
              <td className="px-3 py-2.5 text-ink3 font-mono text-[11px]">{p.cedula ?? '—'}</td>
              <td className="px-3 py-2.5 text-ink3">{p.born ? new Date(p.born).getFullYear() : '—'}</td>
              <td className="px-3 py-2.5 text-ink3">{p.city}, {p.country}</td>
              <td className="px-3 py-2.5">
                <span className={clsx(
                  'inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border',
                  p.is_root ? 'bg-gold/12 text-gold3 border-gold/20' : 'bg-bg2 text-ink3 border-bdr'
                )}>
                  {p.is_root ? '★ Raíz' : relOf(p.id)}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <span className={clsx(
                  'inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border',
                  p.gender === 'M' ? 'bg-blu/10 text-blu2 border-blu/20' : 'bg-pur/10 text-pur2 border-pur/20'
                )}>
                  {p.gender === 'M' ? 'Masculino' : 'Femenino'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TreeLineageView() {
  const { persons, links, rootId, openSidepanel } = useAppStore()
  const root = persons.find(p => p.id === (rootId ?? persons.find(x => x.is_root)?.id))
  if (!root) return null

  const CHILD_T = new Set(['hijo','hija','hijastro','hijastra','adoptado','adoptada'])
  const PARTNER_T = new Set(['pareja','conyuge','divorciado','viudo'])

  const ancestors = links.filter(l => CHILD_T.has(l.type) && l.to_id === root.id)
    .map(l => persons.find(p => p.id === l.from_id)).filter(Boolean) as typeof persons
  const descendants = links.filter(l => CHILD_T.has(l.type) && l.from_id === root.id)
    .map(l => persons.find(p => p.id === l.to_id)).filter(Boolean) as typeof persons
  const partners = links.filter(l => PARTNER_T.has(l.type) && (l.from_id === root.id || l.to_id === root.id))
    .map(l => persons.find(p => p.id === (l.from_id === root.id ? l.to_id : l.from_id))).filter(Boolean) as typeof persons

  const Card = ({ p, badge, col }: { p: typeof persons[0]; badge: string; col: string }) => (
    <button
      onClick={() => openSidepanel(p.id)}
      className="w-full flex items-center gap-2.5 p-2.5 rounded-[8px] border mb-1.5 text-left transition-all hover:shadow-sm"
      style={{ borderColor: col + '33', background: col + '08' }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif shrink-0" style={{ background: col + '20', color: col }}>
        {root.name[0]}{root.last[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-ink">{p.name} {p.last}</div>
        <div className="text-[10px] text-ink3">{p.born?.slice(0, 4) ?? '?'} · {p.city}</div>
      </div>
      <span className="text-[9px] px-2 py-0.5 rounded-full border font-medium" style={{ background: col + '15', color: col, borderColor: col + '33' }}>{badge}</span>
    </button>
  )

  return (
    <div className="max-w-xl mx-auto space-y-3 py-4">
      {ancestors.length > 0 && (
        <div className="bg-card border-l-[3px] border-blu2 rounded-[12px] p-4" style={{ borderLeftColor: '#2a5aac' }}>
          <div className="text-[9px] font-semibold text-blu2 uppercase tracking-[1.6px] mb-3">⬆ Ascendencia ({ancestors.length})</div>
          {ancestors.map(p => <Card key={p.id} p={p} badge="Ancestro" col="#2a5aac" />)}
        </div>
      )}
      <div className="bg-card border-2 border-gold rounded-[12px] p-4">
        <div className="text-[9px] font-semibold text-gold3 uppercase tracking-[1.6px] mb-3">★ Raíz familiar</div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/15 text-gold3 font-serif text-2xl flex items-center justify-center shrink-0">
            {root.name[0]}{root.last[0]}
          </div>
          <div>
            <div className="font-serif text-[19px] text-ink">{root.name} {root.last}</div>
            <div className="text-[11px] text-ink3 mt-1">n. {root.born ? new Date(root.born).toLocaleDateString('es-EC') : '—'}</div>
          </div>
        </div>
      </div>
      {partners.length > 0 && (
        <div className="bg-card border-l-[3px] rounded-[12px] p-4" style={{ borderLeftColor: '#7a3aac' }}>
          <div className="text-[9px] font-semibold uppercase tracking-[1.6px] mb-3" style={{ color: '#7a3aac' }}>♥ Pareja(s)</div>
          {partners.map(p => <Card key={p.id} p={p} badge="Pareja" col="#7a3aac" />)}
        </div>
      )}
      {descendants.length > 0 && (
        <div className="bg-card border-l-[3px] rounded-[12px] p-4" style={{ borderLeftColor: '#2a7a40' }}>
          <div className="text-[9px] font-semibold text-grn3 uppercase tracking-[1.6px] mb-3">⬇ Descendencia ({descendants.length})</div>
          {descendants.map(p => <Card key={p.id} p={p} badge={p.gender === 'F' ? 'Hija' : 'Hijo'} col="#2a7a40" />)}
        </div>
      )}
    </div>
  )
}

import clsx from 'clsx'

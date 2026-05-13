'use client'
import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import { computeLayout, edgeColor, NODE_W, NODE_H, PARTNER_TYPES, CHILD_TYPES } from '@/lib/tree-layout'
import { useAppStore } from '@/store/app'
import type { TreeNode, TreeEdge, LinkType } from '@/types'
import clsx from 'clsx'

const MIN_SCALE = 0.12
const MAX_SCALE = 2.5

// ── Avatar colors ──────────────────────────────────────
const AVC = [
  ['#bf8c20', 'rgba(191,140,32,.18)'],
  ['#2a7a40', 'rgba(42,122,64,.18)'],
  ['#2a5aac', 'rgba(42,90,172,.18)'],
  ['#7a3aac', 'rgba(122,58,172,.18)'],
  ['#ac3030', 'rgba(172,48,48,.18)'],
  ['#1a8a8a', 'rgba(26,138,138,.18)'],
]
const ac = (idx: number) => AVC[Math.abs(idx) % AVC.length]
const ini = (name: string, last: string) =>
  ((name || '')[0] || '') + ((last || '')[0] || '')

interface NodeCardProps {
  node: TreeNode
  isRoot: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  onAddRelative: (id: string, rel: string) => void
}

function NodeCard({ node, isRoot, isSelected, onSelect, onAddRelative }: NodeCardProps) {
  const { person: p } = node
  const idx = p.id.charCodeAt(1) % AVC.length
  const [fg, bg] = ac(idx)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={clsx(
        'absolute select-none cursor-pointer transition-all duration-150',
        'rounded-[8px] border bg-card2 text-center group',
        isRoot && 'border-gold ring-2 ring-gold/30',
        isSelected && !isRoot && 'border-gold/80 shadow-lg shadow-gold/20',
        !isRoot && !isSelected && 'border-bdr2 hover:border-gold/60',
      )}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: node.height,
        zIndex: isSelected ? 40 : hovered ? 20 : 2,
      }}
      onClick={() => onSelect(p.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Edge add buttons — visible on hover */}
      {hovered && (
        <>
          <EdgeBtn pos="top"    pid={p.id} rel="padre"   label="Padre/Madre" onAdd={onAddRelative} />
          <EdgeBtn pos="bottom" pid={p.id} rel="hijo"    label="Hijo/a"      onAdd={onAddRelative} />
          <EdgeBtn pos="left"   pid={p.id} rel="pareja"  label="Pareja"      onAdd={onAddRelative} />
          <EdgeBtn pos="right"  pid={p.id} rel="hermano" label="Hermano/a"   onAdd={onAddRelative} />
        </>
      )}

      {/* Avatar */}
      <div className="flex justify-center pt-2 pb-1">
        {p.photo_url ? (
          <img
            src={p.photo_url}
            alt={p.name}
            className="w-9 h-9 rounded-full object-cover border border-bdr2"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium font-serif"
            style={{ background: bg, color: fg }}
          >
            {ini(p.name, p.last)}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="px-2 pb-1">
        <div className="text-[11px] font-medium text-ink leading-tight truncate">
          {p.name.split(' ')[0]}
        </div>
        <div className="text-[10px] text-ink3 truncate">
          {p.last.split(' ').slice(0, 2).join(' ')}
        </div>
        <div className="text-[10px] text-ink3 mt-0.5">
          {p.born?.slice(0, 4) ?? '?'}
          {p.died ? ` – ${p.died.slice(0, 4)}` : ''}
        </div>
      </div>

      {/* Role badge */}
      {isRoot && (
        <div className="text-[9px] px-2 pb-1 text-gold font-semibold">★ Raíz</div>
      )}
      {p.died && (
        <div className="text-[9px] text-red2 pb-1">† {p.died.slice(0, 4)}</div>
      )}

      {/* View profile overlay */}
      {(hovered || isSelected) && (
        <div className="absolute inset-0 flex items-end justify-center pb-1.5 pointer-events-none">
          <span className="text-[9px] bg-gold/15 text-gold3 border border-gold/30 rounded-full px-2 py-0.5 font-semibold pointer-events-auto cursor-pointer hover:bg-gold hover:text-black transition-colors">
            Ver perfil
          </span>
        </div>
      )}
    </div>
  )
}

// ── Edge add button ────────────────────────────────────
const EDGE_COLORS: Record<string, string> = {
  top: '#2a5aac', bottom: '#2a7a40', left: '#7a3aac', right: '#8a6a14',
}
const EDGE_POS: Record<string, React.CSSProperties> = {
  top:    { top: -11, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: -11, left: '50%', transform: 'translateX(-50%)' },
  left:   { left: -11, top: '50%', transform: 'translateY(-50%)' },
  right:  { right: -11, top: '50%', transform: 'translateY(-50%)' },
}

function EdgeBtn({ pos, pid, rel, label, onAdd }: {
  pos: string; pid: string; rel: string; label: string
  onAdd: (pid: string, rel: string) => void
}) {
  const color = EDGE_COLORS[pos]
  return (
    <button
      className="absolute w-[22px] h-[22px] rounded-full flex items-center justify-center text-[13px] font-bold z-50 shadow-md transition-all hover:scale-110"
      style={{ ...EDGE_POS[pos], background: 'var(--card, #fff)', border: `1.5px solid ${color}`, color }}
      onClick={(e) => { e.stopPropagation(); onAdd(pid, rel) }}
      title={label}
    >
      +
    </button>
  )
}

// ── SVG edges ──────────────────────────────────────────
function TreeEdges({ edges, nodes }: { edges: TreeEdge[]; nodes: TreeNode[] }) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (
    <svg
      className="absolute top-0 left-0 overflow-visible pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        {['#7a3aac', '#2a7a40', '#2a5aac', '#9a6e10'].map(c => (
          <marker
            key={c}
            id={`arr-${c.slice(1)}`}
            viewBox="0 0 10 10"
            refX="8" refY="5"
            markerWidth="6" markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M2 1L8 5L2 9" fill="none" stroke={c} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        ))}
      </defs>
      {edges.map(edge => {
        const from = nodeMap.get(edge.from)
        const to = nodeMap.get(edge.to)
        if (!from || !to || edge.points.length < 2) return null

        const color = edgeColor(edge.type)
        const isPartner = PARTNER_TYPES.has(edge.type)
        const isChild = CHILD_TYPES.has(edge.type)

        const pts = edge.points
        const d = pts.reduce((acc, [x, y], i) =>
          acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`), '')

        return (
          <path
            key={edge.id}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={isPartner ? 2.5 : 2}
            strokeDasharray={isPartner ? '6 3' : undefined}
            opacity={0.82}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd={isChild ? `url(#arr-${color.slice(1)})` : undefined}
          />
        )
      })}
    </svg>
  )
}

// ── Main FamilyTree component ──────────────────────────
export default function FamilyTree({
  onAddRelative,
  onSelectPerson,
}: {
  onAddRelative: (refId: string, rel: string) => void
  onSelectPerson: (id: string) => void
}) {
  const { persons, links, rootId, selectedId, openSidepanel } = useAppStore()

  // Recompute layout whenever data changes
  const layout = useMemo(() => {
    if (!persons.length) return null
    const rid = rootId ?? persons.find(p => p.is_root)?.id ?? persons[0].id
    return computeLayout(persons, links, rid)
  }, [persons, links, rootId])

  // ── Zoom / pan ─────────────────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null)
  const vpRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const drag = useRef({ active: false, lastX: 0, lastY: 0 })

  const applyTransform = useCallback((t: typeof transform) => {
    if (!vpRef.current) return
    vpRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`
  }, [])

  useEffect(() => { applyTransform(transform) }, [transform, applyTransform])

  // Fit all on layout change
  useEffect(() => {
    if (!layout || !canvasRef.current) return
    const cw = canvasRef.current.clientWidth
    const ch = canvasRef.current.clientHeight
    const sx = (cw - 80) / layout.width
    const sy = (ch - 80) / layout.height
    const scale = Math.min(sx, sy, 1)
    const x = (cw - layout.width * scale) / 2
    const y = (ch - layout.height * scale) / 2
    setTransform({ x, y, scale })
  }, [layout])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    setTransform(t => {
      const factor = e.deltaY < 0 ? 1.12 : 0.88
      const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor))
      return { x: mx - (mx - t.x) * (ns / t.scale), y: my - (my - t.y) * (ns / t.scale), scale: ns }
    })
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    drag.current = { active: true, lastX: e.clientX, lastY: e.clientY }
    canvasRef.current?.classList.add('cursor-grabbing')
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current.active) return
    setTransform(t => ({
      ...t,
      x: t.x + e.clientX - drag.current.lastX,
      y: t.y + e.clientY - drag.current.lastY,
    }))
    drag.current.lastX = e.clientX
    drag.current.lastY = e.clientY
  }, [])

  const onMouseUp = useCallback(() => {
    drag.current.active = false
    canvasRef.current?.classList.remove('cursor-grabbing')
  }, [])

  const zoomAround = (factor: number) => {
    if (!canvasRef.current) return
    const cw = canvasRef.current.clientWidth / 2
    const ch = canvasRef.current.clientHeight / 2
    setTransform(t => {
      const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor))
      return { x: cw - (cw - t.x) * (ns / t.scale), y: ch - (ch - t.y) * (ns / t.scale), scale: ns }
    })
  }

  const fitAll = () => {
    if (!layout || !canvasRef.current) return
    const cw = canvasRef.current.clientWidth
    const ch = canvasRef.current.clientHeight
    const scale = Math.min((cw - 80) / layout.width, (ch - 80) / layout.height, 1)
    setTransform({ x: (cw - layout.width * scale) / 2, y: (ch - layout.height * scale) / 2, scale })
  }

  const handleSelect = useCallback((id: string) => {
    openSidepanel(id)
    onSelectPerson(id)
  }, [openSidepanel, onSelectPerson])

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full text-ink3 text-sm">
        No hay personas en el árbol aún.
      </div>
    )
  }

  const rootId2 = rootId ?? persons.find(p => p.is_root)?.id ?? persons[0]?.id

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-bg1 rounded-rl border border-bdr cursor-grab select-none"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Viewport */}
      <div
        ref={vpRef}
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{ width: layout.width, height: layout.height }}
      >
        <TreeEdges edges={layout.edges} nodes={layout.nodes} />
        {layout.nodes.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            isRoot={node.id === rootId2}
            isSelected={node.id === selectedId}
            onSelect={handleSelect}
            onAddRelative={onAddRelative}
          />
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1">
        {[
          { label: '⛶', action: () => canvasRef.current?.requestFullscreen?.(), title: 'Pantalla completa' },
          { label: '+', action: () => zoomAround(1.2), title: 'Acercar' },
          { label: '−', action: () => zoomAround(1 / 1.2), title: 'Alejar' },
          { label: '⊡', action: fitAll, title: 'Ajustar todo' },
        ].map(({ label, action, title }) => (
          <button
            key={label}
            onClick={action}
            title={title}
            className="w-7 h-7 rounded-[6px] border border-bdr2 bg-bg1 text-ink2 text-sm hover:border-gold hover:text-gold transition-colors shadow-sm flex items-center justify-center"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Zoom label */}
      <div className="absolute bottom-2.5 right-3 z-30 text-[10px] text-ink3 bg-bg1 border border-bdr rounded-[5px] px-2 py-0.5">
        {Math.round(transform.scale * 100)}%
      </div>

      {/* Legend */}
      <div className="absolute bottom-2.5 left-3 z-30 flex gap-3 bg-bg/90 border border-bdr2 rounded-[7px] px-3 py-1.5 pointer-events-none">
        {[['#7a3aac', '◆ Pareja'], ['#2a7a40', '↓ Descendiente'], ['#2a5aac', '↑ Ancestro']].map(([c, l]) => (
          <div key={c} className="flex items-center gap-1.5 text-[10px] text-ink2">
            <div className="w-3 h-0.5 rounded" style={{ background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

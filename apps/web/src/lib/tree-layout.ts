import dagre from 'dagre'
import type { Person, Link, TreeLayout, TreeNode, TreeEdge, LinkType } from '@/types'

export const NODE_W = 160
export const NODE_H = 90
export const RANK_SEP = 110
export const NODE_SEP = 44

const PARTNER_TYPES = new Set<LinkType>([
  'pareja', 'conyuge', 'divorciado', 'viudo',
])
const CHILD_TYPES = new Set<LinkType>([
  'hijo', 'hija', 'hijastro', 'hijastra', 'adoptado', 'adoptada',
  'nieto', 'nieta', 'bisnieto', 'bisnieta',
  'tataranieto', 'tataranieta', 'chozno', 'chozna',
])
const PARENT_TYPES = new Set<LinkType>([
  'padre', 'madre', 'padrastro', 'madrastra',
  'abuelo', 'abuela', 'bisabuelo', 'bisabuela',
  'tatarabuelo', 'tatarabuela',
])

/**
 * BFS to assign generation levels: 0 = root, negative = ancestors, positive = descendants.
 * Partners share the same level.
 */
function assignGenerations(
  rootId: string,
  persons: Person[],
  links: Link[],
): Map<string, number> {
  const gen = new Map<string, number>([[rootId, 0]])
  const queue: { id: string; g: number }[] = [{ id: rootId, g: 0 }]
  const visited = new Set([rootId])

  const childrenOf = new Map<string, string[]>()
  const parentsOf = new Map<string, string[]>()
  const partnersOf = new Map<string, string[]>()

  for (const l of links) {
    const addTo = (m: Map<string, string[]>, k: string, v: string) => {
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(v)
    }
    if (CHILD_TYPES.has(l.type)) {
      addTo(childrenOf, l.from_id, l.to_id)
      addTo(parentsOf, l.to_id, l.from_id)
    } else if (PARENT_TYPES.has(l.type)) {
      addTo(childrenOf, l.from_id, l.to_id)
      addTo(parentsOf, l.to_id, l.from_id)
    } else if (PARTNER_TYPES.has(l.type)) {
      addTo(partnersOf, l.from_id, l.to_id)
      addTo(partnersOf, l.to_id, l.from_id)
    }
  }

  while (queue.length) {
    const { id, g } = queue.shift()!
    for (const pid of partnersOf.get(id) ?? []) {
      if (!visited.has(pid)) { visited.add(pid); gen.set(pid, g); queue.push({ id: pid, g }) }
    }
    for (const cid of childrenOf.get(id) ?? []) {
      if (!visited.has(cid)) { visited.add(cid); gen.set(cid, g + 1); queue.push({ id: cid, g: g + 1 }) }
    }
    for (const parid of parentsOf.get(id) ?? []) {
      if (!visited.has(parid)) { visited.add(parid); gen.set(parid, g - 1); queue.push({ id: parid, g: g - 1 }) }
    }
  }

  for (const p of persons) { if (!gen.has(p.id)) gen.set(p.id, 0) }
  return gen
}

/**
 * Build a dagre graph from persons + links, run layout, return TreeLayout.
 * dagre places nodes in a layered directed graph — each generation = one rank.
 */
export function computeLayout(
  persons: Person[],
  links: Link[],
  rootId: string,
): TreeLayout {
  if (!persons.length) return { nodes: [], edges: [], width: 0, height: 0 }

  const gen = assignGenerations(rootId, persons, links)
  const personMap = new Map(persons.map(p => [p.id, p]))

  // Build dagre graph
  const g = new dagre.graphlib.Graph({ multigraph: false })
  g.setGraph({
    rankdir: 'TB',
    ranksep: RANK_SEP,
    nodesep: NODE_SEP,
    edgesep: 10,
    marginx: 40,
    marginy: 40,
  })
  g.setDefaultEdgeLabel(() => ({}))

  for (const p of persons) {
    g.setNode(p.id, { width: NODE_W, height: NODE_H, label: p.id })
  }

  const edgesForLayout: Array<{ from: string; to: string; type: LinkType }> = []

  for (const l of links) {
    if (!personMap.has(l.from_id) || !personMap.has(l.to_id)) continue

    if (CHILD_TYPES.has(l.type) || PARENT_TYPES.has(l.type)) {
      // Directed edge: parent → child (visual hierarchy drives layout)
      const parentId = CHILD_TYPES.has(l.type) ? l.from_id : l.from_id
      const childId = CHILD_TYPES.has(l.type) ? l.to_id : l.to_id
      g.setEdge(parentId, childId, { id: l.id, type: l.type })
      edgesForLayout.push({ from: parentId, to: childId, type: l.type })
    } else if (PARTNER_TYPES.has(l.type)) {
      // Partners: use a virtual edge with minlen=0 to keep them adjacent
      g.setEdge(l.from_id, l.to_id, { id: l.id, type: l.type, minlen: 0 })
      edgesForLayout.push({ from: l.from_id, to: l.to_id, type: l.type })
    } else {
      // Sibling / other relationships — include for context
      g.setEdge(l.from_id, l.to_id, { id: l.id, type: l.type, minlen: 0 })
      edgesForLayout.push({ from: l.from_id, to: l.to_id, type: l.type })
    }
  }

  dagre.layout(g)

  // Extract node positions
  const nodes: TreeNode[] = persons.map(p => {
    const n = g.node(p.id)
    return {
      id: p.id,
      person: p,
      x: n ? n.x - NODE_W / 2 : 0,
      y: n ? n.y - NODE_H / 2 : 0,
      width: NODE_W,
      height: NODE_H,
      generation: gen.get(p.id) ?? 0,
    }
  })

  // Extract edges with points
  const edges: TreeEdge[] = []
  for (const e of g.edges()) {
    const dEdge = g.edge(e)
    if (!dEdge) continue
    const points: [number, number][] = (dEdge.points ?? []).map(
      (pt: { x: number; y: number }) => [pt.x, pt.y]
    )
    edges.push({
      id: dEdge.id ?? `${e.v}-${e.w}`,
      from: e.v,
      to: e.w,
      type: (dEdge.type ?? 'hijo') as LinkType,
      points,
    })
  }

  const graph = g.graph()
  return {
    nodes,
    edges,
    width: (graph.width ?? 800) + 80,
    height: (graph.height ?? 600) + 80,
  }
}

/** Edge color by relationship category */
export function edgeColor(type: LinkType): string {
  if (PARTNER_TYPES.has(type)) return '#7a3aac'
  if (CHILD_TYPES.has(type)) return '#2a7a40'
  if (PARENT_TYPES.has(type)) return '#2a5aac'
  return '#9a6e10'
}

export { PARTNER_TYPES, CHILD_TYPES, PARENT_TYPES }

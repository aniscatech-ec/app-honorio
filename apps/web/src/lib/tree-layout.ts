import type { Person, Link, TreeLayout, TreeNode, TreeEdge, LinkType } from '@/types'

export const NODE_W = 160
export const NODE_H = 90
export const RANK_SEP = 120
export const NODE_SEP = 48
const PARTNER_GAP = 24
const MARGIN_X = 80
const MARGIN_Y = 60

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

function addTo(map: Map<string, string[]>, key: string, value: string) {
  if (!map.has(key)) map.set(key, [])
  if (!map.get(key)!.includes(value)) map.get(key)!.push(value)
}

function linkToParentChild(link: Link): { parentId: string; childId: string; type: LinkType } | null {
  if (CHILD_TYPES.has(link.type)) {
    return { parentId: link.from_id, childId: link.to_id, type: link.type }
  }

  // En estos tipos asumimos que from_id es el familiar mayor y to_id la persona relacionada.
  if (PARENT_TYPES.has(link.type)) {
    return { parentId: link.from_id, childId: link.to_id, type: link.type }
  }

  return null
}

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
    const pc = linkToParentChild(l)
    if (pc) {
      addTo(childrenOf, pc.parentId, pc.childId)
      addTo(parentsOf, pc.childId, pc.parentId)
    } else if (PARTNER_TYPES.has(l.type)) {
      addTo(partnersOf, l.from_id, l.to_id)
      addTo(partnersOf, l.to_id, l.from_id)
    }
  }

  while (queue.length) {
    const { id, g } = queue.shift()!

    for (const partnerId of partnersOf.get(id) ?? []) {
      if (!visited.has(partnerId)) {
        visited.add(partnerId)
        gen.set(partnerId, g)
        queue.push({ id: partnerId, g })
      }
    }

    for (const childId of childrenOf.get(id) ?? []) {
      if (!visited.has(childId)) {
        visited.add(childId)
        gen.set(childId, g + 1)
        queue.push({ id: childId, g: g + 1 })
      }
    }

    for (const parentId of parentsOf.get(id) ?? []) {
      if (!visited.has(parentId)) {
        visited.add(parentId)
        gen.set(parentId, g - 1)
        queue.push({ id: parentId, g: g - 1 })
      }
    }
  }

  for (const p of persons) {
    if (!gen.has(p.id)) gen.set(p.id, 0)
  }

  return gen
}

function buildPartnerComponents(ids: string[], links: Link[]): string[][] {
  const idSet = new Set(ids)
  const adjacency = new Map<string, string[]>()

  for (const id of ids) adjacency.set(id, [])

  for (const link of links) {
    if (!PARTNER_TYPES.has(link.type)) continue
    if (!idSet.has(link.from_id) || !idSet.has(link.to_id)) continue
    addTo(adjacency, link.from_id, link.to_id)
    addTo(adjacency, link.to_id, link.from_id)
  }

  const seen = new Set<string>()
  const components: string[][] = []

  for (const id of ids) {
    if (seen.has(id)) continue
    const queue = [id]
    const component: string[] = []
    seen.add(id)

    while (queue.length) {
      const current = queue.shift()!
      component.push(current)
      for (const next of adjacency.get(current) ?? []) {
        if (!seen.has(next)) {
          seen.add(next)
          queue.push(next)
        }
      }
    }

    components.push(component)
  }

  return components
}

function componentWidth(component: string[]) {
  return component.length * NODE_W + Math.max(0, component.length - 1) * PARTNER_GAP
}

function centerOfNodes(ids: string[], pos: Map<string, { x: number; y: number }>) {
  const placed = ids.map(id => pos.get(id)).filter(Boolean) as { x: number; y: number }[]
  if (!placed.length) return 0
  return placed.reduce((sum, p) => sum + p.x + NODE_W / 2, 0) / placed.length
}

function pointsForFamilyEdge(
  parentIds: string[],
  childId: string,
  pos: Map<string, { x: number; y: number }>,
): [number, number][] | null {
  const child = pos.get(childId)
  if (!child) return null

  const placedParents = parentIds
    .map(id => pos.get(id))
    .filter(Boolean) as { x: number; y: number }[]

  if (!placedParents.length) return null

  const parentCenterX = placedParents.reduce((sum, p) => sum + p.x + NODE_W / 2, 0) / placedParents.length
  const parentBottomY = Math.max(...placedParents.map(p => p.y + NODE_H))
  const childCenterX = child.x + NODE_W / 2
  const childTopY = child.y
  const midY = parentBottomY + Math.max(26, (childTopY - parentBottomY) / 2)

  return [
    [parentCenterX, parentBottomY],
    [parentCenterX, midY],
    [childCenterX, midY],
    [childCenterX, childTopY],
  ]
}

/**
 * Layout específico para árbol familiar.
 * Evita el efecto “telaraña” de un grafo genérico: agrupa parejas en la misma fila,
 * separa generaciones y dibuja conexiones ortogonales padre/madre → hijos.
 */
export function computeLayout(
  persons: Person[],
  links: Link[],
  rootId: string,
): TreeLayout {
  if (!persons.length) return { nodes: [], edges: [], width: 0, height: 0 }

  const personMap = new Map(persons.map(p => [p.id, p]))
  const gen = assignGenerations(rootId, persons, links)
  const pos = new Map<string, { x: number; y: number }>()

  const parentLinks = links
    .map(linkToParentChild)
    .filter(Boolean)
    .filter(link => personMap.has(link!.parentId) && personMap.has(link!.childId)) as Array<{ parentId: string; childId: string; type: LinkType }>

  const parentsOf = new Map<string, string[]>()
  for (const link of parentLinks) addTo(parentsOf, link.childId, link.parentId)

  const generations = Array.from(new Set(Array.from(gen.values()))).sort((a, b) => a - b)
  const minGeneration = generations[0] ?? 0

  // Orden estable y familiar: cada generación se ordena por el centro de sus padres si ya fueron ubicados.
  for (const generation of generations) {
    const ids = persons
      .filter(p => gen.get(p.id) === generation)
      .map(p => p.id)

    const components = buildPartnerComponents(ids, links)
      .map(component => ({
        ids: component.sort((a, b) => {
          if (a === rootId) return -1
          if (b === rootId) return 1
          return (personMap.get(a)?.born ?? '').localeCompare(personMap.get(b)?.born ?? '') || a.localeCompare(b)
        }),
        parentCenter: centerOfNodes(
          Array.from(new Set(component.flatMap(id => parentsOf.get(id) ?? []))),
          pos,
        ),
      }))
      .sort((a, b) => {
        const aHasParents = a.parentCenter !== 0
        const bHasParents = b.parentCenter !== 0
        if (aHasParents && bHasParents && a.parentCenter !== b.parentCenter) return a.parentCenter - b.parentCenter
        if (a.ids.includes(rootId)) return -1
        if (b.ids.includes(rootId)) return 1
        return a.ids[0].localeCompare(b.ids[0])
      })

    const totalWidth = components.reduce((sum, component, index) => (
      sum + componentWidth(component.ids) + (index > 0 ? NODE_SEP : 0)
    ), 0)

    let x = MARGIN_X - totalWidth / 2
    const y = MARGIN_Y + (generation - minGeneration) * (NODE_H + RANK_SEP)

    for (const component of components) {
      for (const id of component.ids) {
        pos.set(id, { x, y })
        x += NODE_W + PARTNER_GAP
      }
      x += NODE_SEP - PARTNER_GAP
    }
  }

  // Normaliza para que todo quede dentro del viewport positivo.
  const minX = Math.min(...Array.from(pos.values()).map(p => p.x))
  const minY = Math.min(...Array.from(pos.values()).map(p => p.y))
  for (const p of pos.values()) {
    p.x += MARGIN_X - minX
    p.y += MARGIN_Y - minY
  }

  const nodes: TreeNode[] = persons.map(person => {
    const p = pos.get(person.id) ?? { x: MARGIN_X, y: MARGIN_Y }
    return {
      id: person.id,
      person,
      x: p.x,
      y: p.y,
      width: NODE_W,
      height: NODE_H,
      generation: gen.get(person.id) ?? 0,
    }
  })

  const edges: TreeEdge[] = []

  // Parejas: línea horizontal limpia entre tarjetas.
  for (const link of links) {
    if (!PARTNER_TYPES.has(link.type)) continue
    const from = pos.get(link.from_id)
    const to = pos.get(link.to_id)
    if (!from || !to) continue

    const fromCenterX = from.x + NODE_W / 2
    const toCenterX = to.x + NODE_W / 2
    const y = from.y + NODE_H / 2
    const left = fromCenterX <= toCenterX ? from : to
    const right = fromCenterX <= toCenterX ? to : from

    edges.push({
      id: link.id,
      from: link.from_id,
      to: link.to_id,
      type: link.type,
      points: [
        [left.x + NODE_W, y],
        [right.x, y],
      ],
    })
  }

  // Hijos: una sola conexión por hijo, aunque existan dos links padre/madre → hijo.
  const children = Array.from(new Set(parentLinks.map(link => link.childId)))
  for (const childId of children) {
    const parentIds = parentsOf.get(childId) ?? []
    const firstLink = parentLinks.find(link => link.childId === childId)
    const points = pointsForFamilyEdge(parentIds, childId, pos)
    if (!firstLink || !points) continue

    edges.push({
      id: `family-${parentIds.sort().join('-')}-${childId}`,
      from: parentIds[0],
      to: childId,
      type: firstLink.type,
      points,
    })
  }

  const maxX = Math.max(...nodes.map(n => n.x + n.width))
  const maxY = Math.max(...nodes.map(n => n.y + n.height))

  return {
    nodes,
    edges,
    width: maxX + MARGIN_X,
    height: maxY + MARGIN_Y,
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

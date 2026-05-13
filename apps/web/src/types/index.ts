export type Gender = 'M' | 'F'

export interface Person {
  id: string
  family_id: string
  name: string
  last: string
  gender: Gender
  born: string | null
  died: string | null
  born_place: string | null
  died_place: string | null
  nationality: string | null
  address: string | null
  phone: string | null
  email: string | null
  country: string | null
  city: string | null
  lat: number | null
  lng: number | null
  is_root: boolean
  cedula: string | null
  profession: string | null
  notes: string | null
  photo_url: string | null
  created_at: string
  created_by: string | null
}

export type LinkType =
  | 'pareja' | 'conyuge' | 'divorciado' | 'viudo'
  | 'hijo' | 'hija' | 'hijastro' | 'hijastra' | 'adoptado' | 'adoptada'
  | 'nieto' | 'nieta' | 'bisnieto' | 'bisnieta'
  | 'tataranieto' | 'tataranieta' | 'chozno' | 'chozna'
  | 'padre' | 'madre' | 'padrastro' | 'madrastra'
  | 'abuelo' | 'abuela' | 'bisabuelo' | 'bisabuela'
  | 'tatarabuelo' | 'tatarabuela'
  | 'hermano' | 'hermana' | 'hermanastro' | 'hermanastra'
  | 'medioHermano' | 'medioHermana'
  | 'tio' | 'tia' | 'tioAbuelo' | 'tiaAbuela'
  | 'sobrino' | 'sobrina' | 'sobrinoNieto' | 'sobrinaNieta'
  | 'primo' | 'prima' | 'segundoPrimo' | 'segundaPrima'
  | 'suegro' | 'suegra' | 'yerno' | 'nuera'
  | 'cunado' | 'cunada' | 'tutor' | 'tutora'
  | 'padrino' | 'madrina' | 'ahijado' | 'ahijada'

export interface Link {
  id: string
  family_id: string
  from_id: string
  to_id: string
  type: LinkType
  created_at: string
}

export type EventType =
  | 'nacimiento' | 'bautizo' | 'matrimonio' | 'divorcio'
  | 'fallecimiento' | 'graduación' | 'viaje' | 'otro'

export interface FamilyEvent {
  id: string
  family_id: string
  person_id: string
  type: EventType
  date: string | null
  place: string | null
  description: string | null
  lat: number | null
  lng: number | null
  created_at: string
}

export interface Family {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface Profile {
  id: string
  family_id: string | null
  role: 'admin' | 'member' | 'pending'
  name: string
  last: string
  email: string
  created_at: string
}

// ── Tree layout types ──────────────────────────────────
export interface TreeNode {
  id: string
  person: Person
  x: number
  y: number
  width: number
  height: number
  generation: number // negative = ancestor, 0 = root, positive = descendant
}

export interface TreeEdge {
  id: string
  from: string
  to: string
  type: LinkType
  points: [number, number][]
}

export interface TreeLayout {
  nodes: TreeNode[]
  edges: TreeEdge[]
  width: number
  height: number
}

// ── API payloads ───────────────────────────────────────
export interface CreatePersonPayload {
  name: string
  last: string
  gender: Gender
  born?: string
  died?: string
  born_place?: string
  died_place?: string
  country?: string
  city?: string
  lat?: number
  lng?: number
  cedula?: string
  profession?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export interface CreateLinkPayload {
  from_id: string
  to_id: string
  type: LinkType
}

export interface CreateEventPayload {
  person_id: string
  type: EventType
  date?: string
  place?: string
  description?: string
  lat?: number
  lng?: number
}

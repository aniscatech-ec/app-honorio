import type { Person } from '@/types'

export const AVC = [
  ['#bf8c20', 'rgba(191,140,32,.18)'],
  ['#2a7a40', 'rgba(42,122,64,.18)'],
  ['#2a5aac', 'rgba(42,90,172,.18)'],
  ['#7a3aac', 'rgba(122,58,172,.18)'],
  ['#ac3030', 'rgba(172,48,48,.18)'],
  ['#1a8a8a', 'rgba(26,138,138,.18)'],
  ['#8a7a20', 'rgba(138,122,32,.18)'],
  ['#4a2aac', 'rgba(74,42,172,.18)'],
] as const

export const ac = (i: number): [string, string] =>
  AVC[Math.abs(i || 0) % AVC.length] as [string, string]

export const ini = (name?: string | null, last?: string | null) =>
  ((name ?? '')[0] ?? '') + ((last ?? '')[0] ?? '')

export const fdt = (d?: string | null): string => {
  if (!d) return '—'
  const parts = d.split('-')
  if (parts.length < 3) return d
  const [y, m, dy] = parts
  const ms = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${+dy} ${ms[+m - 1]} ${y}`
}

export const age = (d?: string | null): string => {
  if (!d) return ''
  const a = new Date().getFullYear() - +d.split('-')[0]
  return a > 0 ? `${a} años` : ''
}

export const personColor = (p: Pick<Person, 'id'>): [string, string] => {
  const idx = p.id.charCodeAt(p.id.length - 1) % AVC.length
  return AVC[idx] as [string, string]
}

export const LINK_LABELS: Record<string, string> = {
  pareja: 'Pareja', conyuge: 'Cónyuge', divorciado: 'Divorciado/a', viudo: 'Viudo/a',
  hijo: 'Hijo', hija: 'Hija', hijastro: 'Hijastro', hijastra: 'Hijastra',
  adoptado: 'Adoptado', adoptada: 'Adoptada',
  nieto: 'Nieto', nieta: 'Nieta', bisnieto: 'Bisnieto', bisnieta: 'Bisnieta',
  padre: 'Padre', madre: 'Madre', padrastro: 'Padrastro', madrastra: 'Madrastra',
  abuelo: 'Abuelo', abuela: 'Abuela', bisabuelo: 'Bisabuelo', bisabuela: 'Bisabuela',
  hermano: 'Hermano', hermana: 'Hermana', hermanastro: 'Hermanastro', hermanastra: 'Hermanastra',
  medioHermano: 'Medio hermano', medioHermana: 'Media hermana',
  tio: 'Tío', tia: 'Tía', sobrino: 'Sobrino', sobrina: 'Sobrina',
  primo: 'Primo', prima: 'Prima', segundoPrimo: 'Segundo primo', segundaPrima: 'Segunda prima',
  suegro: 'Suegro', suegra: 'Suegra', yerno: 'Yerno', nuera: 'Nuera',
  cunado: 'Cuñado', cunada: 'Cuñada',
  tutor: 'Tutor', tutora: 'Tutora', padrino: 'Padrino', madrina: 'Madrina',
  ahijado: 'Ahijado', ahijada: 'Ahijada',
}

export const LINK_COLORS: Record<string, string> = {
  pareja: '#7a3aac', conyuge: '#7a3aac', divorciado: '#ac3030', viudo: '#6a5c40',
  hijo: '#2a7a40', hija: '#2a7a40', hijastro: '#2a7a40', hijastra: '#2a7a40',
  adoptado: '#2a7a40', adoptada: '#2a7a40', nieto: '#2a7a40', nieta: '#2a7a40',
  padre: '#2a5aac', madre: '#2a5aac', padrastro: '#2a5aac', madrastra: '#2a5aac',
  abuelo: '#2a5aac', abuela: '#2a5aac', bisabuelo: '#2a5aac', bisabuela: '#2a5aac',
  hermano: '#bf8c20', hermana: '#bf8c20', hermanastro: '#bf8c20', hermanastra: '#bf8c20',
  medioHermano: '#bf8c20', medioHermana: '#bf8c20',
  tio: '#bf8c20', tia: '#bf8c20', sobrino: '#bf8c20', sobrina: '#bf8c20',
  primo: '#bf8c20', prima: '#bf8c20',
  suegro: '#1a8a8a', suegra: '#1a8a8a', yerno: '#1a8a8a', nuera: '#1a8a8a',
  cunado: '#1a8a8a', cunada: '#1a8a8a',
  tutor: '#1a8a8a', tutora: '#1a8a8a', padrino: '#6a5c40', madrina: '#6a5c40',
  ahijado: '#6a5c40', ahijada: '#6a5c40',
}

export const INV_REL: Record<string, string> = {
  hijo: 'Padre/Madre', hija: 'Padre/Madre', hijastro: 'Padrastro/a', hijastra: 'Madrastra/o',
  padre: 'Hijo/a', madre: 'Hijo/a', abuelo: 'Nieto/a', abuela: 'Nieta',
  hermano: 'Hermano/a', hermana: 'Hermano/a',
  tio: 'Sobrino/a', tia: 'Sobrino/a', sobrino: 'Tío/Tía', sobrina: 'Tío/Tía',
  primo: 'Primo/a', prima: 'Primo/a',
  suegro: 'Yerno/Nuera', suegra: 'Yerno/Nuera', yerno: 'Suegro/a', nuera: 'Suegro/a',
  cunado: 'Cuñado/a', cunada: 'Cuñado/a',
  pareja: 'Pareja', conyuge: 'Cónyuge', divorciado: 'Ex pareja', viudo: 'Viudo/a',
}

export const EVENT_TYPES = ['nacimiento','bautizo','matrimonio','divorcio','fallecimiento','graduación','viaje','otro'] as const

export const EP_CLASS: Record<string, string> = {
  nacimiento: 'ep-nac', matrimonio: 'ep-mat', fallecimiento: 'ep-fal',
  bautizo: 'ep-bau', graduación: 'ep-gra', viaje: 'ep-via',
}

export const EP_COLORS: Record<string, { dot: string; bg: string; tc: string; label: string }> = {
  nacimiento:   { dot: '#2a7a40', bg: 'rgba(42,122,64,.12)',   tc: '#1a5a28', label: 'Nacimiento' },
  matrimonio:   { dot: '#bf8c20', bg: 'rgba(191,140,32,.1)',   tc: '#8a6010', label: 'Matrimonio' },
  graduación:   { dot: '#2a5aac', bg: 'rgba(42,90,172,.1)',    tc: '#1a3a7c', label: 'Graduación' },
  fallecimiento:{ dot: '#ac3030', bg: 'rgba(172,48,48,.1)',    tc: '#7c1818', label: 'Fallecimiento' },
  bautizo:      { dot: '#7a3aac', bg: 'rgba(122,58,172,.1)',   tc: '#5a1a8c', label: 'Bautizo' },
  divorcio:     { dot: '#8a6848', bg: 'rgba(138,104,72,.1)',   tc: '#5a3828', label: 'Divorcio' },
  viaje:        { dot: '#1a8a8a', bg: 'rgba(26,138,138,.1)',   tc: '#0a5858', label: 'Viaje' },
  otro:         { dot: '#6a5c40', bg: 'rgba(106,92,64,.1)',    tc: '#3a2c10', label: 'Evento' },
}

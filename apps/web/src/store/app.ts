import { create } from 'zustand'
import type { Person, Link, FamilyEvent, Profile } from '@/types'

interface AppState {
  // Data
  persons: Person[]
  links: Link[]
  events: FamilyEvent[]
  profile: Profile | null
  familyId: string | null

  // UI
  selectedId: string | null
  rootId: string | null
  sidepanelOpen: boolean
  screen: 'dashboard' | 'tree' | 'members' | 'profile' | 'events' | 'map' | 'reports' | 'admin'
  treeView: 'general' | 'lineage' | 'fan' | 'list'

  // Actions
  setPersons: (p: Person[]) => void
  setLinks: (l: Link[]) => void
  setEvents: (e: FamilyEvent[]) => void
  setProfile: (p: Profile | null) => void
  setFamilyId: (id: string | null) => void

  addPerson: (p: Person) => void
  updatePerson: (p: Person) => void
  removePerson: (id: string) => void

  addLink: (l: Link) => void
  updateLink: (l: Link) => void
  removeLink: (id: string) => void

  addEvent: (e: FamilyEvent) => void
  updateEvent: (e: FamilyEvent) => void
  removeEvent: (id: string) => void

  select: (id: string | null) => void
  openSidepanel: (id: string) => void
  closeSidepanel: () => void
  setScreen: (s: AppState['screen']) => void
  setTreeView: (v: AppState['treeView']) => void
  setRootId: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  persons: [],
  links: [],
  events: [],
  profile: null,
  familyId: null,
  selectedId: null,
  rootId: null,
  sidepanelOpen: false,
  screen: 'dashboard',
  treeView: 'general',

  setPersons: (persons) => set({ persons }),
  setLinks: (links) => set({ links }),
  setEvents: (events) => set({ events }),
  setProfile: (profile) => set({ profile }),
  setFamilyId: (familyId) => set({ familyId }),

  addPerson: (p) => set((s) => ({ persons: [...s.persons, p] })),
  updatePerson: (p) => set((s) => ({ persons: s.persons.map(x => x.id === p.id ? p : x) })),
  removePerson: (id) => set((s) => ({
    persons: s.persons.filter(x => x.id !== id),
    links: s.links.filter(l => l.from_id !== id && l.to_id !== id),
    events: s.events.filter(e => e.person_id !== id),
  })),

  addLink: (l) => set((s) => ({ links: [...s.links, l] })),
  updateLink: (l) => set((s) => ({ links: s.links.map(x => x.id === l.id ? l : x) })),
  removeLink: (id) => set((s) => ({ links: s.links.filter(x => x.id !== id) })),

  addEvent: (e) => set((s) => ({ events: [...s.events, e] })),
  updateEvent: (e) => set((s) => ({ events: s.events.map(x => x.id === e.id ? e : x) })),
  removeEvent: (id) => set((s) => ({ events: s.events.filter(x => x.id !== id) })),

  select: (selectedId) => set({ selectedId }),
  openSidepanel: (id) => set({ selectedId: id, sidepanelOpen: true }),
  closeSidepanel: () => set({ sidepanelOpen: false }),
  setScreen: (screen) => set({ screen }),
  setTreeView: (treeView) => set({ treeView }),
  setRootId: (rootId) => set({ rootId }),
}))

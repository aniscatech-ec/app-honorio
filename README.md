# Raíces Familiares

Árbol genealógico familiar · [raicesfamiliares.com](https://raicesfamiliares.com)

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 App Router + React 18 + Vite |
| Estilos | Tailwind CSS (tokens del diseño original) |
| Estado | Zustand |
| Layout árbol | **dagre** — recálculo automático por capas |
| Backend | Next.js API Routes (Vercel Functions) |
| BDD | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Deploy | Vercel → raicesfamiliares.com |
| CI/CD | GitHub Actions |

## Inicio rápido

```bash
# 1. Clonar
git clone https://github.com/TU_ORG/raices.git
cd raices

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example apps/web/.env.local
# Editar con tus credenciales de Supabase

# 4. Base de datos
# Ejecutar packages/db/migrations/001_initial.sql en Supabase SQL Editor

# 5. Desarrollo
npm run dev
# → http://localhost:3000
```

## Estructura del proyecto

```
raices/
├── apps/
│   └── web/                     # Next.js app
│       └── src/
│           ├── app/             # App Router pages + API routes
│           ├── components/
│           │   ├── tree/        # FamilyTree canvas + NodeCard
│           │   ├── layout/      # AppShell + Sidebar + Providers
│           │   ├── ui/          # Botones, modales, formularios
│           │   └── forms/       # AddPersonForm, AddLinkForm
│           ├── lib/
│           │   ├── tree-layout.ts  # dagre auto-layout engine
│           │   └── supabase/
│           ├── store/           # Zustand global state
│           └── types/           # TypeScript types
├── packages/
│   └── db/
│       └── migrations/          # SQL para Supabase
├── .github/workflows/deploy.yml # CI/CD
└── vercel.json
```

## Motor de layout automático

`src/lib/tree-layout.ts` usa **dagre** para calcular posiciones:

1. **BFS** desde la raíz asigna generación a cada persona
   - Ancestros → generaciones negativas
   - Raíz → generación 0
   - Descendientes → generaciones positivas
   - Parejas → misma generación
2. **dagre.layout()** ordena nodos en capas (`rankdir: 'TB'`)
3. Al agregar/eliminar una persona, `useMemo([persons, links, rootId])` recalcula automáticamente
4. La transición CSS 150ms en el canvas suaviza el re-layout

## Deploy

### Vercel + dominio

```bash
npm install -g vercel
vercel login
vercel link           # linkear proyecto
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod         # primer deploy manual
```

Luego conectar dominio en Vercel Dashboard → Settings → Domains → `raicesfamiliares.com`

### Branches

| Branch | Entorno | URL |
|--------|---------|-----|
| `main` | Producción | raicesfamiliares.com |
| `develop` | Staging | raices-develop.vercel.app |
| PR | Preview | raices-pr-N.vercel.app |

### Secrets de GitHub (Settings → Secrets)

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. SQL Editor → pegar `packages/db/migrations/001_initial.sql`
3. Authentication → Email → Enable
4. Storage → buckets `photos` y `documents` se crean en la migración
5. Copiar URL y anon key a `.env.local`

## Agregar personas al árbol

Al agregar una persona nueva:
1. Se inserta en `persons` via API Route
2. Se crea el `link` correspondiente
3. El store de Zustand actualiza `persons` y `links`
4. `useMemo` en `FamilyTree` detecta el cambio y llama `computeLayout()`
5. dagre recalcula todas las posiciones en ~5ms
6. React re-renderiza solo los nodos afectados con transición CSS

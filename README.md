# Mazoteca — TCG Marketplace & Community Platform

Plataforma completa para la comunidad de **Kingdom TCG**: catálogo de cartas, colección digital y física, constructor de mazos, marketplace de singles, sistema de intercambios, foro, torneos, suscripciones premium con MercadoPago y panel de administración.

## 🏗️ Tech Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Lenguaje | TypeScript (strict) |
| Base de datos | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Estilos | Tailwind CSS v4 (dark theme) |
| State (client) | Zustand + React Query v5 |
| Validación | Zod v4 |
| Pagos | MercadoPago (subscripciones via preapprovals) |
| Torneos | Challonge API |
| Monetización | Google AdSense |
| Iconos | Lucide React |

## 📁 Estructura del proyecto

```
src/
├── app/                        # App Router pages
│   ├── admin/                  # Admin panel (layout + sub-pages)
│   ├── api/webhooks/           # MercadoPago webhook
│   ├── catalog/[slug]/         # Card detail
│   ├── collection/             # Digital & physical collection
│   ├── decks/[id]/ & /new     # Deck viewer & builder
│   ├── forum/[id]/ & /new     # Forum threads
│   ├── friends/                # Social / friends list
│   ├── marketplace/[id]/ & /new# Listings
│   ├── notifications/          # Notification center
│   ├── premium/                # Subscription page
│   ├── profile/[username]/     # User profiles
│   ├── settings/               # User settings
│   ├── tournaments/            # Tournaments list
│   ├── trades/                 # Trade proposals
│   ├── layout.tsx, providers.tsx, globals.css
│   ├── loading.tsx, error.tsx, not-found.tsx
│   ├── sitemap.ts, robots.ts
│   └── ...
├── components/
│   ├── ui/                     # Button, Card, Badge, Input, Modal, etc.
│   └── layout/                 # Header, Footer, PageLayout, AdBanner
├── config/
│   ├── site.ts                 # App metadata, game config, tier limits
│   └── design-tokens.ts        # Color palette
├── lib/
│   ├── actions/                # Server Actions (auth, decks, marketplace, forum, trades, profile, social, subscriptions, admin)
│   ├── services/               # MercadoPago + Challonge API wrappers
│   ├── supabase/               # Browser + Server + Middleware clients
│   ├── hooks.ts                # React Query hooks (client-side)
│   ├── queries.ts              # Server-side data access layer
│   ├── stores.ts               # Zustand stores
│   ├── utils.ts                # Utility functions
│   └── validations.ts          # Zod schemas for all forms
├── types/index.ts              # 25+ TypeScript entity interfaces
└── supabase/migrations/        # SQL: schema, RLS, functions, storage
```

## 🚀 Inicio rápido

### 1. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
MERCADOPAGO_ACCESS_TOKEN=your-access-token
MP_PREAPPROVAL_PLAN_ID=your-plan-id
MP_WEBHOOK_SECRET=your-webhook-secret
CHALLONGE_API_KEY=your-api-key
CHALLONGE_USERNAME=your-username
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la base de datos

Ejecutá las migraciones SQL en Supabase (Dashboard → SQL Editor) en orden:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_functions.sql`
4. `supabase/migrations/004_storage.sql`

### 4. Iniciar el servidor

```bash
npm run dev
```

## 🔐 Autenticación

Supabase Auth con email/password. Middleware protege rutas privadas y renueva sesiones.

## 💰 Suscripciones Premium

MercadoPago Preapprovals → webhook `/api/webhooks/mercadopago` → actualiza `subscriptions` + `profiles.is_premium`.

## 🃏 Reglas de mazos

| Tipo | Tamaño | Coronado |
|---|---|---|
| Estrategia | 30 cartas | No |
| Combatientes | 33 + 1 coronado | Sí |

## 🛡️ Seguridad

- RLS en todas las tablas
- Validación server-side con Zod
- Webhook signature verification
- Admin client separado (bypasea RLS)
- Límites por tier

## 📊 Módulos

| # | Módulo | Descripción |
|---|---|---|
| 1 | Catálogo | Explorar cartas con filtros, búsqueda, detalle |
| 2 | Colección Digital | Álbum de cartas digitales obtenidas |
| 3 | Colección Física | Inventario manual de cartas físicas |
| 4 | Constructor de Mazos | Crear/editar mazos con validación |
| 5 | Marketplace | Compra/venta de singles con ofertas |
| 6 | Intercambios | Propuestas P2P de intercambio |
| 7 | Foro | Categorías, hilos, respuestas, likes, soluciones |
| 8 | Torneos | Creación, inscripción, brackets (Challonge) |
| 9 | Social | Amigos, notificaciones, bloqueo |
| 10 | Premium | Suscripción mensual via MercadoPago |
| 11 | Panel Admin | Gestión de usuarios, cartas, reportes, audit log |
| 12 | Monetización | Google AdSense (deshabilitado para premium) |

---

**Mazoteca** — Desarrollado para la comunidad de Kingdom TCG 🃏👑
# mazoteca.com

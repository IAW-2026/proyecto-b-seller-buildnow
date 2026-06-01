<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Build Now (Seller)

## Principios generales

- Código **legible, modular y correcto**. Preferir claridad sobre brevedad.
- Escribir en **TypeScript estricto** — sin `any` salvo casos justificados.
- Mensajes de error, comentarios y UI en **español**.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 |
| Autenticación | Clerk (`@clerk/nextjs`) |
| Base de datos | PostgreSQL vía Prisma ORM |
| Almacenamiento de archivos | Vercel Blob |
| Estilos | Tailwind CSS 4 |
| Notificaciones | react-hot-toast |
| Iconos | lucide-react |
| Deploy | Vercel |

## Arquitectura

El proyecto sigue una **arquitectura en capas** con separación clara:

```
src/
├── core/               # Lógica de dominio (sin dependencias de infraestructura)
│   ├── auth/           # Autenticación y autorización (requireRole, getSellerContext, roles)
│   ├── config/         # Constantes de configuración (paginación, etc.)
│   └── repositories/   # Interfaces de repositorios (I{Entity}Repository.ts)
├── infrastructure/     # Implementaciones concretas
│   └── repositories/prisma/  # Repositorios Prisma que implementan las interfaces de core
├── app/                # Capa de presentación y routing (Next.js App Router)
│   ├── actions/        # Server Actions (comunicación frontend → backend)
│   ├── api/            # Route Handlers REST (endpoints para consumo externo)
│   ├── (auth)/         # Rutas de autenticación (sign-in, sign-up)
│   ├── seller/         # Rutas del dashboard del seller
│   └── admin/          # Rutas del dashboard del admin
├── components/         # Componentes React reutilizables
│   ├── ui/             # Componentes genéricos (Modal, Pagination, MetricCard, etc.)
│   └── layout/         # Componentes de layout (Sidebar, Topbar)
├── types/              # Tipos globales y declaraciones
└── proxy.ts            # Middleware de Clerk (protección de rutas y redirección por rol)
```

### Regla clave: `core/` nunca importa de `infrastructure/`

Las interfaces se definen en `core/repositories/` y se implementan en `infrastructure/repositories/prisma/`. Las server actions instancian directamente la implementación de Prisma.

## Comunicación

### Interna (frontend → backend)

Usar **Server Actions** (`src/app/actions/`). El frontend **nunca** hace `fetch` a rutas propias.

### Externa (otros equipos → nosotros)

Los **Route Handlers** en `src/app/api/` (products, stores, categories, orders) exponen endpoints REST para que consuman los otros equipos (buyer, payments, delivery). Estos endpoints respetan el contrato acordado.

### Externa (nosotros → otros equipos)

Cuando se consume una API de otro equipo, usar `fetch` directamente al endpoint que ellos especifiquen.

## Roles del sistema

Definidos en `src/core/auth/roles.ts` (`APP_ROLES`):

| Rol | Descripción |
|---|---|
| `seller` | Vendedor — gestiona su tienda, productos y órdenes |
| `buyer` | Comprador — navega, compra (consumido vía API) |
| `admin` | Administrador — gestiona tiendas, categorías, órdenes globales |
| `payments` | Pagos — procesa pagos (consumido vía API) |
| `delivery` | Delivery — gestiona envíos (consumido vía API) |

### Autorización

- **Server Actions**: Siempre llamar `requireRole([...])` al inicio.
- **Contexto del seller**: Usar `getSellerContext()` para obtener el seller autenticado y su tienda.
- **Middleware** (`proxy.ts`): Redirige sellers que intentan acceder a rutas admin y viceversa.

## Manejo de errores

- En **Server Actions**: usar `throw new Error('mensaje descriptivo')`.
- En el **frontend**: capturar errores con `try-catch` y mostrar con `toast.error()` de react-hot-toast.

## Convenciones de naming

| Elemento | Convención | Ejemplo |
|---|---|---|
| Server Actions | `{verbo}{Entidad}Action` en `{entidad}.actions.ts` | `createProductAction` en `product.actions.ts` |
| Interfaces de repo | `I{Entidad}Repository.ts` | `IProductRepository.ts` |
| Implementaciones Prisma | `Prisma{Entidad}Repository.ts` | `PrismaProductRepository.ts` |
| Componentes React | PascalCase, un componente por archivo | `ConfirmDeleteModal.tsx` |
| Archivos de página | `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` (convención Next.js) | — |

## Base de datos

- ORM: **Prisma** — schema en `prisma/schema.prisma`.
- Tras modificar el schema: correr `npx prisma generate` y `npx prisma db push` (o migración).
- Los campos monetarios y de peso usan `Decimal(10,2)`.
- IDs: UUID autogenerado (`@default(uuid())`), excepto `Seller.id` que viene de Clerk.

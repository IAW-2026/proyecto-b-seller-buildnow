## Plan: Panel de Administración Global

**Visión General**
Crear el módulo `Admin` para visualizar y gestionar la plataforma globalmente. Incluirá dashboards agregados, gestión de tiendas (aprobar/suspender), CRUD de categorías, y visor de productos/órdenes.

**Fases de Implementación**

1.  **Actualización de Base de Datos (Estado de Tiendas)**
    *   *Acción:* Modificar `StoreStatus` en `schema.prisma` para soportar suspensión, añadiendo `SUSPENDED`.
    . Esto implica modificar el endpoint /api/stores. Si lo accede buyer, solo devolver aquellos que no tengan en su estado Suspended. Si lo accede admin, devolver todos. En ambos casos devolver la misma infomración que se devolvia antes, es decir el estado estaba incluido

2.  **Estructura y Seguridad del Layout Admin**
    *   *Archivos relevantes:* `src/app/admin/layout.tsx`, `src/components/layout/Sidebar.tsx` (hacer dinámicos los enlaces según el rol del usuario).
    *   *Acción:* Crear el layout principal asegurando que esté protegido vía `requireRole([APP_ROLES.ADMIN])`.

3.  **Dashboard General (`/admin/dashboard/page.tsx`)**
    *   *Acción:* Crear tarjetas de métrica globales (Total tiendas, Órdenes Totales, Volumen de Ventas, etc.) utilizando los repositorios de Prisma.

4.  **Gestión de Tiendas y Visor (`/admin/dashboard/stores`)**
    *   *Archivos relevantes:* 
        *   `src/app/admin/dashboard/stores/page.tsx` (Lista de tiendas con botón Activar/Suspender).
        *   `src/app/admin/dashboard/stores/[id]/page.tsx` (Detalle: productos (Solo Lectura) y tableros de órdenes asignadas a esa tienda).
        *   `src/app/actions/admin.actions.ts` (Server actions para suspender/reactivar).

5.  **CRUD de Categorías (`/admin/dashboard/categories`)**
    *   *Archivos relevantes:* 
        *   `src/app/admin/dashboard/categories/page.tsx` (Listado y formulario).
        *   `src/app/actions/category.actions.ts` (Crear, Renombrar, Borrar).

6.  **Visor Global de Órdenes (`/admin/dashboard/orders`)**
    *   *Archivos relevantes:* `src/app/admin/dashboard/orders/page.tsx`.
    *   *Acción:* Tabla unificada con todas las órdenes de la plataforma para buscar rápidamente operaciones.

**Decisiones Técnicas**
- La vista de los productos por tienda estará en `/admin/dashboard/stores/[id]` aprovechando la estructura de carpetas de Next.js, lo cual ayuda a aislar conceptos y no sobrecargar la tabla de listado global.
- Sidebar reutilizable: Modificaremos el actual `Sidebar.tsx` para que reciba el Rol (o para que lea qué rutas pintar) de manera que sirva tanto para SELLER como para ADMIN sin duplicar el componente de UI base.

**Verificación**
1. Comprobar actualización en DB usando Prisma Studio.
2. Ingreso del rol ADMIN y navegación limpia entre las 4 subrutas.
3. Modificar estado de Corralón y creación de Categoría nueva; contrastando visibilidad final con la vista SELLER.
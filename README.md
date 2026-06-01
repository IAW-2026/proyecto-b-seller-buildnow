[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mlS0D64r)
# Build Now - Seller App

Aplicación **Seller** del Proyecto IAW 2026. Esta plataforma permite a los vendedores gestionar su tienda, catálogo de productos y órdenes, y a los administradores moderar la plataforma (gestión de tiendas, categorías y vista global de órdenes).

## 🚀 Deploy

🔗 **[Link al Deploy](https://proyecto-b-seller-buildnow.vercel.app/)**

## 🔐 Accesos y Credenciales

Para acceder a la aplicación puedes usar las siguientes cuentas de prueba:

### 1. Administrador (Admin)
- **Email:** `admin@gmail.com`
- **Contraseña:** `cuenta_admin`

### 2. Vendedor (Seller)
- **Email:** `seller1@gmail.com`
- **Contraseña:** `cuenta_seller`

## ⚙️ Configuración Local (.env)

Para correr el proyecto localmente, configura las siguientes variables en tu archivo `.env`:

```env
# Base de datos
DATABASE_URL=

# Autenticación (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# URLs de Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/seller/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/sign-in

# Almacenamiento de imágenes
BLOB_READ_WRITE_TOKEN=
VERCEL_OIDC_TOKEN=

# Configuración de entorno
SKIP_AUTH=true
DEVELOPMENT=true
```

## Consideraciones
Se tomo la decision de hacer una limpieza de aquellas ordenes cuyos pagos esten en pendiente y hayan superado los 20 minutos sin confirmar. Por lo que al entrar a la aplicacion puede que no existan ordenes en estado PENDING_PAYMENT. Para poder probar este estado hay que hacer una petición al endpoint: 
[POST] https://proyecto-b-seller-buildnow.vercel.app/api/orders
Request:
{
    "buyerId":"Cualquiera",
    "storeId": "1a65cc40-3f58-40aa-b788-e98a3682d933",
    "deliveryAddress": "Cualquiera",
    "items": [
        { "productId": "e71d7101-b4d0-4c60-9246-883ca930cf3e", "quantity": 1}
    ]
}

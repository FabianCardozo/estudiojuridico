# Centro de Gestión Jurídica

Aplicación profesional para estudios jurídicos con cuentas individuales, clientes, expedientes, agenda, tareas, honorarios, comunicaciones, documentos y solicitudes de entrevista mediante QR personalizado.

## Arquitectura

- Next.js 16
- Supabase Auth
- Supabase PostgreSQL con Row Level Security
- Supabase Storage
- Despliegue recomendado: Vercel

## Desarrollo local

1. Instalar Node.js 22 o posterior.
2. Ejecutar `pnpm install`.
3. Copiar `.env.example` como `.env.local`.
4. Completar las variables del proyecto Supabase.
5. Ejecutar `pnpm dev`.

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REEMPLAZAR
```

La clave publicable puede utilizarse en el navegador. Nunca agregue una clave secreta o `service_role` al repositorio.

## Publicación en Vercel

1. Importar este repositorio desde GitHub.
2. Seleccionar el framework Next.js.
3. Agregar las dos variables de entorno anteriores.
4. Presionar **Deploy**.

GitHub Pages no es compatible con esta aplicación porque el sistema utiliza autenticación, rutas de servidor y almacenamiento privado.

## Código QR individual

Cada cuenta recibe automáticamente un `booking_code` único y permanente. El QR apunta a:

```
/solicitar?codigo=CODIGO_UNICO_DEL_ABOGADO
```

Las solicitudes quedan asociadas exclusivamente al abogado titular del código y se agregan automáticamente a su listado de clientes.

## Seguridad

Las tablas utilizan Row Level Security. Cada abogado solamente puede consultar y modificar registros cuyo `owner_id` coincide con su usuario autenticado. Los documentos jurídicos se almacenan en un bucket privado.

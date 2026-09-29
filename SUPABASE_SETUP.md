# Preparación para Supabase

La versión publicada continúa usando su backend actual para no interrumpir los datos existentes. El proyecto incluye una migración lista para trasladar el módulo documental a Supabase Auth, Postgres y Storage.

## Configuración

1. Crear un proyecto en Supabase.
2. Instalar la CLI y ejecutar `supabase login`.
3. Vincular el repositorio: `supabase link --project-ref TU_REFERENCIA`.
4. Aplicar la migración: `supabase db push`.
5. Configurar en el proveedor del frontend `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

La migración crea `public.legal_documents`, un bucket privado `legal-documents`, límite de 8 MB, tipos PDF/DOC/DOCX y políticas RLS que aíslan los documentos por usuario. Nunca expongas una clave `service_role` en el navegador.

Importante: Supabase presta base de datos, autenticación y almacenamiento. El frontend debe publicarse en un servicio compatible con Next.js/Workers o mantenerse en Sites, usando Supabase como backend.

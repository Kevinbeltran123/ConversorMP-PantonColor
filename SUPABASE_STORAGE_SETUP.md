# Configuración de Supabase Storage para Imágenes de Colores

Este documento describe cómo configurar Supabase Storage para almacenar las imágenes de los colores en el proyecto ConversorMP.

## 📋 Requisitos Previos

- Cuenta de Supabase activa
- Proyecto de Supabase ya creado
- Acceso al dashboard de Supabase
- Variables de entorno configuradas en `.env.local`

## 🚀 Paso a Paso: Configuración en Supabase Dashboard

### 1. Aplicar la Migración SQL

La migración SQL ya está preparada en el archivo:
```
supabase/migrations/20260127_add_image_to_colors.sql
```

#### Opción A: Usando Supabase CLI (Recomendado)

Si tienes Supabase CLI instalado:

```bash
# 1. Asegúrate de estar en el directorio raíz del proyecto
cd /Users/kevin_beltran/CodingPersonalProjects/ConversorMP

# 2. Aplica la migración
supabase db push
```

#### Opción B: Manualmente en el Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, selecciona **"SQL Editor"**
3. Haz clic en **"New query"**
4. Copia y pega el contenido del archivo `supabase/migrations/20260127_add_image_to_colors.sql`
5. Haz clic en **"Run"** para ejecutar la migración

### 2. Verificar que el Bucket se Creó Correctamente

1. En el dashboard de Supabase, ve a **"Storage"** en el menú lateral
2. Deberías ver un bucket llamado **"color-images"**
3. Si el bucket NO aparece, créalo manualmente:
   - Haz clic en **"New bucket"**
   - Nombre: `color-images`
   - **IMPORTANTE**: Marca la casilla **"Public bucket"** ✅
   - Haz clic en **"Create bucket"**

### 3. Configurar Políticas de Seguridad (RLS)

Las políticas ya están incluidas en la migración SQL, pero puedes verificarlas:

1. En **Storage**, selecciona el bucket **"color-images"**
2. Ve a la pestaña **"Policies"**
3. Deberías ver 4 políticas:
   - ✅ **Public read access**: Permite lectura pública
   - ✅ **Authenticated upload**: Permite a usuarios autenticados subir imágenes
   - ✅ **Authenticated update**: Permite a usuarios autenticados actualizar imágenes
   - ✅ **Authenticated delete**: Permite a usuarios autenticados eliminar imágenes

#### Si las políticas NO existen, créalas manualmente:

**Política 1: Lectura pública**
```sql
CREATE POLICY "Public read access for color images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'color-images');
```

**Política 2: Subida autenticada**
```sql
CREATE POLICY "Authenticated users can upload color images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'color-images');
```

**Política 3: Actualización autenticada**
```sql
CREATE POLICY "Authenticated users can update color images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'color-images');
```

**Política 4: Eliminación autenticada**
```sql
CREATE POLICY "Authenticated users can delete color images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'color-images');
```

### 4. Verificar la Columna en la Base de Datos

1. En el dashboard, ve a **"Table Editor"**
2. Selecciona la tabla **"colors"**
3. Verifica que existe la columna **"image_url"** de tipo `text` (nullable)

Si NO existe:
1. Ve a **"SQL Editor"**
2. Ejecuta:
```sql
ALTER TABLE colors ADD COLUMN image_url TEXT;
```

## ✅ Verificación de la Configuración

### Verificar el Bucket

1. Ve a **Storage > color-images**
2. Intenta subir un archivo de prueba manualmente
3. Si puedes subirlo y verlo, ¡está funcionando! 🎉

### Probar desde la Aplicación

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Inicia sesión como administrador

3. Ve a **"Colores" > "Crear Color"**

4. Completa el formulario e intenta subir una imagen

5. Si la imagen se sube y aparece en la lista de colores, ¡todo está funcionando correctamente! ✅

## 🔧 Troubleshooting (Solución de Problemas)

### Error: "Bucket does not exist"

**Solución:**
1. Ve a Storage en el dashboard
2. Crea el bucket manualmente llamado `color-images`
3. Marca como **público**

### Error: "Permission denied"

**Solución:**
1. Verifica que las políticas RLS estén configuradas
2. Asegúrate de que el bucket sea **público**
3. Verifica que el usuario esté autenticado

### Error: "Failed to upload image"

**Solución:**
1. Verifica que el archivo sea menor a 5MB
2. Verifica que sea formato JPG, PNG o WebP
3. Revisa la consola del navegador para más detalles
4. Verifica las variables de entorno en `.env.local`

### Las imágenes no se muestran en el frontend

**Solución:**
1. Verifica que el bucket sea **público**
2. Asegúrate de que la URL esté almacenada correctamente en la columna `image_url`
3. Inspecciona el elemento en el navegador y verifica la URL de la imagen
4. Verifica que Next.js tenga permisos para cargar imágenes de Supabase

Para permitir imágenes de Supabase en Next.js, agrega esto a `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
```

## 📊 Configuración de Next.js para Imágenes de Supabase

Agrega la configuración de imágenes remotas en [next.config.ts](next.config.ts):

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
```

Esto permite que Next.js cargue y optimice imágenes desde Supabase Storage.

## 🎨 Características Implementadas

- ✅ Subida de imágenes al crear colores
- ✅ Vista previa de imágenes antes de subir
- ✅ Validación de tipo y tamaño de archivo (max 5MB)
- ✅ Formatos soportados: JPG, PNG, WebP
- ✅ Visualización de imágenes en tarjetas de colores
- ✅ Eliminación automática de imágenes al eliminar colores
- ✅ Storage organizado por carpetas (colors/)
- ✅ URLs públicas para fácil acceso

## 📁 Estructura de Archivos Modificados

```
├── supabase/
│   └── migrations/
│       └── 20260127_add_image_to_colors.sql    # Nueva migración
├── lib/
│   └── utils/
│       └── storage.ts                           # Utilidades de storage
├── domain/
│   └── entities/
│       └── database.types.ts                    # +image_url
├── application/
│   └── use-cases/
│       └── colors.actions.ts                    # Manejo de imágenes
├── components/
│   └── shared/
│       └── color-form.tsx                       # Upload de imágenes
├── app/
│   └── (dashboard)/
│       └── colors/
│           └── page.tsx                         # Mostrar imágenes
└── SUPABASE_STORAGE_SETUP.md                    # Esta guía
```

## 🔐 Seguridad

- Las imágenes se almacenan con nombres únicos para evitar colisiones
- Solo usuarios autenticados pueden subir/modificar/eliminar imágenes
- Las imágenes son públicas para visualización (lectura)
- Validación de tipo y tamaño en el cliente y servidor
- Row Level Security (RLS) habilitado

## 📝 Notas Adicionales

- Las imágenes se organizan en la carpeta `colors/` dentro del bucket
- El nombre de archivo incluye el ID del color y timestamp para unicidad
- Las imágenes antiguas se eliminan automáticamente al actualizar o eliminar colores
- La funcionalidad es opcional: los colores pueden crearse sin imagen

## 🎯 Próximos Pasos Sugeridos (Opcional)

1. Agregar funcionalidad de edición de colores con actualización de imagen
2. Implementar compresión de imágenes antes de subir
3. Agregar soporte para múltiples imágenes por color
4. Implementar drag & drop para subir imágenes
5. Agregar zoom o galería en la página de detalle del color

---

**¿Necesitas ayuda?** Revisa la [documentación oficial de Supabase Storage](https://supabase.com/docs/guides/storage)

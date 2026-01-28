# Scripts de Base de Datos - ConversorMP

Este directorio contiene scripts SQL útiles para gestionar la base de datos.

## 🚀 Solución Rápida: Insertar Datos Iniciales

Si ves el mensaje **"No hay productos disponibles"**, ejecuta:

### Opción 1: Script Completo (Recomendado)

Ejecuta `seed_initial_data.sql` para insertar:
- ✅ 4 Productos (Graniplast, Vinilo, Esmalte, Impermeabilizante)
- ✅ 20 Ingredientes base (tintes, bases, aditivos, cargas)

### Opción 2: Solo Productos

Si solo necesitas productos, ejecuta `seed_products.sql`.

---

## 📋 Cómo Ejecutar los Scripts

### Método 1: Supabase Dashboard (Más Fácil)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. En el menú lateral: **SQL Editor**
4. Click en **New query**
5. Copia y pega el contenido del script deseado
6. Click en **Run** (o presiona `Ctrl + Enter`)
7. Verifica el resultado en la parte inferior

### Método 2: Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db reset  # Resetea todo y aplica migraciones
```

### Método 3: psql (Terminal)

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f supabase/scripts/seed_initial_data.sql
```

---

## 📁 Scripts Disponibles

### Datos Iniciales
- `seed_products.sql` - Solo productos
- `seed_initial_data.sql` - Productos + Ingredientes

### Limpieza
- `clear_test_data.sql` - Elimina TODOS los datos (preserva user_roles)
- `clear_colors_and_batches.sql` - Elimina colores y lotes (preserva productos/ingredientes)
- `truncate_all.sql` - Limpieza rápida con TRUNCATE CASCADE

---

## ⚠️ Notas Importantes

- Los scripts usan `ON CONFLICT DO NOTHING` para evitar duplicados
- No se eliminan `user_roles` para mantener acceso de usuarios
- Después de limpiar datos, re-ejecuta los seeds
- Siempre haz backup antes de ejecutar scripts de limpieza

---

## 🔄 Flujo Típico

```bash
# 1. Limpiar datos de prueba
# Ejecutar: clear_colors_and_batches.sql

# 2. Re-insertar datos iniciales
# Ejecutar: seed_initial_data.sql

# 3. Verificar en la aplicación
# Ir a /colors/new y verificar que aparecen productos
```

---

## 🆘 Solución de Problemas

### "No hay productos disponibles"
➡️ Ejecuta `seed_initial_data.sql`

### "No hay ingredientes disponibles"
➡️ Ejecuta `seed_initial_data.sql`

### Quiero empezar de cero
➡️ Ejecuta `clear_test_data.sql` y luego `seed_initial_data.sql`

### Error: "relation does not exist"
➡️ Primero ejecuta las migraciones: `supabase db push`

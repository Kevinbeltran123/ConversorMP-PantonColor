# Guía de Backup y Recuperación

## Resumen

Esta guía describe las estrategias y procedimientos para realizar backups del sistema ConversorMP y recuperar datos en caso de pérdida.

## Estrategias de Backup

### 1. Backup de Base de Datos (Supabase)

Supabase proporciona backups automáticos en planes pagos, pero para el plan gratuito o para mayor control, se recomienda realizar backups manuales.

#### Opción A: Backup Completo con pg_dump

**Requisitos:**
- PostgreSQL client instalado (`psql`, `pg_dump`)
- Credenciales de conexión de Supabase

**Procedimiento:**

1. **Obtener credenciales de conexión:**
   - Ve a tu proyecto en Supabase Dashboard
   - Settings → Database → Connection String
   - Copia el "Connection string" (URI mode)

2. **Ejecutar backup:**

```bash
# Formato personalizado (recomendado, más compacto)
pg_dump -Fc -v -h <HOST> -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).dump

# Formato SQL plano (más legible)
pg_dump -h <HOST> -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Ejemplo con variables:**
```bash
export DB_HOST="db.xxxxxxxx.supabase.co"
export PGPASSWORD="tu_password_aqui"

pg_dump -Fc -v -h $DB_HOST -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).dump
```

3. **Programar backups automáticos (Linux/Mac):**

```bash
# Crear script de backup
cat > ~/backup_conversormp.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups/conversormp"
mkdir -p $BACKUP_DIR

export DB_HOST="db.xxxxxxxx.supabase.co"
export PGPASSWORD="tu_password_aqui"

BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).dump"

pg_dump -Fc -v -h $DB_HOST -U postgres -d postgres > $BACKUP_FILE

# Mantener solo los últimos 7 días
find $BACKUP_DIR -name "backup_*.dump" -mtime +7 -delete

echo "Backup completado: $BACKUP_FILE"
EOF

chmod +x ~/backup_conversormp.sh

# Programar con cron (ejecutar diario a las 2 AM)
crontab -e
# Agregar línea:
# 0 2 * * * ~/backup_conversormp.sh >> ~/backups/conversormp/backup.log 2>&1
```

#### Opción B: Backup Incremental con Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Hacer backup de la estructura
supabase db dump --project-id <PROJECT_ID> --schema public > schema_backup.sql

# Hacer backup de datos
supabase db dump --project-id <PROJECT_ID> --data-only > data_backup.sql
```

#### Opción C: Backup desde Dashboard (Solo planes pagos)

1. Ve a tu proyecto en Supabase Dashboard
2. Database → Backups
3. Click en "Create Backup"
4. Descarga el backup cuando esté listo

### 2. Backup de Datos en CSV

El sistema incluye exportación CSV integrada para respaldo rápido de datos críticos.

#### Export Manual desde UI

**Fórmulas:**
1. Ve a `/formulas`
2. Click en "📊 Exportar CSV"
3. Se descargará `formulas_list_YYYYMMDD.csv`

**Lotes:**
1. Ve a `/batches`
2. Click en "📊 Exportar CSV"
3. Se descargará `batches_list_YYYYMMDD.csv`

**Fórmula Individual:**
1. Ve a `/formulas/[id]`
2. Click en "📊 Exportar CSV"
3. Se descargará `formula_[producto]_[color]_v[version]_YYYYMMDD.csv`

**Lote Individual:**
1. Ve a `/batches/[id]`
2. Click en "📊 Exportar CSV"
3. Se descargará `batch_[id]_YYYYMMDD.csv`

#### Export Programado (Recomendado)

Crear un script que haga backups CSV automáticos usando la API:

```bash
#!/bin/bash
# backup_csv.sh

BACKUP_DIR="$HOME/backups/conversormp/csv"
mkdir -p $BACKUP_DIR

# URL de tu aplicación
APP_URL="https://tu-app.vercel.app"
AUTH_TOKEN="tu_token_de_autenticacion"

DATE=$(date +%Y%m%d)

# Descargar todos los CSVs (requiere implementar endpoints de API)
# Por ahora, se recomienda hacer manualmente desde la UI semanalmente

echo "Backup CSV completado: $DATE"
```

**Recomendación de Frecuencia:**
- **CSV Export:** Semanalmente o después de cambios importantes
- **pg_dump:** Diariamente (automático con cron)
- **Supabase Backups:** Plan pago con backups automáticos

### 3. Backup de Código Fuente

El código fuente debe estar en un repositorio Git remoto (GitHub, GitLab, Bitbucket).

```bash
# Verificar repositorio remoto
git remote -v

# Backup manual (si no tienes remoto configurado)
git bundle create ../conversormp_backup_$(date +%Y%m%d).bundle --all

# Push a remoto (recomendado)
git push origin main
```

### 4. Backup de Variables de Entorno

Las variables de entorno contienen configuración crítica.

```bash
# Crear backup cifrado de .env.local
gpg -c .env.local
# Guardar .env.local.gpg en lugar seguro (NO en Git)

# Para recuperar:
gpg .env.local.gpg
```

**Variables críticas a respaldar:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (¡MUY SENSIBLE!)

## Recuperación de Datos

### Recuperar desde pg_dump

```bash
# Formato personalizado (.dump)
pg_restore -v -h <HOST> -U postgres -d postgres -c backup_20260126_140000.dump

# Formato SQL (.sql)
psql -h <HOST> -U postgres -d postgres < backup_20260126_140000.sql
```

**Opciones importantes:**
- `-c`: Limpia (DROP) objetos existentes antes de crearlos
- `--if-exists`: Usa DROP IF EXISTS para evitar errores
- `-d postgres`: Base de datos destino

### Recuperar desde CSV

Si solo tienes backups CSV, puedes importar manualmente:

1. **Crear nuevas fórmulas/lotes desde la UI** usando los datos del CSV
2. **Importación SQL directa** (requiere transformar CSV a SQL)

```sql
-- Ejemplo: Importar ingredientes desde CSV
COPY ingredients(name, description, active)
FROM '/path/to/ingredients_backup.csv'
DELIMITER ','
CSV HEADER;
```

### Recuperar desde Supabase Backups (Plan pago)

1. Ve a Database → Backups
2. Selecciona el backup deseado
3. Click en "Restore"
4. Confirma la operación (¡SOBRESCRIBE datos actuales!)

## Estrategia de Backup Recomendada (3-2-1)

La regla **3-2-1** de backup:
- **3 copias** de tus datos (original + 2 backups)
- **2 tipos diferentes** de medios (local + nube)
- **1 copia offsite** (fuera del servidor principal)

### Implementación Sugerida

1. **Copia 1 (Original):** Base de datos de producción en Supabase
2. **Copia 2 (Backup Diario):** pg_dump automático en servidor local o S3
3. **Copia 3 (Backup Semanal CSV):** Export CSV manual guardado en Google Drive/Dropbox

**Calendario de Backups:**

| Frecuencia | Método | Destino | Retención |
|------------|--------|---------|-----------|
| Diario | pg_dump | Servidor local | 7 días |
| Diario | pg_dump | AWS S3 / Google Cloud | 30 días |
| Semanal | CSV Export | Google Drive | 90 días |
| Mensual | pg_dump completo | Disco externo | 12 meses |

## Pruebas de Recuperación

**¡IMPORTANTE!** Los backups sin pruebas son inútiles.

### Procedimiento de Prueba (Cada 3 meses)

1. **Crear proyecto de prueba en Supabase**
2. **Restaurar backup más reciente** en proyecto de prueba
3. **Verificar integridad:**
   ```sql
   -- Contar registros
   SELECT 'products' as table, COUNT(*) FROM products
   UNION ALL
   SELECT 'colors', COUNT(*) FROM colors
   UNION ALL
   SELECT 'formulas', COUNT(*) FROM formulas
   UNION ALL
   SELECT 'ingredients', COUNT(*) FROM ingredients
   UNION ALL
   SELECT 'batches', COUNT(*) FROM batches;

   -- Verificar fórmula activa más reciente
   SELECT f.*, c.name as color, p.name as product
   FROM formulas f
   JOIN colors c ON f.color_id = c.id
   JOIN products p ON c.product_id = p.id
   WHERE f.is_active = true
   ORDER BY f.created_at DESC
   LIMIT 5;
   ```
4. **Probar funcionalidad crítica:** Login, ver fórmulas, calcular lote
5. **Documentar resultado:** Tiempo de restauración, problemas encontrados

## Plan de Recuperación ante Desastres (DRP)

### Escenarios de Desastre

#### Escenario 1: Pérdida de Base de Datos

**Tiempo de Recuperación Objetivo (RTO):** 2 horas
**Punto de Recuperación Objetivo (RPO):** 24 horas (último backup diario)

**Pasos:**
1. Crear nuevo proyecto Supabase (15 min)
2. Restaurar último backup con pg_restore (30 min)
3. Actualizar variables de entorno en Vercel (10 min)
4. Verificar funcionamiento (15 min)
5. Notificar a usuarios (5 min)

#### Escenario 2: Corrupción de Datos

**RTO:** 1 hora
**RPO:** 1 semana (backup semanal CSV)

**Pasos:**
1. Identificar datos corruptos (15 min)
2. Restaurar solo las tablas afectadas desde backup (30 min)
3. Verificar integridad con queries SQL (10 min)
4. Prueba funcional (5 min)

#### Escenario 3: Eliminación Accidental

**RTO:** 30 minutos
**RPO:** Inmediato (si hay audit logs)

**Pasos:**
1. Consultar audit_logs para identificar cambios (5 min)
2. Recuperar desde backup o restaurar manualmente (15 min)
3. Verificar con usuario (10 min)

## Contactos de Emergencia

- **Soporte Supabase:** support@supabase.io
- **Admin del Sistema:** [TU EMAIL]
- **Desarrollador:** [DESARROLLADOR EMAIL]

## Checklist de Backup

Usa esta checklist mensualmente:

- [ ] Verificar que cron de pg_dump está activo
- [ ] Verificar que hay al menos 7 backups diarios disponibles
- [ ] Descargar backup más reciente y guardar localmente
- [ ] Exportar CSV de fórmulas y lotes desde UI
- [ ] Guardar CSVs en Google Drive / Dropbox
- [ ] Hacer backup de .env.local cifrado
- [ ] Verificar espacio en disco de backups
- [ ] Probar restauración en proyecto de prueba (cada 3 meses)
- [ ] Actualizar esta guía si hay cambios en el proceso

## Herramientas Adicionales

### Scripts Útiles

**Verificar tamaño de base de datos:**
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Export de una tabla específica:**
```bash
pg_dump -h <HOST> -U postgres -d postgres -t public.formulas > formulas_backup.sql
```

**Backup solo de estructura (sin datos):**
```bash
pg_dump -h <HOST> -U postgres -d postgres --schema-only > schema_only.sql
```

## Preguntas Frecuentes

**P: ¿Puedo hacer backup mientras la aplicación está en uso?**
R: Sí, pg_dump es seguro en caliente y no bloquea operaciones normales.

**P: ¿Cuánto espacio necesito para backups?**
R: Para un MVP con ~100 fórmulas y ~1000 lotes: ~10-50 MB por backup. Planea al menos 1 GB para backups mensuales.

**P: ¿Los backups incluyen usuarios y permisos?**
R: pg_dump con `-d postgres` incluye roles y permisos. Los usuarios de Supabase Auth están en un esquema separado.

**P: ¿Qué pasa con los archivos subidos?**
R: Actualmente no hay uploads en el sistema. Si se agregan, usar Supabase Storage y respaldar con `supabase storage download`.

---

**Última actualización:** 2026-01-26
**Versión:** 1.0
**Sprint:** 5

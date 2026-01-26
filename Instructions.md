Eres mi copiloto de desarrollo (Arquitecto de Software + Full-Stack Senior). Vamos a construir un MVP para un negocio de pinturas que fabrica Graniplast. El sistema debe permitir registrar fórmulas de colores con ingredientes variables (colanil, negro, etc.), versionarlas, y calcular proporciones para una cantidad objetivo (ej: fórmula base 200 kg → preparar 20 kg). Debe incluir impresión práctica de las cantidades (orden de mezcla) para usar en el taller.
0) Principios y reglas (OBLIGATORIO)
Reglas de trabajo (Copiloto)
Trabaja en sprints numerados y entrega código incremental y ejecutable.
En cada sprint responde con:
Objetivo
Historias de usuario (2–5)
Checklist técnico
Cambios de BD (si aplica)
Archivos creados/modificados (rutas exactas)
Comandos para correr (dev + tests)
“Definición de terminado” (qué debe verse funcionando)
Si falta una decisión crítica, elige por defecto y sigue (sin preguntarme).
No rompas lo anterior: cambios pequeños, migrations, PR-style.
Reglas del dominio (medidas)
Guardar todas las cantidades internamente en gramos (integer o decimal controlado).
Aceptar entrada en g o kg, convertir a g en backend.
Fórmula base: base_total_g
Escalado:
factor = target_total_g / base_total_g
scaled_g = round(factor * ingredient_g, rounding_rule)
Redondeo por defecto: 1 g (configurable).
UI: mostrar en g o kg según magnitud (ej: >1000 g → kg con 2 decimales).
Prácticas de seguridad (mínimo)
Validación fuerte de inputs (Zod).
Autenticación + roles.
Políticas de acceso en BD (RLS).
No exponer secretos en frontend.
Auditoría mínima (quién creó/modificó).
Clean Architecture + Clean Code (mínimo)
Capas:
Domain: entidades + reglas (puras, sin DB).
Application: casos de uso (orquestación, DTOs).
Infrastructure: DB, repositorios, auth provider.
Presentation: UI, controllers/routes.
Clean Code:
funciones pequeñas, nombres claros, sin “magic numbers”.
tipado estricto TypeScript.
errores con mensajes accionables.
logging mínimo (sin datos sensibles).
Testing:
unit tests del motor de escalado y redondeo.
al menos 1 test de integración para persistencia (si es viable en MVP).
1) Stack recomendado (elige y justifica brevemente)
Debes usar un stack económico, seguro y rápido de implementar:
✅ Opción preferida (recomendada):
Next.js (App Router) + TypeScript
TailwindCSS + shadcn/ui (UI rápida y limpia)
Supabase (Postgres + Auth + RLS)
React Hook Form + Zod (formularios robustos)
Vitest (unit tests)
Playwright (opcional, smoke test)
Deploy: Vercel (frontend) + Supabase (DB)
Motivo: acelera Auth, DB y seguridad sin montar servidores, mantiene costos bajos y escala bien.
2) Funcionalidades requeridas (MVP)
A) Colores, fórmulas y versionado
CRUD de colores (nombre, producto, notas).
Crear fórmula versión 1 con:
cantidad base (kg/g)
ingredientes dinámicos (agregar/quitar filas)
Editar fórmula = crear nueva versión, conservar historial.
Marcar versión “activa”.
B) Escalado + Lotes
“Calcular lote”:
seleccionar color y versión activa (o escoger otra)
ingresar cantidad objetivo (kg/g)
ver ingredientes escalados + factor
Guardar lote calculado (trazabilidad).
C) Impresión / Orden de mezcla (imprescindible)
Generar Orden de mezcla imprimible desde “Calcular lote” y desde el historial:
Formato A4, limpio para taller
Color, producto, versión, fecha, operador
Cantidad objetivo
Tabla ingredientes (cantidad en g/kg)
Campo “observaciones”
Botón: Imprimir y opción “Guardar PDF” (desde navegador)
Implementación recomendada:
Página /print con diseño para impresión (@media print)
O PDF server-side si decides (solo si no complica MVP)
D) Búsqueda y export
Búsqueda por nombre de color.
Export CSV de:
fórmula (ingredientes)
lotes (ingredientes escalados)
E) Usuarios y roles
Roles: Admin / Operador.
Admin gestiona fórmulas; Operador solo calcula/imprime/guarda lotes.
3) Roadmap por Sprints (más detallado)
Sprint 0 — Base sólida (setup + auth + layout)
Objetivo: Proyecto corriendo, login funcional, rutas protegidas, estilos base.
Historias
Como usuario, quiero iniciar sesión para acceder al sistema.
Como admin, quiero ver un dashboard inicial.
Checklist
Crear proyecto Next.js TS.
Configurar Supabase (Auth + proyecto).
Middleware de rutas protegidas.
Layout base (sidebar simple).
Estructura Clean Architecture (carpetas).
ESLint + Prettier + EditorConfig.
Convenciones: commits, naming, env.
Definición de terminado
Login funcionando.
Dashboard accesible solo autenticado.
Sprint 1 — Esquema de BD + RLS (seguridad real)
Objetivo: Tablas mínimas + políticas RLS por rol.
Historias
Como admin, quiero almacenar colores y fórmulas de forma segura.
Como operador, quiero leer sin poder modificar fórmulas.
BD
products
colors
formulas (version)
ingredients
formula_items (ingredient_id, grams)
batches
batch_items (opcional pero recomendado para guardar el snapshot)
roles/users mapping (o claims)
audit_logs (mínimo)
Checklist
SQL/migrations.
Índices (color_name, ingredient_name).
RLS: políticas por rol.
Seeds (producto Graniplast).
Documentar decisiones (por qué batch_items snapshot).
Definición de terminado
Tablas creadas.
RLS bloquea accesos indebidos (prueba con rol operador).
Sprint 2 — CRUD Colores + Crear fórmula (ingredientes dinámicos)
Objetivo: Crear colores y fórmulas con ingredientes flexibles.
Historias
Admin crea “Azul cielo”.
Admin crea fórmula base 200 kg con ingredientes variables.
Sistema guarda cantidades en gramos.
Checklist
UI lista de colores + búsqueda.
Crear color (validación nombre, duplicados).
Pantalla detalle color:
lista versiones de fórmulas
marcar activa
Formulario crear fórmula:
base_total (kg/g)
ingredientes dinámicos (add/remove)
autocompletar ingrediente (catálogo) + “crear nuevo”
Persistencia (repositorios + casos de uso).
Definición de terminado
Se puede crear color y fórmula version 1 y verla en detalle.
Sprint 3 — Escalado proporcional + Guardar lote + tests
Objetivo: Cálculo correcto y confiable.
Historias
Operador calcula lote objetivo 20 kg.
Operador guarda el lote para trazabilidad.
Checklist
Caso de uso ScaleFormula.
Validaciones:
target > 0
fórmula existe y tiene items
Redondeo a 1 g.
UI “Calcular lote”:
seleccionar versión
ingresar target
tabla resultados escalados
botón Guardar lote
Tests unitarios (Vitest):
conversión kg↔g
factor
redondeo
ejemplo 200→20
Definición de terminado
Fórmula 200 kg produce resultados correctos para 20 kg.
Lote se guarda y se puede listar.
Sprint 4 — Impresión (Orden de mezcla) + vista histórica
Objetivo: Mejorar operación en taller (imprimir).
Historias
Operador imprime la orden de mezcla del lote calculado.
Operador reimprime una orden de un lote anterior.
Checklist
Ruta /print/batch/:id y /print/preview (sin guardar).
Estilos @media print:
ocultar navbar
tipografía legible
tabla limpia
Botón “Imprimir” (window.print()).
Incluir campos:
color, producto, versión, fecha, operador
cantidad objetivo
tabla ingredientes
observaciones
firma opcional
Asegurar que imprime bien en A4.
Definición de terminado
Desde “Calcular lote” puedo imprimir.
Desde historial puedo reimprimir.
Sprint 5 — Comparación de versiones + export CSV + hardening
Objetivo: Trazabilidad avanzada y robustez.
Historias
Admin compara fórmula v1 vs v2.
Admin/Operador exporta CSV.
Checklist
Comparador de versiones (diff):
agregado/quitado ingrediente
cambios de gramos
Export CSV:
fórmula
lote
Auditoría mínima (audit_logs).
Rate limiting básico (si aplica).
Guía backup:
export CSV periódico
pg_dump (opcional)
Documentación de despliegue.
Definición de terminado
Comparación y export funcionan.
Recomendaciones de backup claras.
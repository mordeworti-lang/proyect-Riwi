# DataCore - Guía de Limpieza de Datos Basura

## Problema Resuelto

Durante el desarrollo del sistema DataCore, se acumularon datos de prueba de múltiples fuentes:
- Migraciones anteriores con datos inconsistentes
- Scripts de seed diferentes (`seed.js`, `seed-data.js`)
- Datos de prueba CSV (`datos-migracion-testing.csv`)
- Datos generados automáticamente durante testing

## Solución Implementada

### 1. Script de Limpieza (`clean-bad-data.js`)

**Características:**
- ✅ Elimina datos basura de forma segura
- ✅ Mantiene integridad referencial
- ✅ Preserva tablas de lookup (sedes, routes, roles, intervention_types)
- ✅ Opción de conservar usuarios demo
- ✅ Transacciones atómicas (rollback si hay error)

### 2. Comandos Disponibles

```bash
# Verificar estado actual de datos
npm run check-data

# Limpiar todos los datos de prueba
npm run clean

# Limpiar pero mantener usuarios demo
npm run clean:keep-users

# Reset completo (limpiar + migrar + seed)
npm run reset

# Migración final limpia
npm run clean && npm run migrate && npm run seed
```

### 3. Qué se Limpia

**Datos Eliminados:**
- `ai_analyses` - Análisis de IA generados
- `interventions` - Intervenciones clínicas
- `couders` - Aprendices/participantes
- `clans` - Grupos
- `cohorts` - Cortes formativos
- `users` - Usuarios (opcional: mantener demo)

**Datos Conservados:**
- `sedes` - Ubicaciones (Medellín, Barranquilla)
- `routes` - Tipos de rutas (básica, avanzada)
- `roles` - Roles del sistema
- `intervention_types` - Tipos de intervención

### 4. Usuarios Demo Conservados (opción --keep-users)

| Email | Rol | Password |
|-------|-----|----------|
| interventor@clinica.com | Interventor | Interventor1234! |
| admin@clinica.com | Admin | Admin1234! |
| lider@clinica.com | Líder | Lider1234! |
| mentor@clinica.com | Mentor | Mentor1234! |
| bybelas@clinica.com | Mentor | Bybelas1234! |

## Flujo de Migración Final Recomendado

### Opción 1: Limpieza Total
```bash
# 1. Backup (opcional pero recomendado)
pg_dump clinical_system > backup-$(date +%Y%m%d).sql

# 2. Limpiar todos los datos
npm run clean

# 3. Ejecutar migración final
npm run migrate

# 4. Cargar datos limpios
npm run seed

# 5. Verificar estado
npm run check-data
```

### Opción 2: Mantener Usuarios Demo
```bash
# 1. Limpiar datos pero mantener usuarios
npm run clean:keep-users

# 2. Migrar y seed
npm run migrate && npm run seed
```

### Opción 3: Reset Automático
```bash
# Todo en un paso
npm run reset
```

## Verificación

Después de la limpieza, verifica el estado con:

```bash
npm run check-data
```

Salida esperada:
```
📊 Estado actual de datos:
   ai_analyses         : 0 registros
   interventions       : 0 registros
   couders            : 0 registros
   clans              : 0 registros
   cohorts            : 0 registros
   users              : 5 registros    (si se usó --keep-users)
   sedes              : 2 registros
   routes             : 2 registros
   roles              : 4 registros
   intervention_types : 5 registros
```

## Beneficios

✅ **Sin datos basura** - Base de datos limpia y consistente  
✅ **Integridad referencial** - Sin errores de FK  
✅ **Datos consistentes** - Todos los datos siguen el mismo formato  
✅ **Rápido y seguro** - Transacciones atómicas  
✅ **Reproducible** - Mismo proceso en cualquier ambiente  

## Notas Importantes

- El script usa transacciones, si hay error todo se revierte automáticamente
- Las tablas de lookup nunca se borran (son datos maestros)
- Los usuarios demo son útiles para testing y desarrollo
- Siempre puedes hacer backup antes de la limpieza

---

**DataCore v1.0 - Sistema Clínico Limpio y Profesional**

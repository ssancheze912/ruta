# Guía de Arquitectura: Sharding y Unificación para Mega-Proyectos BMAD6

> **Contexto:** Esta guía establece la estructura de directorios para mega-proyectos con muchas features que comparten el mismo patrón arquitectónico. Los documentos monolíticos se explotan en shards organizados por tipo, y el original se preserva en `archive/`.

---

## 1. El Patrón `archive/`

Cuando un documento se shardea, el archivo original **no se elimina**: se mueve a `archive/` como respaldo histórico. Lo que queda activo es la carpeta con los shards.

```mermaid
flowchart LR
    subgraph ANTES["Antes del Sharding"]
        PRD_MONO["prd.md<br/><i>Monolito: 2000+ líneas</i>"]
        EPICS_MONO["epics.md<br/><i>Monolito: 1500+ líneas</i>"]
    end

    SHARD["shard-doc<br/><i>Explota por ## headings</i>"]

    subgraph DESPUÉS["Después del Sharding"]
        direction TB
        ARCHIVE["archive/<br/>├── prd.md<br/>└── epics.md"]
        PRD_DIR["prd/<br/>├── index.md<br/>├── goals.md<br/>├── feature-scoring.md<br/>└── ..."]
        EPICS_DIR["epics/<br/>├── index.md<br/>├── epic-pipeline-oportunidades.md<br/>└── ..."]
    end

    PRD_MONO --> SHARD
    EPICS_MONO --> SHARD
    SHARD --> ARCHIVE
    SHARD --> PRD_DIR
    SHARD --> EPICS_DIR

    style ARCHIVE fill:#6c757d,color:#fff
    style PRD_DIR fill:#4ecdc4,color:#000
    style EPICS_DIR fill:#a8e6cf,color:#000
    style SHARD fill:#fdcb6e,color:#000
```

> **Regla:** `archive/` es de solo lectura. Nunca se edita. Es la foto histórica del monolito antes de ser explotado. A partir del sharding, **toda actualización ocurre exclusivamente en los shards** — el archivo archivado queda obsoleto por diseño y no debe consultarse como fuente de verdad.

---

## 2. Estructura Completa del Proyecto

### 2.1 Árbol de Directorios

```
gestor-comercial/
│
├── _bmad/                                       ← Configuración BMAD6
├── _bmad-output/
│   │
│   ├── project-context.md
│   │
│   ├── planning-artifacts/
│   │   │
│   │   ├── architecture.md                      ← ÚNICA arquitectura (sin sharding)
│   │   ├── ux-design-specification.md           ← ÚNICO diseño UX (sin sharding)
│   │   ├── implementation-readiness.md
│   │   │
│   │   ├── archive/                             ← MONOLITOS ORIGINALES (solo lectura)
│   │   │   ├── prd.md                           (snapshot pre-sharding)
│   │   │   └── epics.md                         (snapshot pre-sharding)
│   │   │
│   │   ├── prd/                                 ← SHARDS DE PRD
│   │   │   ├── index.md                         (navegación + tabla de contenido)
│   │   │   ├── table-of-contents.md
│   │   │   ├── goals.md                         ← Shard transversal
│   │   │   ├── success-criteria.md              ← Shard transversal
│   │   │   ├── non-functional-requirements.md   ← Shard transversal
│   │   │   ├── technical-assumptions.md         ← Shard transversal
│   │   │   ├── user-interface-design-goals.md   ← Shard transversal
│   │   │   ├── traceability-matrix.md           ← Shard transversal
│   │   │   ├── pm-checklist-results.md
│   │   │   ├── feature-pipeline-de-oportunidades-etapas.md
│   │   │   ├── feature-scoring-clasificacion-de-leads.md
│   │   │   ├── feature-metricas-en-tiempo-real-filtrado.md
│   │   │   ├── feature-personalizacion-de-dashboard.md
│   │   │   ├── feature-planificacion-de-rutas-de-visita.md
│   │   │   └── ...
│   │   │
│   │   ├── epics/                               ← SHARDS DE EPICS (1 archivo por feature)
│   │   │   ├── index.md                         (mapa: Feature → Épicas → PRD Shard)
│   │   │   ├── epic-pipeline-de-oportunidades.md        (contiene N épicas del feature)
│   │   │   ├── epic-scoring-clasificacion-leads.md      (contiene N épicas del feature)
│   │   │   ├── epic-metricas-tiempo-real.md             (contiene N épicas del feature)
│   │   │   ├── epic-personalizacion-dashboard.md        (contiene N épicas del feature)
│   │   │   └── ...
│   │   │
│   │   └── course-corrections/                  ← HISTORIAL DE DECISIONES
│   │       ├── cc-001-initial-scope.md
│   │       ├── cc-002-add-rutas-de-visita.md
│   │       └── ...
│   │
│   └── implementation-artifacts/
│       ├── sprint-status.yaml                   ← PUNTERO DE EJECUCIÓN (único)
│       ├── stories/                             ← BOLSA PLANA DE STORIES
│       │   ├── story-01.01-pipeline-api.md
│       │   ├── story-01.02-pipeline-frontend.md
│       │   ├── story-02.01-scoring-api.md
│       │   └── ...
│       └── reviews/                             ← BOLSA PLANA DE REVIEWS
│           └── ...
│ 
├── .agents/                                    ← Funciona para Claude y OpenCode
│   │
│   ├── skills/
│   │   │
│   │   ├── finance-sa-dto-inventory/            ← Expone DTO del módulo de inventario
│   │   │   ├── SKILL.md
│   │   └── dominio-sa-name-skill/               ← Expone información relevante para otros equipos
│           └── SKILL.md
├── .claude/
│   │
│   ├── skills/
│   │   │
│   │   ├── finance-sa-dto-inventory/       
│   │   │   ├── SKILL.md
│   │   └── dominio-sa-name-skill/                      
            └── SKILL.md

```

### 2.2 Diagrama de Distribución

```mermaid
graph TB
    ROOT["_bmad-output/"]

    ROOT --> PA["planning-artifacts/"]
    ROOT --> IA["implementation-artifacts/"]

    PA --> ARCH["architecture.md<br/><i>ÚNICA · Sin sharding</i>"]
    PA --> UX["ux-design-specification.md<br/><i>ÚNICO · Sin sharding</i>"]

    PA --> ARCHIVE["archive/<br/><i>Monolitos originales<br/>Solo lectura</i>"]

    PA --> PRD_DIR["prd/"]
    PA --> EPICS_DIR["epics/"]
    PA --> CC_DIR["course-corrections/"]

    PRD_DIR --> PRD_IDX["index.md"]
    PRD_DIR --> PRD_T["Shards transversales<br/><i>goals · success-criteria<br/>non-functional-requirements<br/>technical-assumptions · ...</i>"]
    PRD_DIR --> PRD_F["Shards de features<br/><i>feature-pipeline-oportunidades<br/>feature-scoring-leads<br/>feature-metricas-tiempo-real<br/>...</i>"]

    EPICS_DIR --> EP_IDX["index.md<br/><i>Mapa trazabilidad</i>"]
    EPICS_DIR --> EP_FILES["epic-pipeline-oportunidades.md<br/>epic-scoring-leads.md<br/>epic-metricas-tiempo-real.md<br/><i>... (1 archivo por feature,<br/>N épicas dentro)</i>"]

    IA --> SS["sprint-status.yaml"]
    IA --> ST_DIR["stories/<br/><i>Bolsa plana</i>"]
    IA --> RV_DIR["reviews/<br/><i>Bolsa plana</i>"]

    style ARCH fill:#ffe66d,color:#000
    style UX fill:#ffe66d,color:#000
    style ARCHIVE fill:#6c757d,color:#fff
    style PRD_DIR fill:#4ecdc4,color:#000
    style PRD_T fill:#81ecec,color:#000
    style PRD_F fill:#00b894,color:#fff
    style EPICS_DIR fill:#a8e6cf,color:#000
    style CC_DIR fill:#ffd3b6,color:#000
    style SS fill:#ff6b6b,color:#fff
    style ST_DIR fill:#dcedc1,color:#000
```

### 2.3 Qué Tiene Sharding y Qué No

```mermaid
graph LR
    subgraph SHARDING["✅ CON Sharding"]
        direction TB
        PRD["<b>PRD</b><br/>Shards transversales +<br/>Shards por feature"]
        EPICS["<b>Epics</b><br/>1 archivo por feature<br/>contiene N épicas cada uno"]
    end

    subgraph NO_SHARD["⛔ SIN Sharding"]
        direction TB
        ARCH["<b>Architecture</b><br/>El patrón técnico es uno solo"]
        UXD["<b>UX Design</b><br/>Los componentes UI son compartidos"]
    end

    subgraph ARCHIVE_BOX["🗄️ ARCHIVE"]
        direction TB
        ORIG["Monolitos originales<br/>pre-sharding<br/><i>Solo lectura · Obsoletos</i>"]
    end

    subgraph FLAT["📦 BOLSA PLANA"]
        direction TB
        STORIES["Stories: story-NN.XX-desc.md"]
        REVIEWS["Reviews: review-NN.XX.md"]
    end

    style SHARDING fill:#d4edda,stroke:#28a745
    style NO_SHARD fill:#fff3cd,stroke:#ffc107
    style ARCHIVE_BOX fill:#e2e3e5,stroke:#6c757d
    style FLAT fill:#e2e3e5,stroke:#6c757d
```

---

## 3. Cómo Funciona el Sharding Inteligente

El sharding no es un split mecánico por líneas — es una tarea ejecutada por el agente BMAD que **auto-detecta el tipo de documento** analizando sus headings y aplica reglas de extracción distintas según el modo:

```mermaid
flowchart TD
    DOC["Documento monolito<br/><i>prd.md o epics.md</i>"]

    DOC --> DETECT{"Auto-detectar<br/>tipo de documento"}

    DETECT -->|"Encuentra<br/><code>### feature —</code>"| PRD_MODE["<b>PRD Mode</b>"]
    DETECT -->|"Encuentra<br/><code>### Epic</code> dentro de <code>##</code>"| EPIC_MODE["<b>Epic Mode</b>"]

    PRD_MODE --> PRD_GENERAL["Secciones <code>##</code> generales<br/><i>(goals, NFRs, assumptions...)</i><br/>→ Se extraen como shards<br/>independientes en kebab-case"]
    PRD_MODE --> PRD_FEAT["Secciones <code>### feature — X</code><br/>→ Se extraen como<br/><code>feature-{kebab-name}.md</code><br/><i>El contenedor ## padre<br/>no se emite</i>"]

    EPIC_MODE --> EPIC_GENERAL["Secciones <code>##</code> sin épicas<br/><i>(overview, FR coverage...)</i><br/>→ Se extraen como shards normales"]
    EPIC_MODE --> EPIC_FEAT["Secciones <code>##</code> con <code>### Epic</code><br/>→ Se extraen completas como<br/><code>epic-{kebab-feature}.md</code><br/><i>Incluye todas las épicas<br/>y stories del feature</i>"]

    PRD_GENERAL --> INDEX["Se genera <code>index.md</code><br/>+ original va a <code>archive/</code>"]
    PRD_FEAT --> INDEX
    EPIC_GENERAL --> INDEX
    EPIC_FEAT --> INDEX

    style PRD_MODE fill:#4ecdc4,color:#000
    style EPIC_MODE fill:#a8e6cf,color:#000
    style PRD_FEAT fill:#00b894,color:#fff
    style EPIC_FEAT fill:#00b894,color:#fff
    style PRD_GENERAL fill:#81ecec,color:#000
    style EPIC_GENERAL fill:#81ecec,color:#000
    style INDEX fill:#6c757d,color:#fff
```

> En ambos modos, el agente presenta el mapa de secciones detectado al usuario para confirmación antes de ejecutar. El monolito original se mueve a `archive/` automáticamente.

---

## 4. Anatomía de los Shards de PRD

El PRD no se shardea solo por feature. También se extraen las secciones transversales como shards independientes:

```mermaid
graph TD
    MONO["archive/prd.md<br/><i>Monolito original</i>"]

    MONO -->|"shard-doc explode"| IDX["prd/index.md<br/><i>Navegación</i>"]

    MONO --> TRANS["Shards Transversales"]
    MONO --> FEAT["Shards de Features"]

    TRANS --> G["goals.md"]
    TRANS --> SC["success-criteria.md"]
    TRANS --> NFR["non-functional-requirements.md"]
    TRANS --> TA["technical-assumptions.md"]
    TRANS --> UID["user-interface-design-goals.md"]
    TRANS --> TM["traceability-matrix.md"]

    FEAT --> F1["feature-pipeline-de-<br/>oportunidades-etapas.md"]
    FEAT --> F2["feature-scoring-<br/>clasificacion-de-leads.md"]
    FEAT --> F3["feature-metricas-en-<br/>tiempo-real-filtrado.md"]
    FEAT --> F4["feature-planificacion-<br/>de-rutas-de-visita.md"]
    FEAT --> FN["..."]

    style MONO fill:#6c757d,color:#fff
    style TRANS fill:#81ecec,color:#000
    style FEAT fill:#00b894,color:#fff
    style G fill:#81ecec,color:#000
    style SC fill:#81ecec,color:#000
    style NFR fill:#81ecec,color:#000
    style TA fill:#81ecec,color:#000
    style UID fill:#81ecec,color:#000
    style TM fill:#81ecec,color:#000
    style F1 fill:#00b894,color:#fff
    style F2 fill:#00b894,color:#fff
    style F3 fill:#00b894,color:#fff
    style F4 fill:#00b894,color:#fff
```

> Los shards transversales contienen reglas que aplican a **todas** las features. Los shards de feature contienen reglas de negocio específicas de esa funcionalidad.

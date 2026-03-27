# 🧠 Arquitetura — GIS MVP (tjmaps)

## 📌 Visão Geral

Sistema GIS agnóstico rodando no browser (Vite + React 19 + pnpm), projetado para alta densidade de dados e preparada para futura migração para Electron + SQLite.

---

## 🧱 Princípios Arquiteturais

- **GeoJSON como Single Source of Truth:** Formato interno único para processamento e estado.
- **Micro-UI GIS:** Interface densa (fontes 7-10px) para maximizar área de trabalho do mapa.
- **Full-File Policy:** Entregas de código sempre completas para garantir integridade.
- **Desacoplamento de Estado:** Zustand gerencia a verdade geográfica fora do ciclo de vida do Leaflet.

---

## 🗺️ Componentes e Responsabilidades (Paths Reais)

### 🛰️ Camada de Mapa

- **`src/services/map/mapProvider.ts`**: Encapsula provedores (OSM/Mapbox Satellite) e isola tokens de API.
- **`src/components/map/MapView.tsx`**: Orquestrador do Leaflet. Gerencia renderização via Canvas, clusters de marcadores e vinculação de eventos (clicks/tooltips).

### 🗂️ Gestão de Camadas e Estado

- **`src/store/useLayerStore.ts`**: Store central (Zustand). Gerencia a lista de camadas, visibilidade, seleção de features e operações de CRUD geográfico.
- **`src/services/geo/kmlService.ts`**: Lógica de ingestão. Converte KML bruto para GeoJSON estruturado com IDs únicos.

### 🔍 Inspeção e UI

- **`src/components/layout/Sidebar.tsx`**: Sidebar fixa de 240px. Gerencia lista de camadas, importação e o ciclo de vida do Inspector.
- **`src/components/inspector/PropertyInspector.tsx`**: Micro-componente para edição de atributos de features selecionadas. Utiliza sincronização controlada com supressão de linter para performance.

---

## 🔄 Fluxo de Dados

KML Import → `kmlService` (Parse) → `useLayerStore` (State) → `MapView` (Render) → `PropertyInspector` (Edit)

---

## 💾 Persistência e Performance

- **Atual:** In-memory (Zustand) com suporte inicial para uploads de arquivos KML.
- **Otimização:** Uso de `L.canvas` e `Leaflet.markercluster` para suportar >5.000 pontos sem degradação de FPS.
- **Futuro:** SQLite via Electron para persistência de grandes volumes de dados geoespaciais.

---

## ⚠️ Decisões Críticas

- **Leaflet sobre Mapbox GL JS:** Maior facilidade para manipulação direta de camadas GeoJSON e ecossistema de plugins estável.
- **Uncontrolled Inputs (Refs/Keys):** Adotado pontualmente em formulários de alta frequência para evitar cascading renders no React.
- **Agnóstico Local:** Removida qualquer dependência de coordenadas específicas; o sistema funciona globalmente.

# ✅ Progresso — GIS MVP

## ✔️ Concluído (Sprint 1: Core & Ingestão)

### 🏗️ Setup & Infra

- [x] Projeto Vite + React 19 + TypeScript + pnpm.
- [x] Tailwind CSS configurado para Micro-UI.
- [x] Implementação de `.env` para tokens sensíveis.

### 🗺️ Mapa Base

- [x] Leaflet com renderizador Canvas (Performance).
- [x] Alternância entre 2D (OSM) e Satélite (Mapbox).
- [x] Sistema de Clusters para alta densidade de pontos.
- [x] Tooltips dinâmicos ("sticky") ao passar o cursor sobre objetos.

### 🗃️ Estado e Dados

- [x] Store Global com Zustand (Layers/Selection).
- [x] Serviço de processamento KML → GeoJSON.
- [x] Persistência de visibilidade (Toggle Layer).

### 🛠️ UI/UX

- [x] Sidebar fixa (240px) com Scroll customizado.
- [x] Property Inspector para edição de nomes de features.
- [x] Correção de bugs de sincronização de estado e cascading renders.
- [x] Ajuste de escala visual (Fontes 7-10px / Ícones size 8-10).

---

## 🚧 Próximos Passos (Sprint 2: Edição e Ferramentas)

### 🖋️ Edição de Geometria

- [ ] Integração de ferramentas de desenho (Point, Polygon).
- [ ] Edição de vértices em shapes existentes.
- [ ] Exclusão individual de geometrias via Inspector.

### 📏 Ferramentas GIS

- [ ] Régua de medição de distância (Métrica).
- [ ] Cálculo de área para polígonos.

### 💾 Persistência & Exportação

- [ ] Implementação de LocalStorage para salvar camadas entre sessões.
- [ ] Exportação do estado atual para arquivo GeoJSON/KML.
- [ ] Estudo de viabilidade IndexedDB para arquivos >5MB.

---

## 🎯 Meta Final do MVP

Sistema capaz de gerenciar territórios complexos, permitindo importar bases existentes, editar nomenclaturas e geometrias localmente, e exportar o resultado final com performance fluida.

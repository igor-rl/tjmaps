# ✅ Progresso — GIS MVP

## ✔️ Concluído (Sprint 1: Core & Ingestão)

- [x] Projeto Vite + React 19 + pnpm + Micro-UI.
- [x] Mapa com suporte a Canvas e Satélite (Mapbox).
- [x] Ingestão de KML para GeoJSON.
- [x] Property Inspector básico (Update Name) com supressão de linter.
- [x] Tooltips e Clusters de alta performance.

---

## 🚧 Sprint Atual (Sprint 2: Gestão de Estrutura e Listagem)

_Objetivo: Visualizar e organizar a hierarquia interna das camadas._

- [ ] **Refatoração do Store:** Adicionar suporte a `index` explícito nas features para espelhar a ordem do arquivo KML original.
- [ ] **Componente FeatureList:** - [ ] Criar lista rolável abaixo do Inspector (ocupando o Flex-1 da Sidebar).
  - [ ] Implementar seleção bidirecional (Clica na lista -> Seleciona no Mapa / Clica no Mapa -> Scroll até o item na lista).
- [ ] **Ordenação Dinâmica:** Implementar lógica de "Move Up/Down" para alterar a posição dos elementos no array.
- [ ] **Persistência de Ordem:** Garantir que a reordenação reflita na futura exportação do KML.

---

## 📅 Próximas Sprints

### Sprint 3: Edição e Inclusão (Geometria)

- [ ] Integração de ferramentas de desenho (Leaflet-Draw/Geoman).
- [ ] Inclusão de novos Pontos/Polígonos diretamente na camada selecionada.
- [ ] Edição de vértices (Drag to reshape).

### Sprint 4: Exportação Fiel

- [ ] Gerador de KML/GeoJSON que respeita a ordem definida na Sprint 2.
- [ ] Download do arquivo processado.

### Sprint 5: Persistência de Sessão

- [ ] LocalStorage/IndexedDB para manter as edições e ordens entre refreshes de página.

---

## 🎯 Meta da Sprint Atual

Ter uma Sidebar onde, após importar um KML, eu consiga ver todos os polígonos/pontos listados em ordem, clicar neles para inspecionar e ter uma área de scroll que preencha todo o espaço até o rodapé.

---

## ⚠️ Observações

- A Sidebar deve usar `flex-col` com o componente de lista usando `flex-1` e `overflow-y-auto`.
- A ordem inicial DEVE ser a ordem de leitura do XML do KML.

🚀 Progresso Atualizado — jwmaps GIS MVP
✔️ Concluído (Sprint 1: Core & Ingestão)
[x] Projeto Vite + React 19 + pnpm + Micro-UI.

[x] Mapa com suporte a Canvas e Satélite (Mapbox).

[x] Ingestão de KML para GeoJSON (togeojson).

[x] Property Inspector básico com supressão de linter.

[x] Tooltips e Clusters de alta performance.

🚧 Sprint Atual (Sprint 2: Gestão de Estrutura e Listagem)
Objetivo: Sincronizar a hierarquia da Sidebar com a viewport do Mapa.

[x] Componente FeatureList: Criada a lista virtualizada (TanStack Virtual) para 7k+ itens.

[x] Layout Flex-1: Sidebar estruturada com flex-col e área de scroll ocupando o espaço residual.

[x] Reordenação Local: Implementada lógica de Drag & Drop (Grip handle) no snapshot da lista.

[x] Correção de Navegação (FlyTo)

[ ] Remover elementos (polignos e pontos)

[ ] adiconar piontos no mapa

[ ] adiconar polignos

[ ] editar polignos

[ ] Persistir edicoes e criacao de pontos e polignos no kml original ou regerar e substituir.

[ ] Garantir map.invalidateSize() para evitar quebras de renderização no Electron.

[ ] Sincronização Bidirecional: Clique no Mapa -> Scroll automático na FeatureList.

📅 Próximas Sprints
Sprint 3: Edição e Inclusão (Geometria)

[ ] Integração de ferramentas de desenho (Leaflet-Geoman).

[ ] Edição de vértices (Drag to reshape).

Sprint 4: Exportação Fiel

[ ] Gerador de KML que respeita a ordem definida na Sprint 2.

[ ] Download do arquivo processado.

Sprint 5: Persistência de Sessão

[ ] IndexedDB Persistence: Salvar camadas e edições localmente (Crucial para o fluxo Desktop/Electron).

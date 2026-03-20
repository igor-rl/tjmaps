# ✅ Progresso — GIS MVP

## ✔️ Concluído

### Setup

- [x] Projeto criado com Vite + React + TypeScript
- [x] Dependências instaladas

### Mapa

- [x] Leaflet configurado
- [x] Mapa renderizando
- [x] Correção de ícones
- [x] Alternância de camadas

### Providers

- [x] OpenStreetMap (2D)
- [x] Mapbox Satellite Streets (satélite com ruas)

### Arquitetura

- [x] mapProvider criado
- [x] Uso de .env para token
- [x] Remoção de dependência do Esri

---

## 🚧 Próximos Passos

### Core GIS

- [x] Criar camada GeoJSON no mapa
- [x] Centralizar estado geográfico

---

### Importação

- [x] Input de arquivo KML
- [x] Conversão KML → GeoJSON (togeojson)
- [x] Render no mapa

---

### Barra de navegação semelhante ao google my apps

- [ ] Criar um componente separado do codigo principal para navegacao
- [ ] Incluir um dropdown com o titulo de cada camada. Cada camada possui pontos e polígnos, Quando o pai (nome da camada) for hide, todos os filhos nao devem ser exibidos no mapa

---

### Edição

- [ ] Integrar leaflet-draw
- [ ] Criar pontos
- [ ] Criar polígonos
- [ ] Editar shapes
- [ ] Remover shapes

---

### Persistência

- [ ] Criar interface Repository
- [ ] Implementar LocalStorageRepository
- [ ] Salvar GeoJSON
- [ ] Carregar ao iniciar

---

### Exportação

- [ ] Download de GeoJSON

---

## 🎯 Meta

Sistema funcional com:

- edição territorial
- importação KML
- persistência local
- exportação GeoJSON

---

## ⚠️ Observações

- Evitar abstrações desnecessárias
- Priorizar velocidade de entrega
- Manter arquitetura preparada para Electron

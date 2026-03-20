# 🧠 Arquitetura — GIS MVP

# Título: jwmaps

## 📌 Visão Geral

Sistema GIS rodando no browser (Vite + React), preparado para futura migração para Electron + SQLite.

O foco é entregar um MVP funcional rapidamente, mantendo uma base arquitetural evolutiva.

---

## 🧱 Princípios Arquiteturais

- GeoJSON é o formato interno único
- KML é apenas entrada/saída
- Persistência desacoplada via Repository
- Separação clara de responsabilidades:
  - UI (React)
  - Lógica (services)
  - Persistência (repository)
- Evitar overengineering

---

## 🗺️ Camada de Mapa

### Providers

- 🌍 2D: OpenStreetMap (gratuito)
- 🛰️ Satélite: Mapbox (Satellite Streets)

### Abstração

Arquivo:

src/services/map/mapProvider.ts

Responsável por:

- Encapsular providers
- Centralizar URLs
- Isolar token do Mapbox

Interface implícita:

getNormalLayer(): L.TileLayer
getSatelliteLayer(): L.TileLayer

---

## 🧠 Modelo de Dados

### Formato interno

GeoJSON.FeatureCollection

Motivos:

- padrão universal GIS
- compatível com Leaflet
- fácil persistência
- integração com @turf/turf

---

## 🔄 Fluxo de Dados

KML → (togeojson) → GeoJSON → (mapa / edição / validação) → persistência → exportação

---

## 💾 Persistência

### Atual (MVP)

- LocalStorage (mock)

### Futuro

- SQLite via Electron

### Abstração

repository/
├── interfaces/
└── implementations/

---

## 🧩 Estrutura de Pastas

src/
├── components/ # UI (React)
├── services/ # lógica (mapa, geo, etc.)
├── repository/ # persistência
├── types/ # tipos (GeoJSON)
├── utils/ # helpers

---

## 🔐 Configuração

Uso de .env:

VITE_MAPBOX_TOKEN=...

---

## 🚀 Estratégia Evolutiva

Hoje:

- Browser + LocalStorage

Depois:

- Electron
- SQLite real
- possível suporte offline
- troca de provider de mapa

---

## ⚠️ Decisões Importantes

- Mapbox adotado por necessidade de ruas (core)
- Abstração mínima de provider (sem overengineering)
- GeoJSON como fonte única de verdade
- Usamos sempre pnpm como gerenciador de pacotes

---

## 🎯 Objetivo do MVP

- Importar KML
- Converter para GeoJSON
- Visualizar no mapa
- Criar/editar shapes
- Persistir dados
- Exportar GeoJSON

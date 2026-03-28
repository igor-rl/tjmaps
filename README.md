# React + TypeScript + Vite

# START APP

```cmd
pnpm run dev
```

# Desenvolvimento
pnpm dev:electron

# Gerar instalador
pnpm build:electron

# Gerar Imagem de instalador:
rm -rf dist dist-electron release
pnpm build:electron
open release/TJMaps-0.0.0-arm64.dmg


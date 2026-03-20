FROM node:20-slim

# Instala apenas o essencial para builds nativos futuros (sqlite, etc)
RUN apt-get update && apt-get install -y \
  git \
  ca-certificates \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

# Ativa pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Mantém o container ativo para uso interativo
CMD ["sleep", "infinity"]
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copiar o código fonte
COPY src ./src

# --- Stage Final ---
FROM node:20-alpine

# Definir como produção para otimizações do Node
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copiar os módulos e o código da etapa do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package.json ./

EXPOSE 3000

# Evitar rodar com usuário root
USER node

CMD ["node", "src/index.js"]

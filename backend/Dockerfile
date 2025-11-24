# ---- Base image ----
FROM node:18-alpine AS base
WORKDIR /app

# Install openssl (sometimes needed by Prisma) and bash
RUN apk add --no-cache openssl bash

# ---- Dependencies layer ----
FROM base AS deps
COPY package*.json prisma/schema.prisma ./
RUN npm install
RUN npx prisma generate

# ---- Build layer ----
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Production runtime ----
FROM node:18-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl bash
ENV NODE_ENV=production

# Copy node_modules and built dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY prisma ./prisma

# Expose runtime port (Railway will override with $PORT)
EXPOSE 5000

# Run migrations then start server
CMD ["npm", "run", "start:migrate"]

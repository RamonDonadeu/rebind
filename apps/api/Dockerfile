# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# --- Dependencies ---
FROM base AS deps
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
RUN npm install

# --- Development ---
FROM deps AS development
COPY . .
RUN npm run db:generate -w @rebind/db
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["npm", "run", "dev"]

# --- Build ---
FROM deps AS build
COPY . .
RUN npm run db:generate -w @rebind/db
RUN npm run build -w @rebind/api

# --- Production ---
FROM node:22-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages ./packages

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["npm", "run", "start"]

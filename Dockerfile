# ---- build stage ----
    FROM node:20-slim AS build
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npx prisma generate && npm run build
    
    
    # ---- runtime stage ----
    FROM node:20-slim
    WORKDIR /app
    ENV NODE_ENV=production
    RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*
    COPY --from=build /app/package*.json ./
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/dist ./dist
    CMD ["node", "dist/src/main.js"]
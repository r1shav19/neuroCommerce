# ── Stage 1: Build the React client ──────────────────────────────────────────
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
# Pass empty placeholders so Vite doesn't crash on missing env vars
ARG VITE_HMAC_SECRET=placeholder
ENV VITE_HMAC_SECRET=$VITE_HMAC_SECRET
RUN npm run build

# ── Stage 2: Run the Node WebSocket + HTTP server ────────────────────────────
FROM node:20-alpine AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
# Copy built frontend into /app/client/dist (server will serve it)
COPY --from=client-build /app/client/dist /app/client/dist

# Cloud Run injects PORT automatically (default 8080)
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npx", "tsx", "index.ts"]

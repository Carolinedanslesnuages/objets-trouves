# Image de production : l'API Node.js sert aussi le front construit (une seule image à déployer).
# Construction : docker build --build-arg VERSION=$(cat version.txt) --build-arg COMMIT=$(git rev-parse HEAD) -t <nom> .
FROM node:24-bookworm-slim AS front
WORKDIR /app/front
COPY front/package.json front/package-lock.json ./
RUN npm ci --no-audit --no-fund --fetch-retries=5
COPY front/ ./
RUN npm run build-only

FROM node:24-bookworm-slim AS api
WORKDIR /app/api
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund --fetch-retries=5
COPY api/src ./src
COPY api/migrations ./migrations

FROM node:24-bookworm-slim
ARG VERSION=dev
ARG COMMIT=""
ENV NODE_ENV=production \
    PORT=8080 \
    FICHIER_BASE=/donnees/app.db \
    DOSSIER_FRONT=/app/front \
    VERSION_JSON=/app/version.json
WORKDIR /app/api
COPY --from=api /app/api ./
COPY --from=front /app/front/dist /app/front
# Contrat repo-version-json (format Dockerflow), lu par /__version__.
RUN printf '{"source":"","version":"%s","commit":"%s","build":"","code_date":"","changes":[],"history":[]}\n' "$VERSION" "$COMMIT" > /app/version.json \
 && mkdir -p /donnees && chown node:node /donnees
USER node
EXPOSE 8080
VOLUME ["/donnees"]
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:8080/api').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "src/main.ts"]

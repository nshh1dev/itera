FROM node:24.16.0-bookworm-slim@sha256:2c87ef9bd3c6a3bd4b472b4bec2ce9d16354b0c574f736c476489d09f560a203 AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development
COPY --chown=node:node . .
ENV NODE_ENV=development NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public/monaco .local/mail \
    && cp -R node_modules/monaco-editor/min/vs public/monaco/vs \
    && DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build node node_modules/prisma/build/index.js generate \
    && chown node:node /app && chown -R node:node src/generated public/monaco .local
USER node
EXPOSE 3000
# No usar npm run dev: su predev intenta iniciar el PostgreSQL nativo.
CMD ["node", "node_modules/next/dist/bin/next", "dev", "--hostname", "0.0.0.0"]

FROM dependencies AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma exige una URL al generar; no se conecta a esta base durante el build.
RUN mkdir -p public/monaco && cp -R node_modules/monaco-editor/min/vs public/monaco/vs \
    && DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
       BETTER_AUTH_URL=http://127.0.0.1:3000 \
       BETTER_AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))") npm run build

FROM dependencies AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/.local/mail && chown -R node:node /app/.local
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0"]

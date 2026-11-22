# Stage 1 — dependency & build
FROM node:22-alpine AS builder

WORKDIR /app

# pnpm dipin ke v9: pnpm 10 memblokir build script native (prisma/esbuild)
# kecuali di-approve manual → build container tidak reproducible.
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml ./
# --ignore-scripts: postinstall root (`prisma generate`) butuh folder prisma/
# yang belum di-COPY di tahap ini; generate dijalankan setelah COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm prisma generate && pnpm build

# Stage 2 — runtime
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

ENV NODE_ENV=production

# Dependensi & artefak build dibawa dari builder supaya `prisma migrate deploy`
# dan seed bisa dijalankan saat container start (tanpa langkah manual).
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3015

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "start"]

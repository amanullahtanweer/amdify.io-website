# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
# Astro inlines private import.meta.env values at build time, so these must be build args.
ARG POSTHOG_PROJECT_TOKEN=""
ARG POSTHOG_HOST=""
ENV ASTRO_TELEMETRY_DISABLED=1 POSTHOG_PROJECT_TOKEN=$POSTHOG_PROJECT_TOKEN POSTHOG_HOST=$POSTHOG_HOST
RUN npm run build && npm prune --omit=dev --legacy-peer-deps

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Pages read src/data/posts.json relative to the working directory at request time.
COPY --from=build /app/src/data ./src/data
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:4321/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server/entry.mjs"]

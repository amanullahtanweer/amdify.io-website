# amdify.io website

Marketing site and blog for https://www.amdify.io, built with Astro (server output, `@astrojs/node` adapter) and Tailwind CSS v4.

## Local development

Requires Node 22.12 or newer.

```sh
npm ci --legacy-peer-deps
npm run dev        # http://localhost:4321
npm run build      # production build into ./dist
node dist/server/entry.mjs   # run the production build locally
```

## Project layout

```text
src/
├── pages/
│   ├── index.astro          # landing page
│   ├── blog/                # blog index and [slug] post pages
│   ├── admin/               # post editor UI (see "Admin and API" below)
│   └── api/                 # posts and format API routes
├── data/posts.json          # blog posts, read at request time
├── layouts/  components/  lib/  styles/
public/                      # static assets
deploy/                      # Caddy snippet and server env example
scripts/deploy.sh            # one-command deploy
```

## Adding a blog post

Posts live in `src/data/posts.json`. Add or edit the entry, commit, push to `main`, then deploy (see below). Pushing alone does not publish anything.

## Deployment

The site is self-hosted in Docker (moved off Vercel in November 2026) on the same server as the AMDify dashboard.

| What | Where |
| --- | --- |
| Server | `root@91.98.168.202` |
| Project dir on server | `/root/amdify-website` |
| Container | `amdify-website` (Node, port 4321; host port 3002) |
| HTTPS / domains | Caddy from the grafana stack in `/root/grafana`, proxies `www.amdify.io` to `amdify-website:4321` and redirects `amdify.io` to `www` |
| Server env | `/root/amdify-website/.env` (never overwritten by deploys) |

### Deploying a change

You need SSH access to the server as root. From the repo root:

```sh
./scripts/deploy.sh
```

The script uploads the working tree (excluding `node_modules`, `dist`, `.git` and `.env*`), rebuilds the image with `docker compose build` and restarts the container. It prints the container status at the end; it should say `healthy` within about 30 seconds. It deploys your local files, so pull `main` first and deploy from a clean checkout.

Check it afterwards:

```sh
curl -sI https://www.amdify.io | head -1
ssh root@91.98.168.202 'docker ps --filter name=amdify-website; docker logs --tail 50 amdify-website'
```

### Environment variables

`POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` are set in `/root/amdify-website/.env` (template in `deploy/server.env.example`). Astro inlines private `import.meta.env` values at build time, so they are passed to `docker compose build` as build args. After changing them, redeploy.

### Things to know

- **The container filesystem is read-only on purpose.** `/admin` and the write routes in `/api/posts` have no authentication. On Vercel those writes failed because the filesystem was read-only; the container keeps that behaviour so nobody on the internet can create or delete posts. Publish posts through git and a deploy. Do not remove `read_only` from `docker-compose.yml` without adding auth first.
- **The container joins the `grafana_monitoring` Docker network** so Caddy can reach it by name. The server's firewall blocks container-to-host traffic, so Caddy cannot use the host port.
- **Do not modify the grafana stack** (`/root/grafana`: its compose file, containers, network or `Caddyfile`) without checking with the team first. The `www.amdify.io` and `amdify.io` blocks at the bottom of `/root/grafana/Caddyfile` came from `deploy/Caddyfile.snippet`. If you ever need to change them, back up the file first, then run `docker exec caddy caddy validate --config /etc/caddy/Caddyfile` and `docker exec caddy caddy reload --config /etc/caddy/Caddyfile` (reload, never restart the stack).
- DNS for `amdify.io` and `www.amdify.io` is in Hetzner DNS, both as A records to `91.98.168.202`.

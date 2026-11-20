import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import posts from './src/data/posts.json';

const blogUrls = posts.map(p => `https://www.amdify.io/blog/${p.slug}/`);

export default defineConfig({
  site: 'https://www.amdify.io',
  output: 'server',
  // Self-hosted in Docker on 91.98.168.202 (moved off Vercel); see scripts/deploy.sh
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap({
    filter: (page) => !page.includes('/admin/'),
    customPages: blogUrls,
  })],
  vite: {
    plugins: [tailwindcss()]
  }
});
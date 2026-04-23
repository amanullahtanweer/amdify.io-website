import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import posts from './src/data/posts.json';

const blogUrls = posts.map(p => `https://www.amdify.io/blog/${p.slug}/`);

export default defineConfig({
  site: 'https://www.amdify.io',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap({
    filter: (page) => !page.includes('/admin/'),
    customPages: blogUrls,
  })],
  vite: {
    plugins: [tailwindcss()]
  }
});
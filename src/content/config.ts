import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),           // e.g. "April 10, 2026"
    readTime: z.string(),       // e.g. "6 min read"
    category: z.enum(['Technology', 'Industry', 'Guides']),
    featured: z.boolean().default(false),
    author: z.string().default('amdify.io Team'),
    authorRole: z.string().default('Editorial'),
    coverImage: z.string().optional(), // path relative to /public, e.g. "/blog/cover.jpg"
  }),
});

export const collections = { blog };
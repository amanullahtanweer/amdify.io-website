import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    readTime: z.string(),
    category: z.enum(['Technology', 'Industry', 'Guides']),
    featured: z.boolean().default(false),
    author: z.string().default('amdify.io Team'),
    authorRole: z.string().default('Editorial'),
    coverImage: z.string().optional(),
  }),
});

export const collections = { blog };

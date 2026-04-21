import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/posts.json');

function readPosts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writePosts(posts: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    const posts = readPosts();
    const filtered = posts.filter((p: any) => p.slug !== slug);
    if (filtered.length === posts.length) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }
    writePosts(filtered);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { slug } = params;
    const body = await request.json();
    const posts = readPosts();
    const idx = posts.findIndex((p: any) => p.slug === slug);
    
    if (idx === -1) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Slugify helper
    const slugify = (s: string) => s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 80);

    // Calculate read time
    const wordCount = body.content?.split(/\s+/).filter(Boolean).length || 0;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const newSlug = body.slug?.trim() || slugify(body.title || posts[idx].title);

    const updated = {
      ...posts[idx],
      title:          body.title          ?? posts[idx].title,
      content:        body.content        ?? posts[idx].content,
      excerpt:        body.excerpt        ?? posts[idx].excerpt,
      category:       body.category       ?? posts[idx].category,
      author:         body.author         ?? posts[idx].author,
      coverImage:     body.coverImage     ?? posts[idx].coverImage,
      featured:       body.featured       ?? posts[idx].featured,
      seoTitle:       body.seoTitle       ?? posts[idx].seoTitle,
      seoDescription: body.seoDescription ?? posts[idx].seoDescription,
      slug:           newSlug,
      readTime,
      updatedAt:      new Date().toISOString(),
    };

    // If slug changed, remove old entry and keep position
    posts[idx] = updated;
    
    // If slug changed we need to handle that
    if (newSlug !== slug) {
      // Check no duplicate
      const duplicate = posts.find((p: any, i: number) => p.slug === newSlug && i !== idx);
      if (duplicate) {
        return new Response(JSON.stringify({ error: 'A post with this slug already exists.' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    writePosts(posts);
    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};
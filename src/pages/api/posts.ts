import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/posts.json');

function readPosts() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, '[]');
    return [];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writePosts(posts: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

// Calculate reading time from content
function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

// Generate URL-safe slug from title
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Format date nicely
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export const GET: APIRoute = async () => {
  const posts = readPosts();
  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body.title || !body.content || !body.category) {
      return new Response(JSON.stringify({ error: 'Title, content and category are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const posts = readPosts();
    const createdAt = new Date().toISOString();

    // Make slug unique if duplicate exists
    let slug = slugify(body.title);
    const existing = posts.find((p: any) => p.slug === slug);
    if (existing) slug = `${slug}-${Date.now()}`;

    const newPost = {
      slug,
      title: body.title,
      excerpt: body.excerpt || body.content.slice(0, 160).replace(/[#*_`]/g, '') + '...',
      content: body.content,
      date: formatDate(createdAt),
      readTime: calcReadTime(body.content),
      category: body.category,
      featured: body.featured === true,
      author: body.author || 'amdify.io Team',
      authorRole: body.authorRole || 'Editorial',
      coverImage: body.coverImage || '',
      createdAt,
    };

    // If this is featured, un-feature all others
    if (newPost.featured) {
      posts.forEach((p: any) => { p.featured = false; });
    }

    posts.unshift(newPost);
    writePosts(posts);

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to create post.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
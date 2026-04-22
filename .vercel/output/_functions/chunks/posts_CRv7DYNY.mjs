import fs from 'fs';
import path from 'path';
import { g as getPostHogServer } from './posthog-server_CwLS_Cr2.mjs';

const DATA_FILE = path.join(process.cwd(), "src/data/posts.json");
function readPosts() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, "[]");
    return [];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}
function writePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}
function calcReadTime(content) {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");
}
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
const GET = async () => {
  const posts = readPosts();
  return new Response(JSON.stringify(posts), {
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    if (!body.title || !body.content || !body.category) {
      return new Response(JSON.stringify({ error: "Title, content and category are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const posts = readPosts();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    let slug = slugify(body.title);
    const existing = posts.find((p) => p.slug === slug);
    if (existing) slug = `${slug}-${Date.now()}`;
    const newPost = {
      slug,
      title: body.title,
      excerpt: body.excerpt || body.content.slice(0, 160).replace(/[#*_`]/g, "") + "...",
      content: body.content,
      date: formatDate(createdAt),
      readTime: calcReadTime(body.content),
      category: body.category,
      featured: body.featured === true,
      author: body.author || "amdify.io Team",
      authorRole: body.authorRole || "Editorial",
      coverImage: body.coverImage || "",
      createdAt
    };
    if (newPost.featured) {
      posts.forEach((p) => {
        p.featured = false;
      });
    }
    posts.unshift(newPost);
    writePosts(posts);
    const sessionId = request.headers.get("X-PostHog-Session-Id");
    const posthog = getPostHogServer();
    posthog.capture({
      distinctId: "admin",
      event: "post_created",
      properties: {
        $session_id: sessionId || void 0,
        post_slug: newPost.slug,
        post_title: newPost.title,
        post_category: newPost.category,
        post_featured: newPost.featured
      }
    });
    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to create post." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

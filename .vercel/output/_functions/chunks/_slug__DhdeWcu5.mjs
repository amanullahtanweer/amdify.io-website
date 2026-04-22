import fs from 'fs';
import path from 'path';
import { g as getPostHogServer } from './posthog-server_CwLS_Cr2.mjs';

const DATA_FILE = path.join(process.cwd(), "src/data/posts.json");
function readPosts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}
function writePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}
const DELETE = async ({ params, request }) => {
  try {
    const { slug } = params;
    const posts = readPosts();
    const deletedPost = posts.find((p) => p.slug === slug);
    const filtered = posts.filter((p) => p.slug !== slug);
    if (filtered.length === posts.length) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    writePosts(filtered);
    const sessionId = request.headers.get("X-PostHog-Session-Id");
    const posthog = getPostHogServer();
    posthog.capture({
      distinctId: "admin",
      event: "post_deleted",
      properties: {
        $session_id: sessionId || void 0,
        post_slug: slug,
        post_title: deletedPost?.title,
        post_category: deletedPost?.category
      }
    });
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PUT = async ({ params, request }) => {
  try {
    const { slug } = params;
    const body = await request.json();
    const posts = readPosts();
    const idx = posts.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
    const wordCount = body.content?.split(/\s+/).filter(Boolean).length || 0;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    const newSlug = body.slug?.trim() || slugify(body.title || posts[idx].title);
    const updated = {
      ...posts[idx],
      title: body.title ?? posts[idx].title,
      content: body.content ?? posts[idx].content,
      excerpt: body.excerpt ?? posts[idx].excerpt,
      category: body.category ?? posts[idx].category,
      author: body.author ?? posts[idx].author,
      coverImage: body.coverImage ?? posts[idx].coverImage,
      featured: body.featured ?? posts[idx].featured,
      seoTitle: body.seoTitle ?? posts[idx].seoTitle,
      seoDescription: body.seoDescription ?? posts[idx].seoDescription,
      slug: newSlug,
      readTime,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    posts[idx] = updated;
    if (newSlug !== slug) {
      const duplicate = posts.find((p, i) => p.slug === newSlug && i !== idx);
      if (duplicate) {
        return new Response(JSON.stringify({ error: "A post with this slug already exists." }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    writePosts(posts);
    const sessionId = request.headers.get("X-PostHog-Session-Id");
    const posthog = getPostHogServer();
    posthog.capture({
      distinctId: "admin",
      event: "post_updated",
      properties: {
        $session_id: sessionId || void 0,
        post_slug: updated.slug,
        post_title: updated.title,
        post_category: updated.category,
        slug_changed: newSlug !== slug
      }
    });
    return new Response(JSON.stringify(updated), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

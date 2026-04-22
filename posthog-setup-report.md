<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the amdify.io Astro SSR website. The integration covers both client-side event tracking (via the PostHog JS snippet) and server-side event tracking (via `posthog-node`) for all key business actions.

**New files created:**
- `src/components/posthog.astro` — Client-side PostHog snippet component, initialized via environment variables and included in the shared layout
- `src/lib/posthog-server.ts` — Singleton server-side PostHog client using `posthog-node`

**Files modified:**
- `src/layouts/Layout.astro` — Imports and renders the `<PostHog />` component in `<head>`, enabling tracking on all pages
- `src/pages/index.astro` — CTA, Sign In, FAQ, and sales email click tracking
- `src/pages/blog/index.astro` — Blog category filter tracking
- `src/pages/blog/[slug].astro` — Post viewed, share, read completion, and article CTA tracking
- `src/pages/api/posts.ts` — Server-side post creation tracking
- `src/pages/api/posts/[slug].ts` — Server-side post update and deletion tracking

**Environment variables added to `.env`:**
- `PUBLIC_POSTHOG_PROJECT_TOKEN` — Client-side token (exposed to browser)
- `PUBLIC_POSTHOG_HOST` — Client-side host
- `POSTHOG_PROJECT_TOKEN` — Server-side token
- `POSTHOG_HOST` — Server-side host

| Event | Description | File |
|---|---|---|
| `cta_clicked` | User clicked a primary CTA button (Get in Touch, Get Started, Start Free Trial) | `src/pages/index.astro` |
| `sign_in_clicked` | User clicked the Sign In link to navigate to monitor.amdify.io | `src/pages/index.astro` |
| `faq_expanded` | User expanded a FAQ item to reveal the answer | `src/pages/index.astro` |
| `sales_email_clicked` | User clicked a Talk to Sales mailto link | `src/pages/index.astro` |
| `blog_post_viewed` | User viewed a blog post detail page (top of conversion funnel) | `src/pages/blog/[slug].astro` |
| `blog_filter_applied` | User filtered blog posts by category | `src/pages/blog/index.astro` |
| `blog_post_shared` | User shared a blog post via Twitter/X or copied the link | `src/pages/blog/[slug].astro` |
| `article_read_completed` | User reached 100% reading progress on a blog post | `src/pages/blog/[slug].astro` |
| `article_cta_clicked` | User clicked Try amdify.io Free CTA from within a blog article | `src/pages/blog/[slug].astro` |
| `post_created` | Admin successfully created a new blog post via the API | `src/pages/api/posts.ts` |
| `post_updated` | Admin successfully updated an existing blog post via the API | `src/pages/api/posts/[slug].ts` |
| `post_deleted` | Admin successfully deleted a blog post via the API | `src/pages/api/posts/[slug].ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/393120/dashboard/1498425
- **CTA Clicks Over Time:** https://us.posthog.com/project/393120/insights/rcBNtKLt
- **Blog-to-CTA Conversion Funnel:** https://us.posthog.com/project/393120/insights/8TW3zTfl
- **Top Blog Posts by Views:** https://us.posthog.com/project/393120/insights/yGZB4GYm
- **Blog Engagement Overview:** https://us.posthog.com/project/393120/insights/hI5MITnz
- **Sales Contact & Sign-In Actions:** https://us.posthog.com/project/393120/insights/cujWMj6r

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

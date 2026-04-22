import { PostHog } from 'posthog-node';

let posthogClient = null;
function getPostHogServer() {
  if (!posthogClient) {
    posthogClient = new PostHog("phc_yDiVEq45nVyMkzXgzoQBktKMmX24Wk9B94eb9fGtRnyp", {
      host: "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0
    });
  }
  return posthogClient;
}

export { getPostHogServer as g };

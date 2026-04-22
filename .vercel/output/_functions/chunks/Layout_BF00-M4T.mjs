import { c as createComponent } from './astro-component_CqRHSAfx.mjs';
import 'piccolore';
import { r as renderTemplate, o as defineScriptVars, q as renderSlot, l as renderHead, n as renderComponent, h as addAttribute } from './entrypoint_DECv9gIa.mjs';
import 'clsx';

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$Posthog = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Posthog;
  return renderTemplate(_a$1 || (_a$1 = __template$1(["<script>(function(){", `
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(apiKey || '', {
    api_host: apiHost || '',
    defaults: '2026-01-30'
  })
})();</script>`])), defineScriptVars({ apiKey: "phc_yDiVEq45nVyMkzXgzoQBktKMmX24Wk9B94eb9fGtRnyp", apiHost: "https://us.i.posthog.com" }));
}, "/Users/masoodkhalid/Projects/amdify.io-website/src/components/posthog.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "amdify.io — AI-Powered Answering Machine Detection",
    description = "Detect voicemails with 98.3% accuracy in under 200ms. AI-powered AMD that bolts onto your existing dialer. No migration, no disruption."
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template([`<html lang="en"> <head><!-- Google Tag Manager --><script>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-PK87MSV9');
    <\/script><!-- End Google Tag Manager --><meta name="google-site-verification" content="MtCOP7mJ990IyJ3LTIN4d0ehnKbjkoidAZ8HbCEaEs0"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"`, '><link rel="icon" type="image/png" href="/favicon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><title>', `</title><!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-MFWQYJQVFB"><\/script><script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MFWQYJQVFB');
    <\/script>`, "", '</head> <body class="min-h-screen"> <!-- Google Tag Manager (noscript) --> <noscript> <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PK87MSV9" height="0" width="0" style="display:none;visibility:hidden"></iframe> </noscript> <!-- End Google Tag Manager (noscript) --> ', " </body></html>"])), addAttribute(description, "content"), title, renderComponent($$result, "PostHog", $$Posthog, {}), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/Users/masoodkhalid/Projects/amdify.io-website/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };

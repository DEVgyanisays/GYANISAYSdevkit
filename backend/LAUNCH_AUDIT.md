# Launch audit and implementation checklist

25 October 2026. Scope: the running Node.js/SQLite application on port 4174, its served brand assets, public entry points, account screens, backend APIs and release packaging. The static port-4173 prototype is not a production deployment and must not be exposed as the launched website.

The owner explicitly deferred production-domain, Google Analytics and Search Console configuration. No production URL, Google token or analytics ID was invented. There is no claim of Google verification, Google collection, live email delivery or production hosting.

## Architecture findings and decisions

- The existing stack is a buildless Node HTTP server, SQLite and browser JavaScript; no framework migration or runtime dependency was introduced.
- Previously `/` returned an almost empty JavaScript shell. There was no public content registry, sitemap, robots policy, contact workflow or privacy notice. Unknown URLs returned JSON errors.
- `/about`, `/contact` and `/privacy` now return complete server-rendered HTML. The private workspace stays client-rendered with server-side authorization and `noindex`; exposing private records for SEO would be inappropriate.
- A shared `web/page-manifest.js` drives public metadata, sitemap entries and known private paths. Public page content lives in `src/public-site.mjs`. The old HTML entry is no longer served as an alternative document; `/index.html` redirects.
- `PUBLIC_URL` is validated and used for absolute canonical, social, schema and sitemap URLs. Local/staging indexing is disabled by default. Existing account links and one-time invitation/reset handling remain supported.

## Twenty-item checklist

| # | Improvement | Status | Evidence and remaining manual steps |
|---|---|---|---|
| 1 | SSR/prerendering | Completed | `public-site.mjs` renders complete public HTML; automated HTTP tests inspect content without JavaScript. Private account screens intentionally remain client-rendered and noindexed. |
| 2 | robots.txt | Completed | Dynamic `/robots.txt` disallows all crawling on local/staging. When explicitly enabled on production HTTPS, public crawling is allowed and API crawling is disallowed. Login/workspace pages remain crawlable enough to expose their `noindex` directives; robots is not an authorization mechanism. |
| 3 | sitemap.xml | Completed | `/sitemap.xml` is generated from the same public route registry as the site. It contains only canonical public pages when indexing is enabled, and no private/user records. Empty on staging intentionally. Set the real domain and enable indexing at launch; submission is deferred. |
| 4 | Unique titles | Completed | Each public page and named workspace view has its own title; private login, setup and reset states update titles. Entry aliases serve the same sign-in function and remain noindexed. Tests check public uniqueness. |
| 5 | Meta descriptions | Completed | Public descriptions are page-specific and server-rendered; account/workspace state descriptions update in place, without duplicate tags. |
| 6 | H1/heading hierarchy | Completed | One H1 per server-rendered page and workspace screen. Login's decorative slogan is a paragraph; sections use H2 and nested public cards use H3. HTTP/build checks verify server-rendered H1 counts; browser inspection verifies the workspace hierarchy. |
| 7 | Canonicals | Completed | One canonical per known page, derived from `PUBLIC_URL`; query strings and invitation/reset tokens are never included. Known trailing-slash and legacy aliases redirect. |
| 8 | Open Graph | Completed | Server-rendered title, description, canonical URL, site name and a local 1200×630 branded sharing image, plus a large-image Twitter card. No fabricated social profiles. |
| 9 | Custom 404 | Completed | Unknown routes return a branded HTML page with actual HTTP 404, noindex, and links to the workspace, About and Contact. Unknown API endpoints retain JSON 404 responses. |
| 10 | 301 redirects | Completed | Explicit local aliases (`index.html`, `privacy-policy`, `contact-us`, HTML equivalents) and known-page trailing slashes use HTTP 301. No arbitrary external redirect target is accepted. Domain/protocol redirects should be configured at the eventual hosting proxy. |
| 11 | Alt text | Completed | Brand images have meaningful alternatives where needed; decorative repeats use empty alt text. Dimensions are explicit to reduce layout shift. |
| 12 | Modern images | Completed | Three pixel-identical, lossless WebP brand assets with PNG fallbacks. Originals unchanged. Combined bytes: 463,285 → 286,628 (38.1% smaller). Pillow pixel comparison passes. AVIF is unnecessary for this small set of transparent brand assets. |
| 13 | Lazy loading | Completed | Below-fold footer mark uses native lazy loading; visible branding stays eager. Assistant UI is dynamically imported on first expansion and the model is invoked only on a question. |
| 14 | Organization schema | Completed | Public pages contain escaped JSON-LD Organization data with known name, URL and logo only; no invented address or legal registration. Non-home public pages also include BreadcrumbList. JSON parsing tests pass. Google rich-result validation awaits the real domain. |
| 15 | Breadcrumbs | Completed | Accessible labelled breadcrumb navigation on public subpages and authenticated workspace views; current page is marked. |
| 16 | Internal linking | Completed | Real anchor links connect public information, contact, privacy, applications and login; workspace navigation has deep URLs and back/forward handling. Release checks validate server-rendered internal links. |
| 17 | Consent-aware GA4 | Partially Completed | Basic opt-in loader, reject/withdraw controls, stored preference expiry and GPC/DNT handling are implemented and unit-tested. Only public pages can load it; query strings, referrers, form content and private workspace activity are excluded in application code. Owner deferred the measurement ID and external configuration. No Google collection is verified. Before enabling, turn off GA4 enhanced-measurement form interactions and review all property/data-stream settings; verify with Tag Assistant and DebugView. |
| 18 | Search Console | Partially Completed | Optional escaped verification meta token and maintainable sitemap are ready. Owner deferred domain/token configuration. DNS ownership, URL-prefix verification, sitemap submission and indexing are NOT verified. |
| 19 | Privacy policy | Partially Completed | `/privacy` describes actual application/account/enquiry collection, cookies, local assistant, rate limits, current provider configuration and absence of universal automated deletion. Controller identity/contact route, retention rules and final hosting/provider disclosures still need owner/legal review before launch; this is not a claim of legal compliance. |
| 20 | Working contact form | Completed | Real persisted Admin inbox; server-side input/length validation, signed expiring double-submit CSRF, same-origin checks, rate limiting, honeypot, retry deduplication, audit and access-controlled review. Works with JavaScript or native HTML POST/303. Tests verify receipt only after commit and error handling. No email delivery is claimed; enquiries are handled in Contact inbox. |

## Local RAG assistant

- Uses SQLite FTS5 full-text retrieval over maintained role-scoped workflow documents and current published library content. This is lexical/BM25 retrieval, not hosted embeddings or a vector service.
- Retrieves only authorised documents before local generation. Library sources require a currently signed undertaking. Sources are rechecked before returning generated responses. It does not search client notes, applications, passwords, financial rows or unrestricted filesystem content.
- Uses the already-installed Ollama `llama3.2:3b` model through loopback HTTP. No API keys and no cloud model are used. The URL validator rejects external model hosts and redirects are refused.
- Responses have source buttons that fetch the authorised source through a protected endpoint. Model text is rendered as text, never executable HTML. The assistant cannot perform actions or approve decisions. Generated answers can still be wrong; users should consult citations.
- If no matching source exists, it says so. If generation fails, times out, or returns invalid citations, it explicitly labels a retrieval-only fallback rather than pretending the model answered.
- Administrators can publish and retire custom guidance in Assistant knowledge with explicit audience roles and an audit reason. Do not put secrets or client records in guidance. Built-in guidance is maintained in `knowledge/workflows.json`; library material follows the current published version.
- Chat questions/answers are not written to persistent chat history or the API idempotency cache. Rate-limit counters are stored. Local generation is capped and does not hold the shared database request queue for its duration.
- The independent live test returned `mode: local_rag`, model `llama3.2:3b`, and a valid application/enrolment citation in approximately 24.4 seconds on this computer. Hosting needs its own installed local model and adequate CPU/RAM; this local result is not evidence of a deployed model service.

## Validation

- `npm test`: 38 tests passing, including existing backend regressions plus SSR, metadata, canonical redirects, noindex/crawler boundaries, contact persistence/CSRF/validation/PRG, role-filtered retrieval and analytics consent logic.
- `npm run test:rag-live`: actual local inference succeeded with a retrieved source citation. Test data stays in disposable test databases.
- `npm run build`: creates a versioned Node server release with a file/hash report, syntax checks, server-rendered internal-link/H1 checks and an explicit copy allowlist. No application database, backups, `.env`, session or credentials enter the release. This stack has no frontend framework compilation step.
- Lossless PNG/WebP pixel comparison passes for all three original brand assets.
- Live browser checks: signed-in admin workspace, accessible navigation/breadcrumbs, local assistant form/answer, public About/Contact/Privacy and branded 404. No real contact enquiry is inserted during browser QA.

## Required launch steps (deferred, not claimed complete)

1. Configure a real HTTPS `PUBLIC_URL`, secure data directory, reverse proxy, process supervision and backups. Keep port 4173's prototype out of production. Existing functional backend limitations in `IMPLEMENTATION_STATUS.md` remain applicable.
2. Review the published privacy notice, real operational data retention and provider details.
3. After public-page review, set `NODE_ENV=production` and `SEARCH_INDEXING_ENABLED=true`. The production setup-token requirement and Secure session cookies still apply. Verify robots, sitemap, canonical URLs and the 404 status on the real domain.
4. If analytics is wanted, configure the actual GA4 property, enhanced-measurement settings and consent testing before setting `GA4_MEASUREMENT_ID`. The blank default intentionally does nothing.
5. Complete Search Console ownership verification, then submit `/sitemap.xml`. Optional URL-prefix meta verification uses `GOOGLE_SITE_VERIFICATION`; DNS verification is managed with your domain provider.
6. Test a real contact enquiry on the deployed site and confirm it appears in the authorised Admin inbox. Email forwarding is not part of this workflow.
7. Install/verify the same local Ollama model on the host, keep its port private, and run the live RAG smoke test there. Do not expose Ollama directly to the internet.

## Official references used

- [Google crawler/indexing controls](https://developers.google.com/search/docs/crawling-indexing/control-what-you-share)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google consent-mode implementation](https://developers.google.com/tag-platform/security/guides/consent)
- [Search Console ownership verification](https://support.google.com/webmasters/answer/9008080)
- [Ollama API documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)

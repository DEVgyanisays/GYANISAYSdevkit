# Saarthi local backend

This is a working Node.js/SQLite implementation with persistent records. It is not the old browser-only prototype and it is not a complete implementation of every feature in the developer kit. See [implementation status](IMPLEMENTATION_STATUS.md) for the precise boundary.

## Run

Node.js 24 or newer is required. No npm packages need installing.

```powershell
cd "C:\Users\Ashar Prashant\OneDrive\Desktop\GYANISAYS\Saarthi developer kit v0.1.4\backend"
npm start
```

Open http://127.0.0.1:4174/. Port 4173 is the earlier prototype, not this backend.

The first screen creates the first administrator only while the database has no users. It is prefilled with **Mandeep sodhi** and **mandeep.sodhi@gyanisays.com**. The owner enters and confirms their own password. There are no default passwords or demo accounts. Setup closes after the first account is saved.

After signing in:

1. Publish the approved undertaking and Code of Ethics. Sign the undertaking to read protected library content.
2. Use Training & configuration to enter actual organisations, curriculum, module versions, batches and pay agreements. Use Batch curriculum to fix versions for future batches.
3. Invite faculty and mentors. Record appointment clearances and calibration evidence before assigning examiners.
4. Applicants use New user → Apply now without credentials. Review their application, record an acceptance/rejection reason, and enrol accepted applicants into a batch.
5. Enrolment creates an invited account and queues a single-use invitation. Email must be configured before the applicant can receive that link and set their password.
6. Use Database records, Activity log and Service status to inspect actual stored records and delivery state.
7. Coaches can open **My client batches** to create named groups from Aarambh clients already assigned to them. A coach can only group their own assigned clients; batch membership does not change the automatic coach assignment or the candidate's booking.

## Storage and account boundaries

- The local database is `data/saarthi.sqlite`. It survives server restarts. The original 111-table MySQL schema is translated at initialization; authentication, delivery, independent marking and other operational tables are added explicitly.
- Only reference vocabularies are loaded. No fake people, sessions, rates, assessments or curriculum are loaded into the application database.
- Login roles are checked against the account's database roles. Selecting Admin on the login form does not grant access. Admin and Finance have administrative access as the owner requested; faculty and mentors have assignment scopes; coaches access their own records.
- Passwords use salted scrypt. Session tokens and invitation/reset tokens are stored hashed. Sessions use HttpOnly/SameSite cookies, expiry and revocation. Authenticated writes require CSRF and idempotency headers.
- The outbox encrypts invitation/reset links with `data/outbox.key`. Keep that key with backups. Protect the entire data directory with operating-system permissions; the SQLite database itself is not encrypted at rest.
- Private coaching notes are excluded from the administrator's generic data browser. The original prototype JavaScript and localStorage data are not loaded by this site.

## Email and Aarambh

Copy `.env.example` to `.env` locally, then enter configuration there. Do not put passwords or API keys into chat or source control. The current email adapter uses Resend (`RESEND_API_KEY` and `EMAIL_FROM`). An SMTP-only service needs a separate adapter; it is not already connected.

Unconfigured email is recorded as blocked in Service status, never delivered. Invitations expire after 48 hours; admins can resend an invitation after configuring email. Reset links expire after one hour.

Aarambh connection is deferred at the owner's request. There is no fabricated assessment, booking, report, client response or letter validation. The provisional outgoing adapter and encrypted queue are present, but the real contract, authentication, inbound webhooks and staging tests must be finished before enabling it. Leaving its environment variables empty is intentional.

## Deployment boundary

This runs locally on one Node process and SQLite. It does not connect to MySQL and has not been deployed to the owner's hosting. Do not place the live SQLite database on a network share or synchronize an open database between computers. The current workspace is inside OneDrive; use a dedicated local server data directory for deployment.

For a deployment, set absolute `DATABASE_PATH`, a separate writable `DATA_DIR` for the outbox key, `PUBLIC_URL`, `NODE_ENV=production`, and a strong `SETUP_TOKEN` supplied through the hosting secret manager. Terminate HTTPS at a reverse proxy that preserves the configured Host header. Production enables Secure cookies and rejects HTTP public URLs. Multi-instance hosting and MySQL require a database adapter/migration; changing an environment variable does not implement that migration.

## Verify and back up

```powershell
npm test
npm run check
npm run backup
```

Tests create disposable isolated databases outside the real data directory and remove only those test directories. They cover authentication, permissions, application decisions, enrolment, actual persistence after restart, atomic failures, curriculum and marking, library text, policies, session consent/follow-up locks, public-card review, repeated slots and exact session-pay calculation. Passing them does not imply complete coverage of the kit or live service integration.

Backup uses SQLite `VACUUM INTO` for a consistent snapshot and copies the outbox key. Restore with the server stopped, preserve the original files first, and restore both the database and matching key. A backup has sensitive account and application data; store it privately. No automated remote backup destination is configured.

## Public pages, launch controls and local assistant

Read [LAUNCH_AUDIT.md](LAUNCH_AUDIT.md) for the complete 20-item checklist, verified evidence and deferred external setup. Public pages are `/about`, `/contact` and `/privacy`; authenticated views have `/workspace/...` URLs and remain noindexed. Public contact enquiries are stored in **Contact inbox** with a receipt reference; they are not emailed.

`SEARCH_INDEXING_ENABLED=false` is the safe local/staging default. The sitemap is generated from `web/page-manifest.js` and includes public routes only after explicit production HTTPS indexing is enabled. `PUBLIC_URL` must be the final origin, without a path. Google identifiers stay blank until the owner configures and verifies them. Do not enable GA4 enhanced-measurement form tracking.

The assistant uses SQLite FTS5 retrieval and Ollama on `LOCAL_MODEL_URL` (loopback only), with `LOCAL_MODEL=llama3.2:3b`. There are no model API keys. This computer already has Ollama and this model installed. A new hosting machine needs its own local runtime/model. Run `npm run test:rag-live` to check actual local inference; failure is reported rather than hidden. Custom role-scoped guidance can be maintained under **Assistant knowledge**. Published library text is available only after the user signs the current undertaking. Prompts and responses are not stored as chat history.

Run `npm run build` to assemble a versioned Node server release in `build/`. It validates syntax, public links and H1s, then copies only source/knowledge/assets/schema into the release. It does not copy `.env`, the database, backups or secrets. Deploy the entire release folder structure, not `web/` alone; SSR, sessions, contact submissions and RAG need the Node server. Keep existing live data outside the release, using `DATA_DIR` and `DATABASE_PATH`.

To regenerate WebP assets, run `scripts/optimize-images.py` with Python/Pillow. All three WebP brand marks preserve the original pixel dimensions and colours exactly; original PNG fallbacks remain unchanged. Pillow is not required to run the server.

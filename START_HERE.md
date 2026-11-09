# Start here — working Saarthi application

**Current application instructions · 25 October 2026**

The working application is saved in this project's `backend/` folder. Its interface is in `backend/web/`, server code in `backend/src/`, and persistent local database in `backend/data/saarthi.sqlite`.

- Double-click **Open Saarthi App.cmd** in the parent **GYANISAYS** folder. It starts the backend if needed and opens the working workspace.
- Or open **http://127.0.0.1:4174/workspace/home** while the server is running. Sign in with your real account credentials.
- To start manually, open a terminal in `backend/` and run `npm start` (Node.js 24+ required).
- Run **Start Saarthi.cmd**, then use **frontend/index.html** as the real app entry point. See TEAM_TESTING.md. The old prototype is retained in ui-original for reference only.
- The current app saves real records on the server. It is a local application, not yet a verified public production deployment. Deferred connections and incomplete workflows are listed in `backend/IMPLEMENTATION_STATUS.md` and `backend/LAUNCH_AUDIT.md`.
- Keep the `backend/data/` directory and its outbox key; it contains the real accounts and records. The launcher reuses this data.

## Original developer-kit reference

The instructions below describe the original kit and its sample-data review rig. They are retained as historical developer reference; use the application instructions above to access the current working version.

**kit v0.1 · 16 October 2026**

## The 5-minute picture

- **Saarthi** trains and certifies coaches. **SETU** is the app those coaches work in. One product, one database.
- **Aarambh** is a separate company's app. It assesses a person and draws their reports (Pancha Bhuta, Trayi;
  JD Sculptor role briefs; Paradox later). Saarthi **never** computes a reading — it pulls the finished result.
- The UI is **finished**. You build the API and database **behind** it, and the handshake with Aarambh.

## Read in this order

1. `README.md` — the rule, the map, the staging scope, the security rules
2. `INTEGRATION_AARAMBH.md` — the eight calls between the two apps
3. `BUILD_SPEC.md` — the work lifecycle and every screen's actions
4. `data-model.md` → `schema.sql` — the data
5. `API_CONTRACT.md` — the endpoints you build
6. `frontend/api.js` — the one front-end file you edit

## Setup checklist

1. Serve `frontend/` as static files and open `index.html`. It runs on its own sample data (localStorage).
   The screen list on the left is the review rig — click any screen. *(Optional: run Aarambh's laptop rig on
   port 8910 to see C5 load real report pages.)*
2. Create the database from `schema.sql`; load `seed.json`.
3. Build the endpoints in `API_CONTRACT.md`, enforcing each endpoint's rule on the server.
4. Swap the bodies in `frontend/api.js` for `fetch()` calls. Change nothing else in `frontend/`.
5. Agree `INTEGRATION_AARAMBH.md` with Aarambh's developer; exchange staging credentials; build your half.
6. Run `./build-spec-check.sh` after any change to the docs — it must print **PASS**.

## Ask before you assume

Open questions are listed at the end of `BUILD_SPEC.md` and in `INTEGRATION_AARAMBH.md` §3 (who assigns a coach).
Do not decide them in code.


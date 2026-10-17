# Changelog — Saarthi developer kit

## kit v0.1.4 — 17 October 2026 · same rig

`INTEGRATION_AARAMBH.md` §8 — *For the two developers to settle between them* (MS: the developers talk directly): the integrity read in the Pancha Bhuta coach view, the reliability detail in the payload (v1.3 change 5), the other v1.3 changes, receiving median answers and the early-end audit report, credentials and event names.

## kit v0.1.3 — 17 October 2026 · matches the rig as rebuilt 17 Oct

Rig rebuilt (review-list items 65–66) and `frontend/` re-split: the integrity read sits at the top of the Prep guide with the retake call beside it (`integCard`); the retake is called in C5 or C6 and the debrief is held — the after-debrief retake card is gone; C8 un-parked: no minimum length, red over 400 words, never blocks; the recommendation's one-line why is required at Submit. `BUILD_SPEC.md` rows updated; check PASS.

## kit v0.1.2 — 17 October 2026 · same rig

MS: prep questions lock at Live mode · a retake is called while reading the report or during the debrief, and **no debrief happens on that reading** (`retake_offers.called_at`, H6b `calledAt`) · the integrity read must be in front of the coach · coach-copy links last **3 hours**. Review-list item 65.

## kit v0.1.1 — 17 October 2026 · same rig

MS's answers to the staging questions: Gyani Says assigns coaches · Saarthi is built by Gyani Says on its own staging server · staging is one coach end to end · median answers go back to Aarambh and into the person's report · an early end goes to Aarambh as an audit report only after admin validates it · the recommendation's why is required · transcription to be built or connected. Recorded in `BUILD_SPEC.md` §5 and `INTEGRATION_AARAMBH.md` (H2, §7).

## kit v0.1 — 16 October 2026 · matches `Prototype/GYS_Coach_Platform_Rig_v0.3.html`

First kit. MS: "list what's needed to get Saarthi on staging" → "yes start the kit".

- **`frontend/`** — the rig split into `index.html` · `styles.css` · `app.js` · `api.js`, with its logos and
  icons in `assets/`. `api.js` holds the two seams: storage (`load`/`save`) and Aarambh (`listRig`/`fromRig`).
  Behaviour unchanged (checked: C5 loads a sitting from Aarambh's laptop rig through the seam). Rig chrome is
  still present and is listed in `BUILD_SPEC.md` § Rig only — the production shell is kit v0.2.
- **`INTEGRATION_AARAMBH.md`** — the two-way handshake: server-to-server trust, calls H1–H8, payload v1.2 and
  the changes wanted for v1.3, what Saarthi stores, Aarambh's names on the wire, the disposition sent back.
- **`data-model.md`** — every screen in storage shape, merged into 111 tables, derived values, security,
  open questions.
- **`schema.sql`** — MySQL 8 DDL, 111 tables; loaded cleanly into a throwaway database.
- **`seed.json`** — roles, languages, programme types, modules, enums, settings keys. No people, no money.
- **`BUILD_SPEC.md`** — the coach and debrief lifecycles, the role × screen matrix, every screen's actions with
  the server-side rule, rig-only list, open questions.
- **`API_CONTRACT.md`** — 174 endpoints (169 Saarthi's own, 5 inbound from Aarambh) with named server rules, outbound calls, api.js mapping.
- **`build-spec-check.sh`** — coverage of every UI action + sample-data lint. Prints PASS.

**Not in this kit:** the production shell (v0.2) · Aarambh's own endpoints (theirs to build from
`INTEGRATION_AARAMBH.md`) · real Question Bank and curriculum content · pay numbers.

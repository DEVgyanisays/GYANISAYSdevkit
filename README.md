# Saarthi — Developer Handoff Kit

**kit v0.1 · matches prototype build `Prototype/GYS_Coach_Platform_Rig_v0.3.html` · 16 October 2026**

> **New here? Open [`START_HERE.md`](START_HERE.md) first.** This file is the full map.

**Saarthi** is Gyani Says' coach platform: it trains and certifies coaches (Saarthi) and runs their work with
clients (**SETU**, the coach app inside it). The person's assessment and reports live in **Aarambh**, a separate
app owned by a separate company. The two meet only through the handshake in
[`INTEGRATION_AARAMBH.md`](INTEGRATION_AARAMBH.md).

This folder is the **single source of truth** for the developer team. It is a git repository; every version is
tagged `kit-vX.Y` and stamped to the prototype build it matches (`VERSION`).

---

## The one rule: build *behind* the front-end — do not rebuild it

The front-end in `frontend/` **is** the product UI: every screen, state and interaction, reviewed screen by screen
by MS. It ships **as-is**. The developer's job is the **JSON API + database behind it**, and the **server-to-server
handshake with Aarambh**.

```
  Frozen front-end  (frontend/index.html · app.js · styles.css)
        │  calls the same function names
        ▼
  frontend/api.js   ── localStorage + Aarambh's laptop rig   (prototype today)
                    └─ fetch → Saarthi API                   (production — the only file you wire up)
        │
        ▼
  Saarthi API  ──►  database (schema.sql)
        │   enforces every permission rule server-side (API_CONTRACT.md)
        ▼
  Aarambh API  ◄──►  server to server only (INTEGRATION_AARAMBH.md)
```

### What is still prototype in `frontend/` (to be removed for production)

The prototype is a **review rig**, so `app.js` carries things the live app must not have. They are listed in
`BUILD_SPEC.md` § "Rig only — not built" and are **switched off, not rebuilt**:

- the **screen list** down the left, review marks, the Decisions drawer, Rig controls, Reset, the P1 presenter
- **role switching in one browser** — in production the role comes from login (G10), and each role sees only
  its own screens (the matrix is in `BUILD_SPEC.md`)
- **Load a reading (JSON)** and **From the Aarambh rig on this laptop** in C5 — replaced by the H3 pull
- "Simulate" buttons in Live mode, the sample people and organisations in `seed()`

**Kit v0.2 will ship this production shell** (rig chrome off, role from the session). Until then, read the rig as
the frozen UI and the list above as what not to carry over.

---

## What's in this folder

| File / folder | What it is | Who edits it |
|---|---|---|
| `START_HERE.md` | The 5-minute picture, read order and setup checklist | MS / design, via this kit |
| `README.md` | This file — the rule and the map | MS / design |
| `INTEGRATION_AARAMBH.md` | **The handshake with Aarambh**: trust, the eight calls H1–H8, the reading payload, what Saarthi stores, the disposition that goes back | Both developers agree it |
| `data-model.md` | Every screen's data in storage shape, then the tables | MS / design |
| `BUILD_SPEC.md` | The work lifecycle, every screen's actions, who may do what | MS / design |
| `API_CONTRACT.md` | Saarthi's own endpoints, with the server-side rule on each | MS / design |
| `schema.sql` | MySQL DDL — the database | Developer implements it |
| `seed.json` | Synthetic starting data (roles, settings, one programme) — no real people | — |
| `frontend/` | The frozen front-end: `index.html`, `styles.css`, `app.js`, `api.js`, `assets/` | **Only `api.js`** |
| `build-spec-check.sh` | Proves every UI action is in `BUILD_SPEC.md` and no sample data is in the docs — must print **PASS** | — |
| `CHANGELOG.md` · `VERSION` | Kit history and the build it matches | MS / design |

---

## Staging scope — the first thing that has to work

Proposed (MS to confirm). One coach, end to end, on synthetic people:

1. Log in (G10 roles, password set by emailed link only).
2. Sign the **data undertaking** at first login (S1). No undertaking, no coach copy. (The Code of Ethics is signed in S4, before Provisional.)
3. See an assigned debrief (C4), with the booking from Aarambh (H2).
4. **Read both reports** in the Prep guide (C5): the person's copy and the coach copy of Pancha Bhuta and Trayi,
   pulled from Aarambh (H3, H4), plus what the person opened.
5. Build questions, run Live mode (C6), with Present mode showing only the person's copy.
6. Submit the after-debrief screen (C7–C10) → **the disposition goes back to Aarambh** (H6) → validation returns (H7).

Everything else in the rig (training admin, batches, faculty, capacity, pay, ratings review) is specified here
too, and follows staging.

## Security — the one place logic is written twice

Client-side checks are advisory. **Every rule below is enforced on the server**, on every call
(`API_CONTRACT.md` marks which rule applies to which endpoint):

- **Scope:** a coach sees only debriefs assigned to them; never another coach's notes.
- **Undertaking gate:** no coach copy, no `opened` list, no reading at all for a coach without a signed
  undertaking of the current version.
- **Present mode** is served the person's copy only.
- **Money** (rates, slabs, pay) is visible to **Finance admin** only.
- **No print, save or export** of a person's report or the coach's notes.
- **Every admin change needs a reason**, and is written to the activity log.
- **Admin never sees or sets a password.**
- **Access ends** when a coach is unassigned, the debrief closes, or an organisation's coach leaves — coach links
  are revoked at Aarambh in the same step (H-close).

## Versioning

On every handover: the prototype build → this kit regenerated → `VERSION` bumped → `CHANGELOG.md` → commit →
`git tag kit-vX.Y`. Never hand over a kit whose `VERSION` does not match the build being shipped.

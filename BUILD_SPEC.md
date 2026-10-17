# BUILD_SPEC — Saarthi by Gyani Says (with SETU, the coach app)

**kit v0.1 · matches `Prototype/GYS_Coach_Platform_Rig_v0.3.html` · 16 Oct 2026**

This is the build spec for the developer team. It covers how each screen behaves, every action a user can take,
who may take it, and the rule the **server** checks before allowing it. Read it with `data-model.md` for the storage
shapes, `API_CONTRACT.md` for the endpoints, and `INTEGRATION_AARAMBH.md` for the handshake with Aarambh (H1–H8).

- **The front-end is frozen.** `frontend/` is the product UI. You build the JSON API and MySQL database behind it,
  through `frontend/api.js`. Do not rebuild the screens.
- **Handler names** in `backticks` are the names the front-end uses. Where the rig does an action with an
  anonymous inline `onclick` / `oninput`, the action has a **proposed name** in backticks, marked
  *(inline in the rig)*. Build it as a real endpoint under that name. Where a part gave no proposed name, the
  backticked text is the state the rig writes (`inline:…`). Actions marked *(proposed — not in rig)* come from the
  spec and have no control in the rig yet.
- **No sample data appears here.** Data is described by role and type, never by example. `build-spec-check.sh` proves
  two things mechanically: every UI action in `frontend/app.js` is documented here, and this document carries no
  sample people, organisations or money.
- **Client checks are advice only.** Every rule in the "Server-side rule" column is enforced on the server, on
  every call. A hidden button is never the safeguard.

---

## 1 · The two lifecycles (the spine)

Every screen is a window onto one of these two lifecycles. Build them as the canonical states.

### 1a · A coach

```
apply (W1) → application → enrol (G2) → invited → first login (S1) → in_training (S2, S3)
  → exam (S4) → exam_passed → provisional (S4) → active
                                  ↘ provisional_lapsed (window ends) → provisional again (admin extends once)
  active / provisional → paused (admin, reason) → back to stage_before_pause
  any stage → withdrawn

  coaches.stage ENUM('invited','in_training','exam_passed','provisional','provisional_lapsed','active','paused','withdrawn')
```

| Step | What happens | Screen | Stored state |
|---|---|---|---|
| Apply | A member of the public applies as a coach or as a trainer/mentor. Nothing exists before this | W1 | `applications.state = new` |
| Application | Admin screens, interviews and offers a batch. States `new ⇄ screened ⇄ interviewing → offered → enrolled`, or `waitlisted → enrolled` when the seat type is full | G2 Applications | `applications.state` |
| Enrol | Admin takes a seat (in a transaction), creates the enrolment, the account and the invite, and for a coach requests their own Aarambh sitting. The coach type is set here: **ours** or **an organisation's** (the organisation is then required) | G2 `doEnrol` | `enrolments` row · `coaches.stage = invited` |
| Invited | The person has an account but nothing else opens | — | `enrolments.first_login_state = invited` · `users.state = invited` |
| First login | The person confirms their details, gives the confidentiality promise and signs the **data undertaking** at the current version. Nothing else opens until this is done. (The Code of Ethics is signed after the exam, in S4 — see Open questions) | S1 | `enrolments.first_login_state = confirmed` · `undertaking_signatures` · `coaches.stage = in_training` |
| In training | Five core modules in order, each signed off by faculty; library; practice debriefs on synthetic readings only; role tracks opened by admin | S2, S3 | `module_progress`, `coach_tracks` |
| Exam | Four parts (written, dossier practical, observed debrief, oral viva). A failed part is resat alone; at most 3 attempts per part, then an admin decision | S4 | `exam_attempts` |
| Exam passed | Read the Code of Ethics to the end and sign it; choose a time commitment | S4 | `coaches.stage = exam_passed`, `code_signatures`, `time_commitments` |
| Provisional | Credential issued (number generated once, server-side). A window of six months: supervised debriefs, mentor hours, mentor sign-off. Admin may extend **once** | S4, C1 | `coaches.stage = provisional`, `credentials` |
| Active | Reached automatically when the supervised debriefs, mentor hours and mentor sign-off are all done inside the window | S4, C1 | `coaches.stage = active` |
| Lapsed | The window closes without enough work. No new debriefs are assigned | C1, G1 | `coaches.stage = provisional_lapsed` · `credentials.status = lapsed` |
| Paused | Admin pauses from new bookings, with a reason. Booked work returns to the G3 queue | G1 | `coaches.stage = paused` · `stage_before_pause` · `credentials.status = paused` |
| Withdrawn | Terminal. The credential is withdrawn | G1 | `coaches.stage = withdrawn` · `credentials.status = withdrawn` |

**On top of the stage:**
- **Levels 1–4** come from role tracks passed in training (L1 Students · L2 Executives · L3 Mid-management · L4 Senior;
  `coach_tracks.track` ENUM('student','executive','mid_management','senior')) or all-rounder (`coaches.growth = allrounder`). Read-only outside training.
- **Ranks** Certified → Senior → Lead (`coaches.rank` ENUM('certified','senior','lead')) are set by admin with a reason. Senior or above may run further coaching (C12).
- **Two coach types** (`coaches.coach_type` ENUM('ours','org')). A coach of **ours** works for Gyani Says clients. A coach **appointed by an organisation**
  works only with that organisation's people; their access to readings ends when they are unassigned, the
  engagement closes, or they leave (G1 `endAccess`).
- **Category** A–D (D built but switched off) and **pay slab** sit on the coach record. The coach sees the category
  letter only, never the slab.

### 1b · A debrief

```
booking from Aarambh (H2) → unassigned (waiting in the G3 queue) → assigned → prep (reading pulled, H3 / H4)
  → Live mode → debriefed → after-debrief submitted within 24 h (H6) → validated  → closed (coach links revoked)
                                                                       ↘ sent back → resubmitted within 24 h ↗
side exits: cancel_early · cancel_late · noshow · held for a retake (on_hold + prep_stale)

  debriefs.status ENUM('unassigned','assigned','prep','debriefed','after','sentback','validated','closed',
                       'cancel_early','cancel_late','noshow')
```

| Status | What it means | Set by | Next |
|---|---|---|---|
| `unassigned` | A booking has arrived from Aarambh (H2) and needs a coach. Its queue row is `assignment_queue.state = waiting` (source `new`, `move_request`, `paused_coach`, …) | Booking feed, a move request, or a paused coach | `assigned` (queue row → `assigned`) · `cancel_early` · `cancel_late`; queue row → `cant_fill` |
| `assigned` | Admin chose a coach in G3; the meeting link is made; the coach is told in-app. Saarthi pulls the reading (H3) | Admin, G3 | `prep`, `cancel_early`, `cancel_late` |
| `prep` | The coach has prepared in the Prep guide (C5) and marked prep done. Coach-copy links come from H4, only behind a signed undertaking | Assigned coach, C5 | `debriefed`, `noshow`, `cancel_late` |
| (Live mode) | The 45-minute conversation runs in C6: Settle · Empathise · Think · Undertake. Consent is chosen at Settle | Assigned coach, C6 | — |
| `debriefed` | Live mode ended (completed or ended early with a reason). The 24-hour clock starts | `finishRun` | `after` |
| `after` | The after-debrief screen (C7–C10) is submitted. The disposition goes to Aarambh (H6). The per-session fee is earned here | `submitAfter` / `resubmit` | `validated`, `sentback` |
| `sentback` | Aarambh returned the letter with a comment (H7). Only the letter reopens | Aarambh validation | `after` via `resubmit` within 24 h |
| `validated` | Aarambh approved the letter (H7). It is released to the client, with a coaching key if "Continue with me" was recommended | Aarambh validation | `closed` |
| `closed` | Report access ends; Saarthi calls Aarambh to **revoke every coach link** for the debrief. The coach's own notes stay | System / admin | terminal |
| `cancel_early` | The client cancelled 48 h or more before. The slot reopens | Aarambh booking feed | terminal |
| `cancel_late` | The client cancelled under 48 h before. The slot closes; the coach is paid in part if prep was done | Aarambh booking feed | terminal |
| `noshow` | The client did not join; marked no earlier than 15 minutes after the start. Ratings skipped | Assigned coach, C6 | terminal |
| held for a retake | Not a status: `debriefs.on_hold = 1` and `prep_stale = 1`; `aarambh_readings.state = superseded`. Aarambh says the sitting was superseded (H5), or the coach offered a retake (`retake_offers`). The Prep guide refuses the old reading | H5 / `doRetake` | back to `assigned` on the new reading |

Only the assigned coach moves `assigned → prep → debriefed → after` and `sentback → after`. Only Aarambh's
validation sets `validated` / `sentback`. Cancellations come only from the booking feed. Every transition is
written to `debrief_status_log` with who, when and why.

---

## 2 · Roles and the permission matrix

### 2a · The seven roles

| Role | Who | May open |
|---|---|---|
| **Admin** (`admin`) | Gyani Says operations | Every G screen except money; G2 in full |
| **Finance admin** (`finance_admin`) | Gyani Says finance | Money and the roster: G1 slab, G4 money group, G6 tier rates, G7 |
| **Faculty** (`faculty`) | A trainer, external or a promoted coach | G2 faculty view: their own batches, the modules they own, marking, Question Bank proposals |
| **Mentor** (`mentor`) | Mentors provisional coaches (cap set in G4) | G2 mentor view: their own mentees only |
| **Coach (ours)** (`coach_ours`) | A coach working for Gyani Says clients | S1–S4, C1–C12 — their own work only |
| **Coach (organisation's)** (`coach_org`) | A coach appointed by an organisation | S1–S4, C1–C12 — their own work, for that organisation's people only. Access ends when unassigned, the engagement closes, or they leave |
| **Aarambh reviewer** (`aarambh_reviewer`) | Aarambh's validation team | The review login only (A1 validation, A2 leads, A3 audit). Never a G, S or C screen |

Two unsigned audiences also exist: the **Applicant** (W1, the public apply form) and the **Public** (the credential
verify page). One person may hold several roles (for example faculty and mentor). A trainee is a coach of either
type before Provisional. Nobody, Admin included, ever sees a coach's private notes.

### 2b · Role × screen

**W** = write · **R** = read · **—** = none · **R\*** = read with all money removed by the server ·
**own** = only the person's own record or the debriefs assigned to them.

| Screen | Admin | Finance admin | Faculty | Mentor | Coach (ours) | Coach (organisation's) | Aarambh reviewer |
|---|---|---|---|---|---|---|---|
| W1 Apply form (public) | R (via G2) | — | — | — | — | — | — |
| S1 First login | — | — | W own (undertaking, in induction) | — | W own | W own | — |
| S2 Core modules | — | — | R own batches (signs modules in G2) | — | W own | W own | — |
| S3 Role tracks and rank | — | — | — | — | W own (update modules) | W own | — |
| S4 Exam → Provisional → Active | — | — | — | — | W own | W own | — |
| C1 Coach home | — | — | — | — | W own | W own | — |
| C2 Coach profile | — | — | — | — | W own | W own | — |
| C3 Availability calendar | R (via G3) | — | — | — | W own | W own | — |
| C4 My debriefs | — | — | — | — | R own | R own | — |
| C5 Prep guide | — | — | R (practice) | R (questions, own provisional mentees) | W own | W own | R (*My understanding*, on audit) |
| C6 Live mode | — | — | R (practice runs sent to them) | — | W own | W own | — |
| C7–C10 After the debrief | — | — | R (Question Bank candidates, via G2) | R (reflection, own provisional mentees) | W own | W own | R + decision (via A1) |
| C11 Coach guide | — | — | — | — | R | R | — |
| C12 Coaching session | — | — | — | — | W own (Senior or above) | W own (Senior or above) | — |
| G0 Admin home | R (acknowledge alerts: W) | R | — | — | — | — | — |
| G1 Roster and grading + Requests | W\* (no slab) | W (slab included) | — | — | — | — | — |
| G2 Training admin | W | R (rate band on faculty records only) | W faculty view (own batches, owned modules, proposals) | R mentor view (own mentees) | — | — | — |
| G3 Assigning coaches | W | R | — | — | — | — | — |
| G4 Settings | W (non-money groups) · money group hidden | W (Money and packs) · R others | — | — | — | — | — |
| G5 Ratings review | W | R (receives slab requests) | — | — | — | — | — |
| G6 Upgrade tiers | R\* | W (tier rates) | — | — | — | — | — |
| G7 Slabs and payments | — | W | — | — | — | — | — |
| G8 Organisation engagements | W | R | — | — | — | — | — |
| G9 Capacity and demand | R\* | R | — | — | — | — | — |
| G10 People and access | W | R (activity log: own money entries) | — | — | — | — | — |

### 2c · Cross-cutting server rules (apply to every endpoint)

1. **Scope.** A coach sees only their own record and the debriefs assigned to them: never another coach's slots,
   debriefs, notes or hours. An organisation's coach sees only that organisation's people. Faculty see their own
   batches; a mentor sees their own mentees. Peer comparison returns anonymous hour totals only.
2. **Undertaking gate.** No signature of the **current** undertaking version → no coach copy, no "What they opened"
   list, no reading at all. Checked on every reading fetch. A new version re-locks everyone until they re-sign.
3. **Code of Ethics gate.** When a newer Code version is current, every coach endpoint returns 403
   "re-accept required" until the coach accepts it.
4. **Present mode** is served the person's copy only. It never receives a coach-copy link, notes or numbers.
5. **Money to Finance admin only.** Rates, slabs, fees, pay and prices are **left out of the API response** for every
   other role. Hiding them in the UI is not enough. The coach never sees a slab, rate or fee.
6. **Reasons and the activity log.** Every admin change needs a non-empty reason; the server refuses it otherwise.
   Every change is written to `activity_log` (who, role, what, before → after, reason, when) by the server. The log
   is append-only: no update or delete endpoint exists.
7. **Changes apply forward only.** Settings, pay terms and tiers take an `effective_from` of now or later. Bookings
   and sessions already made keep the value they were made under.
8. **No password handling by admin.** Admin never sees or sets a password. Resets go by an emailed single-use link;
   the token is stored hashed and expires.
9. **No print, save or export** of a person's report or the coach's notes. Report frames are sandboxed (no modals, no
   downloads, no referrer); Ctrl/Cmd-P and Ctrl/Cmd-S are blocked on C5 and C6; the print stylesheet blanks the page.
   No download endpoint exists for library documents, CVs or readings.
10. **Access ends.** When a coach is unassigned, the debrief closes, or an organisation's coach leaves, reading access
    stops at once and Saarthi revokes the coach links at Aarambh in the same step.
11. **First name only.** Coach-facing and admin-facing payloads carry the client's first name and client type only.
    Never a surname, contact detail, money, slab or category.
12. **Only the finished reading crosses.** Saarthi never stores raw answers, raw scores, timings or item ids, and never
    computes a level, lane, gap band, caret or integrity. Intake drops everything else and logs the **names** of the
    fields it dropped.
13. **Server time.** Every date written (signatures, submissions, credential issue) is set by the server, never taken
    from the client.

---

## 3 · Screens and actions (journey order)

Each screen gives its purpose, who uses it, and its actions: **handler · what it does · who may · server-side rule**.

### W1 · Apply form

- **Purpose:** the public apply form on the Gyani Says website (built by Gyani Says; it posts into Saarthi). One
  submission per person per round; the arrival link carries a source tag.
- **Who:** an Applicant, not signed in, applying as a coach or as a trainer/mentor.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `inline:S.w1.as` *(inline in the rig)* | Choose coach or trainer | Applicant | Value from the enum |
| `inline:S.w1.<field>` *(inline in the rig)* | Fill the text fields (name, phone, email, years, current work, experience, qualifications, city) | Applicant | Length limits; strip markup |
| `inline:S.w1.cv` *(inline in the rig)* | Attach or remove a CV | Applicant | PDF only; size cap; virus scan; stored private; read inside Saarthi only |
| `w1Lang` | Cycle a language: none → Secondary → Primary → none | Applicant | Language code from the list |
| `inline:S.w1.band` · `inline:S.w1.mode` · `inline:S.w1.window` *(inline in the rig)* | Single-choice chips: time band, attend mode, start window | Applicant | Value from the enum or admin list |
| `w1Tog` | Toggle a multi-choice chip (preferences, days) | Applicant | Values from the list |
| `inline:S.w1.consent` *(inline in the rig)* | Tick the privacy agreement | Applicant | Required; store the text version and the time |
| `w1Submit` | Create the application (state `new`, with the source tag) | Applicant | **Public endpoint:** rate limit and bot protection; name + (phone or email) + city + at least one language + consent; de-duplicate a still-`new` application from the same contact; never echo existing data back |
| `inline:S.w1.submitted=false` *(inline in the rig)* | Back to the form after submitting | Applicant | Client only |

### S1 · First login — confirm details

- **Purpose:** the once-only first sign-in after enrolment. The person checks their details (read-only, copied from
  the application), gives the confidentiality promise and signs the data undertaking. Nothing else in Saarthi opens
  until it is confirmed.
- **Who:** a trainee (either coach type), and a newly enrolled trainer in induction (for the undertaking).

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `inline:S.s1.photo` *(inline in the rig)* | Add or remove a photo | Trainee (self) | Own record; image type and size; not public until the card is approved (C2) |
| `inline:S.s1.bio` *(inline in the rig)* | Edit the short bio | Trainee (self) | Own record; length cap |
| `inline:S.s1.conf` *(inline in the rig)* | Give the confidentiality promise | Trainee (self) | Own record; timestamp set by the server |
| `inline:S.und` *(inline in the rig)* | Sign the data undertaking at the current version | Trainee (self) | Version = current published; date set by the server (the rig hard-codes it); once confirmed the coach cannot withdraw it |
| `inline:S.own.state` *(inline in the rig)* | "Open my assessment": opens the person's own Aarambh sitting | Trainee (self) | State becomes `done` only from Aarambh's callback; no reading content is stored |
| `inline:modal(Something wrong)` *(inline in the rig)* | Send a detail-correction request to admin | Trainee (self) | Own record; lands in the G1 Requests inbox |
| `inline:S.firstLogin='confirmed'` *(inline in the rig)* | Confirm and open Saarthi | Trainee (self) | Promise given **and** undertaking signed at the current version; idempotent |
| `inline:S.stage='training';go('S2')` *(inline in the rig)* | "Go to core modules" | Trainee | Navigation only |

### S2 · Core modules

- **Purpose:** the five core modules in order, the trainee's batch and next session, the library, and practice
  debriefs. The library stays open after certification.
- **Who:** a trainee; certified coaches for the library.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `inline:library search` *(inline in the rig)* | Search the library documents | Trainee / coach | Signed in; undertaking signed; results read in-app only (no download endpoint) |
| `libOpen` | Open a library document; mark it read at its current version | Trainee / coach | As above; writes the read record |
| `startPractice` | Start a practice debrief: opens C6 in practice mode on a synthetic reading | Trainee | Own enrolment; synthetic reading only; **never written to client history** |

Module states: `locked → in_progress → done` (faculty signs). Modules open strictly in order.

### S3 · Role tracks and rank

- **Purpose:** the coach's rank, level, the four role tracks, update modules waiting, the rank ladder, the
  Advanced Programme and any organisation track. Admin opens tracks; the coach never chooses.
- **Who:** a trainee and a certified coach (mostly a read view).

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `inline:S.updates[...].state='done'` *(inline in the rig)* | "Open the update module": complete a waiting update module | Coach (self) | Own assignment; coach must be provisional or active; sets the completed time |

The "Show: in progress / passed / programmes changed" buttons are rig demo toggles (see §4). In the build those states
are set by admin and faculty.

### S4 · Exam → Provisional → Active, and the credential

- **Purpose:** three views by stage — the exam (in training) · sign the Code and choose time (exam passed) · the road
  to Active and the credential (`provisional`, `provisional_lapsed`, `active`). The public verify page reads from here.
- **Who:** the trainee / coach (self); the Public for verify.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `inline:S.code.read` *(inline in the rig)* | Scrolling to the end records that the Code was read; unlocks signing | Passed trainee (self) | Server stores the read-to-end time; signing is refused without it |
| `inline:S.code.signed` *(inline in the rig)* | Sign the Code at the current version (including the public rating) | Passed trainee (self) | Stage `exam_passed`; read to end recorded; version = current; date set by the server |
| `inline:S.commit.band` *(inline in the rig)* | Choose the time band | Passed trainee (self) | Value from the enum |
| `togCommit` | Toggle a day or a time of day | Passed trainee (self) | Values from the list |
| `inline:S.commit.months` *(inline in the rig)* | Choose how many months | Passed trainee (self) | One of the allowed values |
| `inline:S.stage='provisional'` *(inline in the rig)* | "Issue my credential": issue the Provisional credential and open the calendar | Passed trainee (self) | All four exam parts passed; Code signed at the current version; band chosen; undertaking signed; credential number generated **once, server-side** (never edited or reused); sets the six-month window; idempotent |
| `inline:Download credential` *(inline in the rig)* | Download the credential PDF | Provisional / active coach (self) | Own credential; not withdrawn; PDF generated server-side |
| `verifyModal` | The public verify page for a credential number | Public | Returns only number, name, status, rank, level, issued, valid to; rate-limited; no search by name |

Exam marks are returned to faculty and admin only, never to the coach. Moving to Active is automatic when supervised
debriefs, mentor hours and mentor sign-off are complete within the window.

### C1 · Coach home

- **Purpose:** the landing screen after login. One home that changes with the stage (training → passed →
  provisional → provisional_lapsed → active): the next debrief, what is due, what was sent back, changes, hours and work this
  month, and notices of a new Code or coach guide.
- **Who:** every coach, every session.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `startPractice` | Opens Live mode on the synthetic practice reading | Coach in training | Synthetic only; never client history |
| `startRun` | Opens Live mode for the next debrief, creating its run if none | Coach | Own debrief; status `prep` (or `assigned` from C5); not closed or cancelled |
| `acceptCode` *(inline in the rig)* | Accept the new Code of Ethics version; the banner clears | Coach | "I have read and accept" ticked; writes a `code_signatures` row for the current version; until then every other coach endpoint returns 403 |
| `ackGuide` *(inline in the rig)* | "I've read this" on a coach guide update | Coach | Writes the acknowledgement for that guide version; idempotent |
| Navigation to C5 / C7 / C8 / S2 / S4 / C2 / C3 / C11 | Opens the debrief's next screen or another screen | Coach | Own debrief only; no endpoint of its own |

Hours and "work this month" are computed on the server from completed sessions, not stored figures. The changes feed
is read from the coach's notices (the rig hard-codes it).

### C2 · Coach profile

- **Purpose:** the read-only Saarthi record (credential, rank, level, tracks, languages, category letter) plus three
  things the coach controls: their monthly hours target, a request to change their commitment band, and their public
  "About your coach" card. Peer comparison shows hours only.
- **Who:** a certified coach.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `verifyModal` | Shows the public verify result for the credential | Anyone with the number | As in S4 |
| `togSpec` | Add or remove a speciality on the public card; the card returns to draft | Coach | Own card; value from the fixed list; **at most 3** |
| `setHoursTarget` *(inline in the rig)* | Set the monthly hours target | Coach | Own record; allowed values only; no approval; no effect on rostering |
| `requestBandChange` *(inline in the rig)* | Ask admin to change the commitment band | Coach | Creates a `requests` row (type `time_commitment`) and a `time_commitments` row (state `pending_approval`); one open at a time; band changes only when admin approves (G1 `reqDo`) |
| `editCardWorked` *(inline in the rig)* | Edit "Who I've worked with"; card → draft | Coach | Own card; length cap; no contact details or money |
| `editCardAbout` *(inline in the rig)* | Edit "About me" with a live word count; card → draft | Coach | Own card; at most 80 words, checked server-side; no contact details, handles or money |
| `toggleCardPhoto` *(inline in the rig)* | Add or remove the card photo; card → draft | Coach | Own card; image upload; admin approval before public |
| `submitCard` *(inline in the rig)* | "Send for approval" | Coach | Own card; `coach_public_cards.status` `draft → pending`; creates a `requests` row (type `public_card`); only an approved card is published. The last approved version stays live until a new one is approved |

The public rating shows only from five ratings. The card never shows level, category, slab or anything about a client.
There is **no rate view** on C2.

### C3 · Availability calendar

- **Purpose:** the coach opens and closes 45-minute slots, marks days unavailable, and asks admin to move a booked
  debrief. The coach **cannot book**; clients pick a time on Aarambh (which never shows coach names) and admin
  assigns. Open slots are pushed to Aarambh (H1).
- **Who:** the coach. Admin sees the same slots from G3.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `genSlots` | Open slots every hour between a day start and end on a date, repeated weekly for N weeks | Coach | Own slots; **reject any slot inside the 72-hour lock** (the rig checks this only in `addDay`); skip unavailable dates; no duplicates or overlaps (slot + gap) |
| `closeSlot` | Remove an open slot | Coach | Own slot; status `open`; refused inside the 72-hour lock; a booked slot can never be closed by the coach |
| `freezeAsk` | For a locked open slot: "what do you need, and why?" → to admin | Coach | Own slot; creates a `requests` row (type `locked_slot`) in the G1 inbox |
| `askMove` | For a booked slot: give a reason → move request to admin | Coach | Own booked slot; creates a `requests` row (type `move_debrief`); under 48 h it is a **late drop** (`requests.is_late_drop`, a `late_drops` row) (logged; flag at 2 a month in G5; lower in G3 suggestions for a set number of days); the coach can never cancel a booking |
| `markUnavailable` | Record a date range or a weekday as unavailable; closes open slots on those dates; asks what to do about booked slots | Coach | Own record; open slots inside the 72-hour lock become `locked_slot` requests instead of being removed (the rig removes them — gap); booked slots are never removed |
| `_unApply` | From the booked-slot prompt: apply the unavailability and raise a reassign request for each booked slot | Coach | As `askMove` for each slot; the late-drop rule applies per slot |
| `removeUnavailable` *(inline in the rig)* | Remove an unavailability entry | Coach | Own record; does not reopen closed slots |
| `monthShift` | Month grid previous / next | Coach | Reads own slots for the month |
| `dayModal` | Open a day: its slots, per-slot actions, an "add times" form | Coach | Reads own slots for that date |
| `addDay` | Open times on one day from the day dialog | Coach | Own slots; refused inside the 72-hour lock ("ask admin"); same rule as `genSlots` |
| `setCalView` *(inline in the rig)* | Day by day / Month | Coach | UI only |

Lock window, no-booking window and late-drop line are G4 settings. All times are India time.

### C4 · My debriefs

- **Purpose:** every debrief and coaching session assigned to the coach, in three tabs (Upcoming · Needs action ·
  Done), each row jumping to its next step. There is no accept step.
- **Who:** the coach.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `setDebriefTab` *(inline in the rig)* | Switch tab | Coach | Own debriefs only |
| `searchDebriefs` *(inline in the rig)* | Filter by client first name | Coach | Own debriefs; first name only |
| `openDebrief` *(inline in the rig)* | Open the debrief at its next screen (C5, C6, C7, C8 or C12) | Coach | Own debrief; report access closes at `closed` (own notes stay) |
| `startRun` | "Live mode" on a `prep` row | Coach | Own debrief; status `prep` |

### C5 · Prep guide

- **Purpose:** about 45 minutes of preparation before the debrief. The coach reads both copies of the report side by
  side with the probe points Gyani Says' rules raise, builds questions under Empathise / Think / Undertake, writes
  their understanding and private notes, and marks prep done. Refused when the reading has been superseded (stale).
- **Who:** the assigned coach; a trainee in practice mode on a synthetic reading. Mentor and faculty may read the
  questions; Aarambh may read *My understanding* on audit.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `useReading` | Takes a received payload, runs `normalise`, stores the reading, updates the header, shows the intake report | API job (H3) / admin | Store only the allowed fields; drop raw scores, item answers, timings, full name, contact details; log dropped field **names**; supersede any earlier active reading for the debrief; reject an invalid integrity |
| `normalise` | Maps the payload to the stored shape; splits each report into person / coach links; reads "opened" | Server | Never derives a level, lane or gap from raw numbers |
| `points` | Turns stored traits into probe points and suggested questions | Server or client | Gyani Says' rules only |
| `addQ` | Add a suggested or Bank question (step, why, note) to My questions | Assigned coach | Refuse duplicates |
| `addOwn` | Add a blank coach-written question under a step | Assigned coach | Source = own |
| `qEdit` | Edit a question's text; re-runs the wording check | Assigned coach | Wording check advisory here |
| `qSet` | Set a question's *why* or *note* | Assigned coach | *why* from the enum |
| `qDel` | Remove a question | Assigned coach | Own debrief |
| `qOpts` | Add two blank options to a question, or remove all options | Assigned coach | 2–4 options |
| `editOption` *(inline in the rig)* | Edit one option's label or follow-up | Assigned coach | Length caps |
| `checkQ` | Wording check (directive, closed start, blaming "why", two in one, levels or numbers) | Client + server | Same list runs on save; returns warnings |
| `proposeToBank` *(inline in the rig)* | Propose an own question to the Question Bank | Assigned coach | Creates a Bank proposal; faculty approve in G2 |
| `browseBank` *(inline in the rig)* | Browse Bank questions by trait (report traits first) | Assigned coach | Read-only Bank |
| `ackCaution` *(inline in the rig)* | Tick the caution acknowledgement | Assigned coach | Required before prep done when integrity is Caution |
| `saveUnderstanding` · `savePrivateNotes` *(inline in the rig)* | Autosave *My understanding* / private notes | Assigned coach | Private notes never leave the coach; understanding readable on Aarambh audit |
| `markPrepDone` *(inline in the rig)* | Mark prep done; debrief `assigned → prep` | Assigned coach | Refused when integrity is Caution and not acknowledged |
| `togglePoints` *(inline in the rig)* | Show every point / Show fewer | Assigned coach | UI only |
| `undSigned` | Is the current undertaking signed? | Server | Gate for every coach-copy and "opened" request |
| `repList` | The report links for this debrief | Server | Returns coach links only when `undSigned`; links issued fresh from H4, short-lived and signed, never stored |
| `repPane` | Draws the report tabs and the sandboxed frame; lock box for an unsigned coach copy | Client | Sandbox without modals or downloads; no referrer |
| `integCard` | The **integrity read** at the top of the Prep guide (Aarambh's word, what it means, a link to the Trayi coach copy's reliability strip) with the retake call beside it — MS, 17 Oct 2026 | Assigned coach | The fuller read opens only behind `UNDERTAKING`; the retake call is refused once this coach has called one for this person |
| `pickReportTab` *(inline in the rig)* | Pick which copy / report shows | Assigned coach | Coach-copy tab refused without the undertaking |
| `openedList` | "What they opened", most opened first, with a jump to the coach copy | Assigned coach | **Only with the undertaking signed**; else a locked card linking to S1 |
| `seeInCoachCopy` · `openReportWindow` *(inline in the rig)* | Jump to the matching coach-copy tab; open a report in its own window | Assigned coach | Undertaking signed; the coach-copy button is not rendered without it |
| `setReportLayout` *(inline in the rig)* | Hide / show report, swap sides, read it full width | Assigned coach | Saved to the coach's preferences |
| `bindGutter` | Drag the middle line to resize the split (25–70 %) | Assigned coach | Saved to preferences |
| `repZoom` | Report zoom − / + (60–160 %) | Assigned coach | Saved to preferences |
| `blockPrintSave` *(inline in the rig)* | Blocks Ctrl/Cmd-P and Ctrl/Cmd-S | Client | Plus a print stylesheet that blanks the page |
| `startRun` | Open Live mode for this debrief | Assigned coach | See C6 |

In production the reading arrives by H3 at assignment. The rig's "Load a reading" dialog is a laptop test stand-in
(see §4).

### C6 · Live mode

- **Purpose:** the 45-minute conversation: Settle 5 · Empathise 7 · Think 23 · Undertake 10 minutes. The coach marks
  each prepared question, captures what the person said, adds follow-ups and jots, and can switch to Present mode to
  show the person's own copy. Ending builds the start of the letter.
- **Who:** the assigned coach, with the client. In practice mode, a trainee with a synthetic client (sent to faculty,
  never stored as client history).

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `startRun` | Creates (`freshRun`) or resumes the run and opens Live mode | Assigned coach | Own debrief; an active (not superseded) reading |
| `startPractice` | Start a practice run on a synthetic client | Trainee | Synthetic only |
| `freshRun` | New run: step S, no consent, booking consent carried | Server | — |
| `setConsent` *(inline in the rig)* | Consent tile: Record · Transcript only · Neither; flags a change from booking | Assigned coach | The session choice counts and admin sees a change; Neither → the transcript tool must not start; Transcript only stays mocked until legal sign-off |
| `tickCovers` · `tickConfidentiality` *(inline in the rig)* | Tick the Settle items | Assigned coach | Own run |
| `lmGo` | Move to a step; logs forward moves and step-backs | Assigned coach | **Refused for any step but Settle until consent is chosen** |
| `setStateL` | Set the client-state chip and when it started | Assigned coach | Own run |
| `toggleStatePicker` *(inline in the rig)* | Open / close the state picker | Assigned coach | UI only |
| `markQ` | Mark a question Covered or Put aside (tap again to clear) | Assigned coach | Own run |
| `pickOpt` | Record the quick option chosen (clears the follow-up answer) | Assigned coach | Own run |
| `saveAnswer` *(inline in the rig)* | Save "What they said", a follow-up answer, or an added follow-up's answer | Assigned coach | Never required |
| `addFollow` | Add an on-the-spot follow-up under the current question | Assigned coach | Becomes a Question Bank candidate (`sendCand`) |
| `addJot` | Save a quick jot tagged to the step and minute | Assigned coach | Own run |
| `isTyping` · `nudges` | Keep the screen from redrawing while typing; work out which nudges to show | Client | — |
| `dismissNudge` *(inline in the rig)* | Step back as suggested, or dismiss a nudge | Assigned coach | UI only |
| `toggleMenu` *(inline in the rig)* | Open the ⋯ menu | Assigned coach | UI only |
| `setPresentMode` *(inline in the rig)* | Present mode on / off: hides everything coach-only, shows only the person's copy | Assigned coach | **Never serves a coach-copy link**; the coach-copy group is not rendered |
| `toggleReportStrip` *(inline in the rig)* | Show / hide the report strip | Assigned coach | Same undertaking lock as C5 |
| `lmNoShow` | "Client didn't join": debrief → `noshow` | Assigned coach | Only 15 minutes or more after the scheduled start; ratings skipped |
| `offerRetake` | Live mode ⋯ menu: "This reading needs retaking — stop the debrief" | Assigned coach | One per person per coach; the run ends and **no debrief happens on this reading** |
| `lmEndEarly` | End early, reason required; admin alerted the same day | Assigned coach | Reason required; outcome `ended_early`; same-day alert in G0; ratings skipped |
| `lmEndIt` | End the debrief and show the End summary | Assigned coach | **Refused until consent is chosen**; logs END; sets the end time |
| `lmEnd` | Draws the End summary (conversation map, counts, what they said, the letter started) | Client | — |
| `backToLive` *(inline in the rig)* | Reopen the run from the End summary | Assigned coach | Only before `finishRun` |
| `setPutAsideReason` *(inline in the rig)* | Mark any unmarked question at End; give the reason for a put-aside question | Assigned coach | Reason required for each put-aside |
| `finishRun` | Debrief → `debriefed`; pre-fills the letter from answers and jots; opens C7; starts the 24-hour clock. Practice → sent to faculty | Assigned coach | **Refused unless every question is marked and every put-aside has a reason.** Due time = end + 24 h |
| `startTick` · `stopTick` | Update the minutes and step bars every few seconds | Client | — |

The transcript fill (`transcribe`) and the Simulate buttons are rig only (see §4).

### C7–C10 · After the debrief (Recommendations · Feedback letter · Rating · Recording)

- **Purpose:** one screen, four sections, one **Submit all four**, due within 24 hours of the debrief ending. C7 picks
  up to three recommendations (or none, with a reason); C8 edits the feedback letter; C9 rates the conversation; C10
  records the recording link, transcript meeting ID or why there is none. Submit sends the disposition to Aarambh
  (H6). A send-back (H7) reopens only the letter.
- **Who:** the assigned coach. Aarambh reads the letter, recording and what was discussed in its review login; the
  mentor reads the reflection of a provisional coach; faculty read Question Bank candidates.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `AFTER` | Draws the four sections, the checklist and Submit | Client | Practice runs never reach this screen |
| `togRec` | Choose / un-choose a product | Assigned coach | At most 3; product from Aarambh's list or the organisation's programmes; locked after Submit |
| `togBased` | Toggle a "Based on" reason for a chosen product | Assigned coach | At least one per pick; locked after Submit |
| `setWhoRaised` *(inline in the rig)* | Client asked / I suggested | Assigned coach | Locked after Submit |
| `setRecWhy` *(inline in the rig)* | One line — why | Assigned coach | Locked after Submit (required? see Open questions) |
| `setNoRecommendation` *(inline in the rig)* | No recommendation, with a reason | Assigned coach | Reason required; clears picks; locked after Submit |
| `editLetter` *(inline in the rig)* | Edit one of the four letter sections; re-runs the wording check | Assigned coach | Editable in draft and sent back only; locked while awaiting validation or validated |
| `letterCheck` | Recount words, highlight directive wording, enable / disable Resubmit | Client + server | Server re-runs on submit and resubmit; Resubmit refused while any hit remains |
| `letterStatus` · `hl` | Word count — **no minimum; red over 400, never blocks** (MS, 17 Oct 2026) — and highlighted wording hits | Client | Server re-checks wording only; length never blocks Submit |
| `ackLetterRead` *(inline in the rig)* | "I've read and edited this letter" | Assigned coach | Required for Submit and Resubmit |
| `trFetch` | Fetch the transcript for the meeting ID | Assigned coach | Only when consent is Transcript only; fetched from Gyani Says' own workspace; **not stored** |
| `trPanel` | Show / search transcript lines | Assigned coach | Read-only; nothing kept |
| `searchTranscript` *(inline in the rig)* | Filter transcript lines | Assigned coach | UI only |
| `useLine` | Append a transcript line to "What we talked about" | Assigned coach | Only that line is kept, as letter text |
| `setRating` *(inline in the rig)* | Set one of the four rating parts (1–5) | Assigned coach | Skipped for no-show and ended early; locked after Submit; never shown to the client; not a grade input |
| `setRateComment` *(inline in the rig)* | Rating comment | Assigned coach | Locked after Submit |
| `saveReflection` *(inline in the rig)* | My reflection | Assigned coach | Private (mentor of a provisional coach may read); never sent to Aarambh; stays editable after Submit |
| `setMeetingId` *(inline in the rig)* | Transcript meeting ID | Assigned coach | UUID format; locked after Submit |
| `setRecordingLink` *(inline in the rig)* | Recording link | Assigned coach | `https://` on a Gyani Says-owned meeting account (never the coach's own); disabled when a missing reason is set; locked after Submit |
| `linkHelp` | "Looks like a real link" check | Client | Server validates the URL and the account domain |
| `setNoRecordingReason` *(inline in the rig)* | No recording? reason | Assigned coach | Clears the link; admin sees "not recorded by mistake" in the ratings review |
| `offerRetake` | Open the retake dialog — from the Prep guide's integrity card (C5) or the Live mode menu (C6); **never after the debrief** | Assigned coach | Refused if this coach already called one for this person |
| `doRetake` | Record the retake call with a reason and where it was called (`retake_offers.called_at` = prep \| live), tell Aarambh (H6b `retake_offered`) | Assigned coach | Reason required; one per person is the coach's, a second is Aarambh admin's; logged. The debrief is **held** (`debriefs.on_hold = 1`; the rig shows *Held — retake called*); Live mode is refused until the new sitting arrives (H5 `superseded`) and prep is redone |
| `auditBlock` | "What this debrief taught us" | Assigned coach | Derived; **not a score** |
| `saveGapNote` *(inline in the rig)* | "Something they said that no question asked about" | Assigned coach | Becomes a Bank proposal |
| `sendCand` | Send an own question or in-room follow-up to faculty as a Bank candidate | Assigned coach | Creates a Bank proposal; nothing goes live by itself |
| `scrollToSection` *(inline in the rig)* | Checklist link | Assigned coach | UI only |
| `submitAfter` | **Submit all four**: locks recommendations, rating and recording; `after_debriefs.letter_status` → `awaiting_validation`; debrief → `after`; sends H6 | Assigned coach | Refused unless recommendations are ok (picks each with a based-on **and its one-line why — required, MS 17 Oct 2026**, or a no-recommendation reason) · letter read · rating complete or skipped · recording ok (link, a missing reason, or consent transcript / none). Submitted time set by the server. Recommendations go as leads (to the organisation in an engagement, held until the client's consent to share is recorded) |
| `resubmit` | Resubmit a sent-back letter | Assigned coach | Only when the letter is sent back; letter read ticked and a clean wording check; new letter version; debrief → `after`; resets the read tick; due within 24 h of the send-back |

Never sent to Aarambh: private notes, reflection, jots outside the review bundle, Bank candidates, coach pay.

### C11 · Coach guide

- **Purpose:** one reference page, the same for every coach: the debrief at a glance, how we speak, what you never
  do, when things go wrong, and how other coaching models map onto S·E·T·U. **Parked** — to be rewritten for the Prep
  guide and Live mode.
- **Who:** every coach.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `setGuideModel` *(inline in the rig)* | Show one model's mapping onto S·E·T·U | Coach | UI only |
| Navigation to S2 (library) | — | Coach | No endpoint |
| "Reading the habits — Aarambh" link | Opens Aarambh's own habits guide | Coach | An external link to Aarambh's page; never copied into Saarthi |

### C12 · Coaching session (further coaching)

- **Purpose:** an ongoing 45-minute S·E·T·U coaching session inside a coaching engagement. The engagement starts when
  the client uses a "Continue with me" key (60 days, one per booking) or books further coaching that admin assigns.
  **Parked for re-review** — expected to adopt the Live mode pattern.
- **Who:** an assigned coach of rank Senior or above.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `setSessionFocus` *(inline in the rig)* | Today's focus | Assigned coach | Own session; autosave |
| `stepTo` *(inline in the rig)* | Move to the next prompt in the S·E·T·U tree | Assigned coach | Node must be a valid branch of the current node |
| `stepBackDown` *(inline in the rig)* | Return to Settle | Assigned coach | Own session |
| `setStepNote` *(inline in the rig)* | Note at this step | Assigned coach | Own session; a coach never sees another coach's notes |
| `setSessionAction` *(inline in the rig)* | The agreed action | Assigned coach | Own session |
| `setFollowUp` *(inline in the rig)* | Follow-up date | Assigned coach | On or after the session date |

Only Active coaches of rank Senior or above issue keys, and only for client types their level covers. The engagement
ends after 60 days with no booking. Money is never shown to the coach.

### G0 · Admin home

- **Purpose:** the day on one screen: to assign, prep overdue, letters overdue, sent back, open requests, same-day
  alerts, capacity warning, provisional coaches lapsing this month, this week's training events. Every tile opens the
  screen that fixes it. Stores nothing of its own.
- **Who:** Admin; Finance admin also lands here.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| Tile navigation to G3 / G1 / G9 | Opens the screen behind each count | Admin, Finance admin | Counts computed on the server in the caller's scope; no client names in the payload |
| `acknowledgeAlert` *(proposed — not in rig)* | Mark a same-day alert handled | Admin | Reason required, logged; an alert is never deleted |

### G1 · Coach roster and grading + Requests inbox

- **Purpose:** the roster (open a coach record to set category, rank, coach type, fixed / growing, the "Can't say"
  override, the slab, or pause a coach) and the Requests inbox (approve or decline what coaches asked for).
- **Who:** Admin daily; Finance admin also sees and sets the slab.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `coachRec` | Open the coach record | Admin, Finance admin | Slab left out of the response for Admin; private notes never included for any role |
| `setRec` | Change one field: category, growth, "Can't say" rule, slab, coach type, rank | Admin; **Finance admin only for the slab** | Reason required; logged before → after; a category change needs the minimum number of ratings (G4) unless set at onboarding; never automatic; level is read-only; switching to the organisation type requires an organisation |
| `endAccess` | End an organisation's coach's access to that organisation's readings, today | Admin | Organisation coaches only; reason required; logged; `undertaking_signatures.access_state` → `ended`; reading access stops at once and coach links are revoked |
| `reqDo` | Approve or decline a coach request; approving applies it (updates the record, publishes the card, sends a move to the G3 queue) | Admin | A decline needs a reason; both logged; the coach sees the result on their own screen |
| `sendUndertakingReminder` *(inline in the rig)* | Remind a coach who has not signed the current undertaking | Admin | Notification only |
| `pauseCoach` *(inline in the rig)* | Pause a coach from new bookings; booked work goes to the G3 queue as "paused coach" | Admin | Reason required, logged; a paused coach never appears in G3 suggestions |
| Tab switch · "Open a batch in G2" | Roster / Requests; go to G2 | Admin | UI only; certifications come only from a G2 batch |

Requests: `open → approved` or `open → declined` (with a reason). Both are final.

### G2 · Training admin — programmes and batches · applications · faculty and mentors · curriculum · people in training

- **Purpose:** build batches, work applications, enrol, maintain faculty and mentors, keep the curriculum and library
  versioned, set exam markers.
- **Who:** Admin (all tabs). Faculty: their own batches, modules they own, Question Bank proposals. Mentor: their own
  mentees. Finance admin: the rate band on faculty records only.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `inline:S.admin.g2tab` · `inline:S.admin.g2prog` · `inline:S.admin.g2cprog` *(inline in the rig)* | Switch tab / programme filter | Admin, faculty, mentor | UI only; data scoped by role |
| `openBatch` | Open a batch: details, seats, sessions, waitlist, change dates, close | Admin (faculty: own batches, read-only) | Scope check |
| `batchBuilder` | Open / refresh the New batch dialog; re-checks eligible faculty and mentors on every change | Admin | Eligibility computed server-side, with the reason each person is left out |
| `nbTog` | Pick / unpick a faculty member or mentor in the builder | Admin | Only eligible people selectable |
| `nbSave` | Create the batch; fixes module versions at current | Admin | At least one faculty; name set; end ≥ start; seats ≤ faculty × 6; everyone still eligible at save; seat types match the mode; logged |
| `moveDates` | Change batch dates; shifts sessions; notifies everyone in the batch | Admin | Reason required; end ≥ start; not closed; re-check faculty overlap; recompute own-assessment due dates; logged |
| `closeBatch` | Close a batch | Admin | Reason required; not already closed; logged |
| `offerSeat` | Give a waitlisted person a freed seat | Admin | A seat of that type must be free; must run the **full enrol path** (the rig skips it — gap); logged |
| `moveWait` | Offer a waitlisted person a seat in another batch of the same programme | Admin | Target not closed or running, same programme; application → offered; logged |
| `appView` | Open an application in full, including the CV inside Saarthi | Admin | Admin only; CV viewed, never downloaded |
| `inline:S.apps[...].state` *(inline in the rig)* | Set the screening state (new / screened / interviewing) | Admin | Transitions as in §1a; logged |
| `offerBatch` | List fitting batches with a match flag | Admin | Fitting = programme by "applying as", not closed or running |
| `doOffer` | Offer a batch to an applicant | Admin | Batch fits; not enrolled; → offered; logged; sends the offer |
| `enrol` | Open the enrol dialog (batch, seat, coach type, languages, tracks) | Admin | At least one fitting batch |
| `cycleLang` | Cycle a language in the enrol dialog | Admin | Client only until `doEnrol` |
| `doEnrol` | Enrol: take a seat or join the waitlist; create enrolment, account, invite, own assessment; default mentor | Admin | Seat count checked **in a transaction**; organisation type requires an organisation; at least one language; tracks required (the rig's tracks select is not wired — the build must store it); account email / phone unique; logged |
| `promoteModal` | Open "Promote an Active coach" | Admin | Candidates = Active coaches not already faculty |
| `doPromote` | Create a faculty / mentor record in induction and give an induction seat | Admin | Reason required; coach must be Active; induction batch open with a free seat; logged |
| `facRec` | Open a faculty / mentor record | Admin; faculty / mentor (own, read-only) | Rate band returned **only to Finance admin** |
| `calibrate` | Record a calibration today; next due in six months | Admin | Logged |
| `facState` | Make active / pause | Admin | Reason required; induction must be done and programmes set before active; pausing removes them from future eligibility; logged |
| `ratersModal` | Set exam markers for a trainee, per part | Admin | Shows only eligible markers, with reasons |
| `rTog` | Toggle a marker for a part | Admin | Marker active, calibration in date, cleared for the part; **never the trainee's own mentor**; one marker per part, two for the observed debrief |
| `modRec` | Open a module record (outcomes, plan, material, practice, exam, versions, batches) | Admin; faculty | — |
| `flagMod` | Mark a module "needs update" | Admin; owning faculty | Reason required; logged |
| `publishMod` | Publish the next version; for core modules create an update module for every certified coach | Admin; owning faculty | "What changed" required; module must need an update; running batches keep their fixed version; logged |
| `inline:Publish` *(inline in the rig)* | Publish a new library document version | Admin | Marks it unread for every reader |
| `inline:Approve` *(inline in the rig)* | Approve a proposed Question Bank question | Faculty; admin | Proposal still proposed; logged |
| `inline:Send a reminder` *(inline in the rig)* | Remind a trainee to take their own assessment | Admin | Only when not started |
| `inline:S.admin.g2tab='apps'` *(inline in the rig)* | Jump to Applications | Admin | Navigation |

Eligibility, batch state, seat counts and fits shown in G2 are previews; the server re-checks each one on write.

### G3 · Assigning coaches

- **Purpose:** assign every waiting booking within the set number of hours. Saarthi sorts the eligible coaches;
  **admin clicks; nothing is assigned automatically.**
- **Who:** Admin, several times a day.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| Select a queue row | Pick which booking to fill | Admin | UI only |
| `assignCoach` *(inline in the rig)* | Assign the chosen coach; create the assignment and meeting link; tell the coach in-app; pull the reading (H3) | Admin | **Re-check every hard filter at the moment of assignment:** stage active or provisional, not paused or lapsed; level covers the client type; "Can't say" rule; tier; language; a free slot; organisation pool; Advanced for Paradox / Team; undertaking signed. Reject an invalid reading (back to Aarambh as a retake). Logged |
| `markCantFill` *(proposed — not in rig)* | No eligible coach → Aarambh offers the client another time | Admin | Logged; `assignment_queue.state` → `cant_fill` |

Sort: same coach on a rebook → Primary language → most room left in commitment → rating. A recent late drop moves a
coach down the list; it is not a grade change.

### G4 · Settings (eight groups)

- **Purpose:** every rule's value: assigning · calendar and drops · money and packs · training and credential · consent
  and recording · coaching rules · wording lists · organisations. Also Category D on/off and the "Can't say" default.
- **Who:** Admin for every group but money; **Finance admin owns Money and packs** (Admin sees it as hidden).

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `setChange` | Open the change form for one setting (new value, reason) | Owner role of the setting | Money values left out of the response for Admin |
| `saveSetting` *(inline in the rig)* | Save the new value | Owner role of the setting | Reason required; effective from now or later, never backwards; old rows kept; logged; a new Code version makes every coach re-accept at next login |

### G5 · Ratings review

- **Purpose:** the quarterly review, and any coach Saarthi flags. Saarthi flags with a reason and **never proposes a
  grade**; a person decides.
- **Who:** Admin.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `openRatingReview` *(inline in the rig)* | Open the review for a flagged coach | Admin | — |
| `decideRatingReview` *(proposed — not in rig)* | Record the outcome | Admin | Reason required; a category change needs the minimum ratings; a slab change is **never made here** — it becomes a request to Finance admin; the coach sees the new letter only; logged |
| `excludeRating` *(proposed — not in rig)* | Leave one rating out of the average | Admin | Reason required, logged; the rating row is kept |

### G6 · Upgrade tiers

- **Purpose:** what each tier (Standard · Plus · Premium) requires the coach to deliver, who qualifies, and supply per
  tier. Read-only in the rig. **The client price is never in Saarthi.**
- **Who:** Admin (read); Finance admin (tier rates).

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `setTierRate` *(proposed — not in rig)* | Set the rates billed to Aarambh by client type × tier × session type | Finance admin only | Never shown to Admin; future-dated only; no formula links it to coach pay |

A tier is never silently downgraded; key bookings bill at the tier the coach qualifies for on the booking day.

### G7 · Slabs and payments / rate agreements

- **Purpose:** monthly pay and case-by-case pay terms: each coach's rate card, the agreement in force, the pay run.
- **Who:** **Finance admin only.** Admin sees "This screen belongs to Finance admin" and no data.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `rateCard` | Render one coach's rate card | — | Render helper, not an action |
| `setRate` | Open "change how this coach is paid": slab, session rates or share, an effective date, a reason | Finance admin only | Every G7 endpoint returns 403 for any other role |
| `doRate` | Agree the new terms: a new pay agreement row supersedes the old one | Finance admin only | Reason required; effective today or later (future sessions only); logged; the coach never sees it |
| `approvePayRun` *(proposed — not in rig)* | Approve the monthly run | Finance admin only | Stops at held when bank details are missing; training and exam time are never paid |

A per-session fee is earned when the after-debrief is complete. Pay runs (`pay_runs.state`): `draft → approved → paid`, or `held_no_bank`.

### G8 · Organisation engagements

- **Purpose:** an organisation's engagement, brief, programmes, certified coach pool and vetted coaches. Read-only in
  the rig.
- **Who:** Admin.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| `saveOrganisation` *(proposed — not in rig)* | Create or edit the organisation, engagement and programmes | Admin | Reason logged |
| Link to G2 | Organisation track or update module | Admin | Certification only from a G2 batch |
| `grantVetted` *(proposed — not in rig)* | Allow direct recommendations without a validation step | Admin (open) | Logged; only a certified pool coach |

Only the organisation's pool takes its clients. Recommendations go to the organisation, and every one is documented.

### G9 · Capacity and demand

- **Purpose:** "do we have enough coaches, and when must a batch start?" Plain arithmetic, not a forecast: who we have,
  what they can take, what is coming, the gap per language × level as a sentence, and the latest batch start date.
- **Who:** Admin; Finance admin (the only role that would see money, if any is added).
- **Actions:** none (read-only). Server rule: aggregates only; no client identifiers in the payload.

### G10 · People and access

- **Purpose:** who may sign in and what they may open: Roles · People · Undertakings · Activity log.
- **Who:** Admin.

| Handler | What it does | Who may | Server-side rule |
|---|---|---|---|
| Tab switch | Roles / People / Undertakings / Activity log | Admin | UI only |
| `sendPasswordResetLink` *(inline in the rig)* | Email the person a single-use reset link | Admin | No endpoint accepts or returns a password from an admin; token hashed, expires; logged |
| `suspendPerson` / `restorePerson` *(inline in the rig)* | Suspend or restore sign-in | Admin | Reason required, logged; suspending ends live sessions at once |
| `invitePerson` *(proposed — not in rig)* | Invite a non-coach staff role | Admin | Coach accounts are created **only** by G2 enrolment; logged |
| `deactivatePerson` *(proposed — not in rig)* | Close an account for good; the record is kept | Admin | Reason, logged; nothing is hard-deleted |
| `changeRole` *(proposed — not in rig)* | Add or remove a role | Admin | Reason, logged; **forces a re-login**; an Aarambh reviewer can never be given G, S or C screens |
| `publishUndertakingVersion` *(inline in the rig)* | Publish a new undertaking version | Admin | Every signature drops to closed-unsigned; readings stay closed until each person re-signs; old versions and signatures kept as proof |
| Activity log (read) | Who changed what, when and why | Admin; Finance admin (own money entries) | Append-only; no update or delete endpoint |

People: `invited → active ⇄ suspended → deactivated`. Undertaking access: `closed_unsigned → open → ended`.

### Server-owned helpers (logic, not handlers)

The front-end previews these; the server must own and re-check them on every write: `logAct` (activity log),
`fin` (money visibility), `facultyFit`, `mentorFit`, `canMark`, `calibState`, `batchState`, `fitBatches`, `nextVer`,
`credNumber`, `band`, `weekHours`, `statusLabel`, `frozen`, `isUnavail`, `peerBars`.

---

## 4 · Rig only — not built

These exist in `frontend/app.js` only because the prototype is a review rig. They are **switched off, not rebuilt**.

| Item | What it is in the rig |
|---|---|
| `closeModal` | Closes the rig's dialog layer (a UI helper; production uses the same dialog without a rig wrapper) |
| `go` | The rig's screen router, driven by the screen list. Production routes by URL and role |
| `markReviewed` | Marks a screen reviewed in the screen list (review status only) |
| `modal` | Opens the rig's dialog layer |
| `reset` | Restores the sample data in the browser, keeping the review marks |
| `toast` | The rig's pop-up message; many rig controls only toast in place of a real action |
| `presBegin` | P1 presenter: start the walkthrough |
| `presDisc` | P1 presenter: open the discussion point |
| `presExit` | P1 presenter: leave the walkthrough |
| `presGo` | P1 presenter: jump to a step |
| `presHide` | P1 presenter: hide the presenter panel |
| `presMove` | P1 presenter: next / previous step |
| `loadReading` | The "Load a reading" dialog in C5 (file, paste, or the laptop source) |
| `readFile` | Reads an uploaded reading JSON file in that dialog |
| `useReading` | In the rig, takes the loaded JSON; in production the same intake runs on the H3 pull (see C5) |
| `fromRig` | Fetches one sitting from Aarambh's laptop test rig on this computer. **Replaced by H3** |
| `listRig` | Lists sittings on the laptop test rig. Replaced by H3 |
| `transcribe` | The simulated transcript fill in Live mode |
| Simulate buttons | Live mode `+5 min`, `Flat for 5 min`, `Restart` |
| `R` | State accessor: returns the **current Live-mode run** record. A helper, **not an endpoint** |
| `P` | State accessor: returns the **current prep** record for the debrief. A helper, not an endpoint |
| `AF` | State accessor: returns (and on first open creates) the **current after-debrief form** record, seeding product pointers. A helper, not an endpoint |
| `A` | State accessor: the answer record for one question in the run |
| `render` · `save` | Redraw the screen; write the rig state to the browser's local storage |
| `seed` · `seedSlots` | Sample people, organisations and slots for the rig |

Also rig only: the **screen list** down the left (groups, codes, status dots, the status key, Hide list, Reset), the
**decisions drawer**, the **Rig controls** (stage switch, Code current / changed, growing / fixed / all-rounder, the
S3 "Show" toggles, the trainee state segment), the "Download credential" toast, the fixed dates the rig writes, the
hard-coded consent warning in C7, and **in-browser role switching** ("Signed in as Admin / Finance admin"). In
production the role comes from sign-in (G10) and each role sees only its own screens.

---

## 5 · Open questions

Do not decide these in code. Ask MS.

**Answered by MS, 17 October 2026**
- **Who assigns a coach:** Gyani Says admin (G3). Aarambh never assigns.
- **Ratings:** a coach's rating on Aarambh's site is partly supplied by Gyani Says and partly from clients' ratings after a debrief or coaching.
- **Money:** Aarambh pays Gyani Says a fixed amount for coaching; Gyani Says pays coaches internally. A coach never sees a price.
- **Further coaching:** the person gets a pop-up on their Aarambh screen — the coach may prompt it, or it sits quietly at the foot of the screen during the debrief. The person pays Aarambh; Gyani Says then assigns the coach.
- **Who builds:** Gyani Says builds Saarthi, on its own staging server, separate from Aarambh's. The stack is the developer's call.
- **Staging scope:** one coach, end to end — confirmed.
- **Median answers:** once the coach validates where the person sits, it goes to Aarambh and into the person's report (H6 `medianAnswers[]`).
- **Ending early:** the reason stays in Saarthi until Gyani Says admin validates it, then goes to Aarambh as an audit report.
- **Recommendation "why":** required at Submit.
- **Prep questions lock when Live mode starts.** The planned list is kept as planned; the coach can still add follow-ups live.
- **Retakes — no debrief on a reading that needs retaking.** The coach calls a retake either **while reading the report** in the Prep guide (C5) — typically from the integrity read — or **during the debrief** (C6), which then stops. Either way the debrief on that reading does not happen; it is held until the new sitting arrives (H5 `superseded`) and is prepared afresh. One retake call per person per coach; anything more is Aarambh admin's. *(The rig today offers a retake only after the debrief, in C7–C10 — to be moved into C5 and C6.)*
- **The integrity read must be in front of the coach while reading the report.** It is missing today: the Pancha Bhuta coach view carries no integrity read, and C5 shows only a one-word pill. *(Rig and Aarambh coach view to fix.)*
- **Coach-copy links last 3 hours,** renewed automatically while the debrief is open, and stop when it closes.
- **Transcription:** build Saarthi's own module or connect an existing one; it fills in the questions asked and the answers given, so the coach is not typing throughout. (Recording consent and the lawyer's check still apply.)

**Product decisions**
1. ~~Who assigns a coach~~ — **answered:** Gyani Says admin (G3).
2. **Staging scope.** README proposes one coach end to end on synthetic people (login → undertaking → assigned
   debrief → both reports → Live mode with Present mode → submit → validation). MS to confirm.
3. **When the Code of Ethics is signed.** The rig signs it in S4 after the exam; README's staging list says it is
   signed with the undertaking at first login (S1). Pick one.
4. **Application end states.** There is no declined or withdrawn state for an application.
5. **W1 retention.** How long an application is kept before deletion is still open.
6. **Promotion criteria** for making an Active coach faculty or mentor (spec item 15).
7. **Beyond three exam attempts** — what the admin decision is and where it is recorded.
8. **Reading intake route.** The rig lets the coach load a file; spec says the API at assignment, with file upload by
   admin only. Build the admin route; remove the coach upload.
9. **Letter wording check.** The rig checks directive words only; spec also requires numbers / levels and Fit-lane
   "develop" language.
10. **Required fields at Submit.** Whether the recommendation's one-line "why" and the transcript meeting ID are
    required (the rig does not require either).
11. **Organisation consent to share recommendations** needs a stored consent record; the rig shows a fixed warning.
12. ~~Prep after Live mode starts~~ — **answered:** the plan locks; follow-ups can be added live.
13. **Median answers.** Part of the spec keeps captured median answers inside SETU; the disposition in
    INTEGRATION_AARAMBH.md §7 sends `medianAnswers[]` to Aarambh. Pick one.
14. **Early-end reason** — whether Aarambh receives it or it stays with Gyani Says admin.
15. **Disposition rating.** The parts send the coach's rating *of the conversation*; INTEGRATION_AARAMBH.md §7 names
    a coach rating *of the client*. Agree the field.
16. **Transcript tool** stays off until a lawyer confirms; retention of the transcript is still to be set.
17. **Who grants "vetted coach"** for an organisation (G8).
18. **Client consent to share** with an organisation (G8) — required before anything is shared; its source is open.
19. **Category D** is built but switched off; its meaning is not yet defined.
20. **Rate view on C2** — not in the rig; do not build unless MS adds it.
21. **C11 Coach guide** is parked, to be rewritten for the Prep guide and Live mode.
22. **C12 Coaching session** is parked for re-review, expected to adopt the Live mode pattern.

**Rig gaps the build must close (confirm the intended rule)**
23. `offerSeat` marks the application enrolled without creating the enrolment or account — the build runs the full
    enrol path.
24. The enrol dialog's tracks select is not wired — the build must store it.
25. Undertaking, Code and submit dates are hard-coded in the rig — the server sets them.
26. `genSlots` does not check the 72-hour lock (only `addDay` does) — the server enforces it for both.
27. `markUnavailable` removes open slots inside the 72-hour lock — they should become locked-slot requests.
28. **Retake limit** — one per person per coach, enforced by `retake_offers` (unique key); more is Aarambh admin's. The retake moves to C5/C6 (see answers above).
29. **Coach-copy delivery** — issue coach links only from an authenticated, undertaking-checked request, signed and
    short-lived (**3 hours**, renewed while the debrief is open), and never to the Present-mode view.
30. The C1 changes feed is hard-coded — read it from the coach's notices.

**Naming — reconciled with `schema.sql` (kit v0.1).** The four screen captures used different words; the schema's
names below are final. Use them everywhere (the rig's display labels are display only).
31. **Coach stage** — one enum, `coaches.stage`: `invited`, `in_training`, `exam_passed`, `provisional`,
    `provisional_lapsed`, `active`, `paused`, `withdrawn`, plus `coaches.stage_before_pause` (`provisional` | `active`).
    The rig's training / passed / lapsed are display labels for `in_training` / `exam_passed` / `provisional_lapsed`.
32. **Credential** — `credentials.status`: `active`, `lapsed`, `paused`, `withdrawn` (the parts' "expired" is `lapsed`).
    `credentials.credential_number` is `CHAR(18)` (`GYS-SAR-YYYY-XXXXC`).
33. **Requests** — one table, `requests`. `type`: `detail_correction`, `time_commitment`, `public_card`,
    `move_debrief` (not "move booking"), `locked_slot` (not "calendar inside lock"). `state`: `open`, `approved`,
    `declined` (not "done").
34. **One table each** — Question Bank candidates: `question_proposals` (with `origin` `own_question`,
    `follow_up_in_room`, `gap_note`, `faculty`; approved rows become `bank_questions`). Code of Ethics first signing and
    every re-accept: `code_signatures` (no separate acceptance table). Coaching key: `coaching_keys`.

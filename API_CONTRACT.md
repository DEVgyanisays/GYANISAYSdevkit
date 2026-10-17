# Saarthi — API Contract

**kit v0.1 · matches `Prototype/GYS_Coach_Platform_Rig_v0.3.html` · 16 Oct 2026**

The PHP team implements these endpoints against `schema.sql`. The frozen front-end reaches them only through
`frontend/api.js` (§7). Read with `BUILD_SPEC.md` (who may do what, and why), `data-model.md` (storage shapes) and
`INTEGRATION_AARAMBH.md` (the handshake H1–H8).

- Table and column names below are **exactly** those in `schema.sql`. Request and response fields use the column
  names of the table they read or write; where a field is derived, it says so.
- The **Serves** column names the `BUILD_SPEC.md` handler(s) the endpoint backs. Handlers that need no endpoint are
  listed as **client-only, no endpoint** at the end of each area.
- **No sample data appears here.** Data is described by role and type only. `build-spec-check.sh` lints this file.

---

## 1 · Conventions

| Rule | What it means |
|---|---|
| Base path | `/api`. Requests and responses are `application/json` (UTF-8), except the four file uploads, which are `multipart/form-data` |
| Session | `POST /api/auth/login` sets an HTTP-only, `Secure`, `SameSite=Strict` session cookie. Every endpoint except §5.2 (public) and §6 (Aarambh) needs a valid session. A session is valid only while `users.state = 'active'` and its stored `users.session_version` still matches (a role change or suspension bumps it and ends the session) |
| Who is calling | The server derives the caller (user, roles, coach record, scope) **from the session only**. Never trust a user id, coach id, role or stage sent by the client |
| Errors | `{ "error": "plain message" }`, optionally with `"rule": "<RULE CODE>"` (§2) so the front-end can draw the right lock box. **400** malformed request · **401** no or expired session · **403** a rule refused it (role, scope, gate) · **404** not found **or not in the caller's scope** (never reveal that an out-of-scope row exists) · **409** the record is in the wrong state (locked, already submitted, stale, superseded, closed) · **422** a field failed validation (including a missing `reason`) |
| Datetimes | ISO 8601 in **UTC** with `Z` (`DATETIME` columns). The UI shows Asia/Kolkata. `DATE` columns are India calendar dates as `YYYY-MM-DD`. A slot is `slot_date` + `start_minute` (minutes from 00:00 India time) + `duration_min` |
| Server time | Every "signed at", "submitted at", "accepted at", "issued on" is set by the server. Any such field sent by the client is ignored |
| Money | Integer minor units + currency: `{ "amount_minor": int, "currency": "CHAR(3)" }`. Never a formatted label. Money fields exist only in **FINANCE-ONLY** responses |
| Admin writes | Every admin or Finance admin write carries a non-empty `reason` (**ADMIN-REASON**) and writes one `activity_log` row server-side |
| Idempotency | Every `POST` / `PUT` / `PATCH` / `DELETE` carries an `Idempotency-Key` header (a client-made UUID). A repeat with the same key and caller returns the first result and changes nothing |
| Concurrency | Rows that two people may edit (`settings`, `coach_public_cards`, `batches`) return `updated_at` / a version; the write sends it back as `If-Match`. A stale write gets **409** |
| Lists | `GET` lists accept `?limit` (default 50, max 200) and `?cursor`; the response is `{ "items": [...], "next_cursor": string\|null }` |
| Enum values | As in `schema.sql` (lower `snake_case`). Display labels are the front-end's job |

---

## 2 · Named server rules

Each rule is defined once here and referenced by code on every endpoint. **Every rule is enforced on the server on
every call.** A hidden button is never the safeguard.

| Code | The rule |
|---|---|
| `SESSION` | A valid session (§1). Implied on every endpoint outside §5.2 and §6; not repeated below |
| `ROLE-<name>` | The caller holds that role in `user_roles.role`: `ROLE-admin`, `ROLE-finance_admin`, `ROLE-faculty`, `ROLE-mentor`, `ROLE-aarambh_reviewer`. `ROLE-coach` = `coach_ours` or `coach_org`. Several are written `ROLE-admin/finance_admin` (either). An `aarambh_reviewer` gets 403 on every G, S and C endpoint |
| `SCOPE-COACH` | Only the coach assigned to the debrief: `debriefs.coach_id` is the caller's `coaches.id` **and** the current `debrief_assignments` row has `ended_at IS NULL`. A `coach_org` coach additionally only where `debriefs.organisation_id = coaches.organisation_id`. For `/api/me/...` the caller's own records only. Never another coach's slots, debriefs, notes or hours. Out of scope → 404 |
| `SCOPE-FACULTY` | Faculty see only batches where they are in `batch_staff`, modules where `modules.owner_faculty_id` is theirs, and Question Bank proposals |
| `SCOPE-MENTOR` | A mentor sees only their own mentees (`enrolments.mentor_faculty_id`, `supervised_debriefs.mentor_faculty_id`) |
| `FIRST-LOGIN` | Until `enrolments.first_login_state = 'confirmed'`, a coach or trainee may call only §5.1 and §5.3 endpoints; everything else returns 403 |
| `UNDERTAKING` | The caller has an `undertaking_signatures` row with `access_state = 'open'` for the `undertaking_versions` row where `is_current = 1`. Without it: **no reading at all, no coach copy, no `opened` list** (403, `rule: UNDERTAKING`). Publishing a new version re-locks everyone until they re-sign |
| `CODE-CURRENT` | When a newer `code_versions` row is current and the coach has no `code_signatures` row for it, every coach endpoint except `GET /api/me`, `GET /api/bootstrap` and the accept call returns 403 `rule: CODE-CURRENT` |
| `PRESENT-PERSON-ONLY` | Present mode (`mode: present`) is served the **person** copy only. A coach-copy link, private notes, numbers or the `opened` list are never returned in present mode, whatever the caller holds |
| `FINANCE-ONLY` | Money fields (rates, slabs, fees, pay, prices, the faculty rate band; every `[MONEY]` table; `settings` rows in group `money_packs`; `activity_log` / `setting_changes` rows with `is_money = 1`) are **left out of the response** for every role except `finance_admin`. Endpoints that exist only for money return 403 to every other role |
| `ADMIN-REASON` | A non-empty `reason` is required (422 without it) and the server writes `activity_log` (`actor_user_id`, `actor_role`, `entity_type`, `entity_id`, `action`, `before_json`, `after_json`, `reason`, `is_money`). `activity_log` has no update or delete endpoint |
| `NO-PASSWORD` | No admin endpoint accepts, sets or returns a password or `password_hash`. A password is set only by the person, through a single-use emailed link (`password_reset_tokens.token_hash`, stored hashed, expiring) |
| `NO-EXPORT` | No print, save or download endpoint exists for a person's report, a reading, the coach's notes, a CV or a library document. Viewed content is sent `Cache-Control: no-store`, `Content-Disposition: inline`, `Referrer-Policy: no-referrer` |
| `LOCK-72H` | A slot whose start is inside the lock window (setting, 72 h) cannot be opened, closed or removed by the coach; the coach may only raise a `locked_slot` request. A booked slot can never be closed by the coach |
| `LOCKED-AFTER-SUBMIT` | Once `after_debriefs.submitted_at` is set: recommendations, rating and recording fields are locked for good (409). The letter is editable only while `after_debriefs.letter_status` is `draft` or `sent_back`. `after_debriefs.reflection` never locks |
| `MENTOR-NOT-MARKER` | An exam marker (`exam_markers.faculty_id`) is never the trainee's own mentor (`enrolments.mentor_faculty_id`), must be `faculty.state = 'active'`, cleared for the part (`faculty.may_mark`) and in calibration date (`faculty_calibrations.due_on` not passed). One marker per part, two for `observed_debrief` |
| `FACULTY-RATIO` | A batch's seats (`seats_in_person + seats_online`) ≤ faculty on it (`batch_staff.role = 'faculty'`) × 6; a mentor has fewer than 6 mentees. Checked again on every save and seat change |
| `ACCESS-ENDS` | Reading access stops at once when the coach is unassigned (`debrief_assignments.ended_at` set), the debrief is `closed`, or an organisation's coach's access is ended (`undertaking_signatures.access_state = 'ended'`). In the same step Saarthi calls Aarambh's revoke (§6.2) and sets `report_link_requests.revoked_at` |
| `CONSENT-FIRST` | In a real run, no step but Settle and no End until `live_runs.consent_at_session` is set (409) |
| `FIRST-NAME-ONLY` | Coach- and admin-facing payloads carry the client's `first_name` and `client_type` only — never a surname, contact detail, money, slab or category |
| `FORWARD-ONLY` | `effective_from` is now or later (422 otherwise). Bookings and sessions already made keep the value they were made under |
| `FINISHED-READING-ONLY` | Intake stores only the fields in `INTEGRATION_AARAMBH.md` §5, never derives a level, lane, gap band, caret or integrity, drops everything else and records the **names** of dropped fields in `aarambh_readings.intake_log`. An integrity of `hold` is refused |
| `RANK-SENIOR` | `coaches.rank` is `senior` or `lead` and `coaches.stage = 'active'` |
| `PUBLIC-LIMIT` | Unsigned public endpoint: per-IP rate limit, bot protection, no search by name, never echoes stored data back |
| `AARAMBH-SIGNED` | Server-to-server only: valid `X-Signature` (HMAC-SHA256 over `timestamp + "." + body`) and `X-Timestamp` within 5 minutes, per-environment client id, IP allow-list, `Idempotency-Key` checked against `integration_events` (`direction`, `call_code`, `idempotency_key`). Answers `2xx` only after the event is stored (`INTEGRATION_AARAMBH.md` §2) |

---

## 3 · Bootstrap

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/bootstrap` | — | The front-end's state object `S`, filled for the caller's role and scope (table below). Keys a role may not see are **absent**, not empty | `SESSION` · scope rules per key · `FINANCE-ONLY` · `FIRST-NAME-ONLY` | replaces `load()` in `api.js` |
| `GET /api/me` | — | `{ user: {id, first_name, full_name, state}, roles: [role], coach: {id, coach_type, organisation_id, stage, rank, level, growth, category} \| null, gates: {first_login_state, undertaking_open: bool, code_reaccept_needed: bool} }` | `SESSION` | every screen's role and gate checks |

**Which top-level keys of the rig's `S` it fills.** Keys marked *client* are never sent by the server: `api.js`
keeps them in the browser.

| `S` key | Filled from | For |
|---|---|---|
| `seedv`, `pres` | *client* — rig only, dropped in production | — |
| `ui` | *client*, except the report layout fields, filled from `coach_prefs` (`report_view`, `split_width_pct`, `swap_sides`, `hide_report`, `report_zoom_pct`) | coach |
| `admin` | *client* tab state; `admin.role` is replaced by the caller's roles from `user_roles` | staff |
| `w1`, `cur`, `qbt` | *client* | — |
| `stage`, `growth`, `firstLogin`, `codeChanged`, `coachKind` | `coaches.stage`, `coaches.growth`, `enrolments.first_login_state`, derived "Code re-accept needed", `coaches.coach_type` — read-only facts in production (the rig switches are off) | coach |
| `view` | `coach_prefs.report_view` | coach |
| `saarthi`, `s1` | `users`, `user_profiles`, `user_languages`, `enrolments` (own record); `enrolments.confidentiality_promised_at` | coach / trainee (own) |
| `batch`, `own` | `batches` + `batch_staff` + `batch_sessions` via `enrolments`; `enrolments.own_assessment_state` / `own_assessment_due` / `own_assessment_ref` / `own_debrief_coach_id` | trainee (own) |
| `und` | current `undertaking_versions` + the caller's `undertaking_signatures` | every signed-in person |
| `code`, `commit` | current `code_versions` + the caller's `code_signatures`; active `time_commitments` | coach (own) |
| `coach` | `coaches` + `users.first_name` + `coach_org_certifications` + open `requests` of type `time_commitment` + derived rating average and count (`client_ratings` less `rating_exclusions`) | coach (own) |
| `card` | `coach_public_cards` + `coach_card_specialities` | coach (own) |
| `cred` | `credentials` + latest `credential_attestations` | coach (own) |
| `advanced`, `updates` | `advanced_enrolments`; `update_module_assignments` | coach (own) |
| `hours`, `work` | Derived from completed sessions and `slots` (never stored); `coaches.hours_target_month` | coach (own) |
| `notices` | `notifications` (unread first) | every signed-in person (own) |
| `debriefs` | `debriefs` in the caller's scope + latest `feedback_letters.decision_comment` — `first_name` and `client_type` only | coach (`SCOPE-COACH`) |
| `slots`, `unavailable` | `slots`; `coach_unavailability` (`removed_at IS NULL`) | coach (own) |
| `prep` | `prep` + `prep_questions` + `prep_question_options` per own debrief. `prep.private_notes` only ever to its own coach | coach (`SCOPE-COACH`) |
| `runs` | `live_runs` + `run_step_log` + `run_answers` + `run_followups` + `run_jots` | coach (`SCOPE-COACH`) |
| `after` | `after_debriefs` + `recommendations` + latest `feedback_letters` | coach (`SCOPE-COACH`) |
| `session` | `coaching_session_notes` + `coaching_step_notes` | coach (`SCOPE-COACH`, `RANK-SENIOR`) |
| `bankQ` | The caller's own `question_proposals` | coach |
| `loaded` | **Not in bootstrap.** Filled per debrief by `GET /api/debriefs/:id/reading` (§5.7) | coach (`UNDERTAKING`) |
| `apps` | `applications` + `application_languages` + `application_preferences` | `ROLE-admin` |
| `batches`, `modules` | `batches` (+ derived batch state and seat fill), `batch_staff`, `batch_waitlist`; `modules` + `module_versions` + `module_version_items` | `ROLE-admin`; faculty per `SCOPE-FACULTY` |
| `faculty` | `faculty` + `faculty_calibrations` + `faculty_agreements`; `faculty_pay_terms.rate_band` only for `finance_admin` | `ROLE-admin/finance_admin` |
| `trainees` | `enrolments` ⋈ `coaches` ⋈ `users` + `exam_markers` + derived module and exam progress | `ROLE-admin`; mentor per `SCOPE-MENTOR` |
| `roster` | `coaches` ⋈ `users` + derived counts; the slab (`coach_pay_agreements.pay_slab_id`) only for `finance_admin` | `ROLE-admin/finance_admin` |
| `requests` | `requests` — all for admin; own for a coach | `ROLE-admin`; coach (own) |
| `alerts` | `same_day_alerts` (open first) | `ROLE-admin/finance_admin` |
| `toAssign` | `assignment_queue` (`state = 'waiting'`) ⋈ `debriefs` — first name only | `ROLE-admin/finance_admin` |
| `activity` | `activity_log` (latest page). Finance admin: its own `is_money` entries; Admin: non-money entries | `ROLE-admin/finance_admin` |
| `people` | `users` + `user_roles` + `undertaking_signatures` — never `password_hash` | `ROLE-admin` |
| `rates` | G7 rate cards: `coach_pay_agreements` + `pay_slabs` + `pay_slab_rates` + derived worth signals | `ROLE-finance_admin` only (`FINANCE-ONLY`); absent for every other role |

---

## 4 · Endpoint index

| § | Area | Screens |
|---|---|---|
| 5.1 | Auth & me | sign-in, G10 reset link |
| 5.2 | Applications (public) | W1 |
| 5.3 | First login, Code, undertaking | S1, S4, C1 |
| 5.4 | Training | S2, S3, S4, verify page |
| 5.5 | Coach profile & public card | C2, C1 |
| 5.6 | Slots & calendar | C3 |
| 5.7 | Debriefs list and the reading | C4, C5 |
| 5.8 | Prep | C5 |
| 5.9 | Live run | C6 |
| 5.10 | After the debrief | C7–C10 |
| 5.11 | Coaching sessions | C12, C11 |
| 5.12 | Faculty and mentor writes | G2 faculty / mentor views, S4 |
| 5.13 | Admin G0–G10 | G0 … G10 |
| 5.14 | System jobs (no endpoint) | — |
| 6 | Inbound from Aarambh, and outbound calls | H1–H8, revoke |

---

## 5 · Endpoints by area

### 5.1 · Auth & me

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `POST /api/auth/login` | `{ login: email or E.164 phone, password }` | `{ me }` (as `GET /api/me`) + session cookie | `users.state = 'active'`; rate-limited per login and per IP; sets `users.last_sign_in_at`; never returns `password_hash` | sign-in (not in the rig; the rig switches roles in the browser) |
| `POST /api/auth/logout` | — | `{ ok: true }` | `SESSION` | sign-out |
| `POST /api/auth/password/forgot` | `{ login }` | `202 { ok: true }` always (never reveals whether the account exists) | `PUBLIC-LIMIT`; writes `password_reset_tokens` (hash only, expiry) and emails the single-use link | self-service reset |
| `POST /api/auth/password/reset` | `{ token, new_password }` | `{ ok: true }` | `NO-PASSWORD` — the **only** endpoint that sets `users.password_hash`; token matched by hash, unexpired, `used_at IS NULL`; sets `used_at`; bumps `session_version` | the emailed link |
| `GET /api/notifications` | — | `{ items: [notifications row] }` | own rows only | C1 changes feed (BUILD_SPEC open question 30: read from `notifications`, not hard-coded) |
| `POST /api/notifications/:id/read` | — | `{ ok: true }` | own row; sets `read_at` | C1 changes feed |

### 5.2 · Applications (W1, public, rate-limited)

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/public/apply-options` | — | `{ languages: [languages row], start_windows: [string], cities: [string], preferences: {coach: [string], trainer: [string]}, consent_text_version }` | `PUBLIC-LIMIT` | W1 form lists |
| `POST /api/public/applications/cv` | `multipart` — one PDF | `{ upload_token, bytes }` | `PUBLIC-LIMIT`; PDF only; size cap; virus scan before use (`files.scanned_at`); stored private (`files.kind = 'cv'`, `owner_user_id` NULL); never served back to the applicant | `inline:S.w1.cv` |
| `POST /api/public/applications` | `{ applying_as, full_name, phone?, email?, city, years_of_work?, current_work?, experience_text?, qualifications_text?, cv_upload_token?, languages: [{language_code, proficiency}], time_band?, attend_mode, start_window, attend_days: [weekday], preferences: [string], source_tag?, consent_given: true, consent_text_version }` | `201 { ok: true }` — no id, nothing echoed | `PUBLIC-LIMIT`; name + (phone or email) + city + ≥ 1 language + consent; enums from `schema.sql`; length caps; markup stripped; de-duplicates a still-`new` application from the same phone or email (answers `201` either way); sets `applications.state = 'new'`, `submitted_at`, `consent_at` (server time) | `w1Submit`, `w1Lang`, `w1Tog`, `inline:S.w1.as`, `inline:S.w1.<field>`, `inline:S.w1.band` · `inline:S.w1.mode` · `inline:S.w1.window`, `inline:S.w1.consent` (all sent in this one body) |

Client-only, no endpoint: `inline:S.w1.submitted=false`.

### 5.3 · First login, Code, undertaking

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/undertaking/current` | — | `{ undertaking_versions row (id, version, published_on, owner_label, body), my_signature: undertaking_signatures row \| null }` | `SESSION` | S1 undertaking text |
| `POST /api/me/undertaking` | `{ undertaking_version_id }` | `{ undertaking_signatures row }` | own record; the id must be the current version (409 otherwise); `signed_at` server time; `access_state = 'open'`; idempotent per (user, version); cannot be withdrawn by the signer | `inline:S.und` |
| `PATCH /api/me/profile` | `{ bio }` | `{ user_profiles row }` | own record; `bio` ≤ 400 chars, markup stripped | `inline:S.s1.bio` |
| `POST /api/me/profile/photo` · `DELETE /api/me/profile/photo` | `multipart` image · — | `{ photo_file_id \| null }` | own record; image type and size cap; `files.kind = 'photo'`; not public until a card is approved | `inline:S.s1.photo` |
| `POST /api/me/confidentiality` | `{ promised: true }` | `{ confidentiality_promised_at }` | own enrolment; server time; idempotent | `inline:S.s1.conf` |
| `POST /api/me/own-assessment/open` | — | `{ url }` — the person's own Aarambh sitting link | own enrolment; Saarthi stores only `enrolments.own_assessment_ref`; `own_assessment_state` becomes `done` **only** from Aarambh's event (§6.1 — the event kind is still to agree), never from this call | `inline:S.own.state` |
| `POST /api/me/requests` | `{ type: 'detail_correction' \| 'time_commitment', summary, reason?, payload? }` | `201 { requests row }` | own record; `detail_correction` lands in the G1 inbox; `time_commitment` also writes a `time_commitments` row (`state = 'pending_approval'`); one open `time_commitment` request at a time (409) | `inline:modal(Something wrong)`, `requestBandChange` |
| `POST /api/me/first-login/confirm` | — | `{ first_login_state: 'confirmed', stage }` | `confidentiality_promised_at` set **and** `UNDERTAKING`; sets `enrolments.first_login_state = 'confirmed'`, `first_login_confirmed_at`; a coach moves `coaches.stage` `invited → in_training`; idempotent | `inline:S.firstLogin='confirmed'` |
| `GET /api/code/current` | — | `{ code_versions row, my_signature: code_signatures row \| null }` | `SESSION` | S4, C1 banner |
| `POST /api/me/code/read-to-end` | `{ code_version }` | `{ read_to_end_at }` | `ROLE-coach`; `coaches.stage = 'exam_passed'`; version = current; server time | `inline:S.code.read` |
| `POST /api/me/code/sign` | `{ code_version, includes_public_rating: bool }` | `{ code_signatures row }` | `ROLE-coach`; `coaches.stage = 'exam_passed'`; `read_to_end_at` recorded; version = current; server time | `inline:S.code.signed` |
| `POST /api/me/code/accept` | `{ code_version, accepted: true }` | `{ code_signatures row }` | `ROLE-coach`; version = current; writes the re-accept into `code_signatures`; clears `CODE-CURRENT` | `acceptCode` |

Client-only, no endpoint: `inline:S.stage='training';go('S2')` (navigation).

### 5.4 · Training (modules, library, tracks, exam, credential, public verify)

All coach endpoints here also carry `FIRST-LOGIN` and `CODE-CURRENT`.

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/library?q=` | — | `{ items: [library_documents row + unread: bool (derived from library_reads)] }` | `ROLE-coach` or staff; `UNDERTAKING`; `NO-EXPORT` (no download URL in the payload) | `inline:library search` |
| `GET /api/library/:id` | — | `{ library_documents row, body }` — rendered in-app | as above; `NO-EXPORT` headers | `libOpen` |
| `POST /api/library/:id/read` | `{ version }` | `{ library_reads row }` | as above; version = `current_version`; upserts `version_read`, `read_at` | `libOpen` |
| `POST /api/practice-debriefs/:id/start` | — | `{ practice_debriefs row, live_runs row (mode 'practice'), synthetic reading (same shape as §5.7 reading) }` | own enrolment; synthetic only; `practice_debriefs.state → in_progress`; **never written to client history** (no `debriefs` row) | `startPractice` |
| `POST /api/me/update-modules/:id/complete` | — | `{ update_module_assignments row }` | own row; `coaches.stage` in (`provisional`, `active`); `state due → done`; server `done_at` | `inline:S.updates[...].state='done'` |
| `PUT /api/me/time-commitment` | `{ band, days: [weekday], times_of_day: [string], months }` | `{ time_commitments row }` | `ROLE-coach`; `coaches.stage = 'exam_passed'` (later changes go through `requestBandChange`); enums; `months` in 6/12/18/24 | `inline:S.commit.band`, `togCommit`, `inline:S.commit.months` |
| `POST /api/me/credential` | — | `{ credentials row, coaches.stage: 'provisional', provisional_start, provisional_end }` | all four `exam_attempts` parts `passed`; `code_signatures` at the current version; a `time_commitments` row chosen; `UNDERTAKING`; `credential_number` generated **once** server-side (never edited or reused); sets the six-month window; idempotent | `inline:S.stage='provisional'` |
| `GET /api/me/credential/pdf` | — | the credential PDF, `Content-Disposition: inline` | own credential; `credentials.status <> 'withdrawn'`; generated server-side (`files.kind = 'credential_pdf'`) | `inline:Download credential` |
| `GET /api/public/credentials/:credential_number` | — | `{ credential_number, full_name, status, rank, level, issued_on, valid_to }` — nothing else | `PUBLIC-LIMIT`; check character validated before lookup; no search by name | `verifyModal` |

Exam marks (`exam_attempts.mark`) are never returned to a coach. Moving to `active` is a system job (§5.14).

### 5.5 · Coach profile & public card

All carry `ROLE-coach`, `FIRST-LOGIN`, `CODE-CURRENT`, own record only.

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `PATCH /api/me/coach` | `{ hours_target_month }` | `{ hours_target_month }` | one of the allowed values (setting); no approval; no effect on rostering | `setHoursTarget` |
| `GET /api/me/peer-hours` | — | `{ position, of, top_half: bool, pct_of_committed, median_hours }` | derived; same `time_commitments.band` only; **hours only — anonymous, no ratings, no money, nobody named** | C2 peer comparison (`peerBars`) |
| `PATCH /api/me/card` | `{ years_experience?, worked_with?, about? }` | `{ coach_public_cards row, about_word_count }` | `about` ≤ 80 words (server-counted); `worked_with` ≤ 160 chars; no contact details, handles or money (pattern check); any edit sets `status = 'draft'`; `approved_snapshot` stays live | `editCardWorked`, `editCardAbout` |
| `PUT /api/me/card/specialities` | `{ specialities: [speciality] }` | `{ specialities }` | values from the `coach_card_specialities.speciality` enum; **at most 3** (422); card → `draft` | `togSpec` |
| `POST /api/me/card/photo` · `DELETE /api/me/card/photo` | `multipart` image · — | `{ photo_file_id \| null }` | image type and size; card → `draft`; public only after approval | `toggleCardPhoto` |
| `POST /api/me/card/submit` | — | `{ status: 'pending', request_id }` | `draft → pending`; creates a `requests` row (type `public_card`); only an approved card is published | `submitCard` |

`requestBandChange` is `POST /api/me/requests` (§5.3). `verifyModal` is §5.4. There is no rate view (`FINANCE-ONLY`).

### 5.6 · Slots & calendar

All carry `ROLE-coach`, `FIRST-LOGIN`, `CODE-CURRENT`, own slots only. Every change that opens or closes an open
slot triggers the outbound **H1** push (§6.2).

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/me/slots?from=&to=` | — | `{ slots: [slots row + derived locked, too_soon], unavailability: [coach_unavailability row] }` | own rows; a booked slot shows `debrief_id` and the client's `first_name` only | `monthShift`, `dayModal` |
| `POST /api/me/slots/generate` | `{ slot_date, day_start_minute, day_end_minute, repeat_weeks }` | `{ created: [slots row], skipped: [{slot_date, start_minute, why}] }` | `LOCK-72H` (each generated slot inside the lock is skipped — the rig does not check this, BUILD_SPEC gap 26); skips unavailable dates; no duplicates or overlaps (slot length + gap settings); `repeat_weeks` in 1/2/4/8/12 | `genSlots` |
| `POST /api/me/slots` | `{ slot_date, start_minutes: [int] }` | `{ created: [slots row], skipped: [...] }` | as `genSlots` (`LOCK-72H` → 409 "ask admin") | `addDay` |
| `POST /api/me/slots/:id/close` | — | `{ slots row (status 'closed') }` | own slot; `status = 'open'`; `LOCK-72H`; a `booked` slot → 409 | `closeSlot` |
| `POST /api/me/slots/:id/locked-request` | `{ summary, reason }` | `201 { requests row }` | own slot inside the lock; creates `requests` (type `locked_slot`, `slot_id`) | `freezeAsk` |
| `POST /api/me/slots/:id/move-request` | `{ reason }` | `201 { requests row, is_late_drop }` | own `booked` slot; creates `requests` (type `move_debrief`, `slot_id`, `debrief_id`); under the late-drop line (48 h) sets `is_late_drop` and writes `late_drops`; the coach can never cancel a booking | `askMove` |
| `POST /api/me/unavailability` | `{ kind: 'range' \| 'weekday', date_from?, date_to?, weekday?, booked_action?: 'reassign' }` | `{ coach_unavailability row, closed_slots, locked_requests: [requests row], booked_slots: [slots row], move_requests: [requests row] }` | own record; open slots outside the lock → `closed`; open slots **inside** the lock become `locked_slot` requests (not removed — BUILD_SPEC gap 27); booked slots are never removed: without `booked_action` the response lists them so the front-end can ask; with `booked_action: 'reassign'` one `move_debrief` request per booked slot (late-drop rule per slot) | `markUnavailable`, `_unApply` |
| `POST /api/me/unavailability/:id/remove` | — | `{ removed_at }` | own row; sets `removed_at`; does not reopen closed slots | `removeUnavailable` |

Client-only, no endpoint: `setCalView`.

### 5.7 · Debriefs list and the reading

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/me/debriefs?tab=up\|action\|done&q=` | — | `{ items: [debriefs row: id, first_name, client_type, session_type, session_no, report_kind, report_version, sitting_type, integrity, language_code, scheduled_at, organisation_id, pack_size, consent_at_booking, status, prep_stale, on_hold, + next_screen (derived), sent_back_comment (latest feedback_letters.decision_comment)] }` | `ROLE-coach` · `SCOPE-COACH` · `FIRST-NAME-ONLY`; `q` matches `first_name` only | `setDebriefTab`, `searchDebriefs` |
| `GET /api/debriefs/:id` | — | the row above + `organisations.brief` / `organisation_programmes` when `organisation_id` is set | `SCOPE-COACH` · `FIRST-NAME-ONLY`; after `closed` the header and the coach's own notes stay, report access does not (`ACCESS-ENDS`) | `openDebrief` |
| `GET /api/debriefs/:id/reading` | — | **Served from the cache, trait fields only:** `{ reading: aarambh_readings (id, sitting_type, sitting_completed_at, payload_version, generated_at, received_at, integrity, state), traits: [aarambh_reading_traits (trait_code, level, lane, gap_band, trait_status, caret) + traits.name], reports: [aarambh_reading_reports (id, report_type, copy_kind, report_version, integrity, sort_order)], opened: [aarambh_opened_items (item_ref, report, kind, name, band, times_opened, sort_rank)] }` — **no URL, no report text, no raw number** | `ROLE-coach` · `SCOPE-COACH` · `UNDERTAKING` (403 `rule: UNDERTAKING` → the front-end draws the locked card linking to S1) · `ACCESS-ENDS` · `NO-EXPORT`; `aarambh_readings.state` must be `active` (superseded → 409, prep stale); never derives anything (`FINISHED-READING-ONLY`) | `undSigned`, `repList`, `openedList`, `points` (computed client-side from these fields) |
| `POST /api/debriefs/:id/report-link` | `{ report_id (aarambh_reading_reports.id), copy: 'person' \| 'coach', mode: 'prep' \| 'present' }` | `{ url, expires_at }` — a short-lived signed URL from Aarambh, **never stored** | `SCOPE-COACH` · `ACCESS-ENDS` · `NO-EXPORT`; `copy: 'coach'` refused without `UNDERTAKING` (403); `PRESENT-PERSON-ONLY`: with `mode: 'present'` a coach copy is **always** refused (403), whatever the caller holds. Calls Aarambh **H4** (`POST /setu/coach-links` with `undertakingVersion` and `undertakingSignedAt`; the person copy with `copy: "person"`); writes `report_link_requests` (`copy_kind`, `report_type`, `undertaking_version`, `present_mode`, `expires_at`, `result` issued / refused). Renewable while the debrief is open | `repPane`, `pickReportTab`, `seeInCoachCopy` · `openReportWindow`, `toggleReportStrip`, `setPresentMode` |
| `PATCH /api/me/prefs` | `{ report_view?, split_width_pct?, swap_sides?, hide_report?, report_zoom_pct? }` | `{ coach_prefs row }` | own row; `split_width_pct` 25–70, `report_zoom_pct` 60–160 | `setReportLayout`, `bindGutter`, `repZoom` |
| `POST /api/admin/debriefs/:id/reading-file` | `multipart` — one reading JSON (payload v1.2) + `reason` | `{ aarambh_readings row (route 'file'), intake_log }` | `ROLE-admin` · `ADMIN-REASON` · `FINISHED-READING-ONLY`; the **admin-only** file route (BUILD_SPEC open question 8 — the coach upload is not built); supersedes any earlier `active` reading for the debrief | `useReading`, `normalise` (the same intake as the H3 pull, §6.2) |

Client-only, no endpoint: `blockPrintSave` (plus the print stylesheet — `NO-EXPORT`), `togglePoints`. The rig's
`loadReading`, `readFile`, `listRig`, `fromRig` are rig only (BUILD_SPEC §4); see §7.

### 5.8 · Prep

All carry `ROLE-coach`, `SCOPE-COACH`, `CODE-CURRENT`, `ACCESS-ENDS`. Each `/api/debriefs/:id/...` question endpoint
has a practice twin under `/api/practice-debriefs/:id/...` (own enrolment; synthetic only; rows carry
`prep_questions.practice_debrief_id`).

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/debriefs/:id/prep` | — | `{ prep row, questions: [prep_questions row + options: [prep_question_options row]] }` | `prep.private_notes` returned only to the assigned coach — never to a mentor, faculty, admin or Aarambh | C5 |
| `PATCH /api/debriefs/:id/prep` | `{ understanding?, private_notes?, caution_ack? }` | `{ prep row }` | autosave; refused (409) when `debriefs.prep_stale = 1` | `saveUnderstanding` · `savePrivateNotes`, `ackCaution` |
| `POST /api/debriefs/:id/prep/done` | — | `{ prep_done_at, status: 'prep' }` | `debriefs.status = 'assigned'`; when `debriefs.integrity = 'caution'`, `prep.caution_ack = 1` (409 otherwise); `debriefs.status → prep`; writes `debrief_status_log` | `markPrepDone` |
| `POST /api/debriefs/:id/questions` | `{ step, text, source, bank_question_id?, why?, note?, point_kind?, trait_code? }` | `201 { prep_questions row, warnings: [string] }` | `step` in E/T/U; refuse a duplicate of the same `bank_question_id` or text (409); `source = 'own'` for a blank coach question; runs the wording check | `addQ`, `addOwn` |
| `PATCH /api/questions/:id` | `{ text?, why?, note? }` | `{ prep_questions row, warnings: [string] }` | own debrief's question; `why` from the enum; wording check runs on save and returns warnings (advisory here) | `qEdit`, `qSet`, `checkQ` |
| `DELETE /api/questions/:id` | — | `{ ok: true }` | own debrief's question; refused (409) once `run_answers` has a row for it. *`prep_questions` has no soft-delete column — this is the one delete outside the reading cache; confirm or add `removed_at` (§8)* | `qDel` |
| `PUT /api/questions/:id/options` | `{ options: [{ ord, label, follow_up? }] }` (empty array = none) | `{ options }` | 0 or 2–4 options; `label` ≤ 80, `follow_up` ≤ 300 | `qOpts`, `editOption` |
| `POST /api/questions/check` | `{ text }` | `{ warnings: [string] }` | pure check (directive, closed start, blaming why, two in one, levels or numbers); stores nothing | `checkQ` |
| `GET /api/bank-questions?trait_code=` | — | `{ items: [bank_questions row (state 'active')] }` | `ROLE-coach` or faculty; read-only | `browseBank` |
| `POST /api/question-proposals` | `{ text, origin, debrief_id?, trait_code?, point_kind? }` | `201 { question_proposals row }` | `origin` in `own_question` / `follow_up_in_room` / `gap_note`; `debrief_id` in scope; nothing goes live by itself (faculty decide, §5.13 G2) | `proposeToBank`, `sendCand`, `saveGapNote` (its proposal) |

### 5.9 · Live run

All carry `ROLE-coach`, `SCOPE-COACH`, `CODE-CURRENT`, `ACCESS-ENDS`. Practice runs use the same `/api/runs/:id/...`
calls on a `live_runs` row with `mode = 'practice'` (own enrolment).

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `POST /api/debriefs/:id/run` | — | `{ live_runs row + step_log, answers, followups, jots }` | creates (`started_at` server time, `current_step = 'S'`, booking consent carried as the default) or resumes the one run per debrief (`uq_lr_debrief`); `debriefs.status` in (`prep`, `assigned`); the reading `active` (not superseded, 409) | `startRun`, `freshRun` |
| `PATCH /api/runs/:id` | `{ consent_at_session?, covers_done?, confidentiality_done?, client_state?, state_since_min? }` | `{ live_runs row }` | own run, not ended; `consent_changed` set by the server when the choice differs from `debriefs.consent_at_booking`; `none` → the transcript tool must not start; `transcript` stays mocked until legal sign-off | `setConsent`, `tickCovers` · `tickConfidentiality`, `setStateL` |
| `POST /api/runs/:id/step` | `{ step, at_min }` | `{ current_step, run_step_log row }` | `CONSENT-FIRST`; logs forward moves and step-backs (`stepped_back`) | `lmGo` |
| `PUT /api/runs/:id/answers/:question_id` | `{ mark?, option_ord?, answer_text?, follow_up_answer?, from_transcript?, put_aside_reason? }` | `{ run_answers row }` | question belongs to the debrief; `mark` covered / put_aside / null (tap again clears); a new `option_ord` clears `follow_up_answer`; answers never required | `markQ`, `pickOpt`, `saveAnswer`, `setPutAsideReason` |
| `POST /api/runs/:id/followups` | `{ question_id, question, answer? }` | `201 { run_followups row }` | own run; becomes a Question Bank candidate only via `sendCand` | `addFollow` |
| `PATCH /api/runs/:id/followups/:question_id/:ord` | `{ answer }` | `{ run_followups row }` | own run | `saveAnswer` (an added follow-up's answer) |
| `POST /api/runs/:id/jots` | `{ step, at_min, text }` | `201 { run_jots row }` | own run | `addJot` |
| `POST /api/runs/:id/no-show` | — | `{ outcome: 'no_show', status: 'noshow' }` | real run; now ≥ `debriefs.scheduled_at` + 15 min (409); ratings skipped; writes `debrief_status_log`, a `same_day_alerts` row (kind `did_not_join`) | `lmNoShow` |
| `POST /api/runs/:id/end-early` | `{ ended_early_reason }` | `{ outcome: 'ended_early', ended_at }` | reason required (422); writes a `same_day_alerts` row (kind `ended_early`, `call_today`); ratings skipped | `lmEndEarly` |
| `POST /api/runs/:id/end` | — | `{ current_step: 'END', ended_at }` | `CONSENT-FIRST`; logs END | `lmEndIt` |
| `POST /api/runs/:id/reopen` | — | `{ current_step }` | only before finish (409 after) | `backToLive` |
| `POST /api/runs/:id/finish` | — | `{ status: 'debriefed', after_debriefs row (due_at = ended_at + 24 h), feedback_letters row (version 1, seeded) }` | **every** question marked and every `put_aside` has a `put_aside_reason` (422 listing them); `debriefs.status → debriefed`; writes `debrief_status_log`; practice → `practice_debriefs` sent to faculty, no `after_debriefs` row | `finishRun` |
| `POST /api/debriefs/:id/retake-offer` | `{ reason }` | `201 { retake_offers row }` | reason required; one per person per coach (`uq_ro_coach_person` → 409); sets `debriefs.on_hold = 1`; tells Aarambh — *the outbound call is not yet in `INTEGRATION_AARAMBH.md` (§8)* | `doRetake` |

Client-only, no endpoint: `isTyping` · `nudges`, `dismissNudge`, `toggleMenu`, `toggleStatePicker`, `lmEnd` (draws the
End summary from data already loaded), `startTick` · `stopTick`, `offerRetake` (opens the dialog; the write is
`doRetake`). `setPresentMode` has no endpoint of its own — the report frame it shows is fetched with
`POST /api/debriefs/:id/report-link` and `mode: 'present'` (§5.7).

### 5.10 · After the debrief (C7–C10) — submit sends H6

All carry `ROLE-coach`, `SCOPE-COACH`, `CODE-CURRENT`. Practice runs never reach these endpoints (404).

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/debriefs/:id/after` | — | `{ after_debriefs row, recommendations: [row], letter: latest feedback_letters row, products: [{source, product_ref \| org_programme_id, label}], audit_block (derived, not a score), checklist (derived) }` | `debriefs.status` in (`debriefed`, `after`, `sentback`, `validated`, `closed`); products filtered by `client_type` (`cant_say` → `mid_management`); organisation programmes only for that organisation's clients | `AFTER`, `retakeCard`, `auditBlock` |
| `PUT /api/debriefs/:id/recommendations` | `{ no_recommendation: bool, no_recommendation_reason?, items: [{ source, product_ref?, org_programme_id?, based_on: [value], who_raised, why?, setu_pointer? }] }` | `{ recommendations: [row], no_recommendation }` | `LOCKED-AFTER-SUBMIT`; at most 3 (`ord` 1–3); each item ≥ 1 `based_on`; `no_recommendation` needs a reason and clears the items; `chk_rec_target` | `togRec`, `togBased`, `setWhoRaised`, `setRecWhy`, `setNoRecommendation` |
| `PATCH /api/debriefs/:id/letter` | `{ talked_about?, stood_out?, next_steps?, coach_note? }` | `{ feedback_letters row, word_count, warnings: [string] }` | `LOCKED-AFTER-SUBMIT` (letter editable only while `letter_status` is `draft` or `sent_back`); the server recounts words and re-runs the wording check | `editLetter`, `letterCheck`, `useLine` (appends a fetched transcript line to `talked_about`) |
| `PATCH /api/debriefs/:id/after` | `{ letter_read_ack?, rate_settled?, rate_understood?, rate_covered?, rate_next_step?, rate_comment?, reflection?, transcript_meeting_id?, recording_url?, recording_missing_reason?, gap_note? }` | `{ after_debriefs row }` | `LOCKED-AFTER-SUBMIT` for every field except `reflection` (never locks) and `letter_read_ack` (resets on a send-back); rates 1–5, skipped when `live_runs.outcome` is `no_show` or `ended_early`; `transcript_meeting_id` UUID; `recording_url` `https://` on a Gyani Says-owned meeting account (never the coach's own) — validated server-side; a `recording_missing_reason` clears the link; `reflection` is `[PRIVATE]` (the mentor of a provisional coach may read it, §5.12), never sent to Aarambh | `ackLetterRead`, `setRating`, `setRateComment`, `saveReflection`, `setMeetingId`, `setRecordingLink`, `setNoRecordingReason`, `saveGapNote` |
| `GET /api/debriefs/:id/transcript` | — | `{ lines: [{ at, speaker_role, text }] }` | only when `live_runs.consent_at_session = 'transcript'`; fetched from Gyani Says' own transcript workspace by `transcript_meeting_id`; **not stored** (sets `transcript_fetched_at` only); `NO-EXPORT` | `trFetch`, `trPanel` |
| `POST /api/debriefs/:id/after/submit` | — | `{ submitted_at, status: 'after', letter_status: 'awaiting_validation' }` | refused (422 with the failing items) unless: recommendations ok (each pick with a `based_on`, or a no-recommendation reason) · `letter_read_ack` · rating complete or skipped · recording ok (link, a missing reason, or consent `transcript` / `none`) · clean wording check; `submitted_at` server time; locks per `LOCKED-AFTER-SUBMIT`; `debriefs.status → after`; writes `debrief_status_log`; sends **H6** (§6.2) and sets `disposition_sent_at`. Recommendations for an organisation are held until `client_share_consents.consented = 1` | `submitAfter` |
| `POST /api/debriefs/:id/letter/resubmit` | — | `{ feedback_letters row (version + 1), status: 'after' }` | only when `letter_status = 'sent_back'` and within 24 h of the send-back; `letter_read_ack` set and a clean wording check; new letter version; resets `letter_read_ack`; `debriefs.status sentback → after`; sends the new letter to Aarambh for validation — *the H6 shape for a resubmit is to agree (§8)* | `resubmit` |

Client-only, no endpoint: `letterStatus` · `hl`, `linkHelp` (the server validates on save), `searchTranscript`,
`scrollToSection`. `offerRetake` / `doRetake` are §5.9; `sendCand` is §5.8.

### 5.11 · Coaching sessions (C12) and the coach guide (C11, C1)

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/debriefs/:id/coaching` | — | `{ coaching_session_notes row, step_notes: [coaching_step_notes row], history: [earlier coaching_session_notes of the same coaching_engagements row], engagement }` | `ROLE-coach` · `SCOPE-COACH` · `RANK-SENIOR`; `debriefs.session_type = 'coaching'`; `[PRIVATE]` — never another coach's notes | C12 |
| `PATCH /api/debriefs/:id/coaching` | `{ focus?, current_node?, state_read?, action?, follow_up_on? }` | `{ coaching_session_notes row }` | as above; `current_node` must be a valid branch of the stored node; `follow_up_on` ≥ the session date | `setSessionFocus`, `stepTo`, `stepBackDown`, `setSessionAction`, `setFollowUp` |
| `PUT /api/debriefs/:id/coaching/steps/:node` | `{ note }` | `{ coaching_step_notes row }` | as above | `setStepNote` |
| `GET /api/guide` | — | `{ guide_versions row (current), model_map: [guide_model_map row], my_ack }` | `ROLE-coach` | C11 |
| `POST /api/me/guide-acks` | `{ guide_version }` | `{ guide_acks row }` | own; idempotent | `ackGuide` |

Client-only, no endpoint: `setGuideModel`. C12 is parked for re-review (BUILD_SPEC §5); these endpoints follow the
rig as it stands.

### 5.12 · Faculty and mentor writes (no rig control yet)

The rig has no buttons for these; `data-model.md` lists them as writes by faculty and mentors. Build them with the
G2 faculty / mentor views.

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `POST /api/faculty/module-progress/sign` | `{ enrolment_id, module_id, faculty_feedback }` | `{ module_progress row (state 'done') }` | `ROLE-faculty` · `SCOPE-FACULTY`; modules signed strictly in order; server `signed_at` | S2 module sign-off |
| `POST /api/faculty/exam-attempts/:id/result` | `{ result, mark, feedback, half_a_plan?, half_b_comparison? }` | `{ exam_attempts row }` | `ROLE-faculty`; the caller is in `exam_markers` for that part · `MENTOR-NOT-MARKER`; `attempt_no` ≤ 3; when all four parts pass, `coaches.stage → exam_passed` | S4 exam results |
| `POST /api/faculty/practice-debriefs/:id/feedback` | `{ feedback }` | `{ practice_debriefs row (state 'feedback_given') }` | `ROLE-faculty` · `SCOPE-FACULTY` | S2 practice debriefs |
| `GET /api/mentor/debriefs/:id/review` | — | `{ questions: [prep_questions row], reflection }` — never `private_notes`, never the reading | `ROLE-mentor` · `SCOPE-MENTOR`; only debriefs of a `provisional` mentee | C5 / C7–C10 mentor read |
| `POST /api/mentor/supervised-debriefs/:debrief_id/sign` | — | `{ supervised_debriefs row }` | `ROLE-mentor` · `SCOPE-MENTOR`; server `mentor_signed_at` | S4 supervised debriefs |
| `POST /api/mentor/hours` | `{ coach_id, hours, on_date }` | `201 { mentor_hours_log row }` | `ROLE-mentor` · `SCOPE-MENTOR` | S4 mentor hours |
| `POST /api/mentor/coaches/:id/signoff` | — | `{ mentor_signoff_at }` | `ROLE-mentor` · `SCOPE-MENTOR`; coach `provisional` | S4 mentor sign-off |

### 5.13 · Admin G0–G10

Every write here carries `ADMIN-REASON`. Reads carry `FIRST-NAME-ONLY` and `FINANCE-ONLY`.

#### G0 · Admin home

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/home` | — | `{ to_assign, prep_overdue, letters_overdue, sent_back, open_requests, alerts: [same_day_alerts row], capacity_warning, lapsing_this_month, training_events: [...] }` — counts computed server-side, no client names | `ROLE-admin/finance_admin` | G0 tiles (navigation to G3 / G1 / G9) |
| `POST /api/admin/alerts/:id/acknowledge` | `{ reason }` | `{ acknowledged_by, acknowledged_at }` | `ROLE-admin` · `ADMIN-REASON`; an alert is never deleted | `acknowledgeAlert` |

#### G1 · Roster, grading and the Requests inbox

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/coaches` | `?stage=&coach_type=&q=` | `{ items: [roster row] }` | `ROLE-admin/finance_admin` · `FINANCE-ONLY` (slab only to Finance admin) | G1 roster |
| `GET /api/admin/coaches/:id` | — | `{ coaches row, users (full_name, first_name), user_languages, coach_tracks, coach_org_certifications, time_commitments (active), credentials, latest code_signatures, undertaking_signatures, derived rating, warnings this month, pay_slab_id (Finance admin only) }` — **never** `prep.private_notes`, reflections or coaching notes | `ROLE-admin/finance_admin` · `FINANCE-ONLY` | `coachRec` |
| `PATCH /api/admin/coaches/:id` | `{ field: 'category' \| 'growth' \| 'cant_say_rule' \| 'coach_type' \| 'rank' \| 'pay_slab_id', value, organisation_id?, reason }` | `{ coaches row }` (or the new `coach_pay_agreements` row for the slab) | `ROLE-admin` · `ADMIN-REASON`; `pay_slab_id` → `ROLE-finance_admin` only (`FINANCE-ONLY`), written as a new `coach_pay_agreements` row (kind `standard_slab`, `FORWARD-ONLY`); a `category` change needs the minimum ratings (setting) unless set at onboarding; `level` is read-only (422); switching to `org` requires `organisation_id` | `setRec` |
| `POST /api/admin/coaches/:id/end-access` | `{ organisation_id, reason }` | `{ undertaking_signatures row (access_state 'ended') }` | `ROLE-admin` · `ADMIN-REASON` · `ACCESS-ENDS`; `coach_type = 'org'` only; ends open `debrief_assignments` (`end_reason = 'access_ended'`); calls revoke (§6.2) | `endAccess` |
| `POST /api/admin/coaches/:id/pause` | `{ reason }` | `{ stage: 'paused', stage_before_pause, requeued: [assignment_queue row] }` | `ROLE-admin` · `ADMIN-REASON`; from `provisional` / `active`; booked work → `assignment_queue` (source `paused_coach`), assignments ended (`end_reason = 'paused'`), coach links revoked; `credentials.status → paused` | `pauseCoach` |
| `POST /api/admin/coaches/:id/resume` | `{ reason }` | `{ stage }` (= `stage_before_pause`) | `ROLE-admin` · `ADMIN-REASON`; *no rig control yet — the lifecycle needs it (BUILD_SPEC §1a)* | — |
| `POST /api/admin/coaches/:id/undertaking-reminder` | — | `{ notifications row }` | `ROLE-admin`; notification only (kind `undertaking_reminder`) | `sendUndertakingReminder` |
| `GET /api/admin/requests?state=open` | — | `{ items: [requests row + target screen (derived from type)] }` | `ROLE-admin` | G1 Requests tab |
| `POST /api/admin/requests/:id/decide` | `{ decision: 'approved' \| 'declined', reason }` | `{ requests row }` | `ROLE-admin` · `ADMIN-REASON` (reason required for a decline, logged for both); `state = 'open'` only — both outcomes final; approving applies it: `detail_correction` → `users` / `user_profiles`; `time_commitment` → the pending `time_commitments` row `active`, the old `superseded`; `public_card` → `coach_public_cards.status = 'approved'`, `approved_snapshot`; `move_debrief` → `assignment_queue` row (source `move_request`); `locked_slot` → close or keep the slot; a `notifications` row (kind `request_decided`) | `reqDo` |

Client-only, no endpoint: G1 tab switch, "Open a batch in G2" (navigation).

#### G2 · Training admin

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/batches/:id` | — | `{ batches row, derived state and seat fill, batch_staff, batch_sessions, batch_waitlist, batch_module_versions, batch_date_changes, enrolments }` | `ROLE-admin`; faculty read-only per `SCOPE-FACULTY` | `openBatch` |
| `GET /api/admin/batch-eligibility` | `?programme_code=&mode=&city=&start_date=&end_date=` | `{ faculty: [{faculty_id, eligible: bool, reasons: [string]}], mentors: [...] }` | `ROLE-admin`; computed server-side (`facultyFit`, `mentorFit`) | `batchBuilder`, `nbTog` (selection is client-side; re-checked on save) |
| `POST /api/admin/batches` | `{ programme_code, name, mode, city?, venue?, start_date, end_date, seats_in_person, seats_online, curriculum_label?, organisation_id?, staff: [{faculty_id, role}], reason }` | `201 { batches row, batch_module_versions }` | `ROLE-admin` · `ADMIN-REASON` · `FACULTY-RATIO`; ≥ 1 faculty; end ≥ start; everyone still eligible at save; seat types match the mode; module versions fixed at current | `nbSave` |
| `POST /api/admin/batches/:id/move-dates` | `{ new_start, new_end, reason }` | `{ batches row, batch_date_changes row }` | `ROLE-admin` · `ADMIN-REASON`; not closed; end ≥ start; re-checks faculty overlap; shifts `batch_sessions`; recomputes `enrolments.own_assessment_due`; a `notifications` row per member (kind `batch_dates_changed`) | `moveDates` |
| `POST /api/admin/batches/:id/close` | `{ reason }` | `{ closed_at, close_reason }` | `ROLE-admin` · `ADMIN-REASON`; not already closed | `closeBatch` |
| `POST /api/admin/waitlist/:id/offer-seat` | `{ reason }` | `{ batch_waitlist row (offered_seat), enrolment, user }` | `ROLE-admin` · `ADMIN-REASON` · `FACULTY-RATIO`; a seat of that `seat_type` free (checked in a transaction); runs the **full enrol path** as `doEnrol` (BUILD_SPEC gap 23) | `offerSeat` |
| `POST /api/admin/waitlist/:id/move` | `{ target_batch_id, reason }` | `{ batch_waitlist row (moved), applications.state: 'offered' }` | `ROLE-admin` · `ADMIN-REASON`; target not closed or running, same programme | `moveWait` |
| `GET /api/admin/applications/:id` | — | `{ applications row, application_languages, application_preferences, cv: {file_id, bytes} \| null }` | `ROLE-admin` | `appView` |
| `GET /api/admin/applications/:id/cv` | — | the CV, rendered inline | `ROLE-admin` · `NO-EXPORT` (viewed, never downloaded) | `appView` |
| `PATCH /api/admin/applications/:id/state` | `{ state: 'new' \| 'screened' \| 'interviewing', reason }` | `{ applications row }` | `ROLE-admin` · `ADMIN-REASON`; transitions per BUILD_SPEC §1a | `inline:S.apps[...].state` |
| `GET /api/admin/applications/:id/fitting-batches` | — | `{ items: [{batch_id, name, programme_code, start_date, seats_left_in_person, seats_left_online, matches: bool}] }` | `ROLE-admin`; fitting = programme by `applying_as` (`core` for a coach, `induct` for a trainer), not closed or running | `offerBatch`, `enrol` (opens the dialog) |
| `POST /api/admin/applications/:id/offer` | `{ batch_id, reason }` | `{ applications row (offered, offered_batch_id) }` | `ROLE-admin` · `ADMIN-REASON`; batch fits; not `enrolled`; a `notifications` row (kind `offer`) | `doOffer` |
| `POST /api/admin/applications/:id/enrol` | `{ batch_id, seat_type, coach_type?, organisation_id?, languages: [{language_code, proficiency}], enrolled_tracks: [track], reason }` | `201 { enrolments row, users row (state 'invited'), coaches row (stage 'invited') or faculty row, waitlisted: bool }` | `ROLE-admin` · `ADMIN-REASON` · `FACULTY-RATIO`; seat count checked **in a transaction** (full → `batch_waitlist`, `applications.state = 'waitlisted'`); `org` requires `organisation_id` (`chk_enr_org`); ≥ 1 language; `enrolled_tracks` stored (BUILD_SPEC gap 24); `users.email` / `phone` unique (409); creates `user_roles`, `user_profiles`, `user_languages`, the invite (`notifications` kind `invite` + a set-password link per `NO-PASSWORD`), default mentor; for a coach requests the own Aarambh sitting (`own_assessment_ref`) | `doEnrol` |
| `GET /api/admin/promotion-candidates` | — | `{ items: [{coach_id, first_name, full_name, rank, level}] }` | `ROLE-admin`; `active` coaches not already in `faculty` | `promoteModal` |
| `POST /api/admin/faculty` | `{ coach_id, kind, teaches, may_mark, city?, teaches_online, cap_batches_per_month, induction_batch_id, reason }` | `201 { faculty row (state 'in_induction', route 'promoted_coach', promotion_reason) }` | `ROLE-admin` · `ADMIN-REASON`; coach `active`; induction batch open with a free seat; adds `user_roles` | `doPromote` |
| `GET /api/admin/faculty/:id` | — | `{ faculty row, faculty_calibrations, faculty_agreements, code_signatures, undertaking_signatures, batches, mentees, rate_band (Finance admin only) }` | `ROLE-admin/finance_admin`; faculty / mentor read their own; `FINANCE-ONLY` | `facRec` |
| `POST /api/admin/faculty/:id/calibrations` | `{ note?, reason }` | `201 { faculty_calibrations row (calibrated_on today, due_on + 182 days) }` | `ROLE-admin` · `ADMIN-REASON` | `calibrate` |
| `POST /api/admin/faculty/:id/state` | `{ state: 'active' \| 'paused', reason }` | `{ faculty row }` | `ROLE-admin` · `ADMIN-REASON`; `active` needs induction done and `teaches` set; pausing removes them from future eligibility | `facState` |
| `PUT /api/finance/faculty/:id/rate-band` | `{ rate_band, effective_from, reason }` | `201 { faculty_pay_terms row }` | `ROLE-finance_admin` · `FINANCE-ONLY` · `ADMIN-REASON` · `FORWARD-ONLY`; *no rig control yet* | G2 faculty record (Finance) |
| `GET /api/admin/enrolments/:id/eligible-markers` | — | `{ parts: [{part, markers: [{faculty_id, eligible, reasons}]}] }` | `ROLE-admin`; `canMark`, `calibState` server-side | `ratersModal` |
| `PUT /api/admin/enrolments/:id/markers` | `{ part, faculty_ids: [id], reason }` | `{ exam_markers rows for the part }` | `ROLE-admin` · `ADMIN-REASON` · `MENTOR-NOT-MARKER` | `rTog` |
| `GET /api/admin/modules/:id` | — | `{ modules row, module_versions, module_version_items, batches teaching it and at which version }` | `ROLE-admin`; faculty per `SCOPE-FACULTY` | `modRec` |
| `POST /api/admin/modules/:id/flag` | `{ reason }` | `{ modules row (status 'needs_update', needs_update_reason) }` | `ROLE-admin` or owning faculty · `ADMIN-REASON` | `flagMod` |
| `POST /api/admin/modules/:id/publish` | `{ change_note, items: [{kind, position, text}], practice_text?, reason }` | `201 { module_versions row, modules row (status 'current') }` | `ROLE-admin` or owning faculty · `ADMIN-REASON`; `change_note` required; `status = 'needs_update'` (409 otherwise); `nextVer` server-side; running batches keep their fixed version; a core module creates an `update_module_assignments` row for every certified coach | `publishMod` |
| `POST /api/admin/library/:id/publish` | `{ change_note, reason }` | `201 { library_document_versions row }` | `ROLE-admin` · `ADMIN-REASON`; bumps `library_documents.current_version` — every reader's `version_read` is now behind (unread) | `inline:Publish` |
| `GET /api/faculty/question-proposals?state=proposed` | — | `{ items: [question_proposals row] }` — no client details | `ROLE-faculty` or `ROLE-admin` | G2 Question Bank proposals |
| `POST /api/question-proposals/:id/decide` | `{ decision: 'approved' \| 'declined', step, trait_code?, why?, reason }` | `{ question_proposals row, bank_questions row (when approved) }` | `ROLE-faculty` or `ROLE-admin` · `ADMIN-REASON`; `state = 'proposed'` only | `inline:Approve` |
| `POST /api/admin/enrolments/:id/own-assessment-reminder` | — | `{ notifications row }` | `ROLE-admin`; only when `own_assessment_state = 'not_started'` | `inline:Send a reminder` |

Client-only, no endpoint: `inline:S.admin.g2tab` · `inline:S.admin.g2prog` · `inline:S.admin.g2cprog`,
`inline:S.admin.g2tab='apps'`, `cycleLang` (sent in the `doEnrol` body). The list views come from bootstrap
(`apps`, `batches`, `faculty`, `trainees`, `modules`).

#### G3 · Assigning coaches

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/queue` | — | `{ items: [assignment_queue row ⋈ debriefs (first_name, client_type, language_code, scheduled_at, tier, report_kind, session_type, organisation_id, integrity)] }` | `ROLE-admin/finance_admin` · `FIRST-NAME-ONLY` | G3 queue (select a row) |
| `GET /api/admin/queue/:id/suggestions` | — | `{ items: [{coach_id, first_name, full_name, room_left, reasons: [string], free_slots: [slots row]}] }` — derived, never stored | `ROLE-admin`; hard filters and sort per BUILD_SPEC G3 | G3 suggestion list |
| `GET /api/admin/coaches/:id/slots?from=&to=` | — | `{ slots, unavailability }` | `ROLE-admin` | C3 read via G3 |
| `POST /api/admin/queue/:id/assign` | `{ coach_id, slot_id, reason }` | `{ debrief_assignments row, debriefs row (status 'assigned'), meeting_ref }` | `ROLE-admin` · `ADMIN-REASON`; **re-checks every hard filter at that moment**: `coaches.stage` `active` or `provisional`; level covers `client_type`; `cant_say_rule`; tier; language; slot free; organisation pool; Advanced for Paradox / Team; the coach's `UNDERTAKING`. Sets `slots.status = 'booked'`, `assignment_queue.state = 'assigned'`; a `notifications` row (kind `new_debrief`); pulls the reading (**H3**, §6.2). An invalid reading (`hold`) is refused and goes back to Aarambh as a retake | `assignCoach` |
| `POST /api/admin/queue/:id/cant-fill` | `{ reason }` | `{ assignment_queue row (cant_fill) }` | `ROLE-admin` · `ADMIN-REASON`; Aarambh offers the client another time — *the outbound call is not yet in `INTEGRATION_AARAMBH.md` (§8)* | `markCantFill` |
| `POST /api/admin/debriefs/:id/close` | `{ reason }` | `{ status: 'closed', closed_at, reading_purge_after }` | `ROLE-admin` · `ADMIN-REASON` · `ACCESS-ENDS`; from `validated` (or a terminal side exit); revokes coach links (§6.2); schedules the reading-cache purge; the coach's own notes stay. Also run by the system (§5.14) | debrief close (BUILD_SPEC §1b) |

#### G4 · Settings

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/settings` | `?group_key=` | `{ items: [settings row] }` | `ROLE-admin/finance_admin` · `FINANCE-ONLY` (group `money_packs` values and `amount_minor` absent for Admin) | G4 |
| `GET /api/admin/settings/:setting_key` | — | `{ settings row, history: [setting_changes row] }` | as above | `setChange` |
| `POST /api/admin/settings/:setting_key` | `{ value, effective_from, reason }` | `201 { setting_changes row, settings row }` | caller's role = `settings.owner_role` (`money_packs` → Finance admin only) · `ADMIN-REASON` · `FORWARD-ONLY`; old rows kept; a new current Code version (`code_versions.is_current`) makes every coach re-accept (`CODE-CURRENT`) | `saveSetting` |

#### G5 · Ratings review

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/rating-flags` | `?quarter=&state=` | `{ items: [rating_flags row] }` | `ROLE-admin`; Finance admin reads `slab_request` outcomes | G5 list |
| `GET /api/admin/coaches/:id/rating-review` | — | `{ rating_flags, client_ratings (debrief_id, score, comment, rated_at — first name only), rating_exclusions, derived average, count, trend, coach-client gap, late drops }` | `ROLE-admin`; Saarthi never proposes a grade | `openRatingReview` |
| `POST /api/admin/rating-flags/:id/decide` | `{ outcome, category_to?, reason }` | `201 { rating_reviews row, rating_flags row (decided / dismissed) }` | `ROLE-admin` · `ADMIN-REASON`; `category_change` needs the minimum ratings; a slab change is **never made here** — `outcome = 'slab_request'` is the request Finance admin acts on in G7; the coach sees the new letter only | `decideRatingReview` |
| `POST /api/admin/client-ratings/:id/exclude` | `{ reason }` | `201 { rating_exclusions row }` | `ROLE-admin` · `ADMIN-REASON`; the `client_ratings` row is kept | `excludeRating` |

#### G6 · Upgrade tiers

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/tiers` | — | `{ upgrade_tiers rows, coaching_packs rows, supply (derived), tier_rates (Finance admin only) }` | `ROLE-admin/finance_admin` · `FINANCE-ONLY`. The client price is never in Saarthi | G6 |
| `POST /api/finance/tier-rates` | `{ client_type, tier_key, session_type, amount_minor, currency, effective_from, reason }` | `201 { tier_rates row }` | `ROLE-finance_admin` · `FINANCE-ONLY` · `ADMIN-REASON` · `FORWARD-ONLY`; no formula links it to coach pay | `setTierRate` |

#### G7 · Slabs and payments (Finance admin only — every endpoint 403 for any other role)

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/finance/coaches/:id/rate-card` | — | `{ coach_pay_agreements (current + superseded), pay_slabs, pay_slab_rates, worth signals (derived) }` | `ROLE-finance_admin` · `FINANCE-ONLY` | `rateCard` (render data), `setRate` (opens the change form) |
| `POST /api/finance/coaches/:id/pay-agreements` | `{ kind, pay_slab_id?, rate_debrief_minor?, rate_one_to_one_minor?, rate_group_minor?, currency?, share_basis_points?, effective_from, reason }` | `201 { coach_pay_agreements row }` — the previous row gets `superseded_at` | `ROLE-finance_admin` · `FINANCE-ONLY` · `ADMIN-REASON` · `FORWARD-ONLY` (future sessions only); the coach never sees it | `doRate` |
| `GET /api/finance/pay-runs?period=` | — | `{ pay_runs row, pay_lines rows }` | `ROLE-finance_admin` · `FINANCE-ONLY` | G7 pay run |
| `POST /api/finance/pay-runs/:id/approve` | `{ reason }` | `{ pay_runs row (approved or held_no_bank) }` | `ROLE-finance_admin` · `FINANCE-ONLY` · `ADMIN-REASON`; stops at `held_no_bank` while bank details are missing; training and exam time are never paid | `approvePayRun` |

#### G8 · Organisation engagements

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/organisations/:id` | — | `{ organisations row, engagements, organisation_programmes, pool: coach_org_certifications, vetted_coaches }` | `ROLE-admin/finance_admin` | G8 |
| `POST /api/admin/organisations` · `PATCH /api/admin/organisations/:id` | `{ name, type, brief?, aarambh_org_ref?, engagement?: {starts_on, ends_on, state, expected_sessions}, programmes?: [{id?, name, kind, description, active}], reason }` | `{ organisations row, engagements, organisation_programmes }` | `ROLE-admin` · `ADMIN-REASON`; `ends_on ≥ starts_on` | `saveOrganisation` |
| `POST /api/admin/organisations/:id/vetted` | `{ coach_id, reason }` | `201 { vetted_coaches row }` | `ROLE-admin` · `ADMIN-REASON`; only a coach certified in that pool (`coach_org_certifications.state = 'certified'`); who may grant is still open (BUILD_SPEC open question 17) | `grantVetted` |

#### G9 · Capacity and demand

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/capacity` | `?month=` | `{ who_we_have, what_they_can_take, what_is_coming, gaps: [{language_code, level, short_by, sentence}], lead_times }` — aggregates only, derived per `data-model.md` §4 | `ROLE-admin/finance_admin`; no client identifiers | G9 (read-only) |

#### G10 · People and access

| Method · path | Request | Response | Rules | Serves |
|---|---|---|---|---|
| `GET /api/admin/people` | `?role=&state=&q=` | `{ items: [users row (never password_hash) + roles + undertaking state] }` | `ROLE-admin` · `NO-PASSWORD` | G10 People / Roles tabs |
| `POST /api/admin/people/:id/password-reset-link` | `{ reason }` | `202 { ok: true }` | `ROLE-admin` · `ADMIN-REASON` · `NO-PASSWORD`; writes `password_reset_tokens` (hash, expiry, `requested_by`) and emails the person; the admin never sees the token | `sendPasswordResetLink` |
| `POST /api/admin/people/:id/suspend` · `POST /api/admin/people/:id/restore` | `{ reason }` | `{ users row (state) }` | `ROLE-admin` · `ADMIN-REASON`; suspend bumps `session_version` (ends live sessions at once) and revokes coach links | `suspendPerson` / `restorePerson` |
| `POST /api/admin/people` | `{ full_name, first_name, email?, phone?, roles: [role], reason }` | `201 { users row (invited) }` | `ROLE-admin` · `ADMIN-REASON` · `NO-PASSWORD`; staff roles only — coach accounts are created **only** by G2 enrolment (`coach_ours` / `coach_org` → 422); the invite carries a set-password link | `invitePerson` |
| `POST /api/admin/people/:id/deactivate` | `{ reason }` | `{ users row (deactivated, deactivated_at) }` | `ROLE-admin` · `ADMIN-REASON`; nothing is hard-deleted | `deactivatePerson` |
| `PUT /api/admin/people/:id/roles` | `{ add: [role], remove: [role], reason }` | `{ roles }` | `ROLE-admin` · `ADMIN-REASON`; bumps `session_version` (forces re-login); `aarambh_reviewer` can never be combined with a G, S or C role (422) | `changeRole` |
| `GET /api/admin/undertakings` | — | `{ versions: [undertaking_versions row], people: [undertaking_signatures row per person (derived union of coaches, faculty, mentors, trainees)] }` | `ROLE-admin` | G10 Undertakings tab |
| `POST /api/admin/undertaking-versions` | `{ version, owner_label, body, reason }` | `201 { undertaking_versions row (is_current 1) }` | `ROLE-admin` · `ADMIN-REASON`; exactly one current; every `open` signature → `closed_unsigned`; old versions and signatures kept | `publishUndertakingVersion` |
| `GET /api/admin/activity-log` | `?entity_type=&entity_id=&actor_user_id=&from=&to=` | `{ items: [activity_log row] }` | `ROLE-admin/finance_admin` · `FINANCE-ONLY` (Finance admin: its own `is_money` entries; Admin: no `is_money` rows); **no update or delete endpoint exists** | G10 Activity log |

Client-only, no endpoint: G10 tab switch.

### 5.14 · System jobs (no endpoint)

Run on the server's schedule; each writes `activity_log` with `actor_role = 'system'` and, for debriefs,
`debrief_status_log` with `source = 'system'`.

| Job | What it does |
|---|---|
| Provisional → active | When supervised debriefs, mentor hours and mentor sign-off reach their targets inside the window: `coaches.stage → active` |
| Provisional lapse | At `provisional_end` without the targets: `coaches.stage → provisional_lapsed`, `credentials.status → lapsed` |
| Debrief close | After `validated` (rule to agree): `debriefs.status → closed`, revoke (§6.2), `reading_purge_after` set |
| Reading purge | Nightly: deletes `aarambh_readings` past `reading_purge_after` (traits, reports and opened items cascade) |
| Coaching | `coaching_keys.status → expired` after `expires_at`; `coaching_engagements.state → ended` after 60 days with no booking |
| Pay run | Monthly `pay_runs` draft with `pay_lines` |
| Rating flags | Quarterly and on threshold: `rating_flags` rows (never a proposed grade) |
| H1 nightly sync | Full open-times sync to Aarambh (§6.2) |

---

## 6 · Aarambh — server to server

Both directions follow `INTEGRATION_AARAMBH.md` §2 (signing, idempotency, retries, allow-list). Payload shapes live
**there**, not here. Every call in or out writes one `integration_events` row (`direction`, `call_code`,
`idempotency_key`, `debrief_id`, `external_ref`, `event_kind`, `http_status`, `result`) — **never a body**.

### 6.1 · Inbound (Aarambh → Saarthi)

| Method · path | Call | What Saarthi does | Rules |
|---|---|---|---|
| `POST /api/aarambh/bookings` | **H2** — the booking (`INTEGRATION_AARAMBH.md` §3) | Creates a `debriefs` row (`status = 'unassigned'`; `booking_ref`, `person_ref`, `sitting_ref` as external refs; `first_name` only; `client_type`, `language_code`, `tier`, `pack_size`, `consent_at_booking`, `organisation_id` via `organisations.aarambh_org_ref`) and an `assignment_queue` row (`assign_by` from the assign-within setting). Stores `client_share_consents` when the booking carries it. Cancellations and moves arrive on `/api/aarambh/booking-events` (H2b), not here | `AARAMBH-SIGNED` · `FIRST-NAME-ONLY` (any surname, email or phone in the body is dropped, and its field name logged) |
| `POST /api/aarambh/booking-events` | **H2b** — `cancelled {bookingId, cancelledAt}` · `rescheduled {bookingId, slotId}` | `cancelled`: early (outside the late window) → `debriefs.status = 'cancel_early'`, slot reopens; late → `cancel_late`, slot closes. `rescheduled`: move the debrief to the new slot | `AARAMBH-SIGNED` · `Idempotency-Key` |
| `POST /api/aarambh/sitting-events` | **H5** — `superseded` · `integrity_changed` · `withdrawn` · `opened_updated` · `trainee_sitting_completed` | `superseded`: `aarambh_readings.state → superseded`, `debriefs.on_hold = 1`, `prep_stale = 1`. `integrity_changed`: update `aarambh_readings.integrity` / `debriefs.integrity`; `hold` → hold the debrief. `withdrawn`: `aarambh_readings.state → withdrawn`, purge the cache at once, revoke links. `opened_updated`: replace `aarambh_opened_items`. `trainee_sitting_completed`: tick the trainee's own sitting on `enrolments` | `AARAMBH-SIGNED` · `FINISHED-READING-ONLY` |
| `POST /api/aarambh/validation` | **H7** — `validated` / `sent_back` with a comment; later the client's rating and validated feedback | `validated`: `feedback_letters.decision = 'approved'`, `after_debriefs.letter_status = 'validated'`, `debriefs.status → validated`, issue a `coaching_keys` row when "Continue with me" was recommended. `sent_back`: `decision = 'sent_back'`, `decision_comment`, `letter_status = 'sent_back'`, `debriefs.status → sentback` (resubmit within 24 h). Rating: a `client_ratings` row | `AARAMBH-SIGNED`; writes `debrief_status_log` (`source = 'aarambh'`) |
| `POST /api/aarambh/checkins` | **H8** — the day-7 check-in | **Later**; not in staging scope | `AARAMBH-SIGNED` |

### 6.2 · Outbound (Saarthi → Aarambh)

| Call | Aarambh endpoint | Triggered by |
|---|---|---|
| **H1** open times | `POST /setu/slots` + nightly full sync | `genSlots`, `addDay`, `closeSlot`, `markUnavailable`, `assignCoach`, request approvals that open or close a slot. Slot id, start, duration, language, client types — **never a coach name** |
| **H3** pull the reading | `GET /setu/sittings/:sittingId` | `assignCoach` (and a retake's new sitting). Intake per `FINISHED-READING-ONLY` into `aarambh_readings`, `aarambh_reading_traits`, `aarambh_reading_reports`, `aarambh_opened_items` — the server-side `useReading` / `normalise` |
| **H4** report link | `POST /setu/coach-links` | `POST /api/debriefs/:id/report-link` only (§5.7) |
| **H6** the disposition | `POST /setu/debriefs/:bookingId/outcome` | `submitAfter` (§5.10); see `INTEGRATION_AARAMBH.md` §7 for the fields. Never sent: private notes, reflection, jots outside the review bundle, Bank candidates, coach pay |
| **REVOKE** | `POST /setu/coach-links/revoke` | Debrief close, `endAccess`, `pauseCoach`, `suspendPerson`, a move that unassigns the coach, an H5 `withdrawn` — every case of `ACCESS-ENDS` |

---

## 7 · `api.js` mapping

`app.js` is frozen and reaches storage and Aarambh only through four functions in `frontend/api.js`. Keep the names;
swap the bodies.

| `api.js` today | Production body |
|---|---|
| `load()` | `GET /api/bootstrap` → assign to `S`, then add the *client* keys from §3 (`ui`, `w1`, `cur`, `qbt`, the `admin` tab fields) from their defaults, restoring per-viewer `ui` conveniences from `localStorage` (never review marks — the screen list is rig only). On 401 → the sign-in page. Do **not** call `seed()` or `seedSlots()` |
| `save()` | `app.js` calls `save()` after each change it makes to `S`. In production `save()` diffs `S` against the last state the server returned (kept in `api.js`), and for each changed `S` key sends the matching write from §5 — e.g. `S.firstLogin` → `POST /api/me/first-login/confirm`; `S.und` → `POST /api/me/undertaking`; `S.card` → `PATCH /api/me/card` / `PUT /api/me/card/specialities`; `S.slots` → the §5.6 calls; `S.prep` → §5.8; `S.runs` → §5.9; `S.after` → §5.10; `S.requests` (a decision) → `POST /api/admin/requests/:id/decide`. Each request carries a new `Idempotency-Key`. On 4xx it shows the `error` with `toast()` and replaces that key with the server's copy. Keys marked *client* in §3 are never sent. Where BUILD_SPEC gives a proposed handler name for an inline control, kit v0.2 exposes that name in `api.js` so the diff is no longer needed |
| `listRig()` | **No browser call to Aarambh.** The reading arrives server-side by H3 at assignment, so there is nothing to list: `listRig()` becomes a no-op (the Load-a-reading dialog is rig only and is switched off) |
| `fromRig()` | `GET /api/debriefs/:id/reading` (§5.7) for the current debrief, then fill `S.loaded[id]` in the shape `app.js` already reads: `traits` ← `traits`, `reports` ← `reports` (each tab's frame URL is fetched on demand with `POST /api/debriefs/:id/report-link`), `opened` ← `opened`, `sitting` ← the reading's sitting fields, `when` ← `received_at`. On 403 `rule: UNDERTAKING` leave `S.loaded[id]` empty so C5 draws the locked card |

Report frames: every place `app.js` sets a report `<iframe>` source, `api.js` supplies the URL from
`POST /api/debriefs/:id/report-link` (with `mode: 'present'` while Present mode is on). The URL is held in memory only
and re-requested when it expires.

---

## 8 · Open items this contract raises

Do not decide these in code. They join `BUILD_SPEC.md` §5.

1. ~~Cancellation event on H2~~ — **settled:** H2b `POST /api/aarambh/booking-events` (`cancelled`, `rescheduled`).
2. ~~Retake offer and can't-fill~~ — **settled:** H6b `POST /setu/notices` (`retake_offered`, `cant_fill`).
3. ~~Resubmit and H6~~ — **settled:** H6 is re-sent with the letter only and `revision` 2, 3, …
4. ~~Own-assessment done~~ — **settled:** H5 kind `trainee_sitting_completed`.
5. **Removing a prep question** — `prep_questions` has no soft-delete column; either allow `DELETE` before Live mode
   (as written) or add `removed_at`.
6. **Debrief close rule** — a debrief closes after its letter is validated (H7); the delay after validation is open (MS).
7. **Aarambh reviewer screens (A1–A3)** — not in the v0.3 rig; their endpoints follow when the screens are designed.
8. **Resume a paused coach** — `POST /api/admin/coaches/:id/resume` is specified for the lifecycle; the rig has no control.

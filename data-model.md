# Saarthi — Data model

**kit v0.1 · matches `Prototype/GYS_Coach_Platform_Rig_v0.3.html` · 16 Oct 2026**

Every screen's data in storage shape, then the merged tables, what is never stored, the security rules and the
open questions. `schema.sql` is generated from this file; `seed.json` holds the synthetic starting data. Actions
and who may press them live in `BUILD_SPEC.md`; endpoints in `API_CONTRACT.md`; the Aarambh handshake (H1–H8) in
`INTEGRATION_AARAMBH.md`.

## Conventions

| Rule | What it means |
|---|---|
| Names | `snake_case` everywhere. Tables plural (`debriefs`), columns singular. Enum values lower `snake_case` |
| Ids | Saarthi's own ids are `BIGINT UNSIGNED AUTO_INCREMENT`. Aarambh's ids (`personId`, `sittingId`, `bookingId`, `productId`, organisation id) are stored as `*_ref VARCHAR(40)` **external references**, never as our keys |
| Money | Integer minor units `amount_minor INT` + `currency CHAR(3)`. Never a formatted label. Money lives only in the **Money** tables (§3.8) and the money group of `settings` — Finance admin only |
| Time | Every `DATETIME` is **UTC**. Screens show **Asia/Kolkata** (India time only). `DATE` columns are India calendar dates. A slot is `slot_date` + `start_minute` (minutes from 00:00 India time) + `duration_min` |
| Languages | `language_code VARCHAR(10)` → `languages.code` (ISO 639-1, eleven languages) |
| Soft delete | Nothing is hard-deleted except the **reading cache** (deleted when the debrief closes plus the audit window). Everything else ends by state: `state`/`status` columns, `closed_at`, `ended_at`, `revoked_at`, `deactivated_at`. Superseded rows (settings, pay terms, letters, undertaking versions) are kept |
| Admin writes | Every admin write is **refused without a reason** and is written to `activity_log` (who, role, what, before → after, reason, when). The log is append-only |
| Forward only | Settings, pay terms and tiers carry `effective_from` (now or later). Bookings and sessions already made keep the value they were made under |
| Server time | Every "signed at", "submitted at", "accepted at" is set by the server. The rig's hard-coded dates are not carried over |
| Labels | `[PERSONAL]` personal data · `[PRIVATE]` coach-only text no other role reads · `[MONEY]` Finance admin only |

---

## 1 · Screen capture blocks (journey order)

Each block: who and when, the fields in storage shape (`table.column` and type), what is derived, and the
lifecycle. Types are given once; the full DDL is `schema.sql`.

### W1 · Apply form
- **Who / when:** an Applicant on the Gyani Says public website, not signed in, applying as a coach or as a
  trainer/mentor. Before any relationship exists. One still-`new` submission per contact; the arrival link carries
  a source tag. (Gyani Says builds the real page; it posts into Saarthi.)

| Shown / entered | Stored as | Notes |
|---|---|---|
| Applying as | `applications.applying_as` ENUM('coach','trainer') | trainer = trainer or mentor |
| Full name | `applications.full_name` VARCHAR(120) | required `[PERSONAL]` |
| Phone · Email | `applications.phone` VARCHAR(20) E.164 · `applications.email` VARCHAR(254) | phone **or** email required `[PERSONAL]` |
| City | `applications.city` VARCHAR(60) | from the city list or "Other" |
| Years of work | `applications.years_of_work` TINYINT NULL | |
| What you do now | `applications.current_work` VARCHAR(200) NULL | role and organisation type |
| People worked with / what you have taught | `applications.experience_text` TEXT NULL | label differs by `applying_as` |
| Qualifications | `applications.qualifications_text` TEXT NULL | |
| CV | `applications.cv_file_id` → `files` (kind `cv`) | PDF, optional; read inside Saarthi only |
| Languages · Primary / Secondary | `application_languages` (`language_code`, `proficiency` ENUM('primary','secondary')) | at least one; several of each allowed |
| Time you could give | `applications.time_band` ENUM('u5','5_10','10_20','20p') NULL | an interest only |
| How you would attend | `applications.attend_mode` ENUM('in_person','online','either') | |
| When you could start | `applications.start_window` VARCHAR(40) | from an admin-maintained list |
| Who you'd work with / what you could teach | `application_preferences.value` VARCHAR(40) rows | coach: role tracks or all four; trainer: core · tracks · advanced · mentoring |
| Days you can attend | `applications.attend_days` SET('mon'…'sun') | |
| You arrived from | `applications.source_tag` VARCHAR(40) | from `?src=`; known tags web · ig · yt · gg · li · dl · ref · `talk-<slug>` |
| I agree (privacy) | `applications.consent_given` · `consent_at` · `consent_text_version` VARCHAR(10) | required to submit |
| — | `applications.state` (lifecycle below) · `submitted_at` · `delete_after` DATE NULL | starts `new`; retention still open |

- **Derived:** the source label for a tag; the "what happens next" steps; whether Send is enabled
  (`full_name` + phone-or-email + `city` + ≥1 language + consent).
- **Lifecycle (`applications.state`):** `new` ⇄ `screened` ⇄ `interviewing` (admin moves freely) → `offered` →
  `enrolled`, or `waitlisted` (seat type full) → `enrolled`. `enrolled` is terminal. (No declined/withdrawn state — open.)

### S1 · First login — confirm details
- **Who / when:** a Trainee (coach of either type) — and a newly enrolled trainer for the undertaking — once, at
  first sign-in after enrolment (`enrolments.first_login_state = 'invited'`). Nothing else opens until confirmed.

| Shown / entered | Stored as | Notes |
|---|---|---|
| Name, city, years, phone, email, current work, people coached, qualifications | `users.full_name/first_name/email/phone` · `user_profiles.*` | read-only, copied from the application at enrolment; corrections go through a request |
| Languages | `user_languages` (`language_code`, `proficiency`) | read-only; set by admin at enrolment |
| Tracks enrolled for | `enrolments.enrolled_tracks` SET('student','executive','mid_management','senior') | read-only |
| Coach type pill | `enrolments.coach_type` ENUM('ours','org') + `organisation_id` | read-only |
| Batch: programme, name, dates, mode, venue | `batches.*` via `enrolments.batch_id` | read-only |
| Your seat | `enrolments.seat_type` ENUM('in_person','online') | |
| Faculty · mentor | `batch_staff` (role `faculty`) · `enrolments.mentor_faculty_id` → `faculty` | "Assigned before Day 1" when NULL |
| Sessions list | `batch_sessions` | |
| Batch dates changed | `notifications` (kind `batch_dates_changed`) | |
| Own assessment: due, sitting, debriefed by, state | `enrolments.own_assessment_due` DATE · `own_assessment_state` ENUM('not_started','done','n_a') · `own_assessment_ref` (Aarambh sittingId) · `own_debrief_coach_id` → `coaches` | Saarthi records **only that it happened**, never the reading |
| Photo · short bio | `user_profiles.photo_file_id` → `files` · `user_profiles.bio` VARCHAR(400) | optional |
| Confidentiality promise | `enrolments.confidentiality_promised_at` DATETIME | |
| Data undertaking (version, six parts, signature) | `undertaking_signatures` (`user_id`, `undertaking_version_id`, `coach_type`, `organisation_id`, `signed_at`, `access_state`) | text from `undertaking_versions.body` |
| Something wrong? | `requests` (type `detail_correction`, `summary`, `reason`) | lands in the admin Requests inbox |
| Confirmed | `enrolments.first_login_state` ENUM('invited','confirmed') + `first_login_confirmed_at` | |

- **Derived:** "Due by" = batch start − 2 days (stored on the enrolment so a date move recomputes it); next session;
  welcome first name; Confirm enabled (promise given **and** undertaking signed at the current version).
- **Lifecycle:** `first_login_state` `invited` → `confirmed` (one way). Readings stay closed until an
  `undertaking_signatures` row for the current version is `open` — **no signature, no access**.

### S2 · Core modules
- **Who / when:** a Trainee, from first login to the exam; the library stays open after certification while active.

| Shown | Stored as | Notes |
|---|---|---|
| Modules done (n of 5) | derived from `module_progress.state = 'done'` | |
| My batch, dates, mentor | `batches`, `enrolments.mentor_faculty_id` | |
| Next session | `batch_sessions` + `batch_staff` | first session on/after today |
| Own assessment debriefed | `enrolments.own_debrief_done_at` | |
| Per module: number, title, summary | `modules.number/title/summary` | |
| Taught at version | `batch_module_versions.version` | fixed per batch |
| Module status, sessions attended | `module_progress.state` ENUM('locked','in_progress','done') · `sessions_attended` | `sessions_total` derived from `batch_sessions` |
| Done · signed by faculty + feedback | `module_progress.signed_by_faculty_id` · `signed_at` · `faculty_feedback` TEXT | |
| Library: name, owner, size, version, updated since read | `library_documents` (`name`, `owner_label`, `word_count`, `current_version`) + `library_reads` (`version_read`, `read_at`) | unread = `version_read ≠ current_version` |
| Practice debriefs: label, state, feedback | `practice_debriefs` (`synthetic_report_id`, `report_version`, `state` ENUM('not_started','in_progress','feedback_given'), `feedback`, `given_by_faculty_id`) | synthetic only — **never client history** |

- **Lifecycle (`module_progress.state`):** `locked` → `in_progress` (previous module done / first session held) →
  `done` (faculty signs). Modules open strictly in order.

### S3 · Role tracks and rank
- **Who / when:** a Trainee and a certified coach (read view). Admin opens tracks; the coach never chooses. Update
  modules appear only once certified.

| Shown | Stored as | Notes |
|---|---|---|
| Rank | `coaches.rank` ENUM('certified','senior','lead') | history via `activity_log` |
| Level / growth | `coaches.level` TINYINT (1–4) · `coaches.growth` ENUM('growing','fixed','allrounder') | level set by training only |
| Track cards L1–L4, length, state | `coach_tracks` (`track`, `state` ENUM('opened','passed','passed_at_entry'), `opened_by`, `opened_at`, `batch_id`, `signed_off_by_faculty_id`, `passed_at`) · `role_track_defs.days` | |
| Update module waiting | `update_module_assignments` (`module_id`, `version`, `what_changed`, `length_minutes`, `state` ENUM('due','done'), `done_at`) | |
| Rank ladder | `rank_defs` (`label`, `how_earned`, `adds`) | reference |
| Advanced Programme | `advanced_enrolments` (`batch_id`, `state` ENUM('not_started','in_progress','passed'), `passed_at`) | admin opens; never applied for |
| Organisation track | `coach_org_certifications` (`organisation_id`, `state`, `certified_at`) | |

- **Derived:** level / all-rounder from passed tracks; the credential line; "Advanced" suffix; who I can take.
- **Lifecycles:** `coach_tracks.state` (none) → `opened` (admin) → `passed` (observed debrief at the level + faculty
  sign-off). `advanced_enrolments.state` `not_started` → `in_progress` → `passed`. `update_module_assignments` `due` → `done`.

### S4 · Exam → Provisional → Active, and the credential
- **Who / when:** a Trainee (exam), then a passed trainee (Code + time), then a Provisional / Active coach (road to
  Active, credential). **Public** uses the verify page. Three views by `coaches.stage`: `in_training` · `exam_passed` ·
  `provisional` / `provisional_lapsed` / `active`.

| Shown / entered | Stored as | Notes |
|---|---|---|
| Exam part, format, where it runs | `exam_part_defs` (`part` ENUM('written','dossier_practical','observed_debrief','oral_viva'), `title`, `description`) | weights in setting `exam_weights_pct` |
| Part result, booking, feedback | `exam_attempts` (`enrolment_id`, `part`, `attempt_no` 1–3, `scheduled_at`, `result` ENUM('booked','passed','not_passed'), `feedback`, `mark` DECIMAL(5,2)) | `mark` faculty/admin only — never returned to the coach |
| Dossier practical halves A / B | `exam_attempts.half_a_plan` · `half_b_comparison` TEXT | marked together as one part |
| Exam markers | `exam_markers` (`part`, `faculty_id`) | set in G2 |
| Code of Ethics: version, read to end, signed | `code_signatures` (`code_version`, `read_to_end_at`, `signed_at`, `includes_public_rating`) | text from `code_versions` |
| Time band · days · time of day · months | `time_commitments` (`band` ENUM('u5','5_10','10_20','20p'), `days` SET, `times_of_day` SET('morning','afternoon','evening'), `months` 6/12/18/24, `state`, `effective_from`, `approved_by`) | later changes need admin approval |
| Supervised debriefs n of 6 | `supervised_debriefs` (`debrief_id`, `mentor_faculty_id`, `mentor_signed_at`) | target from settings |
| Mentor hours n of 3 | `mentor_hours_log` (`hours` DECIMAL(4,2), `on_date`) | target from settings |
| Mentor sign-off | `coaches.mentor_signoff_at` | |
| Days left of 6 months | `coaches.provisional_start` · `provisional_end` · `provisional_extended` | |
| Supervised list (first name · type · signed) | `supervised_debriefs` ⋈ `debriefs.first_name/client_type` | first name only |
| Credential number | `credentials.credential_number` CHAR(18) UNIQUE | `GYS-SAR-YYYY-XXXXC`; generated once, never edited or reused |
| Issued · valid to · attestation | `credentials.issued_on` · `valid_to` · `credential_attestations` (`attested_at`, `valid_to`) | issuer is constant |
| Credential PDF | `credentials.pdf_file_id` → `files` (kind `credential_pdf`) | generated server-side |
| Verify page: number, name, status, rank, level, issued, valid to | `credentials.status` ENUM('active','lapsed','paused','withdrawn') + joins | public read; nothing else |

- **Derived:** "≈ N debriefs a week" from the band; days left; what the credential shows (name, rank line, level,
  languages, Advanced) — never category, slab, ratings or clients.
- **Lifecycle (`coaches.stage`):** `invited` → `in_training` (S1 confirmed) → `exam_passed` (all four parts passed;
  a failed part is resat alone, max 3 attempts, then an admin decision) → `provisional` (Code signed + time chosen +
  credential issued) → `active` (6 supervised debriefs + 3 mentor hours + mentor sign-off inside the window,
  automatic) **or** `provisional_lapsed` (window ends) → `provisional` again only by an admin extension, **once, 2
  months**. `credentials.status`: `active` ⇄ `lapsed` (attestation missed / window lapsed) · `paused` (coach paused)
  · → `withdrawn` (misconduct; terminal).

### C1 · Coach home
- **Who / when:** the coach (either type), from Day 1 of training; the landing screen. One home that changes by stage.

| Shown | Stored as | Notes |
|---|---|---|
| Greeting | `users.first_name` | |
| Stage, rank, level | `coaches.stage` · `coaches.rank` · `coaches.level` | drives which home is drawn |
| Provisional window | `coaches.provisional_start/end/extended` | |
| Code re-accept banner | `code_versions.is_current` vs latest `code_signatures.code_version` | |
| Coach guide updated | `guide_versions` (`version`, `published_on`, `whats_new`) + `guide_acks` (`guide_version`, `read_at`) | "I've read this" |
| Hours target · band | `coaches.hours_target_month` · active `time_commitments.band` | |
| Training block | `batches`, `batch_sessions`, `module_progress`, `coach_tracks`, `exam_attempts` | rings |
| Provisional block | `supervised_debriefs`, `mentor_hours_log`, `coaches.mentor_signoff_at` | rings |
| Debrief rows (next, prep due, waiting on me, sent back) | `debriefs` (`id`, `first_name`, `client_type`, `organisation_id`, `report_kind`, `report_version`, `integrity`, `scheduled_at`, `status`) | first name + client type only; never surname, money, slab or category |
| Changes feed | `notifications` (kind `new_debrief`, `cancelled_late`, `no_show`, `moved`, `batch_dates_changed`; `debrief_id`, `created_at`) | the rig hard-codes three lines; the build reads them |

- **Derived:** next debrief (earliest own `assigned`/`prep`); prep due (`assigned`); waiting on me (`debriefed`, due
  24 h after the end); sent back (`sentback`); "my work this month" (sessions, distinct and repeat clients, groups,
  client rating average + count, own conversation rating average); "my hours this month" (debrief = 45 min with the
  client + 45 min prep; coaching session = 45 min; a group counts once) — computed from completed sessions, **not**
  the rig's stored hours; opened this week = own slots this Mon–Sun × 0.75 h vs the band minimum; provisional days
  left; re-accept needed.
- **Lifecycle:** follows `coaches.stage`. `provisional_lapsed`: no new debriefs assigned.

### C2 · Coach profile
- **Who / when:** the coach, after certification. Read-only Saarthi record plus three things the coach controls: the
  monthly hours target, a band-change request, and the public "About your coach" card.

| Shown / entered | Stored as | Notes |
|---|---|---|
| Name, rank, level, growth, Advanced | `users.full_name` · `coaches.rank/level/growth` · `advanced_enrolments.state` | |
| Category | `coaches.category` ENUM('A','B','C','D') | letter only; never on the public card |
| "Can't say" allowed | `coaches.cant_say_rule` ENUM('default','yes','no') | |
| Code signed | latest `code_signatures` | |
| Credential | `credentials` (`credential_number`, `issued_on`, `valid_to`, `status`) + latest `credential_attestations` | |
| Languages · tracks | `user_languages` · `coach_tracks` | read-only here |
| Hours target | `coaches.hours_target_month` SMALLINT (12/18/24/30/40) | coach's own; no approval; no effect on rostering |
| Commitment band + pending change | active `time_commitments` + `requests` (type `time_commitment`, `payload` = requested band, `state`) | "Change requested · waiting for admin" |
| Organisation certifications | `coach_org_certifications` | |
| Earned roles | `user_roles` (`mentor`, `faculty`) + `faculty` | granted by admin only |
| Public card | `coach_public_cards` (`years_experience`, `worked_with` VARCHAR(160), `about` TEXT ≤ 80 words, `photo_file_id`, `status` ENUM('draft','pending','approved'), `submitted_at`, `approved_at`, `approved_by`, `approved_snapshot` JSON) | any edit → `draft` |
| Specialities | `coach_card_specialities.speciality` (8 fixed values) | max 3 |

- **Derived:** peer comparison — hours opened this month by every coach on the same band, anonymous (position N of M,
  top half, % of committed hours opened, group median). **Hours only — never ratings, never money, nobody named.**
  Public rating shown only from 5 ratings. Credential line text.
- **No rate view** on C2 (rates live only on G7, Finance admin).
- **Lifecycle (`coach_public_cards.status`):** `draft` → `pending` (submitted; creates a `public_card` request) →
  `approved` (admin; live). An edit to an approved card → `draft`; `approved_snapshot` stays live until the next approval.

### C3 · Availability calendar
- **Who / when:** the coach, whenever they open times, close an open time, mark themselves unavailable or need a
  booked debrief moved. Clients pick a time on the Aarambh website (times only, never coach names); admin assigns
  from these slots. **The coach cannot book.**

| Shown / entered | Stored as | Notes |
|---|---|---|
| Slot | `slots` (`coach_id`, `slot_date`, `start_minute` 0–1439, `duration_min` default 45, `status` ENUM('open','booked','closed'), `debrief_id`, `created_by`, `created_at`, `closed_at`) | unique coach + date + start; 15-min gap is a setting |
| Unavailable | `coach_unavailability` (`kind` ENUM('range','weekday'), `date_from`, `date_to`, `weekday`, `removed_at`) | |
| Open-times form (date, day start, day end, repeat 1/2/4/8/12 weeks) | request body only | generates `slots` rows |
| Move request (booked slot) | `requests` (type `move_debrief`, `slot_id`, `debrief_id`, `reason`, `is_late_drop`) | |
| Ask admin (locked open slot) | `requests` (type `locked_slot`, `slot_id`, `reason`) | |
| Late drop | `late_drops` (`debrief_id`, `request_id`, `dropped_at`) | a move asked < 48 h before the start |
| View list/month, month offset | client only | |

- **Derived:** day part (morning < 12:00, afternoon 12:00–16:59, evening ≥ 17:00); **locked** = start − now < 72 h
  (setting); **too soon to be booked** = start − now < 48 h (setting); month grid counts; unavailable day; opened this
  week vs commitment.
- **Lifecycle (`slots.status`):** `open` → `booked` (admin assigns, G3) · `open` → `closed` (coach, outside 72 h) ·
  `open` inside 72 h → `locked_slot` request → admin closes or keeps · `booked` → move request → admin reassigns or
  declines. Client early cancel (≥ 48 h) reopens the slot; late cancel (< 48 h) closes it — both from Aarambh's feed.

### C4 · My debriefs
- **Who / when:** the coach. Every debrief and coaching session assigned to them; no accept step.

| Shown | Stored as | Notes |
|---|---|---|
| Debrief | `debriefs.id` · `coach_id` · `first_name` (only) · `person_ref` | |
| Session type, engagement, session N | `debriefs.session_type` ENUM('debrief','coaching') · `engagement_id` · `session_no` | coaching rows open C12 |
| Client type | `debriefs.client_type` ENUM('student','executive','mid_management','senior','cant_say') | Can't say → Mid-management report |
| Report, version, sitting | `debriefs.report_kind` ENUM('pancha_bhuta','trayi','paradox','team') · `report_version` · `sitting_type` ENUM('core','full') | one report per debrief |
| Integrity | `debriefs.integrity` ENUM('reliable','caution') | invalid readings never reach a coach |
| Language, date/time | `debriefs.language_code` · `scheduled_at` / `slot_id` | |
| Engagement column | `debriefs.organisation_id` | Individual or organisation |
| Pack, consent at booking | `debriefs.pack_size` · `consent_at_booking` ENUM('record','transcript','none') | |
| Status | `debriefs.status` (lifecycle below) · `status_changed_at` | |
| Sent-back comment | latest `feedback_letters.decision_comment` | |

- **Derived:** tabs — Upcoming (`assigned`, `prep`) · Needs action (`assigned`, `debriefed`, `sentback`) · Done
  (`after`, `validated`, `closed`, `cancel_early`, `cancel_late`, `noshow`); counts; sort; row target screen
  (coaching → C12, `assigned` → C5, `prep` → C6, `debriefed` → C7, `sentback` → C8, else C7 read-only).
- **Lifecycle (`debriefs.status`):**

| Status | Set by | Next |
|---|---|---|
| `unassigned` | booking arrives from Aarambh (H2) | `assigned`, `cancel_early`, `cancel_late` |
| `assigned` | admin assigns (G3) | `prep`, `cancel_early`, `cancel_late` |
| `prep` | coach "Mark prep done" (C5) | `debriefed`, `noshow`, `cancel_late` |
| `debriefed` | `finishRun` (C6), also after End early | `after` (due within 24 h) |
| `after` | Submit (C7–C10) / resubmit (C8) — per-session fee earned here | `validated`, `sentback` |
| `sentback` | Aarambh validation (H7) | `after` via resubmit (within 24 h) |
| `validated` | Aarambh validation (H7) — letter and key released | `closed` |
| `closed` | system / admin — report links revoked, reading cache purge scheduled, coach notes stay | terminal |
| `cancel_early` | Aarambh feed, ≥ 48 h before; slot reopens | terminal |
| `cancel_late` | Aarambh feed, < 48 h; slot closes; part pay if prep done | terminal |
| `noshow` | coach, ≥ 15 min after the start (C6); ratings skipped | terminal |

  Only the assigned coach moves `assigned → prep → debriefed → after` and `sentback → after`; only Aarambh's
  validation sets `validated` / `sentback`; cancellations come only from the booking feed. Every change writes
  `debrief_status_log`.

### C5 · Prep guide
- **Who / when:** the coach assigned to the debrief, after assignment and the reading's arrival, before the debrief
  (about 45 minutes of prep). In PRACTICE mode a trainee on a synthetic reading. Mentor (provisional coach) and
  faculty (practice) may read the questions; Aarambh may read *My understanding* on audit. Refused on a superseded
  reading (prep is marked stale).

**Debrief header** (from the booking feed, on `debriefs`): `person_ref`, `first_name` (payload carries no surname;
intake drops any full name), `client_type`, `language_code`, `scheduled_at`, `organisation_id` (shows the
organisation brief), `pack_size`, `consent_at_booking`.

**Reading receipt** — `aarambh_readings`: `sitting_ref`, `person_ref`, `sitting_type`, `sitting_completed_at`,
`payload_version`, `generated_at`, `received_at` (server), `route` ENUM('api','file') (file = admin only),
`integrity` ENUM('reliable','caution'), `state` ENUM('active','superseded','withdrawn'), `intake_log` JSON (field
**names** found / missing / dropped — never values). Report type and version are copied to `debriefs`.

**Traits** — `aarambh_reading_traits` (one row per trait): `trait_code`, `level` TINYINT 0–5 NULL (from Aarambh's
L0–L5; L0 is the most of the trait; NULL = unreadable; never derived), `lane` ENUM('fit','performance'), `gap_band`
ENUM('none','check','probe') (band only), `trait_status` ENUM('readable','agreed','median','unreadable'), `caret`
TINYINT (0/1, 0/1/2 from v1.3).

**Reports** — `aarambh_reading_reports`: `report_type`, `copy_kind` ENUM('person','coach'), `report_version`,
`integrity`, `sort_order`. **No URL is stored.** Each time a report pane opens, the server asks Aarambh for a fresh
signed link (H4) and records the request in `report_link_requests` (`copy_kind`, `undertaking_version`,
`present_mode`, `requested_at`, `expires_at`, `revoked_at`, `result`).

**What they opened** — `aarambh_opened_items`: `item_ref`, `report`, `kind` ENUM('job','group','situation'), `name`,
`band`, `times_opened` (the person's own opens only), `sort_rank`. Served **only behind a signed undertaking**.

**Prep** — `prep` (one per debrief): `understanding` TEXT (coach · Aarambh on audit), `private_notes` TEXT
`[PRIVATE]`, `caution_ack`, `prep_done`, `prep_done_at`, `updated_at` (autosave).

**My questions** — `prep_questions`: `step` ENUM('E','T','U') (Settle has no prepared questions), `text`
VARCHAR(500), `source` ENUM('bank','guide','own'), `bank_question_id`, `why`
ENUM('general_routine','specific_high','specific_low','caret','discrepancy','median','other'), `note`, `point_kind`
ENUM('integrity','check','must','caret','median','high','low'), `trait_code`, `sort_order`. Options —
`prep_question_options` (`ord`, `label` VARCHAR(80), `follow_up` VARCHAR(300)), 2–4 or none.

**Propose to Bank** — `question_proposals` (origin `own_question`). **View preferences** — `coach_prefs`
(`report_view`, `split_width_pct` 25–70, `swap_sides`, `hide_report`, `report_zoom_pct` 60–160).

- **Derived:** probe points from traits + integrity by Gyani Says' rules (Caution first · level 0–1 strong · level 4–5
  low · median · caret · gap probe · gap check; Fit lane is a tag), grouped Clarify / Probe further / Build on;
  suggested questions per point; wording-check warnings (directive · closed start · blaming why · two in one · levels
  or numbers); "ready to mark done" = not Caution or `caution_ack`.
- **Lifecycle:** `debriefs.status` `assigned` → `prep`. Reading `active` → `superseded` (retake) — prep kept but
  stale. Undertaking unsigned → coach copy and opened list locked; a new undertaking version re-locks until re-signed.
  Report access closes when the debrief is `closed`; the coach's own notes stay.

### C6 · Live mode
- **Who / when:** the assigned coach, with the client, during the 45-minute debrief: Settle 5 · Empathise 7 · Think
  23 · Undertake 10 minutes. PRACTICE mode: a trainee with a synthetic client (sent to faculty, never client history).

| Captured | Stored as | Notes |
|---|---|---|
| The run | `live_runs` (`debrief_id` UNIQUE **or** `practice_debrief_id`, `mode` ENUM('real','practice'), `started_at`, `ended_at`) | one per debrief |
| Consent at Settle | `live_runs.consent_at_session` ENUM('record','transcript','none') · `consent_changed` | required before leaving Settle or ending; the session choice counts |
| Settle ticks | `live_runs.covers_done` · `confidentiality_done` | |
| Step, client state | `live_runs.current_step` ENUM('S','E','T','U','END') · `client_state` ENUM('here','fast','flat') · `state_since_min` | |
| Outcome, early-end reason | `live_runs.outcome` ENUM('completed','ended_early','no_show') · `ended_early_reason` | same-day alert to admin |
| Step log | `run_step_log` (`seq`, `at_min`, `step`, `stepped_back`) | |
| Answers | `run_answers` (`question_id`, `mark` ENUM('covered','put_aside'), `answer_text` `[PERSONAL]`, `option_ord`, `follow_up_answer`, `from_transcript`, `put_aside_reason`) | a `why = median` question captures where they say they sit — stays in Saarthi |
| Added follow-ups | `run_followups` (`question_id`, `ord`, `question`, `answer`) | Question Bank candidates |
| Quick jots | `run_jots` (`step`, `at_min`, `text`) | |
| Report strip, ⋯ menu, nudges dismissed, Present mode, tab | client only | |

- **Derived:** minutes in, per-step bars and "N min over"; nudges (not settled ≥ 5 min → back to Settle; state not
  "here" in Think/Undertake → back to Empathise; step 8+ min over); End summary (conversation map, counts, what they
  said) and the letter already started (talked = S+E, stood out = T, next steps = U).
- **Lifecycle:** steps S (consent gate) → E → T → U → END, step-backs logged. Outcomes `completed` → `finishRun` →
  debrief `debriefed` (`after_debriefs.due_at = ended_at + 24 h`) · `ended_early` · `no_show` (debrief `noshow`, ≥ 15
  min after the start). Present mode serves the **person copy only**.

### C7–C10 · After the debrief (Recommendations · Feedback letter · Rating · Recording)
- **Who / when:** the assigned coach, due within 24 h of the debrief ending; one screen, four sections, one Submit.
  Aarambh (validation, A1) reads the letter, the recording reference and what was discussed; the mentor reads the
  reflection of a provisional coach; faculty read Question Bank candidates.

**After-debrief record** — `after_debriefs` (one per debrief): `due_at`, `submitted_at` (server), `no_recommendation`
+ `no_recommendation_reason`, `letter_status` ENUM('draft','awaiting_validation','sent_back','validated'),
`letter_read_ack`, `rate_settled` · `rate_understood` · `rate_covered` · `rate_next_step` TINYINT 1–5 NULL,
`rate_comment`, `reflection` `[PRIVATE]` (editable after Submit), `recording_url` (https on a Gyani Says-owned meeting
account), `recording_missing_reason` ENUM('technical_failure','not_recorded_by_mistake'), `transcript_meeting_id`
CHAR(36), `transcript_fetched_at`, `gap_note`, `disposition_sent_at`.

**C7 Recommendations** — `recommendations` (at most 3): `source` ENUM('aarambh','organisation'), `product_ref`
(Aarambh productId) **or** `org_programme_id`, `based_on` SET('said','own_next_step','reading_point','observation')
(≥ 1), `who_raised` ENUM('client_asked','coach_suggested'), `why` VARCHAR(200), `setu_pointer`, `ord` 1–3.

**C8 Feedback letter** — `feedback_letters` (a new version per resubmit): `version`, `talked_about`, `stood_out`,
`next_steps`, `coach_note`, `language_code` (= the debrief's), `word_count` (guide 150–400), `submitted_at`,
`decision` ENUM('approved','sent_back'), `decision_comment`, `decided_at`. Aarambh never edits the letter.

**C9 Rating** — the four `rate_*` columns + `rate_comment`; skipped for `no_show` / `ended_early`; never shown to the
client; not a grade input.

**C10 Recording** — follows the Settle choice: `record` → `recording_url` (or a missing reason) · `transcript` →
`transcript_meeting_id` (the transcript stays in the transcript tool's workspace; lines are fetched on request,
shown, never stored) · `none` → "Not recorded", logged.

**Retake offer** — `retake_offers` (`person_ref`, `sitting_ref`, `coach_id`, `reason`, `offered_at`, `aarambh_status`
ENUM('received','issued','declined')), one per person per coach. **Question Bank candidates** — `question_proposals`
(origin `own_question`, `follow_up_in_room`, `gap_note`). **Coaching key** — `coaching_keys` (issued on letter
approval when "Continue with me" is recommended).

- **Derived:** product list filtered by client type (Can't say → Mid-management; "Continue with me" hidden when a pack
  is held); SETU pointers (reading point → product, up to 3); "goes to" (Aarambh or the organisation); letter wording
  check; checklist ring; audit block ("what this debrief taught us" — not a score); transcript lines.
- **Lifecycle:** `debriefed` → Submit → `after` (C7, C9, C10 locked for good; letter `awaiting_validation`) →
  `validated` (letter released, key issued) or `sentback` (only the letter reopens) → resubmit within 24 h → `after` …
  → `closed`. Reflection never locks. Overdue = now > `due_at` and `submitted_at` NULL. The disposition (H6) is sent on
  Submit.

### C11 · Coach guide
- **Who / when:** every coach (training and certified); one page, the same for all. **Parked** — to be rewritten.

| Shown | Stored as |
|---|---|
| Version pill, what's new, body sections | `guide_versions` (`version`, `published_on`, `whats_new`, `body` MEDIUMTEXT, `status` ENUM('current','parked','superseded')) |
| Other models panel | `guide_model_map` (`model` ENUM('GROW','OPAL','CLEAR'), `setu_step` ENUM('settle','empathise','think','undertake'), `model_step` NULL = no match, `note`) |
| Which model is shown | client only |

- **Derived:** jump-to anchors. The habits guide is an external link to Aarambh's page, never copied in.

### C12 · Coaching session (further coaching)
- **Who / when:** a coach of rank **Senior or above**, at the booked time of a coaching session inside an engagement.
  **Parked for re-review** (expected to adopt the Live mode pattern).

| Shown / entered | Stored as | Notes |
|---|---|---|
| Engagement | `coaching_engagements` (`coach_id`, `person_ref`, `started_on`, `last_booking_on`, `state` ENUM('active','ended'), `ended_reason` ENUM('no_booking_60d','coach_closed','admin_closed')) | ends 60 days after the last booking |
| Key | `coaching_keys` (`debrief_id` UNIQUE, `coach_id`, `key_code` CHAR(12) UNIQUE, `issued_at`, `expires_at` +60 d, `status` ENUM('issued','used','expired'), `used_debrief_id`) | reaches the client's login with the approved letter |
| Session | `debriefs` (session_type `coaching`, `session_no`) | |
| Focus, node, state, action, follow-up | `coaching_session_notes` (`focus`, `current_node` ENUM('S','S2','E','E2','T','T2','U','END'), `state_read` ENUM('here_curious','fast_anxious','flat_fine'), `action`, `follow_up_on`) | `[PRIVATE]` |
| Step notes | `coaching_step_notes` (`node`, `note`) | `[PRIVATE]` — a coach never sees another coach's notes |
| History panel | earlier `coaching_session_notes` rows of the engagement | read-only |

- **Derived:** stage pills; "last time" action and follow-up; engagement end date.
- **Rules:** only Active coaches of rank Senior+ issue keys, only for client types their level covers; a key shows that
  coach's free times only; the client pays for every further session (money never shown to the coach).

### G0 · Admin home
- **Who / when:** Admin every morning; Finance admin also lands here. Stores nothing of its own.

| Reads | From |
|---|---|
| Same-day alerts | `same_day_alerts` (`coach_id`, `debrief_id`, `kind` ENUM('ended_early','did_not_join','late_drop'), `severity` ENUM('call_today','logged'), `summary` (no surname), `occurred_at`, `acknowledged_by`, `acknowledged_at`) |
| Open requests | `requests.state = 'open'` |
| This week's training events | `batch_sessions`, `exam_attempts.scheduled_at`, mentor sign-off due dates |

- **Derived:** to-assign count, prep overdue, letters overdue, sent back, open requests, the capacity warning (largest
  G9 shortfall), provisional coaches lapsing this month — all computed server-side inside the caller's scope.
- **Lifecycle:** an alert is open → acknowledged (with a reason); never deleted.

### G1 · Coach roster and grading + Requests inbox
- **Who / when:** Admin daily. Finance admin sees everything Admin sees plus the slab column and control. Aarambh
  never sees the roster.

| Roster field | Stored as | Notes |
|---|---|---|
| Coach, type, appointing organisation | `coaches.user_id` · `coach_type` ENUM('ours','org') · `organisation_id` | org required for `org` |
| Rank · stage | `coaches.rank` · `coaches.stage` ENUM('invited','in_training','exam_passed','provisional','provisional_lapsed','active','paused','withdrawn') · `stage_before_pause` | |
| Provisional window | `coaches.provisional_end` · `provisional_extended` | |
| Level, all-rounder | `coaches.level` · `growth = 'allrounder'` | set by training; read-only here |
| Category | `coaches.category` | D built but switched off (setting) |
| Fixed / growing | `coaches.growth` | admin labels fixed as "locked" |
| "Can't say" rule | `coaches.cant_say_rule` | |
| Pay slab | current `coach_pay_agreements.pay_slab_id` | **Finance admin only**; never returned to Admin or the coach |
| Advanced | `advanced_enrolments.state = 'passed'` | |
| Code signed | latest `code_signatures` | |
| Undertaking: version, date, access | `undertaking_signatures` (`access_state` open · closed_unsigned · ended) | |
| Band | active `time_commitments.band` | |
| Languages · organisation certifications | `user_languages` · `coach_org_certifications` (`state` ENUM('in_training','certified','update_due','paused','expired'), `certified_at`) | |

| Request field | Stored as |
|---|---|
| Who, type, summary, proposed value | `requests` (`user_id`, `coach_id`, `type` ENUM('detail_correction','time_commitment','public_card','move_debrief','locked_slot'), `summary`, `reason`, `payload` JSON) |
| Touches | `requests.slot_id` · `debrief_id` (the target screen is derived from `type`) |
| Decision | `requests.state` ENUM('open','approved','declined') · `decision_reason` · `decided_by` · `decided_at` |

- **Derived:** warnings this month (late drops + conduct); rating average and count (from `client_ratings` less
  `rating_exclusions`); work this month.
- **Lifecycles:** coach stage — `invited` → `in_training` → `exam_passed` → `provisional` → `active`; from
  `provisional`/`active` → `paused` (reason) → back to `stage_before_pause`; `provisional` → `provisional_lapsed`; any →
  `withdrawn`. An organisation's coach's reading access `open` → `ended` (`endAccess`), separate from the stage.
  Requests `open` → `approved` | `declined` (final; a new request is a new row).

### G2 · Training admin (programmes and batches · applications · faculty and mentors · curriculum · people in training)
- **Who / when:** Admin (all tabs). Faculty: their batches, the module versions they own, Question Bank proposals.
  Mentor: their mentees. Finance admin: the faculty rate band. Continuously.

**Tab 1 · Programmes and batches**

| Shown / entered | Stored as |
|---|---|
| Programme, name, mode, city, venue | `batches.programme_code` ENUM('core','track','adv','org','induct') · `name` VARCHAR(80) · `mode` ENUM('both','in_person','online') · `city` (NULL online) · `venue` |
| Starts / ends | `batches.start_date` · `end_date` (end ≥ start) |
| Seats in person / online | `batches.seats_in_person` · `seats_online` |
| Faculty / mentors | `batch_staff` (`faculty_id`, `role` ENUM('faculty','mentor')) |
| Teaches | `batches.curriculum_label` + `batch_module_versions` (`module_id`, `version`, fixed at creation) |
| Organisation (org-update batches) | `batches.organisation_id` |
| Sessions | `batch_sessions` (`session_date`, `start_time`, `title`, `module_id`) |
| Waitlist | `batch_waitlist` (`application_id`, `seat_type`, `position`, `added_at`, `state` ENUM('waiting','offered_seat','moved','withdrawn')) |
| Dates changed | `batch_date_changes` (`old_start`, `old_end`, `new_start`, `new_end`, `reason`, `changed_by`, `changed_at`) + `notifications` per member |
| Closed | `batches.closed_at` · `close_reason` |

- **Derived:** batch state (below); seats filled per type = count of `enrolments` by `seat_type` (**never stored
  counters**); days to start; "needs you" (no faculty or mentor; a waitlist); seats ≤ faculty × 6; eligibility reasons
  for every faculty member or mentor left out (faculty: active, cleared for the programme, in the city unless online,
  online-capable for online, no overlapping batch, under `cap_batches_per_month`; mentor: kind includes mentor,
  active, fewer than 6 mentees).

**Tab 2 · Applications** — reads `applications` (W1) + `state`, `offered_batch_id`. Enrol writes `enrolments`
(`batch_id`, `seat_type`, `coach_type`, `organisation_id`, `enrolled_tracks`, `mentor_faculty_id` = first batch
mentor), `users` + `user_roles` + `user_profiles` + `user_languages` (copied from the application and the language
picker), a `coaches` row (stage `invited`) for a coach or a `faculty` row for a trainer, the invite, and for a coach the
own Aarambh sitting. Derived: batches that fit (`induct` for trainers, `core` for coaches; not closed or running),
"matches" flag, seats left, count of applications not `enrolled`.

**Tab 3 · Faculty and mentors**

| Shown | Stored as |
|---|---|
| Name, languages | `faculty.user_id` → `users` · `user_languages` |
| Role · route in | `faculty.kind` ENUM('faculty','mentor','faculty_mentor') · `route` ENUM('external_trainer','promoted_coach') · `application_id` |
| May teach · modules · may mark | `faculty.teaches` SET(programmes) · `modules_note` · `may_mark` SET(exam parts) |
| Where · online · capacity | `faculty.city` · `teaches_online` · `cap_batches_per_month` |
| Calibration | `faculty_calibrations` (`calibrated_on`, `due_on` = +182 days, `note`, `recorded_by`) |
| State | `faculty.state` ENUM('in_induction','active','paused') |
| Code, agreement, undertaking | `code_signatures` · `faculty_agreements` (`agreement_version`, `signed_on`) · `undertaking_signatures` |
| Rate band | `faculty_pay_terms.rate_band` — **Finance admin only** |
| Promotion reason, induction batch | `faculty.promotion_reason` · `induction_batch_id` |

  Derived: mentees n of 6 (count of `enrolments.mentor_faculty_id` in active stages); calibration overdue; batches
  teaching / mentoring.

**Tab 4 · Curriculum**

| Shown | Stored as |
|---|---|
| #, programme, title, summary | `modules.number` · `programme_code` · `title` · `summary` |
| Version, published | `modules.current_version` · `module_versions.published_on` |
| Owner | `modules.owner_faculty_id` or `owner_label` |
| Status, needs-update reason | `modules.status` ENUM('draft','current','needs_update') · `needs_update_reason` |
| Examined by | `modules.exam_note` |
| Outcomes · session plan · material | `module_version_items` (`kind` ENUM('outcome','plan','material'), `position`, `text`) |
| Practice | `module_versions.practice_text` |
| Version history | `module_versions` (`version`, `published_on`, `change_note`, `published_by`) |
| Library versions | `library_documents` + `library_document_versions` |
| Question Bank proposals | `question_proposals` (`text`, `origin`, `proposed_by`, `proposed_at`, `state` ENUM('proposed','approved','declined'), `decided_by`, `decided_at`) → approved ones become `bank_questions` |

  Derived: batches teaching each module and at which version.

**Tab 5 · People in training** — `enrolments` ⋈ `coaches` ⋈ `users`: person, coach type (+ organisation), batch,
modules n of 5 (derived), own assessment state + due, undertaking (version · date, or "at first login"), mentor, exam
markers (`exam_markers`, n of 4 parts set, derived), stage. One marker per part, **two** for the observed debrief (a
third only on disagreement); never the trainee's own mentor.

- **Lifecycles:** applications (W1); batch state derived — `empty` → `filling` → `nearly full` (≥ 80 %) → `full` ·
  `running` from the start date · `closed` (end passed or closed by admin; terminal; only `closed_at` stored);
  `faculty.state` `in_induction` → `active` ⇄ `paused`; `modules.status` `draft` → `current` → `needs_update` →
  `current` at the next version (running batches keep their fixed version; publishing a core module creates an
  `update_module_assignments` row for every certified coach); `batch_waitlist.state` `waiting` → `offered_seat` |
  `moved` | `withdrawn`; `question_proposals.state` `proposed` → `approved` | `declined`.

### G3 · Assigning coaches
- **Who / when:** Admin, several times a day, to assign every booking within the assign-within setting. Saarthi sorts
  the eligible coaches; **admin clicks; nothing is assigned automatically.**

| Queue row | Stored as |
|---|---|
| Booking: first name, client type, language, starts | `debriefs.first_name` · `client_type` · `language_code` · `scheduled_at` (not copied onto the queue) |
| Source | `assignment_queue.source` ENUM('new','upgrade','key','rebook','coaching_lead','move_request','paused_coach') |
| Tier, report, organisation, integrity | `debriefs.tier` ENUM('standard','plus','premium') · `report_kind` (+ `session_type` coaching) · `organisation_id` · `integrity` |
| Previous coach (rebooks) | `assignment_queue.previous_coach_id` |
| Assign by, state | `assignment_queue.assign_by` · `state` ENUM('waiting','assigned','cant_fill') · `request_id` |
| The assignment | `debrief_assignments` (`coach_id`, `slot_id`, `assigned_by`, `assigned_at`, `meeting_ref`, `ended_at`, `end_reason` ENUM('moved','late_drop','paused','cancelled','access_ended')) + `debriefs.coach_id` / `slot_id` / `status = 'assigned'` + a `notifications` row |

- **Derived (never stored): the suggestion list.** Hard filters — stage `active` or `provisional`, not paused or
  lapsed · level covers the client type · the Can't say rule allows it · qualifies for the tier · language matches · a
  free slot exists · organisation client → only that organisation's certified pool · Paradox or Team → Advanced passed
  only · undertaking signed. Sort — same coach (rebook) → Primary language → most room left in commitment → rating.
  A late drop in the last N days (setting) moves a coach down — not a grade change. Shown per coach: room left
  (booked vs committed this week) and the reason chips.
- **Lifecycle:** queue `waiting` → `assigned` | `cant_fill`. A move request or a coach pause adds a new `waiting` row
  with the matching source.

### G4 · Settings (eight groups)
- **Who / when:** Admin changes every setting except money; **Finance admin owns Money and packs** (Admin sees
  "hidden — Finance admin"). Rarely, when a rule is agreed.

| Shown / entered | Stored as |
|---|---|
| Setting | `settings` (`setting_key`, `group_key` ENUM('assigning','calendar_drops','money_packs','training_credential','consent_recording','coaching_rules','wording_lists','organisations'), `label`, `value_type` ENUM('int','decimal','bool','enum','text','list','money','json'), `value_int` / `value_text` / `value_json`, `amount_minor` + `currency` (money only), `owner_role` ENUM('admin','finance_admin'), `effective_from`, `updated_by`, `updated_at`) |
| Change history | `setting_changes` (`old_value`, `new_value`, `effective_from` (now or later), `reason`, `changed_by`, `changed_at`) |

  The keys are in `seed.json` (assigning order, assign within, late-drop penalty; slot length and gap, no-booking
  window, late-drop line, flag at N a month, lock window; the money group; modules, exam weights, resits, supervised
  debriefs, mentor hours, provisional window and extension, current Code version, attestation; consent choices,
  meeting account, transcript tool, retention; Prep guide rules, product rules, gaps as bands; the two wording lists;
  organisation rules; Category D and the Can't say default).
- **Rules:** a raised Code version makes every coach re-accept at next login; turning on Category D shows "meaning not
  yet defined".

### G5 · Ratings review
- **Who / when:** Admin at the quarterly review and whenever Saarthi flags a coach. Saarthi flags with a reason and
  **never proposes a grade**.

| Shown / entered | Stored as |
|---|---|
| Flag | `rating_flags` (`coach_id`, `rule` ENUM('trend_drop','low_ratings_month','coach_client_gap','warnings_month','late_drops','retake_offers'), `detail`, `quarter` CHAR(7), `state` ENUM('flagged','in_review','decided','dismissed')) |
| Review outcome | `rating_reviews` (`flag_id`, `reviewer_id`, `outcome` ENUM('no_change','warning','category_change','pause','slab_request'), `category_from`, `category_to`, `reason`, `decided_at`) |
| Excluded rating | `rating_exclusions` (`client_rating_id`, `reason`, `excluded_by`, `excluded_at`) — the rating row is kept |
| Client ratings (read) | `client_ratings` (`debrief_id`, `coach_id`, `score` 1–5, `comment`, `rated_at`) — booking reference and first name only |

- **Derived:** average and count per coach, trend over the last N, coach-vs-client gap, late drops this month (all
  thresholds from G4). A slab change is never made here — it becomes a request to Finance admin.
- **Lifecycle:** flag `flagged` → `in_review` → `decided` | `dismissed`. Every Active coach is reviewed each quarter.

### G6 · Upgrade tiers
- **Who / when:** Admin, to see what each tier requires the coach to deliver; Finance admin for the uplift and pack
  pricing. **The client price is never in Saarthi.**

| Shown | Stored as |
|---|---|
| Tier, what it delivers, availability | `upgrade_tiers` (`tier_key` ENUM('standard','plus','premium'), `label`, `delivers`, `qualifies_rule` JSON, `availability` ENUM('included','upgrade_at_booking'), `effective_from`) |
| Coaching packs | `coaching_packs` (`sessions`, `active`); the price is a Finance-admin money setting |
| Rates billed to Aarambh (Finance) | `tier_rates` (`client_type`, `tier_key`, `session_type`, `amount_minor`, `currency`, `effective_from`) `[MONEY]` |

- **Derived:** supply panel — coaches and open hours per tier × client type.
- **Rules:** a tier is never silently downgraded (only with the client's agreement, then billed at Standard); key
  bookings are billed at the tier the coach qualifies for on the booking day; a coach never pitches an upgrade.

### G7 · Slabs and payments / rate agreements
- **Who / when:** **Finance admin only** (Admin sees "this screen belongs to Finance admin" and no data). Monthly pay
  and case-by-case terms.

| Shown / entered | Stored as `[MONEY]` |
|---|---|
| Slab | `pay_slabs` (`code`, `commitment_band`) + `pay_slab_rates` (`component` ENUM('monthly_commitment','debrief','coaching_one_to_one','coaching_group'), `amount_minor` NULL until agreed, `currency`, `effective_from`) |
| How this coach is paid | `coach_pay_agreements` (`kind` ENUM('standard_slab','fixed_per_session','share_of_client_fee'), `pay_slab_id`, `rate_debrief_minor`, `rate_one_to_one_minor`, `rate_group_minor`, `currency`, `share_basis_points`, `effective_from`, `superseded_at`, `reason`, `agreed_by`) — superseded rows kept |
| Pay run | `pay_runs` (`period` CHAR(7), `state` ENUM('draft','approved','paid','held_no_bank'), `approved_by`, `approved_at`) |
| Pay lines | `pay_lines` (`coach_id`, `debrief_id`, `component` (+ `late_cancel_share`, `did_not_join`), `amount_minor`, `currency`) |

- **Derived:** the rate card's four worth signals (work done count and hours, rating average, demand = share of open
  slots taken + rebook count, operating level); this month's debriefs and coaching sessions per coach (groups once);
  amount due. A per-session fee is earned when the after-debrief is complete; the monthly commitment counts only if
  the coach opened most of their committed hours; training and exam time is never paid.
- **Lifecycle:** pay run `draft` → `approved` → `paid`; `held_no_bank` while bank details are missing.

### G8 · Organisation engagements
- **Who / when:** Admin, when an organisation signs an engagement and to keep its pool and programmes current. Coaches
  see the brief and programmes in the Prep guide, Live mode and recommendations, for that organisation's clients only.

| Shown | Stored as |
|---|---|
| Organisation | `organisations` (`name`, `type` ENUM('corporate','university','industry'), `brief`, `aarambh_org_ref`) |
| Engagement | `engagements` (`starts_on`, `ends_on`, `state` ENUM('draft','active','closed'), `expected_sessions`) |
| Programmes | `organisation_programmes` (`name`, `kind` ENUM('learning','training','mentoring','counselling'), `description`, `active`) |
| Pool | `coach_org_certifications` (certified / update due) |
| Vetted coaches | `vetted_coaches` (`granted_by`, `granted_at`, `revoked_at`) — who grants is open |
| Client consent to share | `client_share_consents` (`debrief_id`, `consented`, `consented_at`, `source`) — required before sharing anything |

- **Rules:** only the organisation's pool takes its clients (G3 sort inside the pool); recommendations go to the
  organisation and every one is documented; certification only from a G2 batch; the coach represents Aarambh.

### G9 · Capacity and demand
- **Who / when:** Admin weekly and at planning time; Finance admin sees the same page. **Plain arithmetic, not a
  forecast.** Stores nothing; aggregates only; no client identifiers in the payload. See §4 for the arithmetic.

### G10 · People and access
- **Who / when:** Admin, to manage who may sign in and what they may open, to check undertakings, and to read the
  activity log. Tabs: Roles · People · Undertakings · Activity log.

| Shown / entered | Stored as |
|---|---|
| Seven roles | `roles` (`role` ENUM('admin','finance_admin','faculty','mentor','coach_ours','coach_org','aarambh_reviewer'), `label`, `may_open`) |
| Person | `users` (`full_name`, `email` UNIQUE, `state` ENUM('invited','active','suspended','deactivated'), `last_sign_in_at`, `password_hash` (never readable through any admin endpoint), `session_version`) |
| Roles held | `user_roles` (`user_id`, `role`) — one person may hold several |
| Role change | `activity_log` + `users.session_version` bump (forces re-login) |
| Reset link | `password_reset_tokens` (`token_hash`, `expires_at`, `used_at`, `requested_by`) |
| Undertaking versions | `undertaking_versions` (`version`, `published_on`, `owner_label`, `body` JSON, `is_current`) |
| Signatures | `undertaking_signatures` (`signed_at`, `access_state` ENUM('open','closed_unsigned','ended'), `ended_at`, `end_reason`) |
| Activity log | `activity_log` (`occurred_at`, `actor_user_id`, `actor_role`, `entity_type`, `entity_id`, `action`, `before_json`, `after_json`, `reason`, `is_money`) |

- **Derived:** the undertaking list = a union of coaches, faculty, mentors and trainees, de-duplicated by person.
- **Lifecycles:** person `invited` → `active` ⇄ `suspended` → `deactivated` (kept, never deleted). Undertaking access
  `closed_unsigned` → `open` (signed) → `ended` (unassigned, engagement closed, or left the organisation); publishing a
  new version takes every `open` back to `closed_unsigned` — readings stay closed until re-signed.

---

## 2 · How the four captures were merged

| Merged into | From | Decision |
|---|---|---|
| `users` | `user_account` (A), `staff_user` (D), `users` (B) | One sign-in table for everyone, staff and coaches. Roles in `user_roles` (several per person) |
| `user_profiles` · `user_languages` | `coach_profile`, `coach_language`, `coach_languages`, `faculty.languages` | Keyed by user, so trainers and coaches share them. Languages are a code FK to `languages` |
| `coaches` | `coach` (D), `coaches` (B), parts of `enrolment` (A) | One coach record. The career stage (`coaches.stage`) is the single lifecycle; batch-specific fields (seat, first login, own assessment, mentor) stay on `enrolments`. Provisional fields moved to `coaches` |
| Stage enum | A: invited…active; B: training/passed/lapsed; D: + paused/withdrawn | `invited, in_training, exam_passed, provisional, provisional_lapsed, active, paused, withdrawn` + `stage_before_pause`. C1's labels are display only |
| Rank history | `coach_rank` (A) | Current rank on `coaches.rank`; history via `activity_log` (reason required) |
| Commitment band | `time_commitment` (A), `coaches.commit_band` (B), `coach.commitment_band` (D) | One source: `time_commitments` (active row = current band; `pending_approval` row = a change waiting, linked from the `time_commitment` request) |
| Pay slab | `coach.pay_slab_id` (D) | Moved off `coaches` into `coach_pay_agreements`, so the coach table carries no money. Faculty `rate_band` likewise moved to `faculty_pay_terms` |
| Rating cache | `coaches.rating_avg/count` (B) | Not stored; derived from `client_ratings` less exclusions |
| `client_ratings` | `ratings` (B, rater client/coach), `client_rating` (D) | Client ratings only. The coach's four-part rating of the conversation stays on `after_debriefs` |
| `code_signatures` | `code_signature` (A), `code_acceptances` (B) | One table for the first signing and every re-accept |
| `credentials` | A (char 20, active/lapsed/withdrawn), B (char 18, + paused/expired) | `CHAR(18)` (the format is 18 characters); status `active, lapsed, paused, withdrawn` (expired = lapsed) |
| `coach_tracks` | A (opened/passed/passed_at_entry), B (locked/open/in_training/passed) | A's states; track values singular, matching `client_type` |
| `coach_org_certifications` | A (`coach_org_cert`), B, D | One table; state `in_training, certified, update_due, paused, expired` |
| Earned roles | `coach_roles` (B) | Dropped: `user_roles` + `faculty` already hold it |
| `debriefs` | `debriefs` (B), `debrief` (C), `booking` + parts of `assignment_queue` (D) | One table per booked session, created when the booking arrives (H2, status `unassigned`). Booking/person/sitting are `*_ref` external ids. The queue keeps only queue facts; the assignment history is `debrief_assignments` |
| `clients` | `clients` (B) | Dropped: Saarthi keeps no person record — `person_ref` + `first_name` on the debrief |
| Sent-back comment, early-end reason | on `debriefs` (B) | De-duplicated: `feedback_letters.decision_comment`, `live_runs.ended_early_reason` |
| `requests` | `change_request` (A), `requests` (B), `coach_request` (D) | One table; types `detail_correction, time_commitment, public_card, move_debrief, locked_slot`; states `open, approved, declined`. `target` is derived from `type` |
| `notifications` | `notification` (A), `coach_notices` (B) | One table with one kind enum |
| `question_proposals` | `question_proposal` (A), `bank_proposal` (C) | One table with `origin`; approved rows become `bank_questions` (the FK target of `prep_questions.bank_question_id`) |
| `undertaking_versions` · `undertaking_signatures` | A (version PK string), D (id + access_state) | D's shape: id PK, unique version, `access_state` carries the gate |
| `activity_log` | A, D | D's shape; `before_json`/`after_json` (BEFORE is reserved in MySQL), `is_money` for Finance-only entries |
| Report links | `aarambh_report_link.url` + `expires_at` (C) | **No URL stored** (integration §5). `aarambh_reading_reports` keeps type/copy/version; every link request is logged in `report_link_requests` |
| Lane enum | C: Fit/Develop; integration §6: Fit/Performance | Aarambh's wire values: `fit, performance` |
| Integrity | C: Reliable/Caution; wire: reliable/needs_clarification/hold | Stored `reliable, caution`; `hold` refused at intake |
| `coaching_keys` | B (dates), C (key_code, status) | Merged: `key_code`, `issued_at`, `expires_at`, `status`, `used_debrief_id` |
| `organisations` | A, D | D's shape + `aarambh_org_ref` |
| Practice runs | C (run with no debrief) | `live_runs` and `prep_questions` point at either a debrief or a `practice_debriefs` row (CHECK: exactly one) |
| Derived "tables" | `trainee_progress`, `exams`, `provisional_progress` (B) | Not tables: derived from `module_progress`, `exam_attempts`, `supervised_debriefs`, `mentor_hours_log` |
| Integration log | — | Added `integration_events` (H1–H8 + revoke; idempotency key; no bodies) to meet the integration doc's idempotency and logging rules |

---

## 3 · Tables (111)

Columns are listed by name; types, keys and comments are in `schema.sql`. "Reads" / "Writes" name screens or jobs.

### 3.1 People & access

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `users` | Every sign-in | id, full_name, first_name, email, phone, state, password_hash, session_version, invited_at, last_sign_in_at, deactivated_at, created_at | PK id · UQ email · UQ phone | all (auth), S1, G10 | G2 enrol, G10, auth |
| `roles` | The seven roles | role, label, may_open | PK role | G10, every permission check | seed |
| `user_roles` | Who holds which role | user_id, role, granted_by, granted_at | PK (user_id, role) | every endpoint | G2 enrol, G10 `changeRole` |
| `password_reset_tokens` | Single-use reset links | id, user_id, token_hash, expires_at, used_at, requested_by, created_at | PK · UQ token_hash | auth | G10 reset link, self-service |
| `languages` | The eleven languages | code, name, sort_order | PK code | everywhere | seed |
| `user_languages` | A person's languages | user_id, language_code, proficiency | PK (user_id, language_code) | S1, C2, G1, G3, G9 | G2 enrol |
| `user_profiles` | Profile copied from the application | user_id, city, years_of_work, current_work, experience_text, qualifications_text, photo_file_id, bio, updated_at | PK user_id | S1, C2, G2 | G2 enrol, S1 (photo, bio) |
| `files` | Private uploads | id, owner_user_id, kind, mime, bytes, storage_key, scanned_at, created_at | PK | W1, S1, S4, C2, G2 | W1, S1, S4, C2 |
| `undertaking_versions` | The data undertaking, versioned | id, version, published_on, owner_label, body, is_current, published_by | PK · UQ version | S1, G10 | G10 publish |
| `undertaking_signatures` | Who signed which version; the reading gate | id, user_id, undertaking_version_id, coach_type, organisation_id, signed_at, access_state, ended_at, end_reason | PK · UQ (user, version) | every reading / coach-copy request, G1, G2, G3, G10 | S1, G1 `endAccess`, G10 publish |
| `code_versions` | Code of Ethics versions | version, published_on, what_changed, body_ref, is_current | PK version | S4, C1, C2 | G4 |
| `code_signatures` | First signing and re-accepts | id, user_id, code_version, read_to_end_at, signed_at, includes_public_rating | PK · UQ (user, version) | C1, C2, G1, G2 | S4, C1 |

### 3.2 Training

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `programmes` | The five programme types | code, name | PK code | all | seed |
| `applications` | W1 applications | id, applying_as, full_name, phone, email, city, years_of_work, current_work, experience_text, qualifications_text, cv_file_id, time_band, attend_mode, start_window, attend_days, source_tag, consent_given, consent_at, consent_text_version, state, offered_batch_id, submitted_at, delete_after | PK · idx state, source_tag, email, phone | G2 | W1, G2 |
| `application_languages` | Languages on an application | application_id, language_code, proficiency | PK (app, lang) | G2 | W1 |
| `application_preferences` | Who they'd work with / could teach | application_id, value | PK (app, value) | G2 | W1 |
| `batches` | A run of a programme | id, programme_code, name, mode, city, venue, start_date, end_date, seats_in_person, seats_online, curriculum_label, organisation_id, created_by, created_at, closed_at, close_reason | PK · idx (programme, start) · CHECK dates | S1, S2, C1, G2, G9 | G2 |
| `batch_sessions` | Dated sessions | id, batch_id, session_date, start_time, title, module_id | PK · idx (batch, date) | S1, S2, C1, G0, G2 | G2 (`moveDates` shifts) |
| `batch_staff` | Faculty and mentors on a batch | batch_id, faculty_id, role | PK (batch, faculty, role) | S1, S2, G2 | G2 |
| `batch_module_versions` | Versions a batch teaches, fixed at creation | batch_id, module_id, version | PK (batch, module) | S2, G2 | G2 |
| `batch_waitlist` | Waiting for a seat | id, batch_id, application_id, seat_type, position, added_at, state | PK · idx | G2 | G2 |
| `batch_date_changes` | Every date move with a reason | id, batch_id, old_start, old_end, new_start, new_end, reason, changed_by, changed_at | PK | S1, S2, G2 | G2 |
| `enrolments` | A person's seat in a batch | id, user_id, application_id, batch_id, seat_type, coach_type, organisation_id, enrolled_tracks, mentor_faculty_id, first_login_state, first_login_confirmed_at, confidentiality_promised_at, own_assessment_state, own_assessment_due, own_assessment_ref, own_debrief_coach_id, own_debrief_done_at, created_at | PK · UQ (user, batch) · CHECK org | S1–S4, C1, G2 | G2 enrol, S1 |
| `modules` | Curriculum modules | id, programme_code, number, title, summary, current_version, status, needs_update_reason, owner_faculty_id, owner_label, exam_note, organisation_id | PK · UQ (programme, number, org) | S2, S3, G2 | G2 |
| `module_versions` | Version history | id, module_id, version, published_on, change_note, practice_text, published_by | PK · UQ (module, version) | G2 | G2 `publishMod` |
| `module_version_items` | Outcomes, plan, material | module_version_id, kind, position, text | PK | S2, G2 | G2 |
| `module_progress` | A trainee's module state | enrolment_id, module_id, state, sessions_attended, signed_by_faculty_id, signed_at, faculty_feedback | PK (enrolment, module) | S2, C1, G2 | faculty (G2) |
| `update_module_assignments` | Update modules due for certified coaches | id, coach_id, module_id, version, what_changed, length_minutes, state, created_at, done_at | PK · UQ | S3 | G2 publish, S3 |
| `library_documents` | The Saarthi library | id, name, owner_label, word_count, current_version, source_ref | PK | S2, G2 | G2 |
| `library_document_versions` | Library version history | id, document_id, version, published_on, change_note, published_by | PK · UQ | G2 | G2 |
| `library_reads` | Who read which version | user_id, document_id, version_read, read_at | PK (user, doc) | S2 | S2 `libOpen` |
| `guide_versions` | The coach guide | version, published_on, whats_new, body, status | PK | C1, C11 | admin |
| `guide_model_map` | Other models onto SETU | model, setu_step, model_step, note | PK (model, step) | C11 | admin |
| `guide_acks` | "I've read this" | user_id, guide_version, read_at | PK | C1 | C1 |
| `practice_debriefs` | Synthetic practice | id, enrolment_id, synthetic_report_id, report_version, state, feedback, given_by_faculty_id | PK | S2, C1, G2 | S2, C6 practice, faculty |
| `exam_part_defs` | The four exam parts | part, title, description, sort_order | PK | S4, G2 | seed |
| `exam_attempts` | Each attempt at a part | id, enrolment_id, part, attempt_no, scheduled_at, result, feedback, mark, half_a_plan, half_b_comparison, marked_at | PK · UQ (enrolment, part, attempt) | S4, C1, G0, G2 | faculty markers |
| `exam_markers` | Markers per part | enrolment_id, part, faculty_id, assigned_by, assigned_at | PK | G2 | G2 `rTog` |
| `faculty` | Faculty and mentors | id, user_id, kind, route, application_id, teaches, modules_note, may_mark, city, teaches_online, cap_batches_per_month, state, promotion_reason, induction_batch_id | PK · UQ user | S1, S2, G2 | G2 |
| `faculty_agreements` | Faculty / mentor agreements | faculty_id, agreement_version, signed_on | PK | G2 | faculty onboarding |
| `faculty_calibrations` | Marking calibration | id, faculty_id, calibrated_on, due_on, note, recorded_by | PK · idx | G2 | G2 `calibrate` |
| `traits` | Aarambh's trait list | code, name, default_lane | PK | C5, G2 | from Aarambh |
| `bank_questions` | The Question Bank | id, trait_code, step, text, why, state, from_proposal_id, approved_by, approved_at | PK · idx trait | C5 | G2 approve |
| `question_proposals` | Candidates for the Bank | id, text, origin, debrief_id, proposed_by, trait_code, point_kind, proposed_at, state, decided_by, decided_at | PK · idx state | G2 | C5, C6, C7–C10, faculty |

### 3.3 Coaches & grading

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `coaches` | The coach record | id, user_id, coach_type, organisation_id, stage, stage_before_pause, rank, level, growth, category, cant_say_rule, hours_target_month, provisional_start, provisional_end, provisional_extended, mentor_signoff_at, created_at | PK · UQ user · CHECK org | C1–C4, C12, G0, G1, G3, G5, G9 | G2 enrol, S1, S4, G1, C2 (target only), mentor |
| `role_track_defs` | Track reference | track, code, title, days | PK | S3 | seed / admin |
| `rank_defs` | Rank ladder | rank, label, how_earned, adds, sort_order | PK | S3 | seed |
| `coach_tracks` | Tracks opened and passed | coach_id, track, state, opened_by, opened_at, batch_id, signed_off_by_faculty_id, passed_at | PK (coach, track) | S3, C2, G3 | G1 / G2 / faculty |
| `advanced_enrolments` | Advanced Programme | coach_id, batch_id, state, passed_at | PK coach | S3, C2, G1, G3 | admin |
| `coach_org_certifications` | Organisation pool | coach_id, organisation_id, state, certified_at, batch_id | PK (coach, org) | S3, C2, G1, G3, G8, G9 | G2 batches |
| `time_commitments` | Band, days, months | id, coach_id, band, days, times_of_day, months, state, effective_from, approved_by, created_at | PK · idx | S4, C1, C2, G1, G3, G9 | S4, C2 request, G1 approve |
| `credentials` | The credential | id, coach_id, credential_number, issued_on, valid_to, status, withdrawn_at, withdrawn_reason, pdf_file_id | PK · UQ number · UQ coach | S3, S4, C2, verify page | S4 issue, G1 |
| `credential_attestations` | Annual attestation | id, credential_id, attested_at, valid_to | PK | S4, C2 | annual flow |
| `supervised_debriefs` | Provisional supervised debriefs | coach_id, debrief_id, mentor_faculty_id, mentor_signed_at | PK | S4, C1 | mentor |
| `mentor_hours_log` | Mentor hours | id, coach_id, mentor_faculty_id, hours, on_date | PK | S4, C1 | mentor |
| `coach_public_cards` | "About your coach" | id, coach_id, years_experience, worked_with, about, photo_file_id, status, submitted_at, approved_at, approved_by, approved_snapshot | PK · UQ coach | C2, Aarambh website, client login | C2, G1 approve |
| `coach_card_specialities` | Up to three specialities | card_id, speciality | PK | C2 | C2 |
| `coach_prefs` | "Coach chooses, SETU remembers" | coach_id, report_view, split_width_pct, swap_sides, hide_report, report_zoom_pct | PK | C5, C6 | C5, C6 |
| `client_ratings` | Client's rating of the coach | id, debrief_id, coach_id, score, comment, rated_at | PK · UQ debrief | C1, C2, G1, G3, G5, G7 | Aarambh (H7) |
| `rating_flags` | Saarthi's flags | id, coach_id, rule, detail, quarter, state, created_at | PK · idx | G5 | quarterly job, G5 |
| `rating_reviews` | A person's decision | id, coach_id, flag_id, reviewer_id, outcome, category_from, category_to, reason, decided_at | PK | G1, G5 | G5 |
| `rating_exclusions` | Ratings left out of the average | client_rating_id, reason, excluded_by, excluded_at | PK | G5 | G5 |

### 3.4 Calendar & bookings

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `slots` | Times a coach opens | id, coach_id, slot_date, start_minute, duration_min, status, debrief_id, created_by, created_at, closed_at | PK · UQ (coach, date, start) · idx date | C1, C2 (peer hours), C3, G3, G9, Aarambh (H1) | C3, G3 |
| `coach_unavailability` | Dates and weekdays off | id, coach_id, kind, date_from, date_to, weekday, created_at, removed_at | PK | C3, G3 | C3 |
| `assignment_queue` | Bookings waiting for a coach | id, debrief_id, source, previous_coach_id, request_id, assign_by, state, entered_at, resolved_at, resolved_by | PK · idx (state, assign_by) | G0, G3, G9 | H2 arrival, G1 (moves, pause), G3 |
| `debrief_assignments` | Assignment history | id, debrief_id, coach_id, slot_id, assigned_by, assigned_at, meeting_ref, ended_at, end_reason | PK · idx | G3, C4, G7 | G3 `assignCoach` |
| `late_drops` | Moves asked < 48 h before | id, coach_id, debrief_id, request_id, dropped_at | PK · idx (coach, time) | G3 (penalty), G5 | C3 |

### 3.5 Debriefs & the reading cache

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `debriefs` | One booked debrief or coaching session | id, booking_ref, person_ref, sitting_ref, first_name, client_type, language_code, session_type, engagement_id, session_no, report_kind, report_version, sitting_type, integrity, tier, organisation_id, pack_size, consent_at_booking, scheduled_at, slot_id, coach_id, supervised, status, prep_stale, on_hold, status_changed_at, closed_at, reading_purge_after, created_at | PK · UQ (booking_ref, session_no) · idx (coach, status), (status, time), person_ref, purge | C1, C3, C4–C12, G0, G3, G9 | H2, G3, C5, C6, C7–C10, H5, H7 |
| `debrief_status_log` | Every status change | id, debrief_id, from_status, to_status, changed_by, source, changed_at, reason | PK · idx | G10 audit | every transition |
| `aarambh_readings` | The reading receipt (H3) | id, debrief_id, sitting_ref, person_ref, sitting_type, sitting_completed_at, payload_version, generated_at, received_at, route, integrity, state, intake_log | PK · idx | C5, C6, C7 | H3 intake, H5 |
| `aarambh_reading_traits` | Finished per-trait fields | reading_id, trait_code, level, lane, gap_band, trait_status, caret | PK (reading, trait) · CASCADE | C5, C7 | H3 intake |
| `aarambh_reading_reports` | Which reports and copies exist | id, reading_id, report_type, copy_kind, report_version, integrity, sort_order | PK · CASCADE | C5, C6 | H3 intake |
| `aarambh_opened_items` | What the person opened | reading_id, item_ref, report, kind, name, band, times_opened, sort_rank | PK · CASCADE | C5 (undertaking signed only) | H3, H5 `opened_updated` |
| `report_link_requests` | Every fresh link asked of Aarambh (no URL kept) | id, debrief_id, user_id, copy_kind, report_type, undertaking_version, present_mode, requested_at, expires_at, revoked_at, result | PK · idx | G10 audit | C5, C6 (H4), close (revoke) |
| `prep` | The coach's prep | debrief_id, understanding, private_notes, caution_ack, prep_done, prep_done_at, updated_at | PK | C5, Aarambh audit (understanding only) | C5 |
| `prep_questions` | My questions | id, debrief_id, practice_debrief_id, step, text, source, bank_question_id, why, note, point_kind, trait_code, sort_order | PK · CHECK one owner | C5, C6, C7–C10 | C5 |
| `prep_question_options` | Quick options | question_id, ord, label, follow_up | PK | C5, C6 | C5 |
| `live_runs` | The Live mode run | id, debrief_id, practice_debrief_id, mode, started_at, ended_at, consent_at_session, consent_changed, covers_done, confidentiality_done, current_step, client_state, state_since_min, outcome, ended_early_reason | PK · UQ debrief · UQ practice · CHECK one owner | C6, C7–C10, G0 | C6 |
| `run_step_log` | Steps and step-backs | run_id, seq, at_min, step, stepped_back | PK | C6 End | C6 |
| `run_answers` | What they said | run_id, question_id, mark, answer_text, option_ord, follow_up_answer, from_transcript, put_aside_reason | PK | C6, C7–C10, A1 | C6 |
| `run_followups` | Follow-ups added in the room | run_id, question_id, ord, question, answer | PK | C6, C7–C10 | C6 |
| `run_jots` | Quick jots | id, run_id, step, at_min, text | PK | C6, C7–C10 | C6 |

### 3.6 After the debrief (and further coaching)

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `after_debriefs` | The four sections' state | debrief_id, due_at, submitted_at, no_recommendation, no_recommendation_reason, letter_status, letter_read_ack, rate_settled, rate_understood, rate_covered, rate_next_step, rate_comment, reflection, recording_url, recording_missing_reason, transcript_meeting_id, transcript_fetched_at, gap_note, disposition_sent_at | PK debrief · CHECK rates | C7–C10, G0, G5, A1 | C7–C10 |
| `recommendations` | Up to three leads | id, debrief_id, source, product_ref, org_programme_id, based_on, who_raised, why, setu_pointer, ord | PK · UQ (debrief, ord) · CHECK target | C7, A2 leads, organisation | C7 |
| `feedback_letters` | The letter, versioned | id, debrief_id, version, talked_about, stood_out, next_steps, coach_note, language_code, word_count, submitted_at, decision, decision_comment, decided_at | PK · UQ (debrief, version) | C4, C8, A1 | C8, H7 |
| `retake_offers` | "This reading does not fit" | id, debrief_id, person_ref, sitting_ref, coach_id, reason, offered_at, aarambh_status | PK · UQ (coach, person) | C6, C7–C10, G5 | C6, C7–C10 |
| `coaching_engagements` | Further coaching | id, coach_id, person_ref, started_on, last_booking_on, state, ended_reason | PK · idx | C4, C12 | key booking, nightly 60-day job, coach/admin close |
| `coaching_keys` | "Continue with me" keys | id, debrief_id, coach_id, key_code, issued_at, expires_at, status, used_debrief_id | PK · UQ debrief · UQ code | C12, client login (via Aarambh) | on letter approval |
| `coaching_session_notes` | C12 session notes | debrief_id, focus, current_node, state_read, action, follow_up_on, updated_at | PK | C12 | C12 |
| `coaching_step_notes` | Note at each step | debrief_id, node, note | PK | C12 | C12 |

### 3.7 Organisations

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `organisations` | An organisation client | id, name, type, brief, aarambh_org_ref, created_at | PK · UQ ref | S1, S3, C1, C4, C5, G1, G3, G8 | G8 |
| `engagements` | A signed engagement | id, organisation_id, starts_on, ends_on, state, expected_sessions | PK · CHECK dates | G8, G9 | G8 |
| `organisation_programmes` | Its programmes | id, organisation_id, name, kind, description, active | PK | C7, G8 | G8 |
| `vetted_coaches` | May recommend directly | coach_id, organisation_id, granted_by, granted_at, revoked_at | PK | C7, G8 | G8 |
| `client_share_consents` | Client's consent to share | debrief_id, consented, consented_at, source | PK | C7, G8 | H2 booking feed |

### 3.8 Money (Finance admin only)

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `pay_slabs` | Slab codes | id, code, commitment_band | PK · UQ code | G1 (Finance), G7 | G7 / G4 money |
| `pay_slab_rates` | Slab amounts per component | id, pay_slab_id, component, amount_minor, currency, effective_from | PK · idx | G7 | G4 money / G7 |
| `coach_pay_agreements` | How each coach is paid | id, coach_id, kind, pay_slab_id, rate_debrief_minor, rate_one_to_one_minor, rate_group_minor, currency, share_basis_points, effective_from, superseded_at, reason, agreed_by, created_at | PK · idx | G1 (Finance), G7 | G7 `doRate` |
| `faculty_pay_terms` | Faculty rate band | id, faculty_id, rate_band, effective_from, set_by | PK · idx | G2 (Finance) | Finance admin |
| `tier_rates` | Rates billed to Aarambh | id, client_type, tier_key, session_type, amount_minor, currency, effective_from, set_by | PK · idx | G6 (Finance) | G6 `setTierRate` |
| `pay_runs` | Monthly run | id, period, state, approved_by, approved_at | PK · UQ period | G7 | G7 |
| `pay_lines` | Lines of a run | id, pay_run_id, coach_id, debrief_id, component, amount_minor, currency | PK · idx | G7 | pay-run job |

### 3.9 Settings

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `settings` | Every agreed rule | setting_key, group_key, label, value_type, value_int, value_text, value_json, amount_minor, currency, owner_role, effective_from, updated_by, updated_at | PK key | everywhere (rules) | G4 |
| `setting_changes` | History, forward only | id, setting_key, old_value, new_value, effective_from, reason, changed_by, changed_at | PK · idx | G4, G10 | G4 |
| `upgrade_tiers` | What each tier delivers | tier_key, label, delivers, qualifies_rule, availability, effective_from | PK | G3, G6 | G6 / G4 |
| `coaching_packs` | Pack sizes | id, sessions, active | PK · UQ | G6, G9 | G4 money group |

### 3.10 Requests, alerts & log

| Table | Purpose | Columns | Keys | Reads | Writes |
|---|---|---|---|---|---|
| `requests` | What coaches ask admin for | id, user_id, coach_id, type, summary, reason, payload, slot_id, debrief_id, is_late_drop, state, decided_by, decided_at, decision_reason, created_at | PK · idx | C2, C3, G0, G1 | S1, C2, C3, G1 `reqDo` |
| `same_day_alerts` | Call-today alerts | id, coach_id, debrief_id, kind, severity, summary, occurred_at, acknowledged_by, acknowledged_at | PK · idx | G0 | C6 (system), G0 |
| `notifications` | In-app notices | id, user_id, kind, debrief_id, batch_id, request_id, body, reason, created_at, read_at | PK · idx (user, read) | S1, S2, C1 | system, G1, G2, G3 |
| `integration_events` | Every H1–H8 call, no bodies | id, direction, call_code, idempotency_key, debrief_id, external_ref, event_kind, http_status, result, occurred_at | PK · UQ (direction, call, key) | ops, G10 | integration layer |
| `activity_log` | Who changed what, and why | id, occurred_at, actor_user_id, actor_role, entity_type, entity_id, action, before_json, after_json, reason, is_money | PK · idx · append-only | G10 (Finance: own money entries) | every admin write (server-side `logAct`) |

---

## 4 · Derived, never stored

| What | How it is worked out |
|---|---|
| **Batch state** (G2, G9) | `closed` if `closed_at` set or end < today · `running` if start ≤ today · `empty` (0 filled) · `full` (filled ≥ seats) · `nearly full` (≥ 80 %) · else `filling`. Only `closed_at` is stored |
| **Seat fill** | Filled per type = count of `enrolments` by `seat_type` for the batch; seats left = seats − filled. **No counters stored**; the enrol write checks the count inside a transaction |
| **Eligibility** (G2 builder, G3 suggestions, markers) | Re-checked server-side on every write: faculty fit, mentor fit (< 6 mentees), `canMark` (active, calibration in date, cleared for the part, not the trainee's mentor), the G3 hard filters and sort |
| **Credential number check digit** | `GYS-SAR-YYYY-` + 4 Crockford base-32 characters + 1 check character computed from them; generated once and validated on the verify page |
| **Module / exam / provisional progress** | Modules n of 5; exam parts passed; supervised debriefs n of target; mentor hours sum vs target; provisional days left = `provisional_end` − today |
| **Coach hours** (C1, C2) | Debrief = 45 min with the client + 45 min prep; coaching = 45 min; a group counts once — from completed sessions. Opened this week = own slots in the Mon–Sun week × 0.75 h vs the band minimum |
| **Peer comparison** (C2) | Hours opened this month per coach on the same band: position N of M, top half, % of committed, median. Anonymous; hours only |
| **Slot flags** (C3) | Locked = start − now < lock window (72 h); too soon = < no-booking window (48 h); day part; late drop = a move asked under the late-drop line |
| **Debrief tabs and targets** (C1, C4) | From `debriefs.status` and `session_type` |
| **Probe points, suggested questions, wording checks, SETU pointers** (C5, C7) | Gyani Says' rules on the stored finished fields only — never Aarambh's logic, never from raw numbers |
| **Letter seed, End summary, audit block** (C6, C7) | From `run_answers`, `run_followups`, `run_jots`, `run_step_log` — the audit block is not a score |
| **After-debrief overdue** (G0, G5) | now > `due_at` and `submitted_at` NULL |
| **Rating average / count / trend / coach-client gap** | From `client_ratings` less `rating_exclusions`; public only from 5 ratings |
| **G0 counts** | to assign (`assignment_queue.state = 'waiting'`), prep overdue (assigned, start inside the prep window, prep not done), letters overdue, sent back (`sentback`), open requests, capacity warning (largest G9 shortfall), lapsing this month (`provisional_end` in this month) — inside the caller's scope |
| **G9 who we have** | Coach counts by stage, level, language (Primary/Secondary), category, organisation certification, city; Advanced passed |
| **G9 what they can take** | hours committed (from bands) · hours opened = Σ open + booked slots × slot length · debrief and coaching hours open this month · slots open / booked / unbooked · utilisation = booked ÷ opened |
| **G9 what is coming** | sittings awaiting a debrief (Aarambh feed) · booking run rate = average bookings a month over the last N months · outstanding pack sessions = bought − used · engagement sessions due by `ends_on` · coaching sessions this month · tiers sold |
| **G9 gap** (per language × level / client type) | capacity = eligible coaches × open slots next month · demand = booked + waiting + pack sessions due · gap = capacity − demand, rendered as a sentence ("<language> · <level> is short N debriefs next month") |
| **G9 lead time** | latest batch start = month of need − (training length + provisional window), against the next batch for that language and city; a batch with no faculty "cannot run" |
| **Undertaking list** (G10) | Union of coaches, faculty, mentors and trainees, de-duplicated by person |
| **Request target** (G1) | From `requests.type` |
| **Current band, current rank line, Advanced flag** | Latest active `time_commitments`; `rank_defs.label` + level or all-rounder + "· Advanced" if `advanced_enrolments.state = 'passed'` |
| **Unread library document** | `library_reads.version_read ≠ library_documents.current_version` |
| **Code re-accept needed** | No `code_signatures` row for the current `code_versions` version |

---

## 5 · Security

| Rule | Where it bites |
|---|---|
| **Money — Finance admin only** | `pay_slabs`, `pay_slab_rates`, `coach_pay_agreements`, `faculty_pay_terms`, `tier_rates`, `pay_runs`, `pay_lines`, and `settings` rows in the `money_packs` group (`amount_minor`, `currency`), plus `activity_log` / `setting_changes` rows marked `is_money`. Every other role gets 403 on these endpoints and the fields are **left out of responses** — hiding in the UI is not the safeguard. The coach never sees a slab, rate, fee or category money |
| **Personal data** | `users`, `user_profiles`, `user_languages`, `applications` (+ languages, preferences), `files` (CV, photo), `debriefs.first_name` / `person_ref`, the reading cache (`aarambh_*`), `run_answers`, `run_followups`, `run_jots`, `prep`, `feedback_letters`, `after_debriefs.recording_url`, `client_ratings.comment`, `coaching_*_notes`. Admin screens show a booking reference and first name only; no client surname is ever stored |
| **Private coach text** | `prep.private_notes`, `after_debriefs.reflection` (mentor of a provisional coach may read it), `coaching_session_notes`, `coaching_step_notes`. **Nobody, Admin included, sees a coach's private notes.** Never sent to Aarambh |
| **The undertaking gate** | No `undertaking_signatures` row with `access_state = 'open'` at the current `undertaking_versions` version → no reading, no coach copy, no opened list — checked on **every** reading and link request. Publishing a new version drops every signature to `closed_unsigned`. `endAccess` sets `ended` at once. The coach link request (H4) carries the version and signed-at; Aarambh refuses without them |
| **Scope** | A coach reads only debriefs where `debriefs.coach_id` is theirs; an organisation's coach only that organisation's people; a mentor only their mentees; faculty only their batches; an Aarambh reviewer only A1–A3 |
| **Report links** | Never stored. Fetched fresh, signed and short-lived per request (H4); Present mode is always served the person copy; every request logged in `report_link_requests`; all coach links revoked when the debrief closes |
| **Reading cache deleted at close** | When a debrief reaches `closed`, `reading_purge_after` = `closed_at` + the audit window (setting `reading_audit_window_days`, open). A nightly job deletes the `aarambh_readings` row; traits, reports and opened items go with it (CASCADE). The coach's own notes and the letter stay (spec §14). A `withdrawn` sitting event (H5) purges at once |
| **Never stored** | Raw answers, raw or mirror scores, the pulses block, timings, item ids, surname, email or phone from the payload, the report text, report URLs, transcript text. The intake logs field names it dropped, never values. `integration_events` holds no bodies |
| **No export** | No print, save or download endpoint for a report or the coach's notes. CVs are viewed in-app, never downloaded |
| **Passwords** | `users.password_hash` is set only by the person via an emailed single-use link (`password_reset_tokens.token_hash`); no endpoint accepts or returns a password from an admin. Role change and suspension bump `session_version` (forces re-login) |
| **Audit** | `activity_log` is append-only (grant INSERT and SELECT only). Every admin write carries a reason. Every debrief status change writes `debrief_status_log` |
| **Retention** | Applications carry `delete_after` (period open). Transcript retention and general retention are open settings. Nothing else is hard-deleted; people are deactivated, not removed |
| **Public endpoints** | W1 submit (rate limit, bot protection, de-duplicate, never echo existing data) and the credential verify page (number → name, status, rank, level, issued, valid to only; no search by name) |

---

## 6 · Open questions

Collected from the four parts and the integration doc. Each needs MS (or both developers) to decide.

1. **Application states** — no declined or withdrawn state exists in the rig.
2. **`offerSeat` short-cut** — the rig sets the application `enrolled` without creating the enrolment and account; the build runs the full enrol path. Confirm.
3. **Enrol dialog tracks select** is not wired in the rig; the build stores `enrolments.enrolled_tracks`. Confirm the values.
4. **Undertaking and Code dates** are hard-coded in the rig; the build uses server time.
5. **Retention periods** — W1 applications (`delete_after`), transcripts, the general retention setting, and the reading-cache audit window after close.
6. **Promotion criteria** for making an Active coach faculty or mentor (spec item 15).
7. **Reading intake route** — the rig lets the coach load a file; production is API at assignment (H3), with file upload by admin only. Remove the coach upload.
8. **Letter wording check** — the rig checks only directive words; the spec wants numbers, levels and Fit-lane "develop" language too.
9. **Required at Submit?** — the recommendation's one-line "why" and the transcript meeting id.
10. **Organisation consent to share recommendations** — `client_share_consents` is modelled; confirm it arrives on the booking feed (H2) or is captured at Settle.
11. ~~Prep after the debrief starts~~ — **answered:** the plan locks; follow-ups can be added live.
12. **Retake limit** — one per person per coach is enforced by a unique key; a second offer is Aarambh admin's. Confirm.
13. **Who assigns the coach** — the integration journey says Aarambh picks a free coach; spec §13 and G3 say Gyani Says admin assigns (H2 open). The model supports admin assignment.
14. **Lane names** — Aarambh sends `Fit` / `Performance`; the coach docs say Fit / Develop. Stored as Aarambh's values; display mapping to agree.
15. **Median answers** — whether `medianAnswers[]` go back to Aarambh in the disposition (H6) or stay in Saarthi (Gyani Says' position: stay).
16. **Early-end reason** — whether Aarambh receives it.
17. **Vetted coaches** — who grants the right to recommend directly to an organisation.
18. **Category D** — built but switched off; its meaning is not yet defined.
19. **Can't say default rule** — the G4 default is not yet set.
20. **Money amounts** — slab amounts, session fees, pack prices, cancellation shares, tier rates are all open (blank until Finance admin agrees them).
21. **Locked slots inside an unavailability range** — the rig removes them; the build turns them into `locked_slot` requests. Confirm.
22. **72-hour lock in `genSlots`** — the rig checks it only in `addDay`; the server enforces it in both.
23. ~~Coach link lifetime~~ — **answered:** 3 hours, renewed while the debrief is open (MS, 17 Oct 2026).
24. **Payload v1.3** — explicit `copy` and no URL on `reports[]`, caret 0/1/2, edition and market, `jdBrief`, line ids. The schema already takes caret 0–2 and keeps no URLs.
25. **Transcript tool** — off until a lawyer confirms; which workspace is used is still to settle.

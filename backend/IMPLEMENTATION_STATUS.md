# Implementation status

Updated 25 October 2026. This file deliberately distinguishes working flows from schema-only or deferred work. Having a database table does not mean its complete workflow is implemented.

## Working locally, with persistent storage

| Area | Implemented behavior |
| --- | --- |
| Accounts | First-owner setup, salted password hashing, role-checked login, server sessions, CSRF, expiry/revocation, hashed single-use invitation/reset tokens, account suspension/deactivation, staff invitations |
| Applications | Credential-free application, consent validation, languages, duplicate handling, administrative review/decision history, batch offer/enrolment, waitlisting when full, real invited account provisioning |
| Training | Curriculum and version creation, future-batch version selection, batch sessions/staff configuration, scoped trainee lists, mentor assignment, module signoff, calibrated independent exam markers, exam scheduling and recorded pass/fail assessments |
| Coach progression | First-login confirmation, undertaking and Code of Ethics versions/signatures, initial commitment, credential issuance/verification, mentoring-hour and supervised-session signoff APIs, provisional-to-active checks, pause/resume/withdraw actions |
| Library | Actual text publication/versioning, protected reads, reading acknowledgements; no generated placeholder content |
| Availability | Persistent own slots, weekly generation, overlap and lock-window validation, open-slot closure, unavailability records respected during new slot creation |
| Session APIs | Assigned-coach access, protected reading lookup, preparation/questions, session consent, live steps/answers/jots, finishing/no-show, follow-up rating, versioned feedback letter, organisational recommendations, queued external validation |
| Requests | Approve/decline with reason; atomic name/phone correction, time commitment, public-card review, open locked-slot closure and upcoming-session move |
| Finance | Applicable fixed/slab session rates, draft pay run from submitted follow-ups, approval, recording an external payment reference; no bank transfer initiated |
| Operations | Four enforced editable policies, capacity counts, append-only operational audit, allowlisted database browser, encrypted delivery queue, backup command |
| Interface | Server-connected login/setup, public application, administrative data screens, faculty/coaching screens, original logo/colours, local RAG assistant with role-filtered sources and Ollama generation |

## External connection work

- **Aarambh:** explicitly deferred. Incoming bookings/readings, retake/withdrawal events, external link revocation, live catalogue, outcome delivery and validation cannot be exercised against the actual service yet. The outgoing adapter is provisional, not a certified integration. Session tests use isolated fixtures; the real database has no fabricated readings.
- **Email:** a real Resend HTTP adapter is implemented, but credentials and sender verification are not configured. No invitation or reset email has been sent or live-tested. SMTP is not implemented.
- **Hosting/MySQL:** no deployment or MySQL connection has occurred. Local storage is real SQLite; a MySQL repository layer and data migration remain separate work.

## Remaining implementation before full developer-kit parity

These items are not represented as completed by this delivery:

- Secure file/CV/photo uploads, file scanning/storage, protected media delivery, audio recording/transcription, retention/purge jobs and downloadable credential rendering.
- Full batch editing/date moves, attendance workflows, enforced faculty seat ratios, assessment-dependent onboarding, practice-session review and version-update assignments.
- Complete question-bank proposal/review and coaching-engagement/pack/group-session lifecycle.
- Assignment queue algorithms, compatibility/eligibility/ranking rules and atomic reassignment history; these also need actual Aarambh bookings.
- Automated expiry/renewal, provisional extensions, rank/track advancement, exam appeal/arbitration and detailed numeric scoring rules. Current exam assessment records pass/fail with feedback.
- Full salary/commitment/cancellation/no-show calculations, faculty remuneration, client fee sharing, bank-account verification and bank payment integrations. Current pay run supports submitted session fees only.
- Existing-booking resolution when adding unavailability or pausing a coach. Unavailability affects future creation, not existing bookings. Pause prevents new session writes and queues link revocation; it does not reassign existing bookings.
- Public-card specialities/photo publishing and full request-form field parity. Administrative request review is connected, but some forms still rely on record IDs.
- Complete settings catalogue, scheduled effective dates, optimistic concurrency/version checks and contract-standard cursor pagination across every list. The exposed policy editor supports only four values actually used by this backend.
- Every legacy frontend handler and exact API_CONTRACT URL/response shape. The new operational frontend calls the new API; the old `frontend/app.js` remains an archived prototype, not a production client for this backend.
- Comprehensive production security, load, accessibility and browser regression testing, operational monitoring, a remote backup/restore drill and live email/Aarambh end-to-end verification.

The original developer-kit documents remain unchanged. The original contract's finance-only rule is intentionally broadened to Admin and Finance because the owner explicitly requested full administrative access for both. This implementation uses `operational_audit` for append-only events rather than claiming full parity with every original `activity_log` field.

## Validation performed

`npm test`: 22 passing tests (including two enclosing test groups). Temporary databases exercise password hashing, role/CSRF protection, persistence across restart, public deduplication, decisions/idempotency, real enrolment, encrypted blocked delivery, guarded data access, content publication, transactional request changes, faculty calibration, module completion, scheduling/independent marking, policies, exact pay-run amounts and rollback, slot repeats/overlap, session consent/follow-up locks and public-card review.

The owner database remains free of test accounts and sample business data. Browser verification shows the signed-in Mandeep administrator dashboard, the real batch configuration form and service status. The owner's password has not been entered or created by the assistant.

## Launch audit follow-up (25 October 2026)

Server-rendered public pages, SEO metadata, crawler controls, privacy notice, persisted contact inbox and local RAG were added after the initial backend milestone. See [LAUNCH_AUDIT.md](LAUNCH_AUDIT.md) for the 20-item checklist and verification. The earlier 22-test count describes the initial milestone; the current suite has 38 passing tests plus a separate successful live local-model test. Existing functional parity limitations above are not erased by the SEO work.

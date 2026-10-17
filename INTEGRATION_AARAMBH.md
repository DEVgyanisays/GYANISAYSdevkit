# Saarthi ⇄ Aarambh — the handshake

**kit v0.1 · 16 October 2026 · matches `Prototype/GYS_Coach_Platform_Rig_v0.3.html`**

Saarthi (with SETU, its coach app) and Aarambh are **two apps, two companies, two databases**. They meet only
through the calls below. **There is no file to upload or download in production** — the JSON file in the
prototype's Prep guide is a laptop test stand-in and is not built.

> **Status: a proposal for both developers to agree.** The prototype's side is proved against Aarambh's laptop
> test rig (`setu.php`, payload v1.2). Aarambh's staging endpoints do not exist yet. Where the two sides use
> different names today, **Aarambh's names cross the wire and Saarthi maps them for display** (see §6).

---

## 1 · The rule that sits above everything

**Only the finished reading crosses.** Saarthi never receives raw answers, raw scores, mirror scores, timings,
item ids, surname, email or phone — and never computes a reading. It reads Aarambh's finished results and applies
Gyani Says' own coaching rules (the firewall line approved by MS, 17 Sep 2026; the written exception of 16 Sep
2026 lets Aarambh's report page show inside SETU, read-only).

**The person's copy and the coach's copy are different links.** The coach copy (numbers, cost lines, what the
person opened, all four voices) is issued only to a coach whose **data undertaking** is on record, is
**short-lived and signed**, and **stops working when the debrief closes** (DPDP non-negotiables 4 and 5).

---

## 2 · How the two servers trust each other

| | |
|---|---|
| Direction | **Server to server only.** No browser ever calls the other company's API |
| Identity | Each side issues the other an API client id + secret **per environment** (staging, production). Never shared between environments |
| Signing | Every request and every webhook carries `X-Signature: HMAC-SHA256(secret, timestamp + "." + body)` and `X-Timestamp`. Reject if the signature fails or the timestamp is more than 5 minutes old |
| Idempotency | Every write carries `Idempotency-Key`. A repeat with the same key returns the first result |
| Retries | Webhooks retry with back-off for 24 h; the receiver answers `2xx` only after it has stored the event |
| Transport | HTTPS only. IP allow-list per environment as a second layer |
| Ids | `personId`, `sittingId`, `bookingId` are Aarambh's. `debriefId`, `coachId`, `slotId` are Saarthi's. Each side stores the other's id as an external reference, never as its own key |
| Logging | Both sides log every call (who, what, when, result) without the body's personal fields |

---

## 3 · The calls, in the order a debrief lives

Numbers H1–H8, with H2b and H6b.

| # | Direction | When | What | Notes |
|---|---|---|---|---|
| **H1** | Saarthi → Aarambh | Whenever a coach opens or closes slots | **Open times** — slot id, start, duration, language, client types served. **Never coach names** | Aarambh shows them at booking. Push on change (`POST /setu/slots`), plus a nightly full sync |
| **H2** | Aarambh → Saarthi | The person books | **The booking** — `bookingId`, `personId`, first name, client type, language, `sittingId`, slot id, the reports bought, **the consent choice made at purchase** (record · transcript · none), pack size if bought, organisation id if any | Webhook `POST /api/aarambh/bookings`. **Gyani Says assigns the coach** (MS, 17 Oct 2026) — admin, from the queue (G3). Aarambh never picks a coach |
| **H2b** | Aarambh → Saarthi | The person cancels or moves | **Booking events** — `cancelled` (with `cancelledAt`, so Saarthi can tell early from late), `rescheduled` (new slot id) | Webhook `POST /api/aarambh/booking-events`. Cancellations come only from here |
| **H3** | Saarthi → Aarambh | The debrief is assigned to a coach | **Pull the reading** — `GET /setu/sittings/:sittingId` returns payload v1.2 (§4): person, sitting, integrity, every trait, `reports[]`, `opened` | Saarthi stores only what §5 lists |
| **H4** | Saarthi → Aarambh | The coach opens the coach copy | **Ask for a coach link** — `POST /setu/coach-links {sittingId, debriefId, coachId, undertakingVersion, undertakingSignedAt}` returns a signed URL that expires (**3 hours**, renewed automatically while the debrief is open, dead the moment it closes — MS, 17 Oct 2026) | DPDP 4. Aarambh refuses if no undertaking is on record. The person's-copy link is issued the same way with `copy: "person"` |
| **H5** | Aarambh → Saarthi | Something about the sitting changes | **Sitting events** — `superseded` (a retake replaced it), `integrity_changed`, `withdrawn` (the person withdrew consent), `opened_updated`, `trainee_sitting_completed` (a trainee's own Aarambh sitting is done — Saarthi ticks it in S1/G2) | Webhook `POST /api/aarambh/sitting-events`. On `superseded`: hold the debrief, mark prep stale (review-list item 50) |
| **H6** | Saarthi → Aarambh | The coach submits the after-debrief screen (within 24 h); **again with the letter only** when a sent-back letter is resubmitted | **The disposition** — §7 (`revision` 1, 2, …) | Webhook to Aarambh `POST /setu/debriefs/:bookingId/outcome` |
| **H6b** | Saarthi → Aarambh | Admin can't fill a booking, or a coach offers a retake | **Notices** — `cant_fill {bookingId}` (Aarambh tells the person and rebooks) · `retake_offered {sittingId, debriefId, calledAt: prep | live}` — the coach calls it while reading the report or during the debrief; **no debrief happens on that reading** | `POST /setu/notices` |
| **H7** | Aarambh → Saarthi | Aarambh has reviewed it | **Validation** — `validated` or `sent_back` with a comment; later the **client's rating of the coach** and validated client feedback | Webhook `POST /api/aarambh/validation`. Sent back → the coach resubmits within 24 h (C8) |
| **H8** | Aarambh → Saarthi | Day 7 after the debrief | **What they tried this week** — the seven-day check-in answer (Pancha Bhuta only) | Later. Spec exists on Aarambh's side; not in staging scope |

**Closing:** a debrief closes when its letter is validated (H7) — the exact delay after validation is open (MS). When Saarthi marks a debrief closed, it calls `POST /setu/coach-links/revoke {debriefId}`; every
coach link for that debrief stops working at once.

---

## 4 · The reading (H3) — payload v1.2

This is the shape Aarambh's test rig sends today. Field names are Aarambh's.

```json
{
  "version": "1.2",
  "generatedAt": "ISO 8601",
  "person":  { "personId": "string", "firstName": "string", "clientType": "enum", "language": "enum" },
  "sitting": { "sittingId": "string", "sittingType": "core | full", "completedAt": "ISO 8601" },
  "report":  { "reportType": "string", "version": "string", "integrity": "enum", "url": "url" },
  "reports": [
    { "reportType": "Pancha Bhuta",              "version": "string", "integrity": "enum", "url": "url" },
    { "reportType": "Pancha Bhuta · coach view", "version": "string", "integrity": "enum", "url": "url" },
    { "reportType": "Trayi",                     "version": "string", "integrity": "enum", "url": "url" },
    { "reportType": "Trayi · coach view",        "version": "string", "integrity": "enum", "url": "url" }
  ],
  "traits": [
    { "name": "string", "level": "L0–L5", "lane": "enum", "gapBand": "none | check | probe",
      "status": "readable | agreed | median", "caret": "bool (to become 0 | 1 | 2)" }
  ],
  "opened": [
    { "report": "string", "kind": "job | group | situation", "id": "string", "name": "string",
      "band": "string", "times": "int" }
  ]
}
```

**Changes wanted for v1.3** (both sides to agree; none block staging):

| # | Change | Why |
|---|---|---|
| 1 | Each `reports[]` item carries `copy: "person" \| "coach"` explicitly, and **no URL** — the URL comes from H4 | Today Saarthi tells the copies apart by the name ("· coach view"). Links in the payload never expire |
| 2 | `caret` as `0 \| 1 \| 2` | ^ and ^^ mean different things |
| 3 | `edition` (Pancha Bhuta · Five Elements) and `market` | The released reading has two editions |
| 4 | `jdBrief` — when the sitting was taken against a role: `{ roleId, title, format: "jd-role-brief 5.0", url }` | So a coach can see the role the person was assessed against (JD Sculptor). **Read-only, never a decision** (review-list item 12) |
| 5 | `reliability` — the integrity read's detail: `{ band, cells }` as the Trayi coach copy's reliability strip already uses | The Prep guide's integrity card (C5) shows only Aarambh's one word today; the coach needs the detail before deciding on a retake (MS, 17 Oct 2026) |
| 6 | `paradox` | **Later**, with the paradox rebuild |
| 7 | Line ids on traits and report lines | Optional line feedback (SETU build list G7) without Saarthi storing the report's words |

---

## 5 · What Saarthi stores from H3

| Stored | Not stored |
|---|---|
| `sittingId`, `personId` (as external refs), `payloadVersion`, `receivedAt` | Raw answers, raw scores, mirror scores, timings, item ids |
| First name, client type, language, sitting type, completed date | Surname, email, phone |
| Integrity (Aarambh's word) | The report's text |
| Per trait: name, level, lane, gap band, status, caret | Anything from the coach copy's numbers |
| The `opened` list (name, report, kind, band, times) — shown only behind the undertaking | The coach's own opens (Aarambh never sends them) |
| Report records: type, copy (person/coach), version — **never a stored URL**; links are fetched fresh through H4 | |

Retention: the reading cache is deleted when the debrief closes plus the audit window (to settle with the DPDP
file); the coach's own notes follow spec §14.

---

## 6 · Names: Aarambh's cross, Saarthi maps for display

The released reports and the coach docs use different words for the same things (review-list item 64). The wire
carries Aarambh's values; Saarthi keeps one display map.

| Thing | Aarambh value (on the wire) | Saarthi shows |
|---|---|---|
| Client type / voice | `ST` · `YE` · `MM` · `LD` · `NS` (can't say → read as MM) | Student · Young executive · Mid-level · Leadership |
| Lane | `Fit` · `Performance` | Fit · Performance |
| Integrity | `reliable` · `needs_clarification` · `hold` | Reliable · Caution · (never reaches a coach) |
| Report | `Pancha Bhuta` · `Five Elements` · `Trayi` | as sent |

`hold` (Invalid) never reaches a coach: Saarthi refuses to assign, and the person is told to retake (item 50).

---

## 7 · The disposition (H6) — what goes back after the debrief

Sent once, when the coach submits the after-debrief screen (C7–C10), within 24 h of the debrief.

| Field | Shape | Notes |
|---|---|---|
| `bookingId`, `debriefId`, `coachId` | ids | |
| `status` | `held` · `ended_early` · `no_show` · `cancelled_early` · `cancelled_late` | |
| `heldAt`, `durationMin` | datetime, int | |
| `consentConfirmed` | `record` · `transcript` · `none` | The choice confirmed at Settle, and whether it changed from purchase |
| `recommendations[]` | `{ productId, basedOn (**required** — the one-line why, MS 17 Oct), source: "client_asked" \| "coach_suggested" }`, at most 3 | Go to Aarambh **as leads** (or to the organisation in an engagement). The client never sees them |
| `letter` | `{ language, body, wordCount }` | For **Aarambh's validation** before the client sees it (H7) |
| `medianAnswers[]` | `{ trait, answer: "more_like_me" \| "depends" \| "not_me", words, coachValidated: true }` | **Goes to Aarambh and into the person's report** (MS, 17 Oct 2026): once the coach validates where the person sits on a median trait, Aarambh records it on their reading. Aarambh to build the receiving side |
| `recordingRef` | `{ provider, meetingId }` | A reference, never a copy (spec §14: Granola meeting id) |
| `keyIssued` | bool + key ref | Further coaching runs on the key in the client's Aarambh login |
| `endedEarlyReason` | enum + text | Same-day alert on Saarthi's side too |

Never sent: the coach's private notes, the coach's own understanding, jots not used in the letter.

**Kept in Saarthi, not sent:** the coach's own rating (spec §2: SETU owns it).

**Sent separately, only after Gyani Says admin validates it (MS, 17 Oct 2026):** an **early-end audit report** — `{ debriefId, bookingId, endedAt, reason: emergency | urgency | conflict | other, account, validatedBy, validatedAt }`. The coach's account stays in Saarthi until admin validates it; then it goes to Aarambh as an audit record (`POST /setu/audit-reports`). The categories are to be defined.

---

## 8 · For the two developers to settle between them

MS, 17 October 2026: the two developers agree these directly.

| # | Who | What |
|---|---|---|
| D1 | Aarambh | **The integrity read in the Pancha Bhuta coach view.** Today only the Trayi coach copy carries it (the reliability strip). A coach reading Pancha Bhuta has no integrity read in front of them, and that is where most retake calls start |
| D2 | Both | **The reliability detail in the payload** (v1.3 change 5), so Saarthi's Prep guide can show it beside the retake call |
| D3 | Both | The rest of the v1.3 changes in §4: explicit `copy` and links only through H4, carets 0 · 1 · 2, edition and market, `jdBrief`, line ids |
| D4 | Aarambh | **Receive median answers** (H6 `medianAnswers[]`) and record them on the person's reading |
| D5 | Aarambh | **Receive the early-end audit report** (`POST /setu/audit-reports`), sent only after Gyani Says admin validates it |
| D6 | Both | Exchange staging credentials and allow-lists (§2); agree the event names in H2b, H5 and H6b |

## 9 · Staging checklist for the two developers

1. Agree this document (both sides sign it, with a version).
2. Exchange staging client ids and secrets; set the IP allow-lists.
3. Aarambh: build H3 and H4 on staging (the laptop rig's `setu.php` is the working reference).
4. Saarthi: build H2 receive, H3 pull, H4 link request, H6 send; H5 and H7 receive.
5. One end-to-end run on synthetic people: book → assign → read both copies → debrief → submit → validate.
6. Only then H1 (open times) and real bookings.

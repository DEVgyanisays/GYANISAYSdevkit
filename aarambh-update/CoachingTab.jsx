import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../../shared/context/ToastContext';
import Loader from '../../../shared/ui/Loader';
import BottomSheet from '../../../shared/ui/BottomSheet';
import {
  bookBriefing,
  getBriefingSlots,
  getCoachBriefings,
  rescheduleBriefing,
  sendBriefingRequest,
} from '../api/coachingApi';

// The free Gyani Says coach briefing. The coach is assigned; the candidate only picks a time. A briefing exists only
// after a paid assessment, so an empty list means the section is still locked.

const STATUS_LABEL = {
  pending_assignment: 'Awaiting coach availability',
  assignment_failed: 'Assignment needs attention',
  coach_assigned: 'Pick a time',
  confirmed: 'Booked',
  rescheduled: 'Booked',
  completed: 'Completed',
  no_show: 'Missed',
  cancelled: 'Cancelled',
};

const REQUEST_LABEL = {
  change_time: 'Change the time',
  different_coach: 'A different coach',
  no_slot_fits: 'No time suits me',
  coach_not_joined: 'Coach didn’t join',
  problem: 'Report a problem',
};

const REQUEST_HINT = {
  change_time: 'Tell the Gyani Says team which days or times work for you.',
  different_coach: 'Tell us briefly why you would like a different coach.',
  no_slot_fits: 'Tell us which days or times would suit you.',
  coach_not_joined: 'We are sorry. The Gyani Says team will arrange a new time for you.',
  problem: 'Tell us what went wrong.',
};

const BOOKED = ['confirmed', 'rescheduled'];

const dayKey = (iso) => new Date(iso).toLocaleDateString('en-CA');
const fmtDay = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtWhen = (iso) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
const minutesBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 60000);

function calendarLink(booking, coachName) {
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Aarambh coach briefing${coachName ? ` with ${coachName}` : ''}`,
    dates: `${stamp(booking.start)}/${stamp(booking.end)}`,
    details: booking.meetLink ? `Join your online meeting: ${booking.meetLink}` : 'Your Aarambh coach briefing',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function CoachCard({ coach }) {
  if (!coach) return null;
  const initials = coach.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="cb-coach">
      {coach.photoUrl
        ? <img className="cb-coach-photo" src={coach.photoUrl} alt="" />
        : <div className="cb-coach-photo cb-coach-initials" aria-hidden="true">{initials}</div>}
      <div className="cb-coach-text">
        <div className="cb-eyebrow">Your coach</div>
        <div className="cb-coach-name">{coach.name}</div>
        {coach.languages?.length > 0 && <div className="cb-coach-langs">Speaks {coach.languages.join(', ')}</div>}
        {coach.bio && <p className="cb-coach-bio">{coach.bio}</p>}
      </div>
    </div>
  );
}

function SlotPicker({ briefingId, mode, onDone, onCancel }) {
  const toast = useToast();
  const [slots, setSlots] = useState(null);
  const [error, setError] = useState('');
  const [day, setDay] = useState(null);
  const [slotId, setSlotId] = useState(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError('');
    setSlots(null);
    getBriefingSlots(briefingId)
      .then((data) => setSlots(data.slots || []))
      .catch((err) => setError(err.message));
  }, [briefingId]);
  useEffect(() => { load(); }, [load]);

  const days = useMemo(() => {
    const map = new Map();
    for (const s of slots || []) {
      const k = dayKey(s.start);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(s);
    }
    return [...map.entries()].map(([key, list]) => ({ key, label: fmtDay(list[0].start), slots: list }));
  }, [slots]);
  const activeDay = days.find((d) => d.key === day) || days[0];
  const chosen = (slots || []).find((s) => s.slotId === slotId);

  function submit() {
    if (!chosen) return;
    setBusy(true);
    const call = mode === 'reschedule' ? rescheduleBriefing(briefingId, chosen.slotId) : bookBriefing(briefingId, chosen.slotId);
    call
      .then((view) => {
        toast.success(mode === 'reschedule' ? 'Your briefing has been moved.' : 'Your briefing is booked.');
        onDone(view);
      })
      .catch((err) => {
        toast.error(err.message);
        if (err.status === 409 && Array.isArray(err.details?.nextSlots)) {
          setSlots(err.details.nextSlots);
          setSlotId(null);
          setDay(null);
        } else if (err.status === 409) load();
      })
      .finally(() => setBusy(false));
  }

  if (error) {
    return (
      <div className="cb-picker">
        <p className="cb-error">{error}</p>
        <div className="cb-actions">
          <button type="button" className="cta-btn" onClick={load}>Try again</button>
          {onCancel && <button type="button" className="cb-link" onClick={onCancel}>Back</button>}
        </div>
      </div>
    );
  }
  if (!slots) return <div className="cb-picker"><Loader label="Loading your coach's free times…" size={30} /></div>;

  return (
    <div className="cb-picker">
      <h4 className="cb-h4">{mode === 'reschedule' ? 'Pick a new time' : 'Pick a time that suits you'}</h4>
      {days.length === 0 ? (
        <p className="cb-muted">Your coach has no free times in the next two weeks. Use &ldquo;No time suits me&rdquo; below and the Gyani Says team will help.</p>
      ) : (
        <>
          <div className="cb-days" role="tablist" aria-label="Days">
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                role="tab"
                aria-selected={d.key === activeDay.key}
                className={`cb-day${d.key === activeDay.key ? ' is-on' : ''}`}
                onClick={() => { setDay(d.key); setSlotId(null); }}
              >
                {d.label}
                <span>{d.slots.length} free</span>
              </button>
            ))}
          </div>
          <div className="cb-times">
            {activeDay.slots.map((s) => (
              <button
                key={s.slotId}
                type="button"
                className={`cb-time${s.slotId === slotId ? ' is-on' : ''}`}
                aria-pressed={s.slotId === slotId}
                onClick={() => setSlotId(s.slotId)}
              >
                {fmtTime(s.start)}
              </button>
            ))}
          </div>
          <p className="cb-muted cb-tz">Times are in your local time ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</p>
          {mode !== 'reschedule' && (
            <label className="cb-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>Share my Aarambh report with my coach. Only my coach can open it, through a link that expires.</span>
            </label>
          )}
          <div className="cb-actions">
            <button type="button" className="cta-btn" disabled={!chosen || busy || (mode !== 'reschedule' && !consent)} onClick={submit}>
              {busy ? 'Please wait…' : chosen ? `${mode === 'reschedule' ? 'Move to' : 'Book'} ${fmtDay(chosen.start)}, ${fmtTime(chosen.start)}` : 'Choose a time'}
            </button>
            {onCancel && <button type="button" className="cb-link" onClick={onCancel}>Cancel</button>}
          </div>
        </>
      )}
    </div>
  );
}

function RequestSheet({ request, onClose, onSent }) {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (request) setMessage(''); }, [request]);

  function send() {
    setBusy(true);
    sendBriefingRequest(request.briefingId, request.kind, message.trim() || undefined)
      .then(() => {
        toast.success('Request sent. The Gyani Says team will get back to you.');
        onSent();
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setBusy(false));
  }

  return (
    <BottomSheet open={!!request} title={request ? REQUEST_LABEL[request.kind] : ''} subtitle={request ? REQUEST_HINT[request.kind] : ''} onClose={onClose}>
      <div className="cb-sheet">
        <label className="cb-sheet-label" htmlFor="cb-request-msg">Message (optional)</label>
        <textarea
          id="cb-request-msg"
          className="cb-textarea"
          rows={4}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add any detail that helps"
        />
        <div className="cb-actions">
          <button type="button" className="cta-btn" disabled={busy} onClick={send}>{busy ? 'Sending…' : 'Send request'}</button>
          <button type="button" className="cb-link" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function HelpRow({ kinds, onAsk }) {
  if (!kinds.length) return null;
  return (
    <div className="cb-help">
      <span className="cb-help-label">Need help?</span>
      {kinds.map((k) => (
        <button key={k} type="button" className="cb-chip" onClick={() => onAsk(k)}>{REQUEST_LABEL[k]}</button>
      ))}
    </div>
  );
}

function BriefingCard({ briefing, onChanged, onAsk }) {
  const [picking, setPicking] = useState(false);
  const { status, coach, booking } = briefing;
  const now = Date.now();
  const started = booking && now >= new Date(booking.start).getTime() - 10 * 60000;
  const ended = booking && now > new Date(booking.end).getTime() + 30 * 60000;
  // Request statuses are Gyani Says' own words, so show the latest few as they are, with the team's reply.
  const recentRequests = briefing.requests.slice(0, 3);

  function done(view) {
    setPicking(false);
    onChanged(view);
  }

  let body;
  let helpKinds = [];
  if (status === 'pending_assignment' || status === 'assignment_failed') {
    body = (
      <div className="cb-state">
        <span aria-hidden="true">&#128197;</span>
        <div>
          <h4 className="cb-h4">Waiting for a coach</h4>
          <p className="cb-muted">
            {status === 'assignment_failed'
              ? 'We could not complete your assignment. Please contact support so the team can review it.'
              : 'Your request is saved. A coach with matching availability has not been assigned yet. You can leave this page and check back later.'}
          </p>
        </div>
      </div>
    );
  } else if (status === 'coach_assigned') {
    body = <SlotPicker briefingId={briefing.briefingId} mode="book" onDone={done} />;
    helpKinds = ['no_slot_fits', 'different_coach'];
  } else if (BOOKED.includes(status) && booking) {
    body = picking ? (
      <SlotPicker briefingId={briefing.briefingId} mode="reschedule" onDone={done} onCancel={() => setPicking(false)} />
    ) : (
      <div className="cb-booking">
        <div className="cb-eyebrow">{status === 'rescheduled' ? 'Your briefing (moved)' : 'Your briefing'}</div>
        <div className="cb-when">{fmtWhen(booking.start)}</div>
        <div className="cb-muted">{minutesBetween(booking.start, booking.end)} minute online coaching session</div>
        <div className="cb-actions">
          {booking.meetLink && (
            <a className="cta-btn cb-btn-link" href={booking.meetLink} target="_blank" rel="noopener noreferrer">Join meeting</a>
          )}
          <a className="cb-link" href={calendarLink(booking, coach?.name)} target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>
          {briefing.reschedule?.allowed && !started && (
            <button type="button" className="cb-link" onClick={() => setPicking(true)}>Change time</button>
          )}
        </div>
        {!briefing.reschedule?.allowed && !started && briefing.reschedule?.reason && briefing.reschedule.reason !== 'NOT_BOOKED' && (
          <p className="cb-muted cb-small">
            {briefing.reschedule.reason === 'TOO_LATE'
              ? 'It is too close to the session to change it here. Use “Change the time” below to ask the Gyani Says team.'
              : 'You have already changed the time once. Use “Change the time” below to ask the Gyani Says team.'}
          </p>
        )}
        {briefing.reschedule?.allowed && briefing.reschedule.deadline && !started && (
          <p className="cb-muted cb-small">You can change the time yourself until {fmtWhen(briefing.reschedule.deadline)}.</p>
        )}
        <ul className="cb-tips">
          <li>Read your report once and note two or three questions.</li>
          <li>Join from a quiet place with good internet. No Google account is needed.</li>
          <li>You&rsquo;ll get reminders a day and an hour before.</li>
        </ul>
      </div>
    );
    if (!picking) {
      helpKinds = started && !ended
        ? ['coach_not_joined', 'problem']
        : [...(briefing.reschedule?.allowed ? [] : ['change_time']), 'different_coach', 'problem'];
    }
  } else if (status === 'completed') {
    const notes = briefing.notes || {};
    body = (
      <div className="cb-done">
        <div className="cb-eyebrow">Briefing completed{briefing.completedAt ? ` · ${fmtDay(briefing.completedAt)}` : ''}</div>
        {notes.summary ? <p className="cb-summary">{notes.summary}</p> : <p className="cb-muted">Your coach&rsquo;s notes will appear here soon.</p>}
        {Array.isArray(notes.nextSteps) && notes.nextSteps.length > 0 && (
          <>
            <h4 className="cb-h4">Your next steps</h4>
            <ol className="cb-steps">{notes.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </>
        )}
      </div>
    );
    helpKinds = ['problem'];
  } else if (status === 'no_show') {
    body = (
      <div className="cb-state">
        <div>
          <h4 className="cb-h4">You missed this briefing</h4>
          <p className="cb-muted">Ask the Gyani Says team for a new time and they will get back to you.</p>
        </div>
      </div>
    );
    helpKinds = ['change_time'];
  } else if (status === 'cancelled') {
    body = (
      <div className="cb-state">
        <div>
          <h4 className="cb-h4">This briefing was cancelled</h4>
          <p className="cb-muted">If you didn&rsquo;t expect this, ask the Gyani Says team for a new time.</p>
        </div>
      </div>
    );
    helpKinds = ['change_time'];
  }

  return (
    <div className="cb-card">
      <div className="cb-card-head">
        <span className={`cb-badge cb-badge-${status}`}>{STATUS_LABEL[status] || status}</span>
      </div>
      {coach && status !== 'pending_assignment' && <CoachCard coach={coach} />}
      {body}
      {recentRequests.length > 0 && (
        <div className="cb-requests">
          <div className="cb-eyebrow">Your requests</div>
          {recentRequests.map((r) => (
            <div key={r.requestId} className="cb-request">
              <div className="cb-request-top">
                <span>{REQUEST_LABEL[r.kind] || r.kind}</span>
                <span className="cb-muted">{fmtDay(r.createdAt)} &middot; {r.status.replace(/_/g, ' ')}</span>
              </div>
              {r.resolution && <p className="cb-request-reply">{r.resolution}</p>}
            </div>
          ))}
        </div>
      )}
      <HelpRow kinds={helpKinds} onAsk={(kind) => onAsk({ briefingId: briefing.briefingId, kind })} />
    </div>
  );
}

function LockedCard({ dnaStatus, onGoToStore, onBeginAssessment }) {
  const finished = dnaStatus === 'completed';
  return (
    <div className="cb-card cb-locked">
      <div className="cb-lock-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>
      <h3 className="cb-locked-title">Your free coach briefing is waiting</h3>
      <p className="cb-muted">
        Unlock your report and get a free 45&ndash;50 minute one-to-one online briefing. A Saarthi coach will walk you through your report and help you plan your next steps.
      </p>
      <ul className="cb-tips cb-locked-list">
        <li>A coach is assigned to you; you just pick a time</li>
        <li>Your report is shared only with your coach</li>
        <li>Notes and next steps appear here after the call</li>
      </ul>
      {finished ? (
        <button type="button" className="cta-btn" onClick={onGoToStore}>Unlock in Store</button>
      ) : (
        <>
          <p className="cb-muted cb-small">First complete your Aarambh assessment, then unlock your report.</p>
          {onBeginAssessment && (
            <button type="button" className="cta-btn" onClick={onBeginAssessment}>
              {dnaStatus === 'in_progress' ? 'Continue assessment' : 'Take the assessment'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function CoachingTab({ dnaStatus, onGoToStore, onBeginAssessment }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [request, setRequest] = useState(null);

  const load = useCallback(() => {
    setError('');
    return getCoachBriefings()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  // While the coach is being assigned, check again every 15 seconds.
  const assigning = data?.briefings?.some((b) => b.status === 'pending_assignment' || b.status === 'assignment_failed');
  useEffect(() => {
    if (!assigning) return undefined;
    let checks = 0;
    const t = setInterval(() => { if (++checks >= 8) clearInterval(t); void load(); }, 15000);
    return () => clearInterval(t);
  }, [assigning, load]);

  function replace(view) {
    if (view?.briefingId) {
      setData((d) => ({ ...d, briefings: d.briefings.map((b) => (b.briefingId === view.briefingId ? view : b)) }));
    } else load();
  }

  if (error) {
    return (
      <div className="cb-wrap">
        <div className="cb-card">
          <p className="cb-error">{error}</p>
          <button type="button" className="cta-btn" onClick={load}>Try again</button>
        </div>
      </div>
    );
  }
  if (!data) return <div className="cb-wrap"><Loader label="Loading your coach briefing…" /></div>;

  const briefings = data.briefings || [];
  return (
    <div className="cb-wrap">
      <p className="cb-intro">
        One free, one-to-one briefing with a Saarthi coach from Gyani Says comes with every paid assessment. It runs 45&ndash;50 minutes online.
      </p>
      {briefings.length === 0 ? (
        <LockedCard dnaStatus={dnaStatus} onGoToStore={onGoToStore} onBeginAssessment={onBeginAssessment} />
      ) : !data.enabled ? (
        <div className="cb-card">
          <h4 className="cb-h4">Coach briefings are paused for a moment</h4>
          <p className="cb-muted">Your free briefing is safe. Please check back a little later.</p>
        </div>
      ) : (
        briefings.map((b) => <BriefingCard key={b.briefingId} briefing={b} onChanged={replace} onAsk={setRequest} />)
      )}
      <RequestSheet
        request={request}
        onClose={() => setRequest(null)}
        onSent={() => { setRequest(null); load(); }}
      />
    </div>
  );
}

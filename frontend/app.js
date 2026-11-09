/* =====================================================================
   GYS Coach Platform — Rig v0.3 · single pass (items 1–35)
   Source of every decision: GYS_Coach_Platform_Spec_v0.3.md
   All people, organisations and results here are fictional. No Aarambh report content.
   ===================================================================== */
const MARK='assets/gyani_mark_TRANSPARENT.png';
const SAARTHI_MARK='assets/saarthi_mark_v1.png';
const SAARTHI_WORD='assets/saarthi_wordmark_v1.png';
const KEY='gys_coach_rig_v03', OLDKEY='gys_coach_rig_v02';
const TODAY='2026-09-17';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
function fmtDate(d){return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});}
function fmtLong(d){return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});}
function addDays(d,n){const x=new Date(d+'T00:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);}
function mm(t){const [h,m]=t.split(':').map(Number);return h*60+m;}
function hhmm(n){const h=Math.floor(n/60),m=n%60;const ap=h>=12?'pm':'am';return (((h+11)%12)+1)+':'+String(m).padStart(2,'0')+' '+ap;}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2300);}
function modal(html,wide){$('modal').innerHTML=`<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal ${wide?'wide':''}">${html}</div></div>`;}
function closeModal(){$('modal').innerHTML='';}
function ring(pct,label,sub,color){const r=26,c=2*Math.PI*r,o=c*(1-Math.max(0,Math.min(1,pct)));
 return `<div class="ring"><svg width="66" height="66" viewBox="0 0 66 66"><circle cx="33" cy="33" r="${r}" fill="none" stroke="#F3EFE7" stroke-width="8"/><circle cx="33" cy="33" r="${r}" fill="none" stroke="${color||'#7A2B2B'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${o}" transform="rotate(-90 33 33)"/></svg><div class="rt"><b>${label}</b><span>${sub}</span></div></div>`;}
const ICONS='assets/icons/';
const ic=(n,cls='')=>`<img class="icn ${cls}" src="${ICONS}${n}.png" alt="">`;
const LIB=[
 {name:'Trayi Dossier Reading Guide',icon:'guide',ver:'v0.6',owner:'Owner: Faculty lead',words:'~8,700 words',unread:true,file:'Saarthi/03 Reference/SAR_Reading_Guide_v0.6.md',parts:['Provenance — what came from where','Foreword — how to use this Guide','The two lanes','Reading a gap','The Caution case','Trait by trait']},
 {name:'Trait Cards',icon:'library',ver:'v0.6',owner:'Owner: Faculty lead',words:'~7,000 words',unread:false,file:'Saarthi/03 Reference/SAR_Trait_Cards_v0.6.md',parts:['How to use these cards','Provenance','One card per trait — what it is, what high looks like, what low looks like, what to ask']},
 {name:'Question Bank',icon:'debriefs',ver:'v0.6',owner:'Owner: Faculty lead',words:'~4,100 words',unread:false,file:'Saarthi/03 Reference/SAR_Question_Bank_v0.6.md',parts:['How to use this Bank','Four rules for every question','Questions by trait','Questions by point type']},
 {name:'Code of Ethics',icon:'code-of-ethics',ver:'v0.6',owner:'Owner: Gyani Says',words:'~4,800 words',unread:false,file:'Saarthi/01 Governance/SAR_Code_of_Ethics_v0.6.md',parts:['Preamble','Foundational commitments','Standards of practice','Scope of practice','Referral-out triggers','Use of the credential','Misconduct','Annual attestation']}];
function libOpen(i){const L=LIB[i];L.unread=false;save();
 modal(`<h3>${L.name}</h3><div class="row"><span class="pill">${L.ver}</span><span class="pill">${L.owner}</span><span class="pill">${L.words}</span></div>
 <div class="coderead" style="margin-top:12px">${L.parts.map(x=>`<h4>${x}</h4><p>The section text appears here in the build, read inside SETU. Source: <code>${L.file}</code></p>`).join('')}</div>
 <p class="help">Read inside SETU — never downloaded. New versions are published by admin from G2.</p>
 <div class="row" style="justify-content:flex-end"><button class="btn" onclick="closeModal();render()">Close</button></div>`);}
const say=(title,sub,cls='')=>`<div class="say ${cls}"><span class="mark"><img src="${MARK}" alt="Gyani Says"></span><div class="bub"><p class="who">Gyani Says</p><p class="sq">${title}</p>${sub?`<p class="sub">${sub}</p>`:''}</div></div>`;
const CROCKFORD='0123456789ABCDEFGHJKMNPQRSTVWXYZ';   // no I, L, O, U — can't be misread
function credNumber(year){
 let body='';for(let i=0;i<4;i++)body+=CROCKFORD[Math.floor(Math.random()*32)];
 const sum=[...(String(year)+body)].reduce((a,c)=>a+CROCKFORD.indexOf(c.toUpperCase())+1,0);
 return `GYS-SAR-${year}-${body}${CROCKFORD[sum%32]}`;   // last character is the checksum
}
const SETU_SVG=(s=34)=>`<svg width="${s}" height="${s}" viewBox="0 0 30 30" fill="none" aria-label="SETU logo"><path d="M3 21c4-9 20-9 24 0" stroke="#2F5E5B" stroke-width="2.2" stroke-linecap="round"/><path d="M3 21v3M27 21v3M11 16.2V24M19 16.2V24M15 14.5V24" stroke="#2F5E5B" stroke-width="2" stroke-linecap="round"/></svg>`;

/* ---------------- screens ---------------- */
const SCREENS=[
 {g:'Gyani Says website · MOCK',color:'#2F5D3A',items:[
  ['W1','Apply form','A would-be coach or trainer',1],
 ]},
 {g:'Saarthi · becoming a coach',color:'#9A7213',items:[
  ['S1','First login · confirm details','A newly enrolled trainee, once',1],
  ['S2','Core modules','Trainee',1],
  ['S3','Role tracks','Trainee · growing coach',1],
  ['S4','Exam → Provisional → Active','Trainee · provisional coach',1],
 ]},
 {g:'SETU · working coach',color:'#2F5E5B',items:[
  ['C1','Coach home','Every coach',1],
  ['C2','Coach profile','Every coach',1],
  ['C3','Availability calendar','Provisional and active coaches',1],
  ['C4','My debriefs','Provisional and active coaches',1],
  ['C5','Prepare · Prep guide','Coach, before a debrief',1],
  ['C6','The debrief · Live mode','Coach, with the client',1],
  ['C7','After · recommendations','Coach, within 24 hrs',1],
  ['C8','After · feedback letter','Coach, within 24 hrs',1],
  ['C9','After · rating','Coach, within 24 hrs',1],
  ['C10','After · recording','Coach, within 24 hrs',1],
  ['C11','Coach guide','Every coach',1],
  ['C12','Coaching session','Active coach, further coaching',1],
 ]},
 {g:'Gyani Says admin',color:'#7A2B2B',items:[
  ['G0','Admin home','Admin',1],
  ['G1','Coach roster and grading','Admin · Finance admin',1],
  ['G2','Training · batches, people, content','Admin · faculty · mentors',1],
  ['G3','Assigning coaches','Admin',1],
  ['G4','Settings','Admin · Finance admin',1],
  ['G5','Ratings review','Admin',1],
  ['G6','Upgrade tiers','Admin · Finance admin',1],
  ['G7','Slabs and payments','Finance admin',1],
  ['G8','Organisation engagements','Admin',1],
  ['G9','Capacity and demand','Admin',1],
  ['G10','People and access','Admin',1],
 ]},
 {g:'Aarambh login · inside SETU',color:'#4E463E',pass:2,items:[
  ['A1','Validation queue','Aarambh reviewer'],
  ['A2','Leads inbox','Aarambh'],
  ['A3','Recording audit','Aarambh auditor'],
 ]},
 {g:'Client · MOCK of Aarambh website',color:'#8C1D18',pass:3,items:[
  ['K1','Book a session','Client'],
  ['K2','My sessions','Client'],
  ['K3','Coach ratings page','Public'],
 ]},
 {g:'Presenting Saarthi',color:'#241F1B',items:[
  ['P1','Presenter · two talks','MS, presenting',1],
 ]},
];
const META={};SCREENS.forEach(g=>g.items.forEach(i=>META[i[0]]={code:i[0],name:i[1],who:i[2],built:!!i[3],pass:g.pass||1,group:g.g}));
const OLD2NEW={C1:'S1',C3:'S2',C4:'S3',C5:'S4',C2:'C1',C6:'C2',C7:'C3',C8:'C4',C9:'C5',C10:'C6',C11:'C7',C12:'C8',C13:'C9',C14:'C10',C15:'C11',C16:'C12'};
const REVIEWED_V01=['S1','C1','S2','S3','S4','C2','C3','C4','C5','C6','C7','C9','C10']; // from the review log
const CHANGED_IN_PASS=['S1','S2','S3','S4','C1','C2','C3','C4','C5','C6','C7','C10'];
const PARKED=['C11','C12'];   // C8 un-parked 17 Oct 2026 (MS)

/* ---------------- decisions (spec v0.3 §16) ---------------- */
const DEC={
S1:['Seen once, at first login after the Saarthi invite. No registration, no approval step','Saarthi details read-only: name, contact, city, background, qualifications, languages (Primary / Secondary), level or tracks','"Something wrong? Tell admin" — no self-editing','Confidentiality promise — training material, sample reports, fellow trainees\' readings','Optional photo and short bio','Confirm → S2 opens. States: Invited / Confirmed','Already-certified coaches: also re-accept the current Code and choose time commitment'],
S2:['Holds: my cohort · five module cards · library (including the Code of Ethics) · practice debriefs · Day 1 own-assessment tick','Blended delivery · faculty mark modules done · in order','Module 5: Using SETU and debrief do\'s and don\'ts (1 day)','Practice records kept until Active, then deleted','Rig switch: In training / Certified only'],
S3:['Tracks stack · never chosen by the coach — from Saarthi · admin opens the next track for a growing coach','A fixed coach sees no next track','Later tracks: observed debrief at that level + faculty sign-off','Organisation and industry tracks shown here: certified · active / paused · update module due','Credential: "Certified Coach, The Saarthi System · Level N"'],
S4:['Four parts, all must pass · pass / not pass per part plus feedback · resit only the failed part, at most 2','After passing: read and sign the full Code (unlocks after scrolling to the end; version and date recorded; includes the public rating) and choose time commitment. Then the Provisional credential issues and the calendar opens','Road to Active: 6 supervised debriefs · 3 mentor hours · mentor sign-off · 6 months','Window missed: extend once (2 months), else Provisional-lapsed','Credential issued by Gyani Says only'],
C1:['One home that changes by stage — in training · exam passed · provisional · lapsed · active','Active: next debrief (hero) · prep due · waiting on me · sent back · changes · my week · my rating · guide changes','Code of Ethics changed → re-accept before continuing','First name + client type · in-app notices only · never money, slab or category'],
C2:['Level, tracks, languages (Primary / Secondary), credential — read-only from Saarthi','Category letter only · "fixed" wording · never money','Time commitment change → admin approves','Public "About your coach" card: photo · name · languages · credential (no level, no category) · years · who I\'ve worked with · about me (max 80 words) · rating. Admin approves. Shown in K2 once assigned; K3 shows name, languages, photo, rating only'],
C3:['v0.39 engine · 45-min slots + 15-min gap · repeat weekly · no bookings within 48 hrs · India time','Coach can\'t book · booked slot → move request · website shows times only','Mark unavailable (date, range, weekday), any time; booked slots on those dates prompt reassign-or-keep','Late drop (under 48 hrs): logged · G5 flag at 2 a month · lower in G3 list for 30 days','This week: opened vs commitment'],
C4:['Columns: when · client · report · integrity · status · flags · engagement','Stages: Assigned → Prep done → Debrief done → After-debrief complete → Validated / Sent back → Closed · plus Cancelled early, Cancelled late, Didn\'t join','Invalid never reaches the coach · no accept step · upgrades not shown · one report per debrief · no Team debriefs'],
C5:['Where to probe — SETU reads finished results and applies Gyani Says\' rules (approved firewall line, 17 Sep 2026)','Suggested questions per point, step and why pre-filled','Questions band: my questions and the Question Bank side by side; added questions appear highlighted','Why this question (optional) — six reasons + note','Quick options and follow-ups per question','Wording check · step-fit hints · source badges · propose to the Bank','Split screen: drag to resize · hide report · swap sides · remembered','Organisation brief for organisation clients · Caution tick · private notes · saves automatically','16 Oct 2026 · Two copies of every report: what the person reads (teal) and the coach copy (gold) — numbers, cost lines, four voices, what they opened','The coach copy and "What they opened" stay locked until the data undertaking is signed (S1) · DPDP non-negotiable 4','What they opened: from payload v1.2, most opened first, the coach\'s own opens never counted · jump to it in the coach copy','Numbers only inside the coach copy — SETU\'s own screens still show none · no print, save or download in the report view'],
C6:['Live mode — the screen follows the coach','Consent: Record · Transcript only · Neither — only consent gates Settle','One question card: why · what they said · options · follow-ups · ✓ / ⤼','Not recorded → nudge to capture words, never required','State chip + nudges · quick jot · ⋯ menu · report as a strip — the real Aarambh pages, both copies','Present mode shows only the person\'s own copy — never the coach copy, never notes or numbers (16 Oct 2026)','End: conversation map · what they said · reasons at End · letter started'],
C7:['C7–C10 are one screen, four sections, one Submit, due within 24 hours','Context line: Individual or Organisation','SETU pointers pre-select likely products; the coach confirms, changes or adds','Aarambh\'s list · plus the organisation\'s programmes side by side','Based on — required per pick · client asked / I suggested · at most 3','Goes to shown plainly: Aarambh or the organisation · consent warning for organisation clients','Client never sees them · locked on Submit · coach sees "Sent" only'],
C8:['Reviewed by MS, 17 Oct 2026','One letter, pre-filled from what Live mode captured — the transcript and the coach\'s notes; the coach edits it freely','Wording check · no numbers or levels · in the debrief\'s language','No minimum length; over 400 words shows red and never blocks — the length of a debrief is not known yet','Every recommendation needs its one-line why','Aarambh sends back with a comment; resubmit within 24 hrs'],
C9:['Four parts, 1–5: Settled · Understood · Covered · Next step','Comment: describe the conversation, not the person','Never to the client · not a grade input · my reflection private (mentor sees for provisional)'],
C10:['Follows the Settle choice: link (Record) · transcript (Transcript only) · reason (Neither)','Gyani Says-owned accounts only · tool still open · retention open','Locked sections look locked and say why'],
C11:['PARKED for re-review after the pass','"If you know another model": GROW · OPAL · CLEAR, one at a time','To be rewritten for the Prep guide and Live mode'],
C12:['PARKED for re-review after the pass','Unchanged from v0.2; expected to adopt the Live mode pattern'],
G1:['Roster: coach · stage · level · category · slab (Finance admin) · can\'t say · time · rating · work · warnings · roles · languages · Code version signed · organisation certifications','Change history · every change needs a reason','Two roles: Admin and Finance admin','No "approve registration" action — enrolment is in G2','Approve public coach cards before they go live','Pause a coach with a reason; bookings move to G3'],
G2:['Enrolment — creates the SETU account and sends the invite · import older cohorts · languages','Faculty: cohorts, sign-offs, exam marking, Question Bank proposals','Mentor: mentees, supervised debriefs, Own questions, hours, final sign-off','Organisation tracks and update modules','Raters mark alone; a third decides · at most 6 mentees per mentor'],
G3:['Sources: new · upgrade · key · rebook · coaching lead · move request · paused coach','Never automatic — SETU sorts, admin clicks','Order: same coach → Primary language match → most room in commitment → rating','Late drop: lower for 30 days','Organisation clients: only that organisation\'s pool','Invalid report stopped here','Assign within 24 hours'],
G4:['Every agreed number in one place','New: late drop 48 hrs · flag 2 a month · 30-day list drop · current Code version · question wording list · Prep guide rules · product rules · transcript tool (off until a lawyer confirms)','"Can\'t say" default rule + per-coach override','Changes apply to the future only'],
G5:['SETU flags with a reason, never proposes a grade','At least 10 ratings before a category change · quarterly review','Late drops count as warnings'],
G6:['Standard · Plus · Premium','Client price never in SETU · never silently downgrade'],
G7:['Shape now, numbers blank','Monthly commitment amount + per-session fee','Late-drop money parked with slabs'],
G8:['New: organisation name · type · brief · programmes · dates','Coach pool: certified coaches for this organisation','Organisation track and update modules link to G2','Vetted-coach list for direct recommendations — who grants "vetted" is open','Client consent for sharing with the organisation — open'],
G0:['The day in one screen: to assign · prep overdue · letters overdue · sent back · requests · alerts','Same-day alerts: ended early · didn\'t join · late drops','Coaches lapsing this month · capacity warning from G9 · this week\'s cohorts, exams and sign-offs','Every line clicks through · money only for Finance admin · never client names'],
G9:['Who we have: by stage, level, language, category, organisation certification, city','What they can take: hours committed vs opened · slots open, booked, unbooked · capacity this month','What is coming: sittings awaiting a debrief · booking run-rate · outstanding pack sessions · organisation engagements','The gap by language and level, as a sentence — no black box','Lead time: when a batch must start to close a gap','Money to Finance admin only · never client names'],
G10:['Six roles: Admin · Finance admin · Faculty · Mentor · Coach · Aarambh reviewer','Invite, suspend, deactivate. Enrolment (G2) creates a coach account','Password resets by emailed link only — admin never sees or sets a password','A role change forces a re-login','Activity log: who changed what, when, and the reason','Aarambh reviewers see A1–A3 only · nobody sees another coach\'s private notes'],
A1:['Limited Aarambh login inside SETU','Letter · report link · understanding · what was discussed · recording or transcript. Never private notes','Checklist before Approve · within 48 hours'],
A2:['New → Contacted → Bought · Not interested · No action','Contact only after the letter is approved','Product list with tags that feed SETU\'s product rules'],
A3:['Random 10% + every "Neither" + every A1 flag','Checklist · Concern → Gyani Says admin','A4 folded in: conversation ratings + totals by report'],
K1:['Steps: what for · key · tier · language (eleven) · time · consent · pay · booked','Consent: Record · Transcript only · Neither · mentor may review · cancellation rule · organisation sharing','Aarambh\'s look with a red MOCK band · payment placeholder only'],
K2:['One card per session · rate 1–5 before the letter','"About your coach" card once assigned','Meeting link once confirmed'],
K3:['Name · languages · photo · average · count','Alphabetical · "New" until 5 ratings · never client names'],
};

/* ---------------- fictional world ---------------- */
// 5 Oct 2026 · Saarthi pass — items 52–60 of the review list
DEC.W1=['MOCK of the Gyani Says website — Gyani Says builds the real page','Asks first: applying as a coach, or as a trainer or mentor','About you · languages (Primary / Secondary) · time interest · CV optional','Batch preferences: in person, online or either · city · start window · tracks (or what they could teach) · days they can attend','Every link carries a source tag (website, Instagram, YouTube, Google, LinkedIn, direct, referral, or a talk) and the application keeps it','A plain notice on what is kept, why, and who sees it — wording to come from the lawyer','Send → lands in G2 Applications as "new", tagged'];
DEC.P1=['One presenter engine, two tracks: a walk-through of the live rig, and a talk for would-be coaches','Discovery first — the audience sets the narration; for the talk, city, mode, coach or trainer, and the room','Slides can be hidden, shown and reordered; "restore the standard order" puts them back','Narration library: written for an audience, never a person; missing lines fall back to the standard narration','Full screen · arrow keys · N hides the narration · Esc ends and puts the rig back as it was','The talk is built from the rig\'s own data — batches near the audience, ranks, levels, the exam — so it never goes stale','The Apply link is tagged for the talk (src=talk-<city>) so its applications are counted in G2'];
DEC.S1.push('Batch, dates, sessions, faculty and mentor read from the batch record in G2 — a date change shows here as a notice','Data undertaking signed before Saarthi opens — version and date recorded. Both coach types sign it','An organisation\'s coach sees that they train in full and take only that organisation\'s people');
DEC.S2.push('My batch and next session read from G2; module cards show the version the batch teaches; date changes arrive as a notice');
DEC.S3.push('Ranks sit on top of levels: Certified Coach → Senior Coach → Lead Coach. Earned by hours, observation and a panel; never chosen; admin records each with a reason','Update modules arrive here when a core module gets a new version');
DEC.S4.push('Exam part 2 runs in two halves: unaided read and plan, then against the Prep guide','Exam marking never by the trainee\'s own mentor','The credential and the verify page carry the rank');
DEC.G1.push('Roster adds coach type (ours / organisation\'s), rank and the undertaking signed','Coach record sets type and rank with a reason; "end access" for an organisation\'s coach who leaves or is unassigned');
DEC.G2=['Five tabs: programmes and batches · applications · faculty and mentors · curriculum · people in training','Batches: programme · dates · days to start · mode and venue · seats in person and online counted apart · waitlist · faculty · mentors · the curriculum version it teaches','States worked out from seats and dates: empty · filling · nearly full · full · running · closed','New batch: faculty and mentors filtered to who is eligible and free, every reason shown; one faculty member to six learners in practical work','Change dates → everyone in the batch is told · offer a waitlisted seat, or move them to another batch','Applications from W1 with their source tag · offer a batch that matches · enrol honours the seat type, and waitlists when it is full · coach type set at enrolment','Faculty and mentor records: teaches · may mark · languages · where · capacity · mentees (max 6) · calibration (every six months) · Code, agreement and undertaking · rate band for Finance admin only','Two routes in: promote an Active coach, or an external trainer through W1 — both take the Faculty induction','Curriculum: each module a record — outcomes, session plan, trainee material, practice, how examined, version history. Mark "needs update" → publish → update module for certified coaches','Exam markers: cleared for the part, calibration in date, never the trainee\'s own mentor','Languages set at enrolment, Primary / Secondary'];
DEC.G9.push('Supply in the pipe reads the batch list: seats taken, state, and "no faculty — cannot run"');
DEC.G10.push('Seven roles: the coach role splits into ours and the organisation\'s','Undertakings tab: the current version, who signed which version and when, and whose access is closed or ended');
const LANGS=['English','Hindi','Punjabi','Gujarati','Marathi','Bengali','Kannada','Tamil','Telugu','Malayalam','Odia'];
const BANDS=[['u5','Under 5 hrs a week','≈ up to 3 debriefs a week',4],['5-10','5–10 hrs a week','≈ 3–6 debriefs a week',5],['10-20','10–20 hrs a week','≈ 6–13 debriefs a week',10],['20p','20+ hrs a week','≈ 13+ debriefs a week',20]];
const TRAITS=['Exploration Need','Analytical Reasoning','Ambiguity Tolerance','Execution Stamina','Process Orientation','Ownership','Authoritative Need','Influence','Enthusiasm','Warmth','Collaborative Need','Deference','Emotional Regulation','Even Temper','Recovery'];
const FIT=['Exploration Need','Authoritative Need','Enthusiasm','Warmth','Collaborative Need'];
const WHYS=['General routine','A specific high score','A specific low score','A caret','A discrepancy or misalignment','A median answer','Other'];
const SPECIALITIES=['First-time managers','Career change','Students and early career','Senior leaders','Returning to work','High-pressure roles','Team leads','Founders'];
const PRODUCTS=[
 {id:'p1',name:'Career direction workshop',desc:'Half-day group workshop on choosing a direction',types:['Student','Executive']},
 {id:'p2',name:'Interview readiness programme',desc:'Three short sessions on telling your own story',types:['Student','Executive','Mid-management']},
 {id:'p3',name:'Team conversation sprint',desc:'For people who lead a team',types:['Mid-management','Senior']},
 {id:'p5',name:'Planning habits workshop',desc:'Practical routines for planning and follow-through',types:['Executive','Mid-management','Senior']},
 {id:'p6',name:'Steadiness under pressure',desc:'Four sessions on staying steady when things change',types:['Student','Executive','Mid-management','Senior']},
 {id:'cwm',name:'Continue with me',desc:'Further coaching with this coach — key issued with the approved letter',types:['Student','Executive','Mid-management','Senior']},
];
const PRULES=[ // Gyani Says rule table: reading point → product (sample)
 {kind:'low',trait:'Process Orientation',prod:'p5'},{kind:'low',trait:'Execution Stamina',prod:'p5'},
 {kind:'low',trait:'Emotional Regulation',prod:'p6'},{kind:'low',trait:'Recovery',prod:'p6'},{kind:'must',trait:'Emotional Regulation',prod:'p6'},
 {kind:'high',trait:'Influence',prod:'p3'},{kind:'high',trait:'Ownership',prod:'p3'},
 {kind:'high',trait:'Exploration Need',prod:'p1'},{kind:'caret',trait:'Ownership',prod:'p2'},
];
const ORGS={abc:{name:'ABC Ltd',type:'Corporate',brief:'A 4,000-person logistics firm in Pune and Chennai. Growing its first-line managers; values plain speaking and on-the-floor leadership. Engagement: first-time managers, Sep 2026 – Mar 2027.',programmes:[{id:'o1',name:'ABC Emerging Leaders Programme',desc:'Six-month cohort for first-time managers'},{id:'o2',name:'ABC Mentoring Circle',desc:'Monthly mentoring with a senior leader'},{id:'o3',name:'ABC Wellbeing Counselling',desc:'Confidential counselling through ABC\'s provider'}]}};
const READINGS={ // fictional finished results — sample subset only
 d1:[{t:'Ownership',L:0,caret:true},{t:'Influence',L:1},{t:'Exploration Need',L:1},{t:'Process Orientation',L:4,gap:'probe'},{t:'Emotional Regulation',L:5,gap:'check'},{t:'Warmth',L:2},{t:'Influence',L:3,median:true}],
 d2:[{t:'Ambiguity Tolerance',L:0},{t:'Enthusiasm',L:1},{t:'Ownership',L:3,caret:true},{t:'Deference',L:5,gap:'probe'},{t:'Recovery',L:4},{t:'Initiative',L:2,median:true}],
 d10:[{t:'Influence',L:0},{t:'Collaborative Need',L:1},{t:'Execution Stamina',L:4,gap:'check'},{t:'Even Temper',L:5,caret:true}],
 d3:[{t:'Even Temper',L:0},{t:'Deference',L:1},{t:'Authoritative Need',L:5,gap:'probe'},{t:'Analytical Reasoning',L:2,caret:true},{t:'Warmth',L:3,median:true}],
 d4:[{t:'Exploration Need',L:1},{t:'Process Orientation',L:4},{t:'Collaborative Need',L:2,gap:'check'}],
 d5:[{t:'Ownership',L:1},{t:'Influence',L:4,gap:'check'},{t:'Recovery',L:2,caret:true}],
 d9:[{t:'Exploration Need',L:0},{t:'Process Orientation',L:5},{t:'Warmth',L:1,gap:'probe'}],
};
const SEEDV=8;   // bump when the sample data changes: saved state is rebuilt, review marks kept
function seed(){
 return {
  seedv:SEEDV,
  ui:{screen:'S1',collapsed:true,reviewed:{},ack:{},c4tab:'up',c4q:'',focus:null,guideTick:false,model:'GROW',splitW:56,swap:false,hideRep:false},
  stage:'training', growth:'growing', firstLogin:'invited', codeChanged:false,
  view:'split',
  batch:{programme:'Core programme',name:'Batch 7',mode:'Pune + online',centre:'Baner centre, Pune',start:'2026-09-15',end:'2026-10-02',faculty:'Dr Sunita Rane · Mohit Bansal',day1:'2026-09-18',seatType:'Physical'},
  own:{state:'not started',link:'https://aarambh.example/sitting/invite/ar-7741',due:'2026-09-13',debriefedBy:'Ravi Menon (Active coach)'},
  advanced:{state:'not started'},
  hours:{target:24,prep:9.0,debrief:9.0,indiv:3.8,group:1.3,last:16.5},
  rates:[
   {n:'Monica Rao',lvl:3,cat:'B',rate:4.6,work:'24 sessions · 23 hrs',demand:'92% of open slots taken · 5 rebooks',kind:'Standard slab',terms:'Slab 2',from:'1 Aug 2026',why:'Standard terms at certification'},
   {n:'Imran Sheikh',lvl:4,cat:'A',rate:4.8,work:'31 sessions · 29 hrs',demand:'100% taken · 9 rebooks · 2 organisations ask for him',kind:'Fixed per session',terms:'Own rate — debrief, one to one, group',from:'1 Jul 2026',why:'In demand at Senior level; agreed with MS'},
   {n:'Leela Iyer',lvl:2,cat:'C',rate:4.3,work:'12 sessions · 11 hrs',demand:'64% taken',kind:'Standard slab',terms:'Slab 3',from:'1 Sep 2026',why:'Provisional'},
   {n:'Neel Kamath',lvl:1,cat:'C',rate:4.1,work:'18 sessions · 16 hrs',demand:'88% taken · students ask for him by name',kind:'Percentage of the client fee',terms:'A share per session',from:'1 Sep 2026',why:'Level 1 but sought after — premium agreed case by case'},
  ],
  work:{clients:24,unique:19,repeat:5,sessionsPerClient:1.3,groups:2,groupPeople:11,ratedByMe:4.4,ratedByThem:4.6,ratedCount:38},
  cred:{number:credNumber(2026),issued:'2 Oct 2026',validTo:'2 Oct 2027',attested:true},
  saarthi:{name:'Monica Rao',phone:'+91 98xxx xxx12',email:'monica.rao@example.in',city:'Pune',years:'9',work:'Learning & development lead, mid-size manufacturer',coached:'Graduate trainees, first-time managers',quals:['PG Diploma in Counselling Psychology','Coaching practicum certificate'],langs:[['English',true],['Hindi',true],['Marathi',false]],cohort:'Batch 7 · Pune + online',batch:'b7',seat:'In person',tracks:['Students','Executives','Mid-management']},
  s1:{photo:false,bio:'',conf:false},
  code:{read:false,signed:false,ver:'v0.6',date:''},
  commit:{band:'10-20',days:['Mon','Wed','Thu','Sat'],tod:['Morning','Evening'],months:'12'},
  coach:{name:'Monica Rao',first:'Monica',rank:'Certified',level:3,category:'B',rating:4.6,ratings:38,pendingBand:null,roles:[],cantSay:true,orgs:[{id:'abc',state:'Certified · active engagement',update:false}]},
  card:{years:'9',worked:'Graduate trainees, first-time managers',spec:['First-time managers','Career change'],about:'I help people see how they work best, in plain words, and find one next step that feels like theirs.',photo:true,status:'approved'},
  debriefs:[
   {id:'d2',first:'Arjun',full:'Arjun Mehta',type:'Executive',report:'Trayi',ver:'Executive',integ:'Caution',date:TODAY,time:'16:00',status:'prep',lang:'Hindi',sitting:'core',consent:'record'},
   {id:'d1',first:'Sajal',full:'Sajal Nair',type:'Mid-management',report:'Pancha Bhuta',ver:'Mid-management',integ:'Reliable',date:'2026-09-19',time:'10:00',status:'assigned',lang:'English',sitting:'core',consent:'transcript'},
   {id:'d10',first:'Meera',full:'Meera Pillai',type:'Mid-management',report:'Pancha Bhuta',ver:'Mid-management',integ:'Reliable',date:'2026-09-21',time:'11:00',status:'assigned',lang:'English',sitting:'core',org:'abc',consent:'none'},
   {id:'d9',first:'Tanvi',pack:5,full:'Tanvi Joshi',type:'Student',report:'Pancha Bhuta',ver:'Student',integ:'Reliable',date:'2026-09-22',time:'11:00',status:'assigned',lang:'Marathi',sitting:'core'},
   {id:'d3',first:'Kavya',full:'Kavya Iyer',type:'Can\'t say',report:'Paradox',ver:'Mid-management',integ:'Reliable',date:'2026-09-16',time:'18:00',status:'debriefed',lang:'English',sitting:'core'},
   {id:'d4',first:'Rohan',full:'Rohan Das',type:'Student',report:'Pancha Bhuta',ver:'Student',integ:'Reliable',date:'2026-09-14',time:'17:00',status:'sentback',lang:'Hindi',sitting:'core',sentback:'Section 3 reads as advice ("you should pick a structured role"). Please rephrase as what the report shows.'},
   {id:'d5',first:'Neha',pack:3,full:'Neha Kapoor',type:'Mid-management',report:'Trayi',ver:'Mid-management',integ:'Reliable',date:'2026-09-12',time:'10:00',status:'validated',lang:'English',sitting:'core'},
   {id:'d6',first:'Sameer',full:'Sameer Khan',type:'Executive',report:'Pancha Bhuta',ver:'Executive',integ:'Reliable',date:'2026-09-08',time:'19:00',status:'closed',lang:'Hindi',sitting:'core'},
   {id:'d7',first:'Isha',full:'Isha Verma',type:'Student',report:'Trayi',ver:'Student',integ:'Reliable',date:'2026-09-18',time:'09:00',status:'cancel_late',lang:'Hindi',sitting:'core'},
   {id:'d8',first:'Vikram',full:'Vikram Singh',type:'Mid-management',report:'Pancha Bhuta',ver:'Mid-management',integ:'Reliable',date:'2026-09-15',time:'10:00',status:'noshow',lang:'English',sitting:'core'},
   {id:'s3',first:'Kabir',full:'Kabir Malhotra',type:'Mid-management',report:'Coaching',ver:'Session 3 of engagement',integ:'Reliable',date:'2026-09-21',time:'19:00',status:'assigned',lang:'English',sitting:'core',coaching:true},
  ],
  admin:{role:'admin',g2tab:'batches',g3pick:null,g10tab:'roles'},
  apps:[
   {id:'a0',name:'Sajal Nair',city:'Pune',as:'coach',mode:'Either',pref:'Pune · Oct–Nov 2026',langs:'English (P), Hindi, Marathi',source:'Instagram',state:'new',years:6,work:'School counsellor',days:'Sat Sun',tracks:'Students, Executives',band:'5–10 hrs a week',cv:true},
   {id:'a1',name:'Rohit Sharma',city:'Pune',as:'coach',mode:'In person',pref:'Pune · Oct–Nov 2026',langs:'English, Hindi, Marathi',source:'Instagram',state:'screened',years:7,days:'Mon Wed Fri',tracks:'Executives, Mid-management'},
   {id:'a2',name:'Farida Qureshi',city:'Mumbai',as:'coach',mode:'Online',pref:'Mumbai · any',langs:'English, Hindi, Gujarati',source:'LinkedIn',state:'waitlisted',offer:'r5',years:12,days:'Tue Thu'},
   {id:'a3',name:'Dr Alok Nair',city:'Kochi',as:'trainer',mode:'Either',pref:'Kochi · Nov window',langs:'English, Malayalam',source:'Referral',state:'enrolled',offer:'f1',years:19,tracks:'Core modules, Mentoring new coaches'},
   {id:'a4',name:'Sneha Kulkarni',city:'Pune',as:'coach',mode:'In person',pref:'Pune · Oct–Nov 2026',langs:'English, Marathi',source:'YouTube',state:'interviewing',years:5,days:'Sat Sun'},
  ],
  batches:[
   {id:'b5',prog:'core',name:'Batch 5',mode:'both',city:'Pune',venue:'Baner centre',start:'2026-07-07',end:'2026-07-24',seatsP:6,filledP:6,seatsO:6,filledO:6,facultyIds:['f_sr','f_mb'],mentorIds:['f_sr'],waitP:[],waitO:[],vers:{m1:'v1.0',m2:'v1.0',m3:'v1.0',m4:'v1.0'},verLabel:'Core — versions of 1 Jul 2026',sessions:[]},
   {id:'b7',prog:'core',name:'Batch 7',mode:'both',city:'Pune',venue:'Baner centre, room 2',start:'2026-09-15',end:'2026-10-02',seatsP:6,filledP:6,seatsO:6,filledO:5,facultyIds:['f_sr','f_mb'],mentorIds:['f_mb','f_sr'],waitP:[],waitO:[],vers:{m1:'v1.2',m2:'v1.2',m3:'v1.1',m4:'v1.2',m5:'v1.0'},verLabel:'Core — versions of 12 Sep 2026',
    sessions:[['2026-09-15','10:00','Module 1 · How the assessment works'],['2026-09-16','10:00','Module 2 · Reading the dossier'],['2026-09-18','10:00','Module 3 · The SETU model'],['2026-09-23','10:00','Module 4 · Running a debrief'],['2026-09-29','10:00','Module 5 · Using SETU'],['2026-10-02','11:00','Exam · observed debrief and viva']]},
   {id:'b8',prog:'core',name:'Batch 8',mode:'online',city:'Online',venue:'',start:'2026-10-20',end:'2026-11-06',seatsP:0,filledP:0,seatsO:6,filledO:4,facultyIds:['f_mb'],mentorIds:[],waitP:[],waitO:[],vers:{m1:'v1.2',m2:'v1.2',m3:'v1.1',m4:'v1.2',m5:'v1.0'},verLabel:'Core — versions of 12 Sep 2026',sessions:[['2026-10-20','18:30','Module 1 · How the assessment works'],['2026-10-22','18:30','Module 2 · Reading the dossier']]},
   {id:'b9',prog:'core',name:'Batch 9',mode:'both',city:'Bengaluru',venue:'',start:'2026-11-17',end:'2026-12-04',seatsP:10,filledP:1,seatsO:8,filledO:0,facultyIds:[],mentorIds:[],waitP:[],waitO:[],verLabel:'Fixed when faculty are added',sessions:[]},
   {id:'r3',prog:'track',name:'Senior track, Oct',mode:'online',city:'Online',venue:'',start:'2026-10-12',end:'2026-10-13',seatsP:0,filledP:0,seatsO:6,filledO:5,facultyIds:['f_sr'],mentorIds:['f_ir'],waitP:[],waitO:[],verLabel:'Senior track v1.0',sessions:[]},
   {id:'r5',prog:'track',name:'Mid-management track, Oct',mode:'online',city:'Online',venue:'',start:'2026-10-26',end:'2026-10-27',seatsP:0,filledP:0,seatsO:6,filledO:6,facultyIds:['f_sr'],mentorIds:['f_ir'],waitP:[],waitO:['Leela Iyer','Farida Qureshi'],verLabel:'Mid-management track v1.0',sessions:[]},
   {id:'o1',prog:'org',name:'ABC Ltd update module',mode:'online',city:'Online',venue:'',start:'2026-10-08',end:'2026-10-08',seatsP:0,filledP:0,seatsO:6,filledO:3,facultyIds:['f_sr'],mentorIds:['f_ir'],waitP:[],waitO:[],verLabel:'ABC Ltd programmes, Oct',sessions:[]},
   {id:'f1',prog:'induct',name:'Faculty induction, Nov',mode:'inperson',city:'Pune',venue:'Baner centre',start:'2026-11-03',end:'2026-11-04',seatsP:6,filledP:2,seatsO:0,filledO:0,facultyIds:['f_sr'],mentorIds:['f_sr'],waitP:[],waitO:[],verLabel:'Faculty induction v1.0',sessions:[['2026-11-03','10:00','How we teach · the Reading Guide · the Code'],['2026-11-04','10:00','Marking calibration · SETU and PRACTICE · observed teaching']]},
   {id:'ad1',prog:'adv',name:'Advanced, Jan',mode:'online',city:'Online',venue:'',start:'2027-01-12',end:'2027-01-16',seatsP:0,filledP:0,seatsO:12,filledO:0,facultyIds:[],mentorIds:[],waitP:[],waitO:[],verLabel:'Fixed when faculty are added',sessions:[]},
  ],
  faculty:[
   {id:'f_sr',name:'Dr Sunita Rane',kind:'Faculty · Mentor',route:'External trainer',teaches:['core','track','adv','org','induct'],modules:'Modules 1–5 · all tracks · Advanced',marks:['Written','Dossier practical','Observed debrief','Oral viva'],langs:'English, Marathi',city:'Pune',online:true,capBatches:3,mentees:['Leela Iyer','Kiran Joshi'],state:'active',calib:{last:'2026-08-12',due:'2027-02-10'},code:'v0.6 · 1 Jul 2026',agreement:'Faculty agreement v1 · 1 Jul 2026',und:'v1.0 · 10 Sep 2026',rate:'B1'},
   {id:'f_mb',name:'Mohit Bansal',kind:'Faculty · Mentor',route:'Promoted from Active coach',teaches:['core'],modules:'Modules 1–4',marks:['Written','Dossier practical'],langs:'English, Hindi',city:'Online',online:true,capBatches:2,mentees:['Monica Rao','Tara Singh','Joseph D\'Souza','Asha Patel','Vivek Menon','Nisha Gill'],state:'active',calib:{last:'2026-09-03',due:'2027-03-02'},code:'v0.6 · 2 Jun 2026',agreement:'Faculty agreement v1 · 2 Jun 2026',und:'v1.0 · 10 Sep 2026',rate:'B2'},
   {id:'f_ir',name:'Imran Sheikh',kind:'Mentor',route:'Promoted from Active coach',teaches:[],modules:'',marks:['Observed debrief'],langs:'English, Hindi',city:'Mumbai',online:true,capBatches:1,mentees:['Rahul Verma','Pooja Shah'],state:'active',calib:{last:'2026-02-10',due:'2026-08-10'},code:'v0.6 · 12 Mar 2026',agreement:'Mentor agreement v1 · 12 Mar 2026',und:'v1.0 · 11 Sep 2026',rate:'M1'},
   {id:'f_an',name:'Dr Alok Nair',kind:'Faculty',route:'External trainer · applied on W1',teaches:[],modules:'',marks:[],langs:'English, Malayalam',city:'Kochi',online:true,capBatches:2,mentees:[],state:'in induction',calib:null,code:'',agreement:'',und:'',rate:''},
  ],
  trainees:[
   {n:'Monica Rao',kind:'ours',batch:'b7',mods:2,own:'done',exam:'Booked 2 Oct',mentor:'f_mb',stage:'In training',und:'v1.0 · 15 Sep 2026',raters:{}},
   {n:'Kiran Joshi',kind:'org',org:'ABC Ltd',batch:'b7',mods:2,own:'done',exam:'Booked 2 Oct',mentor:'f_sr',stage:'In training',und:'v1.0 · 15 Sep 2026',raters:{}},
   {n:'Anil Pawar',kind:'ours',batch:'b8',mods:0,own:'not started',due:'2026-10-18',mentor:null,stage:'Invited',und:'—',raters:{}},
   {n:'Leela Iyer',kind:'ours',batch:'b5',mods:5,own:'done',exam:'Passed',mentor:'f_sr',stage:'Provisional · 3 of 6',und:'v1.0 · 12 Sep 2026',raters:{}},
  ],
  modules:[
   {id:'m1',prog:'core',n:'1',title:'How the assessment works',ver:'v1.2',date:'2026-09-12',owner:'Dr Sunita Rane',status:'current',exam:'Written (20%)',outcomes:['Say what Aarambh is — a self-assessment, never a test','Tell a core sitting from a full one','Read the integrity reading, and know why an unstable one never reaches a coach','Explain what JD Sculptor is, so the wider work makes sense'],plan:['Open with the trainee\'s own sitting — how did it feel?','The two sittings and what each prints','Integrity: Reliable, Caution, and the retake','What else Aarambh does'],material:['Reading Guide — part 1','A synthetic core and full report, side by side'],practice:'Spot the sitting type and the integrity reading on three synthetic reports.',hist:[['v1.2','2026-09-12','JD Sculptor explained (item 25)'],['v1.1','2026-08-28','Rebuilt for the 18-trait set'],['v1.0','2026-07-01','First version']]},
   {id:'m2',prog:'core',n:'2',title:'Reading the dossier',ver:'v1.2',date:'2026-09-12',owner:'Dr Sunita Rane',status:'current',exam:'Written (20%) · Dossier practical (30%)',outcomes:['Read Pancha Bhuta and Trayi in depth','Know Paradox and Team well enough to recognise them','Keep the two lanes apart — never "develop" a Fit trait','Hold a Caution reading with verification language'],plan:['Do, debrief, frame — start with a report, not a slide','The scale runs L0 to L5, and L0 is the most of the trait','The two lanes','The Caution case'],material:['Reading Guide — parts 2–4','Trait Cards'],practice:'Read a synthetic report unaided and write a debrief plan — the shape of exam part 2, half A.',hist:[['v1.2','2026-09-12','Pancha Bhuta and Trayi in depth; Paradox and Team to know (item 25)'],['v1.0','2026-07-01','First version']]},
   {id:'m3',prog:'core',n:'3',title:'The SETU model',ver:'v1.1',date:'2026-09-12',owner:'Mohit Bansal',status:'needs update',why:'The Prep guide now groups points as Clarify · Probe further · Build on (item 43)',exam:'Observed debrief (35%)',outcomes:['Regulate before you evoke','Walk Settle, Empathise, Think, Undertake — and step back down','Read state in plain words','Run the two gates in order: integrity, then state'],plan:['A tense conversation, played twice','The four stages','The state read','The two gates'],material:['Coach guide — the SETU model','Other models panel (GROW · OPAL · CLEAR)'],practice:'Two practice debriefs in Live mode, one where the person gets upset.',hist:[['v1.1','2026-09-12','Live mode replaces the old debrief screen'],['v1.0','2026-07-01','First version']]},
   {id:'m4',prog:'core',n:'4',title:'Running a debrief',ver:'v1.2',date:'2026-09-12',owner:'Dr Sunita Rane',status:'current',exam:'Observed debrief (35%) · Oral viva (15%)',outcomes:['Prepare, run and close a 45-minute debrief','Write the letter: explain, never direct','Hold the Code of Ethics — money, contact details, flag words'],plan:['The 45 minutes, step by step','The after-debrief screen','The Code, section by section'],material:['Code of Ethics','Question Bank'],practice:'A full practice debrief and letter, marked against the rubric.',hist:[['v1.2','2026-09-12','Conduct warning added (item 13)'],['v1.0','2026-07-01','First version']]},
   {id:'m5',prog:'core',n:'5',title:'Using SETU · do\'s and don\'ts',ver:'v1.0',date:'2026-09-20',owner:'Mohit Bansal',status:'current',exam:'Dossier practical (30%), half B',outcomes:['Prep guide → Live mode → after the debrief, in PRACTICE mode','Check SETU\'s suggestions against your own reading'],plan:['One whole debrief in SETU, start to finish','Where the Prep guide can be wrong'],material:['Coach guide'],practice:'Compare your unaided plan with the Prep guide — the shape of exam part 2, half B.',hist:[['v1.0','2026-09-20','New module (item 34)']]},
   {id:'t2',prog:'track',n:'L2',title:'Executives track',ver:'v1.0',date:'2026-07-01',owner:'Dr Sunita Rane',status:'current',exam:'Observed debrief at the level + faculty sign-off',outcomes:['Debrief early-career professionals'],plan:['One day'],material:['Executive report samples'],practice:'Two practice debriefs on Executive reports.',hist:[['v1.0','2026-07-01','First version']]},
   {id:'t3',prog:'track',n:'L3',title:'Mid-management track',ver:'v1.0',date:'2026-07-01',owner:'Dr Sunita Rane',status:'current',exam:'Observed debrief at the level + faculty sign-off',outcomes:['Debrief people who manage a team or function'],plan:['Two days'],material:['Mid-management report samples'],practice:'Two practice debriefs on Mid-management reports.',hist:[['v1.0','2026-07-01','First version']]},
   {id:'t4',prog:'track',n:'L4',title:'Senior track',ver:'v1.0',date:'2026-07-01',owner:'Dr Sunita Rane',status:'current',exam:'Observed debrief at the level + faculty sign-off',outcomes:['Debrief people who lead a function or a business'],plan:['Two days'],material:['Senior report samples'],practice:'Two practice debriefs on Senior reports.',hist:[['v1.0','2026-07-01','First version']]},
   {id:'a1m',prog:'adv',n:'A',title:'Paradox · Team report · JD Sculptor',ver:'v0.1',date:'2026-09-25',owner:'Dr Sunita Rane',status:'draft',exam:'Observed debrief on a Paradox report · panel',outcomes:['Debrief a Paradox report','Read a Team report','Explain JD Sculptor work'],plan:['Five days — content waits for the paradox rebuild'],material:['Paradox Cards — deferred until the rebuild'],practice:'Practice debriefs on synthetic Paradox reports.',hist:[['v0.1','2026-09-25','Outline only']]},
   {id:'o1m',prog:'org',n:'O',title:'ABC Ltd — brief and programmes',ver:'v1.1',date:'2026-10-01',owner:'Dr Sunita Rane',status:'current',exam:'Faculty sign-off',outcomes:['Know ABC Ltd\'s brief','Recommend from its programmes beside Aarambh\'s list'],plan:['Half a day, online'],material:['ABC Ltd brief'],practice:'One practice recommendation set.',hist:[['v1.1','2026-10-01','Programmes changed'],['v1.0','2026-08-15','First version']]},
   {id:'i1',prog:'induct',n:'F',title:'Faculty induction',ver:'v1.0',date:'2026-09-25',owner:'Gyani Says',status:'current',exam:'Calibration within the line · one observed teaching session',outcomes:['How we teach — do, debrief, frame','The Reading Guide','Marking calibration','The Code','SETU and PRACTICE mode','One observed teaching session'],plan:['Two days'],material:['Facilitator Handbook — when written'],practice:'Mark a recorded practice debrief alongside two faculty.',hist:[['v1.0','2026-09-25','First version (item 22)']]},
  ],
  updates:[], notices:[],
  und:{signed:false,date:'',ver:'v1.0'}, coachKind:'ours',
  w1:{as:'coach',name:'Sajal Nair',phone:'+91 98xxx xxx41',email:'sajal.nair@example.in',city:'Pune',years:'6',work:'School counsellor',coached:'Students in classes 9–12, and their parents',quals:'MA Psychology',cv:false,langs:{English:2,Hindi:1,Marathi:1},band:'5–10 hrs a week',mode:'Either',window:'Oct–Nov 2026',tracks:['Students','Executives'],days:['Sat','Sun'],consent:false,submitted:false,src:'ig'},
  pres:{track:'walk',disc:{who:'The Gyani Says team',city:'Pune',mode:'Either',as:'Would-be coaches',room:'A public talk'},order:{walk:['w1','g2a','g2b','g2f','g2c','s1','s2','s3','s4','s4b','g1','g10','g9'],talk:['cover','work','who','journey','levels','exam','time','batches','code','apply']},hidden:{walk:[],talk:[]},narr:{walk:'team',talk:'general'},notes:true,on:false,i:0},
  requests:[
   {id:'rq1',who:'Monica Rao',type:'Detail correction',what:'Phone number changed',when:'17 Sep',touches:'S1 · Saarthi record',state:'open'},
   {id:'rq2',who:'Imran Sheikh',type:'Time commitment',what:'10–20 hrs → 5–10 hrs a week',when:'17 Sep',touches:'C2 · commitment',state:'open'},
   {id:'rq3',who:'Monica Rao',type:'Public card',what:'New About me text, waiting for approval',when:'16 Sep',touches:'C2 · public card',state:'open'},
   {id:'rq4',who:'Leela Iyer',type:'Move a debrief',what:'Sat 19 Sep, 10:00 — family emergency',when:'16 Sep',touches:'C3 · booked slot',state:'open'},
  ],
  alerts:[
   {id:'al1',who:'Imran Sheikh',what:'Ended early — client distressed',when:'today, 11:40',kind:'stop'},
   {id:'al2',who:'Leela Iyer',what:'Client didn\'t join — Vikram, Tue 15 Sep',when:'15 Sep',kind:'plain'},
   {id:'al3',who:'Neel Kamath',what:'Late drop — second this month',when:'14 Sep',kind:'gold'},
  ],
  roster:[
   {n:'Monica Rao',kind:'ours',rank:'Certified',stage:'Active',lvl:3,cat:'B',lang:'English, Hindi, Marathi',rate:4.6,work:'5 this month',warn:0,code:'v0.6',und:'v1.0 · 15 Sep 2026',orgs:'ABC Ltd',adv:false},
   {n:'Imran Sheikh',kind:'ours',rank:'Senior',stage:'Active',lvl:4,cat:'A',lang:'English, Hindi',rate:4.8,work:'7 this month',warn:1,code:'v0.6',und:'v1.0 · 11 Sep 2026',orgs:'—',adv:true},
   {n:'Leela Iyer',kind:'ours',rank:'Certified',stage:'Provisional',lvl:2,cat:'C',lang:'English, Tamil',rate:4.3,work:'3 this month',warn:1,code:'v0.6',und:'v1.0 · 12 Sep 2026',orgs:'—',adv:false},
   {n:'Neel Kamath',kind:'ours',rank:'Certified',stage:'Active',lvl:3,cat:'C',lang:'English, Kannada',rate:4.1,work:'4 this month',warn:2,code:'v0.6',und:'',orgs:'ABC Ltd',adv:false},
   {n:'Kiran Joshi',kind:'org',org:'ABC Ltd',rank:'Certified',stage:'In training',lvl:1,cat:'—',lang:'English, Marathi',rate:0,work:'—',warn:0,code:'—',und:'v1.0 · 15 Sep 2026',orgs:'ABC Ltd',adv:false},
  ],
  toAssign:[
   {id:'as1',first:'Ankit',type:'Executive',lang:'Hindi',when:'Tue 22 Sep, 6:00 pm',source:'New booking',org:null},
   {id:'as2',first:'Deepa',type:'Mid-management',lang:'Marathi',when:'Wed 23 Sep, 11:00 am',source:'Rebook — same coach first',org:null},
   {id:'as3',first:'Harsh',type:'Mid-management',lang:'English',when:'Thu 24 Sep, 5:00 pm',source:'ABC Ltd engagement',org:'abc'},
  ],
  activity:[
   {when:'17 Sep, 14:20',who:'Admin · Priyanka',what:'Approved public card — Monica Rao',why:'Wording checked'},
   {when:'17 Sep, 12:05',who:'Faculty · Dr Sunita Rane',what:'Marked module 3 done — Batch 7',why:'Session complete'},
   {when:'16 Sep, 18:30',who:'Admin · Priyanka',what:'Paused Neel Kamath from new bookings',why:'Second late drop this month'},
   {when:'16 Sep, 09:15',who:'Finance · Rahul',what:'Updated per-session fee band',why:'Board decision, applies to future only'},
  ],
  people:[
   {n:'Priyanka Desai',role:'Admin',last:'today, 15:02',state:'active'},
   {n:'Rahul Menon',role:'Finance admin',last:'today, 09:40',state:'active'},
   {n:'Dr Sunita Rane',role:'Faculty',last:'today, 12:05',state:'active'},
   {n:'Mohit Bansal',role:'Faculty · Mentor',last:'yesterday',state:'active'},
   {n:'Monica Rao',role:'Coach',last:'today, 14:55',state:'active'},
   {n:'Aarambh — validation',role:'Aarambh reviewer',last:'today, 10:10',state:'active'},
   {n:'Sonia Bhatt',role:'Coach',last:'4 Aug',state:'suspended'},
  ],
  slots:[], unavailable:[], prep:{}, runs:{}, after:{}, cur:'d1',
  session:{focus:'',notes:{},state:null,action:'',follow:'2026-10-05',node:'S'},
 };
}
function seedSlots(S){
 const add=(date,start,end)=>{for(let t=mm(start);t+45<=mm(end);t+=60)S.slots.push({id:'sl'+date+t,date,t,status:'open'});};
 add('2026-09-17','15:00','18:00');add('2026-09-19','09:00','13:00');add('2026-09-20','17:00','20:00');add('2026-09-21','10:00','13:00');add('2026-09-22','10:00','13:00');add('2026-09-24','17:00','20:00');
 const book=(date,time,dId)=>{const s=S.slots.find(x=>x.date===date&&x.t===mm(time));if(s){s.status='booked';s.dId=dId;}};
 book('2026-09-17','16:00','d2');book('2026-09-19','10:00','d1');book('2026-09-21','11:00','d10');book('2026-09-22','11:00','d9');
}

function reset(){if(!confirm('Reset the rig to its starting sample data? Your review marks stay.'))return;const rv=S.ui.reviewed,ack=S.ui.ack;S=seed();seedSlots(S);S.ui.reviewed=rv;S.ui.ack=ack;save();render();toast('Rig reset');}
function D(id){return S.debriefs.find(d=>d.id===id);}
function band(){return BANDS.find(b=>b[0]===S.commit.band)||BANDS[2];}

/* ---------------- rig render ---------------- */
function go(code,focus){if(!roleAllows(code)){toast('This screen is not part of your workspace.');return;}S.ui.screen=code;S.ui.focus=focus||null;S.ui.menu=false;S.ui.rigPanel=false;save();render();window.scrollTo(0,0);}
// Changed after the pass: screen -> the date of the change. A reviewed screen shows "changed" until
// it is looked at again. 29 Sep 2026: C5 shows the real Aarambh report and loads from the Aarambh rig.
// 16 Oct 2026: C5 and C6 split the person's copy from the coach copy; the coach copy needs the undertaking.
const CHANGED_SINCE={C5:'17oct',C6:'17oct',C8:'17oct',S1:'05oct',S2:'05oct',S3:'05oct',S4:'05oct',C1:'05oct',G1:'05oct',G2:'05oct',G9:'05oct',G10:'05oct'};   // 5 Oct 2026: Saarthi pass
const chgKey=c=>CHANGED_SINCE[c]?c+'@'+CHANGED_SINCE[c]:null;
function dotState(c){const M=META[c];if(!M.built)return '';if(PARKED.includes(c))return 'parked';if(S.ui.reviewed[c])return ((CHANGED_IN_PASS.includes(c)&&!S.ui.ack[c])||(chgKey(c)&&!S.ui.ack[chgKey(c)]))?'changed':'reviewed';return 'built';}
function markReviewed(c){if(dotState(c)==='changed'){S.ui.ack[c]=true;if(chgKey(c))S.ui.ack[chgKey(c)]=true;}else{S.ui.reviewed[c]=!S.ui.reviewed[c];S.ui.ack[c]=true;if(chgKey(c))S.ui.ack[chgKey(c)]=true;}save();render();}
function render(){
 if(!workspaceSession&&publicApplicationOpen){renderPublicApplication();return;}
 if(!workspaceSession){renderLogin();return;}
 if(!roleAllows(S.ui.screen))S.ui.screen=ROLE_PROFILES[workspaceSession.role].home;
 if(!fullWorkspaceAccess()&&S.pres)S.pres.on=false;
 const cur=S.ui.screen,m=META[cur];
 let nav='';
 SCREENS.forEach(g=>{
  nav+=`<div class="grp"><span><i class="gdot" style="background:${g.color}"></i>${esc(g.g)}</span>${g.pass?`<em>pass ${g.pass}</em>`:''}</div>`;
  g.items.forEach(([c,n])=>{const M=META[c];const ds=dotState(c);
   nav+=`<button class="navi ${M.built?'':'later'}" aria-current="${c===cur}" onclick="go('${c}')"><span class="code">${c}</span><span class="nm">${esc(n)}</span><span class="dot ${ds}" title="${ds||'not built'}"></span></button>`;});
 });
 const ds=dotState(cur);
 const revBtn=!m.built?'':ds==='parked'?`<span class="pill">Parked · re-review after the pass</span>`:ds==='changed'?`<button class="btn gold" onclick="markReviewed('${cur}')">Changed since your review · mark reviewed</button>`:`<button class="btn ${S.ui.reviewed[cur]?'':'ghost'}" onclick="markReviewed('${cur}')">${S.ui.reviewed[cur]?'✓ Reviewed':'Mark reviewed'}</button>`;
 $('rig').className='rig'+(S.ui.collapsed?' collapsed':'');
 $('rig').innerHTML=`
 <aside class="rail">
  <div class="rail-head"><img src="${MARK}" alt="Gyani Says"><div class="word"><b>Coach Platform</b><span>Rig v0.3</span></div></div>
  <nav>${nav}</nav>
  <div class="rail-foot">
   <div class="legend tx"><span><i class="dot"></i>not built</span><span><i class="dot built"></i>built</span><span><i class="dot changed"></i>changed since review</span><span><i class="dot reviewed"></i>reviewed</span><span><i class="dot parked"></i>parked</span></div>
   <div class="row"><button class="btn sm" onclick="S.ui.collapsed=!S.ui.collapsed;save();render()">${S.ui.collapsed?'»':'« <span class="tx">Hide list</span>'}</button><button class="btn sm tx" onclick="reset()">Reset</button></div>
  </div>
 </aside>
 <main class="main">
  <div class="strip">
   <div class="id"><span class="chip">${m.code}</span><h1>${esc(m.name)}</h1><span class="who">Used by: ${esc(m.who)}</span></div>
   <div class="right" style="position:relative">${stateSwitch(cur)?`<button class="btn ${S.ui.rigPanel?'pri':''}" onclick="S.ui.rigPanel=!S.ui.rigPanel;save();render()">${ic('time-commitment','sm')}Rig controls</button>`:''}
    ${S.ui.rigPanel&&stateSwitch(cur)?`<div class="menu" style="right:0;top:56px;min-width:340px;padding:16px">
      <div class="eyebrow" style="margin:0 0 10px">Rig controls — not part of the app</div>
      <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-start">${stateSwitch(cur)}</div>
      <p class="help" style="margin:12px 0 0">These switch the same screen between states so you can see each one. A real user never sees them.</p></div>`:''}
    ${cur==='P1'?'':`<button class="btn pri" onclick="go('P1')" title="Open the presenter (P1)">▶ Present</button>`}<button class="btn gold" onclick="$('drawer').classList.add('open')">Decisions (${(DEC[cur]||[]).length})</button>${revBtn}</div>
  </div>
  <div class="stage"><div class="screen-in">${m.built?screen(cur):later(cur)}</div></div>
 </main>`;
 refreshPresentation(cur);applyWorkspaceAccess();renderDrawer();afterRender(cur);renderPres();renderGuideAssistant();
}
function stateSwitch(c){
 const sw=(label,key,opts)=>`<div class="seg"><span class="lbl">${label}</span>${opts.map(([v,t])=>`<button aria-pressed="${S[key]===v}" onclick="S['${key}']='${v}';save();render()">${t}</button>`).join('')}</div>`;
 if(c==='S1')return sw('State','firstLogin',[['invited','Invited'],['confirmed','Confirmed']])+sw('Coach type','coachKind',[['ours','Gyani Says'],['org','Appointed by ABC Ltd']]);
 if(c==='W1')return `<div class="seg" style="flex-wrap:wrap"><span class="lbl">Arrived from</span>${SRC.map(s=>`<button aria-pressed="${S.w1.src===s[0]}" onclick="S.w1.src='${s[0]}';save();render()">${s[1]}</button>`).join('')}</div><button class="btn sm" onclick="S.w1.submitted=false;S.w1.consent=false;save();render()">Show the empty form again</button>`;
 if(c==='S3')return sw('Coach is','growth',[['growing','Growing'],['fixed','Fixed'],['allrounder','All-rounder']])+`<div class="seg"><span class="lbl">Rank</span>${RANKS.map(r=>`<button aria-pressed="${S.coach.rank===r.k}" onclick="S.coach.rank='${r.k}';save();render()">${r.k}</button>`).join('')}</div>`;
 if(c==='S2')return `<div class="seg"><span class="lbl">Trainee</span><button aria-pressed="${S.stage==='training'}" onclick="S.stage='training';save();render()">In training</button><button aria-pressed="${S.stage!=='training'}" onclick="S.stage='active';save();render()">Certified</button></div>`;
 if(c==='S4')return sw('Stage','stage',[['training','In training'],['passed','Exam passed'],['provisional','Provisional'],['lapsed','Lapsed'],['active','Active']]);
 if(c==='C1')return sw('Stage','stage',[['training','Training'],['passed','Passed'],['provisional','Provisional'],['lapsed','Lapsed'],['active','Active']])+`<div class="seg"><span class="lbl">Code</span><button aria-pressed="${!S.codeChanged}" onclick="S.codeChanged=false;save();render()">Current</button><button aria-pressed="${S.codeChanged}" onclick="S.codeChanged=true;save();render()">Changed</button></div>`;
 if(c[0]==='G')return `<div class="seg"><span class="lbl">Signed in as</span><button aria-pressed="${S.admin.role==='admin'}" onclick="S.admin.role='admin';save();render()">Admin</button><button aria-pressed="${S.admin.role==='finance'}" onclick="S.admin.role='finance';save();render()">Finance admin</button></div>`;
 if(['S3','C2'].includes(c))return sw('Coach is','growth',[['growing','Growing'],['fixed','Fixed'],['allrounder','All-rounder']]);
 if(['C5'].includes(c))return sw('Report','view',[['split','Split screen'],['own','Own window']]);
 return '';
}
function renderDrawer(){
 const c=S.ui.screen,m=META[c];
 $('drawer').innerHTML=`<header><span class="pill maroon">${c}</span><h2>Agreed decisions</h2><button class="btn sm" style="margin-left:auto" onclick="$('drawer').classList.remove('open')">Close</button></header>
 <div class="body"><p class="muted small" style="margin-top:0">${esc(m.name)} · GYS_Coach_Platform_Spec_v0.3.md, section 16</p><ol>${(DEC[c]||[]).map(d=>`<li>${esc(d)}</li>`).join('')}</ol></div>`;
}
function later(c){
 const m=META[c];
 return `<div class="app"><div class="page">
  <div class="pagehead"><div><div class="eyebrow">${esc(m.group)}</div><h2>${esc(m.name)}</h2></div><p>Built in <b>pass ${m.pass}</b>. Everything agreed so far is listed here to check now.</p></div>
  <div class="grid2"><div class="card"><h3>Agreed decisions</h3><ol style="margin:0;padding-left:22px">${(DEC[c]||[]).map(d=>`<li style="padding:5px 0">${esc(d)}</li>`).join('')}</ol></div>
  <div class="hollow"><div class="eyebrow">Not built yet</div><p style="margin:0">Pass ${m.pass} ${m.pass===2?'builds the Gyani Says admin (G1–G8) and Aarambh screens.':'builds the client mock and "Follow one booking".'}</p></div></div>
 </div></div>`;
}
function appbar(active,kind){
 if(kind==='web')return `<div class="webbar"><img src="${MARK}" alt="Gyani Says" style="height:46px"><b style="font-family:Georgia,serif;font-size:21px">Gyani Says</b><span style="width:1px;height:34px;background:var(--line)"></span><img src="${SAARTHI_MARK}" alt="Saarthi" style="height:36px"><img src="${SAARTHI_WORD}" alt="Saarthi" style="height:24px"><nav><span>About us</span><span>The Saarthi System</span><b>Apply</b><span>Contact</span></nav></div>`;
 if(kind==='pres')return `<div class="appbar"><div class="logo"><img class="smark" src="${SAARTHI_MARK}" alt="Saarthi"><img class="sword" src="${SAARTHI_WORD}" alt="Saarthi"></div><img class="gsmark" src="${MARK}" alt="Gyani Says"><div class="user"><span>Presenter · not part of the app</span></div></div>`;
 if(kind==='admin'){
  const tabs=[['G0','Home','home'],['G1','Roster','cohort'],['G2','Training','module'],['G3','Assign','debriefs'],['G9','Capacity','level'],['G8','Organisations','organisation'],['G5','Ratings','rating'],['G6','Tiers','recommendations'],['G7','Payments','credential'],['G4','Settings','time-commitment'],['G10','Access','consent']];
  return `<div class="appbar setu"><div class="logo">${SETU_SVG(36)}<div><div class="nm">S·E·T·U</div><div class="by">Gyani Says admin</div></div></div><img class="gsmark" src="${MARK}" alt="Gyani Says">
   <nav>${tabs.map(([c,t,i])=>`<button class="${active===c?'on':''}" onclick="go('${c}')">${ic(i,'sm')} ${t}</button>`).join('')}</nav>
   <div class="user"><span>${S.admin.role==='finance'?'Rahul Menon · Finance admin':'Priyanka Desai · Admin'}</span><span class="avatar">${S.admin.role==='finance'?'RM':'PD'}</span></div></div>`;
 }
 const saarthi=kind==='saarthi';
 const tabs=saarthi?[['S2','Core modules','module'],['S3','Role tracks','level'],['S4','Exam','exam']]:[['C1','Home','home'],['C4','My debriefs','debriefs'],['C3','Calendar','calendar'],['C2','Profile','cohort'],['C11','Guide','guide']];
 if(!saarthi&&(S.stage==='training'||S.stage==='passed'))tabs.push(['S2','Saarthi','module']);
 const logo=saarthi?`<div class="logo"><img class="smark" src="${SAARTHI_MARK}" alt="Saarthi"><img class="sword" src="${SAARTHI_WORD}" alt="Saarthi"></div>`:`<div class="logo">${SETU_SVG(36)}<div><div class="nm">S·E·T·U</div><div class="by">for coaches</div></div></div>`;
 return `<div class="appbar ${saarthi?'':'setu'}">${logo}<img class="gsmark" src="${MARK}" alt="Gyani Says">
  <nav>${tabs.map(([c,t,i])=>`<button class="${active===c?'on':''}" onclick="go('${c}')">${ic(i,'sm')} ${t}</button>`).join('')}</nav>
  <div class="user"><span>${esc(S.coach.name)}</span><span class="avatar">MR</span></div></div>`;
}
function wrap(active,inner,opts={}){return `<div class="app ${opts.present?'present':''}">${opts.practice?'<div class="practice-band">PRACTICE — synthetic report · not saved as client history</div>':''}${opts.kind==='web'?'<div class="mockband">MOCK · GYANI SAYS WEBSITE — GYANI SAYS BUILDS THE REAL PAGE</div>':''}${appbar(active,opts.kind)}<div class="page">${inner}</div></div>`;}
function head(title,sub,right){return `<div class="pagehead"><div>${title}</div><div>${sub?`<p>${sub}</p>`:''}${right||''}</div></div>`;}
function screen(c){
 if(c==='T1'||c==='M1')return staffWorkspace(c);
 const f={W1,P1,S1,S2,S3,S4,C1,C2,C3,C4,C5,C6,C11,C12,G0,G1,G2,G3,G4,G5,G6,G7,G8,G9,G10};
 if(['C7','C8','C9','C10'].includes(c))return AFTER(c);
 return f[c]();
}
function afterRender(c){
 const map={C7:'sec-rec',C8:'sec-letter',C9:'sec-rate',C10:'sec-recording'};
 const id=S.ui.focus||map[c];
 if(id){const el=$(id);if(el){el.classList.add('sec-focus');if(c!=='C7'||S.ui.focus)setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),40);}}
 if(c==='C6')startTick();else stopTick();
 if(c==='C5')bindGutter();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();$('drawer').classList.remove('open');}});

/* =====================================================================
   S1 · First login — confirm your details
   ===================================================================== */
function S1(){
 const sa=S.saarthi,s1=S.s1,b=myBatch(),t=myTrainee(),org=S.coachKind==='org';
 const langs=sa.langs.map(([l,p])=>`<span class="pill ${p?'teal':''}">${esc(l)} · ${p?'Primary':'Secondary'}</span>`).join(' ');
 const ns=nextSession(b)||(b.sessions||[])[0];
 const notice=S.notices.filter(n=>n.batch===b.id).map(n=>say('Your batch dates have changed.',esc(n.text),'warn')).join('');
 const und=S.und||{};
 if(S.firstLogin==='confirmed'){
  return wrap('S1',`${notice}<div class="hero" style="margin-bottom:22px"><div class="eyebrow">Welcome, ${esc(sa.name.split(' ')[0])}</div><h2 style="font-size:34px;color:#fff">You're in. Saarthi is open.</h2><p class="muted" style="margin:8px 0 18px;font-size:17px">${esc(b.name)} · ${esc(modeLabel(b))} · Day 1 is ${fmtLong(b.start)}${ns?`, ${hhmm(mm(ns[1]))}`:''}</p><button class="btn pri" onclick="S.stage='training';go('S2')">Go to core modules →</button></div>
  <div class="grid4"><div class="card lift"><div class="row">${ic('consent')}<div><b>Details confirmed</b><div class="muted small">From your Saarthi enrolment</div></div></div></div>
  <div class="card lift"><div class="row">${ic('code-of-ethics')}<div><b>Confidentiality promise</b><div class="muted small">Given ${esc(und.date||'today')}</div></div></div></div>
  <div class="card lift"><div class="row">${ic('consent')}<div><b>Data undertaking ${UNDERTAKING.ver}</b><div class="muted small">Signed ${esc(und.date||'today')} · recorded</div></div></div></div>
  <div class="card lift"><div class="row">${ic('module')}<div><b>Next: core modules</b><div class="muted small">5 modules · about 4 days</div></div></div></div></div>`,{kind:'saarthi'});
 }
 const ro=(l,v)=>`<div class="field"><label>${l}</label><input class="f" readonly value="${esc(v)}"></div>`;
 const ready=s1.conf&&und.signed;
 return wrap('S1',`${notice}${say(`Welcome, ${esc(sa.name.split(' ')[0])}. You've been enrolled in Saarthi.`,'Everything below comes from your enrolment. Check it, and tell admin if anything is wrong — you never fill it in twice.')}
 <div class="grid3" style="align-items:start">
  <div class="stack" style="grid-column:span 2">
  <div class="card info-box" style="border-radius:var(--r);display:block">
   <div class="row between"><h3 style="margin:0">${ic('cohort','sm')} From your Saarthi enrolment</h3><span class="row"><span class="pill ${org?'teal':''}">${org?`Coach appointed by ${esc(ORGS.abc.name)}`:'Gyani Says coach'}</span><span class="pill">Read-only</span></span></div>
   <div class="grid3" style="margin-top:14px">${ro('Full name',sa.name)}${ro('City',sa.city)}${ro('Years of experience',sa.years)}${ro('Phone',sa.phone)}${ro('Email',sa.email)}${ro('Current work',sa.work)}</div>
   ${ro('People you\'ve coached',sa.coached)}
   <div class="grid3"><div><label class="fl">Languages · set by admin</label><div class="row" style="margin-bottom:14px">${langs}</div></div>
   <div><label class="fl">Qualifications</label><div class="row" style="margin-bottom:14px">${sa.quals.map(q=>`<span class="pill">${ic('exam','sm')}${esc(q)}</span>`).join('')}</div></div>
   <div><label class="fl">Tracks you're enrolled for</label><div class="row">${sa.tracks.map(t=>`<span class="pill maroon">${t}</span>`).join('')}</div><p class="help">Levels come from Saarthi. You never choose them.</p></div></div>
   ${org?`<div class="note teal small">You train in full, exactly like a Gyani Says coach, and sign the same undertaking. Once certified you take <b>only ${esc(ORGS.abc.name)}'s people</b>, and your access to their readings ends if you leave ${esc(ORGS.abc.name)} or are unassigned.</div>`:''}
   <div class="divider"></div>
   <button class="btn" onclick="modal(\`<h3>Something wrong?</h3><p>Tell admin what needs changing. They update your Saarthi record.</p><textarea class='f' placeholder='e.g. My phone number changed'></textarea><div class='row' style='justify-content:flex-end;margin-top:12px'><button class='btn' onclick='closeModal()'>Back</button><button class='btn pri' onclick='closeModal();toast(&quot;Sent to admin&quot;)'>Send to admin</button></div>\`)">Something wrong? Tell admin</button>
  </div>
  <div class="grid2" style="align-items:start">
   <div class="card info-box" style="border-radius:var(--r);display:block;border-top:5px solid var(--teal)"><h3>${ic('module','sm')} Your batch</h3>
    <p class="muted small" style="margin-top:0">Chosen from what you asked for on your application. Admin has given you a seat — this is to confirm, not to choose.</p>
    <dl class="kv" style="grid-template-columns:110px 1fr"><dt>Programme</dt><dd>${progName(b.prog)} · <b>${esc(b.name)}</b></dd><dt>Runs</dt><dd>${fmtDate(b.start)} – ${fmtDate(b.end)}</dd><dt>Where</dt><dd>${esc(modeLabel(b))}${b.venue?` · ${esc(b.venue)}`:''}</dd><dt>Your seat</dt><dd>${esc(sa.seat||'In person')}</dd><dt>Faculty</dt><dd>${esc(facNames(b.facultyIds))}</dd><dt>Mentor</dt><dd>${esc((facById(t.mentor)||{}).name||'Assigned before Day 1')}</dd><dt>Day 1</dt><dd>${fmtLong(b.start)}</dd></dl>
    <span class="fl" style="margin-top:12px">Sessions</span>${(b.sessions||[]).map(s=>`<div class="row between small" style="padding:5px 0;border-bottom:1px solid var(--line)"><span>${fmtDate(s[0])} · ${hhmm(mm(s[1]))}</span><span>${esc(s[2])}</span></div>`).join('')}
    <p class="help">If admin moves a date, you are told here and on your home screen.</p></div>
   <div class="card" style="border-top:5px solid var(--gold)"><h3>${ic('exam','sm')} Before Day 1 — take your own assessment</h3>
    ${say('Every coach starts by being a client. Take the assessment yourself, and on Day 1 a coach will debrief your own report.','It is yours alone. We record only that it happened — never what it says.')}
    <dl class="kv" style="grid-template-columns:110px 1fr"><dt>Due by</dt><dd><b>${fmtDate(addDays(b.start,-2))}</b> — at least 2 days before Day 1</dd><dt>Sitting</dt><dd>Full sitting</dd><dt>Debriefed by</dt><dd>${esc(S.own.debriefedBy)}</dd></dl>
    <div class="row">${S.own.state==='done'?'<span class="pill ok">✓ Done · report ready for Day 1</span>':`<button class="btn pri" onclick="S.own.state='done';save();render();toast('Assessment done — report ready for Day 1')">Open my assessment ↗</button><span class="pill gold">Not started</span>`}</div></div>
  </div></div>
  <div class="stack">
   <div class="card"><h3>${ic('faculty','sm')} A photo and a line about you</h3><p class="muted small" style="margin-top:0">Optional. You can add these later from your profile.</p>
    <div class="row"><div class="avatar" style="width:72px;height:72px;font-size:24px">${s1.photo?ic('faculty','sm'):'MR'}</div><button class="btn sm" onclick="S.s1.photo=!S.s1.photo;save();render()">${s1.photo?'Remove photo':'Add photo'}</button></div>
    <div class="field" style="margin-top:12px"><label>Short bio</label><textarea class="f" oninput="S.s1.bio=this.value;save()" placeholder="One or two lines">${esc(s1.bio)}</textarea></div></div>
   <div class="card" style="border-top:5px solid var(--maroon)"><h3>${ic('code-of-ethics','sm')} 1 · Confidentiality promise</h3>
    ${say('In training you will see sample reports, training material and, on Day 1, fellow trainees\' own readings.','What you see there stays there.')}
    <label class="check ${s1.conf?'on':''}"><input type="checkbox" ${s1.conf?'checked':''} onchange="S.s1.conf=this.checked;save();render()"><span><b>I'll keep all of it private</b> — inside the training room and inside SETU</span></label>
    <p class="help">The full Code of Ethics is taught in Saarthi and signed before your credential.</p></div>
   <div class="card" style="border-top:5px solid var(--teal)"><div class="row between"><h3 style="margin:0">${ic('consent','sm')} 2 · Data undertaking</h3><span class="pill">${UNDERTAKING.ver}</span></div>
    <p class="muted small">Every coach signs this before seeing any reading — ours, and coaches an organisation appoints. <b>No signature, no access.</b></p>
    <ol style="margin:0 0 10px;padding-left:22px;font-size:15.5px">${UNDERTAKING.parts.map(p=>`<li style="padding:3px 0">${esc(p)}</li>`).join('')}</ol>
    <label class="check ${und.signed?'on':''}"><input type="checkbox" ${und.signed?'checked':''} onchange="S.und={signed:this.checked,date:this.checked?'17 Sep 2026':'',ver:'${UNDERTAKING.ver}'};save();render()"><span><b>I sign the data undertaking ${UNDERTAKING.ver}</b>${org?` — as a coach appointed by ${esc(ORGS.abc.name)}`:''}</span></label>
    ${und.signed?`<div class="lockline">✓ Signed ${UNDERTAKING.ver} · ${esc(und.date)} · recorded with the version and date</div>`:''}</div>
   <button class="btn pri" style="width:100%" ${ready?'':'disabled'} onclick="S.firstLogin='confirmed';save();render();toast('Confirmed — Saarthi is open')">${ready?'Confirm and start Saarthi →':'Give the promise and sign the undertaking to continue'}</button>
  </div>
 </div>`,{kind:'saarthi'});
}

/* =====================================================================
   S2 · Core modules
   ===================================================================== */
function S2(){
 const tr=S.stage==='training';const b=myBatch(),ns=nextSession(b);
 const MODICON=['exam','library','live-mode','debriefs','prepare'];
 const mods=[['How the assessment works','A self-assessment · the two sittings · the integrity reading · what else Aarambh does','done','Clear on core vs full sittings.'],['Reading the dossier','Pancha Bhuta and Trayi in depth · Paradox and Team so you know them · the two lanes · the Caution case','done','Good care with the Caution case.'],['The SETU model','Regulate before you evoke · four steps · state read · two gates',tr?'prog':'done','Strong on stepping back down.'],['Running a debrief','Prepare · the 45 minutes · after · the Code of Ethics',tr?'todo':'done','Ready.'],['Using SETU','Prep guide → Live mode → after the debrief · do\'s and don\'ts',tr?'todo':'done','Confident in Live mode.']];
 const done=mods.filter(x=>x[2]==='done').length;
 return wrap('S2',`${S.notices.filter(n=>n.batch===b.id).map(n=>say('Your batch dates have changed.',esc(n.text),'warn')).join('')}${say('Every coach takes these five modules, in order — about four days.','Faculty teach them live. Your schedule, library, practice and feedback all live on this page.')}
 <div class="grid4" style="margin-bottom:18px">
  <div class="card lift">${ring(done/5,`${done} of 5`,'modules done','#2F5D3A')}</div>
  <div class="card lift"><div class="eyebrow">My batch</div><b>${esc(b.name)} · ${esc(modeLabel(b))}</b><div class="muted small">${fmtDate(b.start)} – ${fmtDate(b.end)} · mentor ${esc((facById(myTrainee().mentor)||{}).name||'—')}</div></div>
  <div class="card lift"><div class="eyebrow">Next session</div><b>${ns?`${fmtDate(ns[0])} · ${hhmm(mm(ns[1]))}`:'—'}</b><div class="muted small">${ns?esc(ns[2]):''} · ${esc(b.venue||'online')} · faculty ${esc(facNames(b.facultyIds))}</div></div>
  <div class="card lift"><div class="eyebrow">Day 1</div><span class="pill ok">✓ Own assessment debriefed</span><div class="muted small" style="margin-top:6px">SETU records only that it happened</div></div>
 </div>
 <div class="grid5">${mods.map((m,i)=>`<div class="mod ${m[2]}"><div class="row between"><div class="num">${i+1}</div>${ic(MODICON[i],'lg')}</div><h4 style="font-size:19px">${m[0]}</h4><span class="pill" style="align-self:flex-start">Taught at ${(b.vers||{})['m'+(i+1)]||'—'}</span><p class="muted small" style="margin:0">${m[1]}</p>
  <div>${m[2]==='done'?'<span class="pill ok">Done · signed by faculty</span>':m[2]==='prog'?'<span class="pill gold">In progress · 2 of 3 sessions</span>':`<span class="pill">Opens after module ${i}</span>`}</div>
  ${m[2]==='done'?`<p class="small" style="margin:0;border-top:1px solid var(--line);padding-top:8px"><b>Faculty:</b> ${m[3]}</p>`:''}${i===4?'<span class="pill teal">New · 1 day</span>':''}</div>`).join('')}</div>
 <div class="grid2" style="margin-top:18px">
  <div class="card"><h3>${ic('library','sm')} Library</h3><p class="muted small" style="margin-top:0">Read-only. Stays open after you're certified.</p>
   <input class="f" placeholder="Search all four — a trait, a rule, a question" onkeydown="if(event.key==='Enter')toast('Search across the library — prototype')" style="margin-bottom:10px">
   ${LIB.map((L,i)=>`<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="row" style="cursor:pointer" onclick="libOpen(${i})">${ic(L.icon)}<span><b>${L.name}</b><br><span class="muted small">${L.owner} · ${L.words}</span></span></span><span>${L.unread?'<span class="pill gold">Updated since you read it</span> ':''}<span class="pill">${L.ver}</span></span></div>`).join('')}
   <p class="help">Read inside SETU — never downloaded. Stays open while you are active.</p></div>
  <div class="card"><h3>${ic('practice','sm')} Practice debriefs</h3><p style="margin-top:0">The real Prep guide and Live mode, in PRACTICE mode. Synthetic reports only — never client history.</p>
   <div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span>Practice 1 · synthetic Student report</span><span class="pill ok">Feedback given</span></div>
   <div class="row between" style="padding:10px 0"><span>Practice 2 · synthetic Executive report</span><button class="btn sm pri" onclick="startPractice()">Start</button></div></div>
 </div>`,{kind:'saarthi'});
}
function startPractice(){S.cur='practice';S.runs.practice=null;go('C6');}

/* =====================================================================
   S3 · Role tracks
   ===================================================================== */
function S3(){
 const g=S.growth,all=g==='allrounder';
 const tracks=[['Students',1,1],['Executives',1,2],['Mid-management',2,3],['Senior',2,4]];
 const card=(t,st,note)=>`<div class="mod ${st}"><div class="num">L${t[2]}</div><h4 style="font-size:19px">${t[0]}</h4><p class="muted small" style="margin:0">${t[1]} day${t[1]>1?'s':''} · practice on synthetic reports</p><div>${note}</div></div>`;
 const sen=S.batches.find(b=>b.prog==='track'&&/Senior/.test(b.name));
 let cards;
 if(all)cards=tracks.map(t=>card(t,'done','<span class="pill ok">Passed at entry</span>')).join('');
 else if(g==='fixed')cards=tracks.slice(0,3).map(t=>card(t,'done','<span class="pill ok">Passed · faculty signed</span>')).join('');
 else cards=tracks.slice(0,3).map(t=>card(t,'done','<span class="pill ok">Passed · faculty signed</span>')).join('')+card(tracks[3],'prog',`<span class="pill gold">Opened by admin · ${sen?`${esc(sen.name)} starts ${fmtDate(sen.start)}`:'batch to be set'}</span><p class="small" style="margin:8px 0 0">Needs an observed debrief at Senior level and faculty sign-off. No full exam.</p>`);
 const rk=S.coach.rank||'Certified',ri=RANKS.findIndex(r=>r.k===rk);
 const lvl=all?'All-rounder':'Level 3';
 const ups=S.updates.filter(u=>u.state==='due'&&!['training','passed'].includes(S.stage));   // update modules are for certified coaches
 return wrap('S3',`${head(`<div class="eyebrow">Saarthi · Role tracks and rank</div><h2>${rankOf(rk).name} · ${lvl} — from your Saarthi record</h2>`,'Your level says which clients you may take. Your rank says how much experience is behind you. You choose neither.')}
 ${ups.map(u=>`<div class="card" style="border-left:5px solid var(--gold);margin-bottom:18px"><div class="row between"><div class="row">${ic('module','lg')}<div><b style="font-size:19px">Update module waiting: ${esc(u.title)}, ${u.ver}</b><div class="muted small">${esc(u.what)} · about ${u.len} · do it before your next debrief</div></div></div><button class="btn pri" onclick="S.updates.find(x=>x.mod==='${u.mod}'&&x.ver==='${u.ver}').state='done';save();render();toast('Update module done')">Open the update module</button></div></div>`).join('')}
 <div class="grid2" style="align-items:start;margin-bottom:6px">${say(all?'You took all four tracks at the start, so you may take any client.':'Levels stack and come from Saarthi — you never choose them.',all?'':'Level 3 means Students, Executives and Mid-management are passed.')}
  ${say('Ranks sit on top of levels.','Certified, Senior and Lead Coach are earned with hours, observed sessions and a panel — never by time served, and never chosen. Admin records each one with a reason.')}</div>
 <div class="grid4">${cards}</div>
 <h3 style="font-size:24px;margin:28px 0 12px">${ic('credential','sm')} Your rank</h3>
 <div class="grid3">${RANKS.map((r,i)=>`<div class="mod ${i<ri?'done':i===ri?'prog':'todo'}" style="${i===ri?'box-shadow:0 0 0 2px var(--gold) inset,var(--sh-2)':''}"><div class="row between"><h4 style="font-size:21px;margin:0">${r.name}</h4>${i===ri?'<span class="pill gold">You are here</span>':i<ri?'<span class="pill ok">Held</span>':'<span class="pill">Ahead</span>'}</div>
  <p class="small" style="margin:0"><b>How:</b> ${esc(r.how)}</p><p class="small" style="margin:0"><b>Adds:</b> ${esc(r.adds)}</p></div>`).join('')}</div>
 <div class="grid3" style="margin-top:18px">
  <div class="card lift"><div class="row">${ic('credential','lg')}<div class="eyebrow" style="margin:0">My credential</div></div><h3 style="margin:0">${credLine()} · ${lvl}${S.advanced.state==='passed'?' · Advanced':''}</h3><p class="muted small" style="margin:8px 0 0">Issued by Gyani Says</p></div>
  <div class="card lift"><div class="eyebrow">Who I can take</div><p style="margin:0;font-size:18px">${all?'Students · Executives · Mid-management · Senior':'Students · Executives · Mid-management'}</p></div>
  <div class="card lift"><div class="eyebrow">How levels grow</div><p class="small" style="margin:0">${all?'All-rounders are trained for everyone from the start.':g==='growing'?'You\'re growing. Admin opens your next track when you\'re ready.':'Your level is set. There\'s no next track.'}</p></div>
 </div>
 <h3 style="font-size:24px;margin:28px 0 12px">${ic('level','sm')} The Advanced Programme</h3>
 <div class="grid3">
  <div class="card lift" style="border-left:5px solid var(--maroon)"><div class="row">${ic('guide','lg')}<div><b>Paradox · Team report · JD Sculptor</b><div class="muted small">The deeper work, after certification — and the road to Senior Coach</div></div></div>
   <p style="margin:12px 0 8px"><span class="pill ${S.advanced.state==='passed'?'ok':S.advanced.state==='in progress'?'gold':''}">${S.advanced.state==='passed'?'Passed':S.advanced.state==='in progress'?'In progress':'Not started'}</span></p>
   <p class="small" style="margin:0">Paradox and Team clients are assigned <b>only</b> to coaches who have passed it.</p>
   ${S.advanced.state==='passed'?'':`<div class="row" style="margin-top:10px"><button class="btn sm" onclick="S.advanced.state='${S.advanced.state==='not started'?'in progress':'passed'}';save();render()">Show: ${S.advanced.state==='not started'?'in progress':'passed'}</button></div>`}</div>
  <div class="hollow"><div class="eyebrow">Who may enter</div><p style="margin:0">Active coaches with enough debriefs behind them and a steady rating. <b>The numbers are still open.</b> Admin opens the track; you never apply for it.</p></div>
  <div class="hollow"><div class="eyebrow">What it changes</div><p style="margin:0">Your credential carries <b>"Advanced — Paradox, Team, JD Sculptor"</b>, those reports become assignable to you, and it counts towards <b>Senior Coach</b> with logged hours, observed sessions and a panel.</p></div>
 </div>
 <h3 style="font-size:24px;margin:28px 0 12px">${ic('organisation','sm')} Organisation and industry tracks</h3>
 <div class="grid3">
  ${S.coach.orgs.map(o=>`<div class="card lift" style="border-left:5px solid var(--teal)"><div class="row between"><div class="row">${ic('organisation')}<div><b>${esc(ORGS[o.id].name)}</b><div class="muted small">${ORGS[o.id].type} · first-time managers</div></div></div></div>
   <p style="margin:12px 0 8px"><span class="pill ok">${esc(o.state)}</span></p>
   ${o.update?'<span class="pill gold">Update module due · programmes changed</span>':`<button class="btn sm" onclick="S.coach.orgs[0].update=true;save();render()">Show: programmes changed</button>`}
   <p class="help">Valid while the engagement is active. Pauses when it ends.</p></div>`).join('')}
  <div class="hollow"><div class="eyebrow">${ic('organisation','sm')} How organisation tracks work</div><p style="margin:0">Only coaches certified for an organisation take its clients. You learn its brief and its programmes, and recommend from them beside Aarambh's list.</p></div>
  <div class="hollow"><div class="eyebrow">${ic('module','sm')} Update modules</div><p style="margin:0">When a core module gets a new version, certified coaches take a short update module — the same way organisation programmes are updated.</p></div>
 </div>`,{kind:'saarthi'});
}

/* =====================================================================
   S4 · Exam → Provisional → Active
   ===================================================================== */
const CODE_SECTIONS=['1 · Preamble','2 · Definitions','3 · Foundational commitments','4.1 · The coach and the client','4.2 · The coach and the dossier','4.3 · Scope of practice','4.4 · The coach and the profession','4.5 · The institutional context','4.6 · The coach and the System Authority','4.7 · The coach, SETU and the report page','6 · Referral-out triggers','7 · Use of the credential — never your own rates, payments, contact details, website or social handles','8 · Misconduct, complaint and revocation','9 · Annual attestation','Public rating — your name, languages, photo and rating appear on the Aarambh website'];
function S4(){
 const st=S.stage;
 const parts=[['Written','20%','90 min · multiple choice, scenarios, report extracts','In-app test'],['Dossier practical','30%','Two halves · A: read a synthetic report unaided and write your plan · B: open the Prep guide and say where it agrees and where it differs','Half A with the Prep guide off · half B in the Prep guide, PRACTICE'],['Observed debrief','35%','30 min live · two faculty raters','Live mode, PRACTICE'],['Oral viva','15%','20 min · panel of two faculty','Live']];
 const tr=st==='training';
 const res=tr?[['Passed','ok','Clear and accurate.'],['Passed','ok','A careful plan; Caution language right.'],['Booked · 2 Oct, 11:00','',''],['Booked · 2 Oct, 15:00','','']]:[['Passed','ok','Clear and accurate.'],['Passed','ok','A careful plan.'],['Passed','ok','Calm; stepped back down at the right moment.'],['Passed','ok','Explained the two lanes plainly.']];
 const exam=`<div class="grid4">${parts.map((p,i)=>`<div class="mod ${res[i][1]==='ok'?'done':'todo'}"><div class="row between"><h4 style="font-size:19px;margin:0">${p[0]}</h4><span class="pill">${p[1]}</span></div><p class="muted small" style="margin:0">${p[2]}</p><p class="small" style="margin:0">Runs in: <b>${p[3]}</b></p><div><span class="pill ${res[i][1]}">${res[i][0]}</span></div>${res[i][2]?`<p class="small" style="margin:0;border-top:1px solid var(--line);padding-top:8px"><b>Feedback:</b> ${res[i][2]}</p>`:''}</div>`).join('')}</div>
 <p class="muted small">Pass or not pass, with feedback. Marks stay with faculty. A part not passed is resat on its own — up to 2 resits. Two faculty mark the observed debrief alone — <b>never your own mentor</b>.</p>`;
 if(tr)return wrap('S4',`${head(`<div class="eyebrow">Saarthi · Exam</div><h2>All four parts must pass</h2>`)}
 ${say('After passing you sign the Code of Ethics and choose your time.','Then you are Provisional, and your calendar opens.')}${exam}
 <h3 style="font-size:24px;margin:24px 0 12px">${ic('prepare','sm')} The dossier practical, in two halves</h3>
 <div class="grid2"><div class="card" style="border-top:5px solid var(--maroon)"><h3>Half A · on your own</h3><p style="margin:0">A fresh synthetic report. The Prep guide is switched off. You read it unaided and write your plan — where you would probe, and what you would ask.</p><p class="help">This is what lets you catch the tool when it is wrong.</p></div>
 <div class="card" style="border-top:5px solid var(--teal)"><h3>Half B · against the Prep guide</h3><p style="margin:0">Then the Prep guide opens on the same report. You say where it agrees with your plan, where it differs, and which you would keep — and why.</p><p class="help">Faculty mark both halves together as one part, worth 30%.</p></div></div>`,{kind:'saarthi'});
 if(st==='passed'){
  const c=S.code,b=band();
  const bandBtn=bb=>`<button class="opt" aria-pressed="${S.commit.band===bb[0]}" onclick="S.commit.band='${bb[0]}';save();render()"><b>${bb[1]}</b><em>${bb[2]}</em></button>`;
  const tick=(arr,v)=>`<button class="opt" aria-pressed="${S.commit[arr].includes(v)}" onclick="togCommit('${arr}','${v}')">${v}</button>`;
  const ready=c.signed&&S.commit.band;
  return wrap('S4',`${say('You passed the exam. Two steps left before your credential.','Sign the Code of Ethics and choose the time you can give. Then your Provisional credential issues and your calendar opens.')}
  <div class="grid2" style="align-items:start">
   <div class="card" style="border-top:5px solid var(--maroon)"><div class="row between"><h3 style="margin:0">${ic('code-of-ethics','sm')} 1 · Code of Ethics</h3><span class="pill">${c.ver}</span></div>
    <p class="muted small">Read to the end to unlock signing. Full text: SAR_Code_of_Ethics_${c.ver}.md</p>
    <div class="coderead" onscroll="if(this.scrollTop+this.clientHeight>=this.scrollHeight-8&&!S.code.read){S.code.read=true;save();render()}">
     ${CODE_SECTIONS.map(h=>`<h4>${h}</h4><p>Summary of this section appears here in the build; the full wording comes from the Code document.</p>`).join('')}<p style="text-align:center;color:var(--ok);font-weight:600">— End of the Code —</p></div>
    <label class="check ${c.signed?'on':''}" style="margin-top:12px;${c.read?'':'opacity:.5'}"><input type="checkbox" ${c.signed?'checked':''} ${c.read?'':'disabled'} onchange="S.code.signed=this.checked;S.code.date=this.checked?'2 Oct 2026':'';save();render()"><span><b>I have read and sign the Code of Ethics ${c.ver}</b>, including the public rating${c.read?'':'<br><span class="muted small">Scroll to the end first</span>'}</span></label>
    ${c.signed?`<div class="lockline">✓ Signed ${c.ver} · ${c.date} · recorded</div>`:''}</div>
   <div class="card" style="border-top:5px solid var(--teal)"><h3>${ic('time-commitment','sm')} 2 · Time you can give</h3><p class="muted small" style="margin-top:0">One debrief takes about 90 minutes of your time — 45 to prepare, 45 with the person.</p>
    <div class="grid2">${BANDS.map(bandBtn).join('')}</div>
    <label class="fl" style="margin-top:14px">Which days</label><div class="row">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(v=>tick('days',v)).join('')}</div>
    <label class="fl" style="margin-top:14px">Time of day</label><div class="row">${['Morning','Afternoon','Evening'].map(v=>tick('tod',v)).join('')}</div>
    <div class="field" style="margin-top:14px;max-width:300px"><label>For how many months</label><select class="f" onchange="S.commit.months=this.value;save()">${['6','12','18','24'].map(v=>`<option ${S.commit.months===v?'selected':''}>${v}</option>`).join('')}</select></div>
    <p class="help">You can change this later from your profile. Admin approves the change.</p></div>
  </div>
  <div class="card" style="margin-top:18px"><div class="row between"><div><b>${ready?'Everything\'s in.':'Sign the Code and choose your time to continue.'}</b><div class="muted small">${b[1]} · ${S.commit.days.join(', ')} · ${S.commit.tod.join(', ')} · ${S.commit.months} months</div></div>
   <button class="btn pri" ${ready?'':'disabled'} onclick="S.stage='provisional';save();render();toast('Provisional credential issued — calendar open')">Issue my credential →</button></div></div>
  <details style="margin-top:18px"><summary class="btn" style="display:inline-block">Exam results</summary><div style="margin-top:14px">${exam}</div></details>`,{kind:'saarthi'});
 }
 const lapsed=st==='lapsed',active=st==='active';
 const n=active?[6,3,1]:[3,1,0];
 return wrap('S4',`<div class="hero ${active?'teal':''}" style="margin-bottom:22px"><div class="eyebrow">${active?'Certified':'Provisional'}</div><h2 style="font-size:32px;color:#fff">${active?'You\'re Active':lapsed?'Your window has closed':'Road to Active'}</h2><p class="muted" style="margin:8px 0 0;font-size:17px">${credLine()} · Level 3 · ${active?'Active':lapsed?'Provisional (lapsed)':'Provisional'} · Code ${S.code.ver} signed</p></div>
 ${lapsed?say('Your provisional window closed on 2 April 2027.','No new debriefs are assigned. Admin may extend it once, by two months.','warn'):''}
 <div class="grid4">
  <div class="card lift">${ring(n[0]/6,`${n[0]} of 6`,'supervised debriefs','#7A2B2B')}</div>
  <div class="card lift">${ring(n[1]/3,`${n[1]} of 3`,'mentor hours','#9A7213')}</div>
  <div class="card lift">${ring(n[2],active?'Signed':'Not yet','mentor sign-off','#2F5D3A')}</div>
  <div class="card lift">${ring(active?1:lapsed?0:118/182,active?'Done':lapsed?'0 days':'118 days','left of 6 months',lapsed?'#8C1D18':'#2F5E5B')}</div>
 </div>
 <div class="grid2" style="margin-top:18px">
  <div class="card"><h3>Supervised debriefs</h3>${['Kavya · Can\'t say','Rohan · Student','Neha · Mid-management'].map(x=>`<div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>${x}</span><span class="pill ok">Signed by mentor</span></div>`).join('')}</div>
  <div class="card"><h3>${ic('credential','sm')} Credential</h3>
   <dl class="kv"><dt>Number</dt><dd><b>${esc(S.cred.number)}</b> <span class="muted small">— issued once, never reused, never edited</span></dd><dt>Issued</dt><dd>${esc(S.cred.issued)} · by Gyani Says</dd><dt>Valid to</dt><dd>${esc(S.cred.validTo)} — ${S.cred.attested?'<span class="pill ok">annual attestation made</span>':'<span class="pill gold">attestation due</span>'}</dd><dt>Shows</dt><dd>Name · ${credLine()} · Level 3 · languages${S.advanced.state==='passed'?' · Advanced':''}</dd></dl>
   <p class="help">Never on it: category, slab, ratings or client names.</p>
   <div class="row"><button class="btn" onclick="toast('Credential PDF — prototype')">Download credential</button><button class="btn ghost" onclick="verifyModal()">Public verify page ↗</button></div>
   <p class="help">Use it on a CV or LinkedIn. Never imply you work for Aarambh, never quote client work, never use it to sell coaching privately.</p></div>
 </div>
 <details style="margin-top:18px"><summary class="btn" style="display:inline-block">Exam results</summary><div style="margin-top:14px">${exam}</div></details>`,{kind:'saarthi'});
}
function verifyModal(){modal(`<h3>Verify a credential</h3><p class="muted">Anyone with the number can check it. Nothing else is shown.</p>
 <div class="card"><dl class="kv"><dt>Number</dt><dd><b>${esc(S.cred.number)}</b></dd><dt>Name</dt><dd>${esc(S.coach.name)}</dd><dt>Status</dt><dd><span class="pill ok">Active</span></dd><dt>Rank</dt><dd>${esc(rankOf(S.coach.rank).name)}</dd><dt>Level</dt><dd>3</dd><dt>Issued</dt><dd>${esc(S.cred.issued)}</dd><dt>Valid to</dt><dd>${esc(S.cred.validTo)}</dd></dl></div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Close</button></div>`);}
function peerBars(){
 const peers=[26,24,22,21,19,18,17,16,15,15,14,13,12,11,10,9,7,5];   // hours opened, anonymous
 const you=17, max=Math.max(...peers);
 return `<div style="display:flex;align-items:flex-end;gap:3px;height:92px;margin:12px 0 6px">${peers.map(h=>{const me=h===you;
  return `<div title="${me?'you':'a coach on your band'}" style="flex:1;height:${Math.round(h/max*100)}%;border-radius:4px 4px 0 0;background:${me?'var(--maroon)':'var(--wash)'};border:1px solid ${me?'var(--maroon)':'var(--line)'}"></div>`;}).join('')}</div>
 <div class="row between small"><span class="muted">fewest hours</span><span><span class="pill maroon">you · 17 hrs</span></span><span class="muted">most</span></div>`;
}
function togSpec(x){const a=S.card.spec=S.card.spec||[];const i=a.indexOf(x);
 if(i>=0)a.splice(i,1); else {if(a.length>=3){toast('Three at most — it should say what you are known for');return;} a.push(x);}
 S.card.status='draft';save();render();}
function togCommit(k,v){const a=S.commit[k];const i=a.indexOf(v);i>=0?a.splice(i,1):a.push(v);save();render();}

/* =====================================================================
   C1 · Coach home
   ===================================================================== */
function statusLabel(s){return {assigned:['Assigned',''],prep:['Prep done','gold'],debriefed:['Debrief done','gold'],after:['After-debrief complete','maroon'],sentback:['Sent back','stop'],validated:['Validated','ok'],closed:['Closed',''],cancel_early:['Cancelled early',''],cancel_late:['Cancelled late',''],noshow:['Didn\'t join',''],retake:['Held — retake called','gold']}[s]||[s,''];}
function verLine(d){return d.ver&&d.ver!==d.type&&!d.coaching?` · ${d.ver} version`:'';}
function integPill(i){return `<span class="pill ${i==='Reliable'?'ok':i==='Caution'?'gold':'stop'}">${i}</span>`;}
function weekHours(){return S.slots.filter(s=>s.date>='2026-09-14'&&s.date<='2026-09-20').length*0.75;}
function C1(){
 const hi=`<div class="eyebrow">Good afternoon, ${esc(S.coach.first)}</div>`;
 const codeBanner=S.codeChanged?`<div class="say warn"><span class="mark"><img src="${MARK}" alt="Gyani Says"></span><div class="bub"><p class="who">Gyani Says</p><p class="sq">The Code of Ethics has changed — v0.7.</p><p class="sub">Read and re-accept it before you continue.</p><div style="margin-top:12px"><button class="btn pri" onclick="modal(\`<h3>Code of Ethics v0.7</h3><p class='muted'>What changed: section 4.7 now covers transcripts.</p><div class='coderead' style='max-height:220px'><h4>4.7 · The coach, SETU and the report page</h4><p>Updated wording appears here.</p></div><label class='check' style='margin-top:12px'><input type='checkbox' id='ra'><span><b>I have read and accept v0.7</b></span></label><div class='row' style='justify-content:flex-end'><button class='btn pri' onclick='if(!$(&quot;ra&quot;).checked)return;S.codeChanged=false;S.code.ver=&quot;v0.7&quot;;save();closeModal();render();toast(&quot;Code v0.7 accepted&quot;)'>Accept and continue</button></div>\`)">Read and re-accept</button></div></div></div>`:'';
 if(S.stage==='training'){
  return wrap('C1',`${codeBanner}${head(`${hi}<h2>You're in the Certification Programme</h2>`,esc(myBatch().name+' · '+modeLabel(myBatch()))+' · faculty: '+esc(facNames(myBatch().facultyIds)))}
  <div class="hero" style="margin-bottom:18px"><div class="row between"><div><div class="eyebrow">${ic('calendar','sm on-dark')} Next session</div>${(()=>{const b=myBatch(),ns=nextSession(b);return ns?`<h2 style="font-size:28px;color:#fff">${fmtDate(ns[0])} · ${hhmm(mm(ns[1]))} · ${esc(ns[2])}</h2><p class="muted" style="margin:6px 0 0">${esc(b.venue||'The meeting link')}${b.changed?' · the batch dates have changed — see Saarthi':''}</p>`:'<h2 style="font-size:28px;color:#fff">No session scheduled</h2>';})()}</div><button class="btn pri" onclick="go('S2')">Open Saarthi →</button></div></div>
  <div class="grid4">
   <div class="card lift">${ring(2/5,'2 of 5','core modules','#2F5D3A')}</div>
   <div class="card lift">${ring(0,'0 of 3','role tracks','#9A7213')}</div>
   <div class="card lift"><div class="eyebrow">Exam</div><div class="big" style="font-size:24px">2 Oct 2026</div><p class="muted small">Written and practical first</p></div>
   <div class="card lift"><div class="eyebrow">Practice</div><p style="margin:0 0 10px">A synthetic Executive report is waiting.</p><button class="btn sm" onclick="startPractice()">Start practice</button></div>
  </div>`);
 }
 if(S.stage==='passed'){
  return wrap('C1',`${head(`${hi}<h2>You passed. Two steps left.</h2>`)}
  ${say('Sign the Code of Ethics and choose the time you can give.','Then your credential issues.')}
  <div class="hero"><div class="row between"><div><div class="eyebrow">Exam passed · 2 Oct 2026</div><h2 style="font-size:28px;color:#fff">Sign the Code · choose your time</h2></div><button class="btn pri" onclick="go('S4')">Finish now →</button></div></div>`);
 }
 const prov=S.stage==='provisional'||S.stage==='lapsed',lapsed=S.stage==='lapsed';
 const top=prov?`<div class="grid4" style="margin-bottom:18px">
   <div class="card lift">${ring(3/6,'3 of 6','supervised debriefs')}</div><div class="card lift">${ring(1/3,'1 of 3','mentor hours','#9A7213')}</div>
   <div class="card lift">${ring(0,'Not yet','mentor sign-off','#2F5D3A')}</div><div class="card lift">${ring(lapsed?0:118/182,lapsed?'0 days':'118 days','left of 6 months',lapsed?'#8C1D18':'#2F5E5B')}</div></div>`:'';
 if(lapsed)return wrap('C1',`${codeBanner}${head(`${hi}<h2>Your provisional window has closed</h2>`)}
 ${say('No new debriefs are assigned.','Admin may extend your window once, by two months.','warn')}${top}`);
 return wrap('C1',`${codeBanner}${head(`${hi}<h2>Thursday, 17 September</h2>`,`Certified Coach, The Saarthi System · Level 3 · ${prov?'Provisional':'Active'}`)}${top}${activePanels(prov)}`);
}
function hoursBlock(){
 const h=S.hours, total=h.prep+h.debrief+h.indiv+h.group, t=h.target||1;
 const part=(v,cls,label,note)=>`<div class="row between small" style="padding:6px 0 2px"><span>${label} <span class="muted">${note}</span></span><span><b>${v.toFixed(1)} hrs</b></span></div>
  <div class="bar ${cls}" style="height:10px"><i style="width:${Math.min(100,v/t*100)}%"></i></div>`;
 return `<div class="row between" style="margin-bottom:6px"><span class="muted small">Target ${t} hrs</span><span class="pill ${total>=t?'ok':total>=t*0.75?'gold':''}">${Math.round(total/t*100)}% of target</span></div>
  ${part(h.prep,'gold','Preparing','before debriefs and sessions')}
  ${part(h.debrief,'','In debriefs','45 min each')}
  ${part(h.indiv,'ok','Coaching — one to one','45 min each')}
  ${part(h.group,'ok','Coaching — groups','a group counts once')}
  <div class="row between small" style="border-top:1px solid var(--line);margin-top:10px;padding-top:8px"><span><b>${total.toFixed(1)} hrs</b> in total</span><span class="muted">last month ${h.last.toFixed(1)}</span></div>`;
}
function workBlock(){
 const w=S.work;
 const cell=(n,l)=>`<div><div class="big" style="font-size:26px">${n}</div><div class="muted small">${l}</div></div>`;
 return `<div class="row between" style="gap:18px;flex-wrap:wrap">${cell(w.clients,'sessions this month')}${cell(w.unique,'different people')}${cell(w.repeat,'came back')}${cell(w.sessionsPerClient,'sessions per person')}</div>
  <div class="row between small" style="border-top:1px solid var(--line);margin-top:12px;padding-top:10px"><span>Groups run</span><span><b>${w.groups}</b> · ${w.groupPeople} people</span></div>
  <div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>${ic('rating','sm')}What clients rate me</span><span><b>${w.ratedByThem}</b> <span class="muted">from ${w.ratedCount} ratings</span></span></div>
  <div class="row between small" style="padding:8px 0"><span>${ic('rating','sm')}What I rate the conversations</span><span><b>${w.ratedByMe}</b> <span class="muted">my own average</span></span></div>
  <p class="help">Your rating of a conversation is about the session, never the person — and the client never sees it.</p>`;
}
function activePanels(prov){
 const next=S.debriefs.filter(d=>['assigned','prep'].includes(d.status)&&!d.coaching).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
 const prepDue=S.debriefs.filter(d=>d.status==='assigned'&&!d.coaching);
 const waiting=S.debriefs.filter(d=>d.status==='debriefed');
 const sent=S.debriefs.filter(d=>d.status==='sentback');
 const hrs=weekHours(),min=band()[3];
 const li=(d,btn,fn)=>`<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span><b>${esc(d.first)}</b> · ${esc(d.type)}${d.org?` · <span class="pill teal">${esc(ORGS[d.org].name)}</span>`:''}<br><span class="muted small">${esc(d.report)} · ${fmtDate(d.date)} ${hhmm(mm(d.time))}</span></span><button class="btn sm" onclick="${fn}">${btn}</button></div>`;
 return `<div class="grid3">
  <div class="hero teal" style="grid-column:span 2">${next?`<div class="eyebrow">${ic('live-mode','sm on-dark')} Next debrief</div>
   <h2 style="font-size:32px;color:#fff">${esc(next.first)} · ${hhmm(mm(next.time))} ${next.date===TODAY?'today':fmtDate(next.date)}</h2>
   <p class="muted" style="margin:8px 0 16px">${esc(next.type)} · ${esc(next.report)}${verLine(next)} · ${next.integ}${next.org?' · '+esc(ORGS[next.org].name):''}${prov?' · Supervised':''}</p>
   <div class="row">${next.status==='prep'?`<button class="btn" onclick="S.cur='${next.id}';go('C5')">Review prep</button><button class="btn pri" onclick="startRun('${next.id}')">Start Live mode →</button>`:`<button class="btn pri" onclick="S.cur='${next.id}';go('C5')">Open Prep guide →</button>`}</div>`:'<p>Nothing assigned yet.</p>'}</div>
  <div class="card lift"><div class="row">${ic('rating','lg')}<div><div class="eyebrow" style="margin:0">My rating</div><div class="big">${S.coach.rating}<span class="muted" style="font-size:18px"> / 5</span></div></div></div><p class="muted small" style="margin-bottom:0">From ${S.coach.ratings} client ratings — as on the Aarambh website</p></div>
 </div>
 <div class="grid3" style="margin-top:18px">
  <div class="card"><div class="row between"><h3 style="margin:0">${ic('prepare','sm')} Prep due</h3><span class="pill">${prepDue.length}</span></div>${prepDue.map(d=>li(d,'Prep guide',`S.cur='${d.id}';go('C5')`)).join('')||'<p class="muted">All prepped.</p>'}</div>
  <div class="card"><div class="row between"><h3 style="margin:0">${ic('letter','sm')} Waiting on me</h3><span class="pill gold">${waiting.length}</span></div>${waiting.map(d=>li(d,'Finish',`S.cur='${d.id}';go('C7')`)).join('')||'<p class="muted">Nothing waiting.</p>'}<p class="muted small" style="margin-bottom:0">Due within 24 hours</p></div>
  <div class="card" style="border-color:var(--stop-line)"><div class="row between"><h3 style="margin:0">${ic('put-aside','sm')} Sent back</h3><span class="pill stop">${sent.length}</span></div>${sent.map(d=>li(d,'Revise',`S.cur='${d.id}';go('C8')`)).join('')||'<p class="muted">Nothing sent back.</p>'}<p class="muted small" style="margin-bottom:0">Resubmit within 24 hours</p></div>
 </div>
 <div class="grid3" style="margin-top:18px">
  <div class="card"><h3>${ic('calendar','sm')} Changes</h3>
   <div style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="pill maroon">New</span> Meera · ABC Ltd · Mon 21 Sep, 11:00 am</div>
   <div style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="pill">Cancelled late</span> Isha · Fri 18 Sep — prep not started</div>
   <div style="padding:8px 0"><span class="pill">Didn't join</span> Vikram · Tue 15 Sep</div></div>
  <div class="card"><h3>${ic('session','sm')} My work this month</h3>${workBlock()}</div>
  <div class="card"><h3>${ic('time-commitment','sm')} My hours this month</h3>${hoursBlock()}
   <div class="row" style="margin-top:10px"><button class="btn sm" onclick="go('C3')">Open calendar</button><button class="btn sm ghost" onclick="go('C2')">Change my target</button></div>
   <p class="help">Opened this week: <b>${hrs} hrs</b> against ${band()[1]}.</p></div>
  <div class="card"><h3>${ic('guide','sm')} Coach guide updated</h3><p style="margin-top:0"><b>v1.3 · 17 Sep 2026.</b> New: "If you know another model" (GROW · OPAL · CLEAR).</p>
   ${S.ui.guideTick?'<span class="pill ok">✓ Read</span>':`<button class="btn sm" onclick="S.ui.guideTick=true;save();render()">I've read this</button>`} <button class="btn sm ghost" onclick="go('C11')">Open guide</button></div>
 </div>`;
}

/* =====================================================================
   C2 · Profile
   ===================================================================== */
function C2(){
 const c=S.coach,g=S.growth,all=g==='allrounder',cd=S.card,b=band();
 const words=(cd.about||'').trim().split(/\s+/).filter(Boolean).length;
 const cardStatus={draft:['Draft',''],pending:['Waiting for admin approval','gold'],approved:['Live on the Aarambh website','ok']}[cd.status];
 return wrap('C2',`${head(`<div class="eyebrow">My profile</div><h2>${esc(c.name)}</h2>`)}
 ${say('Your Saarthi record is read-only here.','Your public card is yours to write — admin approves it before it goes live.')}
 <div class="grid3" style="align-items:start">
  <div class="stack">
   <div class="card lift info-box" style="border-radius:var(--r);display:block"><div class="eyebrow">${ic('credential','sm')} Credential</div><h3 style="margin:0">Certified Coach, The Saarthi System · ${all?'All-rounder':'Level '+c.level}${S.advanced.state==='passed'?' · Advanced':''}</h3>
    <p class="muted small" style="margin:8px 0 0">Active · Code ${S.code.ver} signed · issued by Gyani Says</p>
    <dl class="kv small" style="margin-top:10px"><dt>Number</dt><dd>${esc(S.cred.number)}</dd><dt>Valid to</dt><dd>${esc(S.cred.validTo)}</dd></dl>
    <div class="row"><button class="btn sm" onclick="toast('Credential PDF — prototype')">Download</button><button class="btn sm ghost" onclick="verifyModal()">Verify page ↗</button></div></div>
   <div class="card lift info-box" style="border-radius:var(--r);display:block"><div class="eyebrow">${ic('level','sm')} My level</div><div class="big">${all?'All-rounder':'Level '+c.level}</div><p style="margin:8px 0 0">${all?'Trained for every client type':g==='fixed'?'<span class="pill">Fixed</span> Your level is set':'<span class="pill ok">Growing</span> Admin opens your next track'}</p><p class="help">From Saarthi — read-only</p></div>
   <div class="card lift info-box" style="border-radius:var(--r);display:block"><div class="eyebrow">${ic('language','sm')} Languages</div><div class="row">${S.saarthi.langs.map(([l,p])=>`<span class="pill ${p?'teal':''}">${l} · ${p?'Primary':'Secondary'}</span>`).join('')}</div><p class="help">From Saarthi. Clients in your Primary languages are offered to you first.</p></div>
   <div class="card lift"><div class="row between"><div><div class="eyebrow">Category</div><div class="big">${c.category}</div></div><div><div class="eyebrow">Can't say</div>${c.cantSay?'<span class="pill ok">Yes</span>':'<span class="pill">No</span>'}</div></div></div>
  </div>
  <div class="stack">
   <div class="card"><h3>${ic('level','sm')} How you compare</h3>
    <p class="muted small" style="margin-top:0">Coaches on your commitment band, this month. Nobody is named, and only hours are compared — never ratings, never money.</p>
    ${peerBars()}
    <div class="row between small" style="margin-top:10px"><span><b>7th of 18</b> by hours opened</span><span class="pill ok">Top half</span></div>
    <div class="row between small" style="padding-top:8px;border-top:1px solid var(--line);margin-top:8px"><span>You opened <b>92%</b> of what you committed</span><span class="muted">group median 78%</span></div>
    <p class="help">Opening what you committed is what counts here — it is what lets admin promise clients a time.</p></div>
   <div class="card"><h3>${ic('time-commitment','sm')} My hours and my target</h3>
    ${hoursBlock()}
    <label class="fl" style="margin-top:14px">My target for the month — hours with clients</label>
    <div class="row">${[12,18,24,30,40].map(v=>`<button class="opt" style="padding:7px 12px;font-size:15px;min-height:36px" aria-pressed="${S.hours.target===v}" onclick="S.hours.target=${v};save();render()">${v} hrs</button>`).join('')}</div>
    <p class="help">This is <b>yours</b> — set it, change it, no approval needed. It is not the same as your commitment band below, which is what admin plans the roster around. Debriefs and coaching sessions are counted separately so you can see where your time actually goes.</p></div>
   <div class="card"><div class="eyebrow">${ic('time-commitment','sm')} Time I give</div><p style="margin:0;font-size:18px"><b>${b[1]}</b> · ${b[2]}</p>
    ${c.pendingBand?`<p style="margin:10px 0 0"><span class="pill gold">Change requested → ${BANDS.find(x=>x[0]===c.pendingBand)[1]} · waiting for admin</span></p>`:`<div class="row" style="margin-top:12px">${BANDS.filter(x=>x[0]!==S.commit.band).map(x=>`<button class="btn sm" onclick="S.coach.pendingBand='${x[0]}';save();render();toast('Sent to admin')">${x[1]}</button>`).join('')}</div><p class="help">Pick a band to request a change. Admin approves.</p>`}</div>
   <div class="card"><div class="eyebrow">${ic('organisation','sm')} Organisation certifications</div>${c.orgs.map(o=>`<div class="row between" style="padding:6px 0"><span class="row">${ic('organisation')}<b>${esc(ORGS[o.id].name)}</b></span><span class="pill ok">${esc(o.state)}</span></div>`).join('')}</div>
   <div class="card"><div class="eyebrow">Earned roles</div><p class="muted" style="margin:0">None yet. Mentor and Faculty are granted by admin.</p></div>
  </div>
  <div class="stack">
   <div class="card" style="border-top:5px solid var(--teal)"><div class="row between"><h3 style="margin:0">${ic('faculty','sm')} About your coach</h3><span class="pill ${cardStatus[1]}">${cardStatus[0]}</span></div>
    <p class="muted small">What a client sees once you're assigned to them.</p>
    <div class="pubcard"><div class="row"><div class="avatar" style="width:64px;height:64px;font-size:22px">${cd.photo?ic('faculty','sm'):'MR'}</div><div><b style="font-family:Georgia,serif;font-size:20px">${esc(c.name)}</b><div class="small muted">Certified Coach, The Saarthi System${S.advanced.state==='passed'?' · Advanced':''}</div><div class="small">${ic('rating','sm')}<b>${c.rating}</b> from ${c.ratings} clients · ${S.saarthi.langs.map(x=>x[0]).join(', ')}</div></div></div>
     <div class="row" style="margin-top:10px">${(cd.spec||[]).map(x=>`<span class="pill maroon">${esc(x)}</span>`).join('')}</div>
     <p class="small" style="margin:12px 0 4px"><b>${esc(cd.years)} years</b> · worked with ${esc(cd.worked)}</p><p class="small" style="margin:0 0 10px">${esc(cd.about)}</p>
     <div class="row between small" style="border-top:1px solid var(--line);padding-top:8px"><span class="muted">Credential ${esc(S.cred.number)}</span><a style="cursor:pointer" onclick="verifyModal()">Verify ↗</a></div></div>
    <label class="fl" style="margin-top:14px">What you're known for — pick up to three</label>
    <div class="row">${SPECIALITIES.map(x=>`<button class="opt" style="padding:6px 11px;font-size:14.5px;min-height:34px" aria-pressed="${(cd.spec||[]).includes(x)}" onclick="togSpec('${x}')">${x}</button>`).join('')}</div>
    <p class="help">From a set list, so nobody claims something we can't stand behind. Admin approves the card before it goes live.</p>
    <div class="field" style="margin-top:14px"><label>Who I've worked with — one line</label><input class="f" value="${esc(cd.worked)}" oninput="S.card.worked=this.value;S.card.status='draft';save()"></div>
    <div class="field"><label>About me — max 80 words <span class="muted" id="wc80">${words}/80</span></label><textarea class="f" oninput="S.card.about=this.value;S.card.status='draft';save();$('wc80').textContent=this.value.trim().split(/\\s+/).filter(Boolean).length+'/80'">${esc(cd.about)}</textarea></div>
    <div class="row"><button class="btn sm" onclick="S.card.photo=!S.card.photo;S.card.status='draft';save();render()">${cd.photo?'Remove photo':'Add photo'}</button><button class="btn sm pri" onclick="S.card.status='pending';save();render();toast('Sent to admin for approval')">Send for approval</button></div>
    <div class="note plain small" style="margin-top:10px"><b>This is public.</b> It appears on the Aarambh website where people read about our coaches, and again in their login once you're assigned to them. What never appears: your <b>level</b>, your <b>category</b>, your <b>slab</b>, and anything about a client.</div>
    <p class="help">The rating shows publicly only after 5 clients have rated you.</p></div>
  </div>
 </div>`);
}

/* =====================================================================
   C3 · Calendar
   ===================================================================== */
const PARTS=[['morning','Morning'],['afternoon','Afternoon'],['evening','Evening']];
const NOW=new Date(TODAY+'T14:00:00');
function slotTime(sl){const d=new Date(sl.date+'T00:00:00');d.setMinutes(sl.t);return d;}
function frozen(sl){return (slotTime(sl)-NOW) < 72*3600e3;}          // inside 72 hours: admin only
function freezeAsk(id){const sl=S.slots.find(x=>x.id===id);
 modal(`<h3>Inside the 72-hour window</h3><p>This slot is <b>${fmtDate(sl.date)} at ${hhmm(sl.t)}</b>. Slots within 72 hours can't be changed or removed on your own — a client may be booking it right now.</p>
 <div class="field"><label>What do you need, and why?</label><textarea class="f" placeholder="e.g. Please close this slot — I have a family emergency"></textarea></div>
 <div class="note plain small">Admin decides. If it is already booked, moving it under 48 hours counts as a late drop.</div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Back</button><button class="btn pri" onclick="S.slots.find(x=>x.id==='${id}').ask=true;save();closeModal();render();toast('Sent to admin — it appears in their Requests inbox')">Ask admin</button></div>`);}
function isUnavail(date){const wd=new Date(date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short'});return S.unavailable.some(u=>u.type==='range'?(date>=u.from&&date<=u.to):u.day===wd);}
function C3(){
 const view=S.ui.calView||'list';
 const slots=S.slots.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.t-b.t);
 const byDate={};slots.forEach(s=>(byDate[s.date]=byDate[s.date]||[]).push(s));
 const soon=s=>{const dt=new Date(s.date+'T00:00:00');dt.setMinutes(s.t);return dt-new Date(TODAY+'T14:00:00')<48*3600e3;};
 const day=date=>{let h=`<div class="daycard"><div class="dh"><span>${ic('calendar','sm')}${fmtLong(date)}</span><span class="small muted">${byDate[date].length} slot${byDate[date].length>1?'s':''}</span></div>`;
  PARTS.forEach(([icn,l],pi)=>{const part=byDate[date].filter(s=>(s.t<720?0:s.t<1020?1:2)===pi);if(!part.length)return;
   h+=`<div class="timehdr">${ic(icn,'sm')}${l}</div><div class="slotgrid">`;
   part.forEach(s=>{const d=s.dId?D(s.dId):null;
    if(s.status==='booked')h+=`<div class="slot booked"><div class="st">${hhmm(s.t)} – ${hhmm(s.t+45)}${frozen(s)?' 🔒':''}</div><div class="ss">${esc(d?d.first+' · '+d.type:'Booked')}${d&&d.org?' · '+esc(ORGS[d.org].name):''}</div><div class="act">${s.move?'<span class="pill gold">Reassign requested</span>':`<a onclick="askMove('${s.id}')">Ask admin to move</a>`}</div></div>`;
    else h+=`<div class="slot ${soon(s)?'soon':''}"><div class="st">${hhmm(s.t)} – ${hhmm(s.t+45)}</div><div class="ss">${frozen(s)?'Open · locked, within 72 hours':soon(s)?'Open · too soon to be booked':'Open'}</div><div class="act">${frozen(s)?(s.ask?'<span class="pill gold">Asked admin</span>':`<a onclick="freezeAsk('${s.id}')">${ic('code-of-ethics','sm')}Ask admin to close</a>`):`<a onclick="closeSlot('${s.id}')">Close</a>`}</div></div>`;});
   h+='</div>';});
  return h+'</div>';};
 const hrs=weekHours(),min=band()[3];
 const viewSwitch=`<div class="tabs" style="margin-bottom:14px">${[['list','Day by day'],['month','Month']].map(([k,t])=>`<button aria-pressed="${view===k}" onclick="S.ui.calView='${k}';save();render()">${t}</button>`).join('')}</div>`;
 return wrap('C3',`${head(`<div class="eyebrow">Calendar</div><h2>Your availability</h2>`)}
 ${say('Open your times, and mark when you cannot work.','Clients pick a time on the Aarambh website and admin assigns. Your name is never shown next to a time.')}
 <div class="grid3" style="align-items:start">
  <div style="grid-column:span 2">${viewSwitch}${view==='month'?monthView():(Object.keys(byDate).sort().map(day).join('')||'<div class="hollow">No times open yet.</div>')}
   ${S.unavailable.length?`<div class="card"><h3>Unavailable</h3>${S.unavailable.map((u,i)=>`<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>${u.type==='range'?fmtDate(u.from)+(u.to!==u.from?' – '+fmtDate(u.to):''):'Every '+u.day}</span><button class="btn sm ghost" onclick="S.unavailable.splice(${i},1);save();render()">Remove</button></div>`).join('')}</div>`:''}</div>
  <div class="stack sticky">
   <div class="card">${ring(Math.min(1,hrs/min),hrs+' hrs','opened this week · '+band()[1],hrs>=min?'#2F5D3A':'#9A7213')}<p class="muted small" style="margin-bottom:0">${hrs>=min?'You\'ve opened your committed hours.':'Open '+(min-hrs)+' more hours to meet your commitment.'}</p></div>
   <div class="card" style="border-top:5px solid var(--stop)"><h3>${ic('put-aside','sm')} Mark unavailable</h3><p class="muted small" style="margin-top:0">Any time — even after your times are open.</p>
    <div class="grid2"><div class="field"><label>From</label><input class="f" type="date" id="un_from" value="2026-09-21"></div><div class="field"><label>To</label><input class="f" type="date" id="un_to" value="2026-09-21"></div></div>
    <div class="field"><label>Or every</label><select class="f" id="un_day"><option value="">—</option>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<option>${d}</option>`).join('')}</select></div>
    <button class="btn danger" style="width:100%" onclick="markUnavailable()">Mark unavailable</button></div>
   <div class="card"><h3>${ic('calendar','sm')} Open times</h3>
    <div class="field"><label>Date</label><input class="f" type="date" id="av_date" value="2026-09-23"></div>
    <div class="grid2"><div class="field"><label>Day starts</label><input class="f" type="time" id="av_start" value="09:00"></div><div class="field"><label>Day ends</label><input class="f" type="time" id="av_end" value="13:00"></div></div>
    <div class="field"><label>Repeat weekly for</label><select class="f" id="av_rep">${[1,2,4,8,12].map(n=>`<option value="${n}">${n===1?'Just this date':n+' weeks'}</option>`).join('')}</select></div>
    <div class="note plain small">45-minute slots with 15 minutes after each. Prep isn't blocked here.</div>
    <div class="note small" style="margin-top:8px">${ic('code-of-ethics','sm')} <b>Anything inside the next 72 hours is locked.</b> You can't close or change it on your own — ask admin, and they decide.</div>
    <button class="btn teal" style="width:100%;margin-top:12px" onclick="genSlots()">Open these times</button></div>
  </div>
 </div>`);
}
function monthShift(n){S.ui.calM=(S.ui.calM||0)+n;save();render();}
function monthView(){
 const base=new Date(2026,8,1); base.setMonth(base.getMonth()+(S.ui.calM||0));
 const y=base.getFullYear(), m=base.getMonth();
 const first=new Date(y,m,1), start=new Date(first); start.setDate(1-((first.getDay()+6)%7));   // weeks start Monday
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;   // local, never UTC
 let cells='';
 for(let i=0;i<42;i++){
  const d=new Date(start); d.setDate(start.getDate()+i); const key=iso(d);
  const out=d.getMonth()!==m;
  const day=S.slots.filter(x=>x.date===key);
  const booked=day.filter(x=>x.status==='booked').length, open=day.length-booked;
  const lock=day.some(frozen), off=isUnavail(key);
  cells+=`<button class="cal ${out?'out':''} ${key===TODAY?'today':''} ${off?'off':''}" ${out?'':`onclick="dayModal('${key}')"`}>
   <div class="dn">${d.getDate()}${key===TODAY?' <small>today</small>':''}</div>
   ${booked?`<span class="tag b">${booked} booked</span>`:''}
   ${open?`<span class="tag o">${open} open</span>`:''}
   ${lock?`<span class="tag l">locked · 72 hrs</span>`:''}
   ${off&&!day.length?'<span class="tag o">unavailable</span>':''}</button>`;
 }
 const label=base.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
 return `<div class="card"><div class="row between"><h3 style="margin:0">${ic('calendar','sm')} ${label}</h3>
  <span class="row"><button class="btn sm" onclick="monthShift(-1)">‹ Previous</button><button class="btn sm" onclick="monthShift(1)">Next ›</button></span></div>
  <div class="row small" style="margin:10px 0 12px"><span class="pill teal">booked</span><span class="pill">open</span><span class="pill gold">locked — within 72 hours</span><span class="muted">Shaded days are ones you marked unavailable</span></div>
  <div class="calhead">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div>${d}</div>`).join('')}</div>
  <div class="calgrid">${cells}</div>
  <p class="help">Click a day to open it, add times, or ask admin about anything locked.</p></div>`;
}
function dayModal(key){
 const day=S.slots.filter(x=>x.date===key).sort((a,b)=>a.t-b.t);
 const rows=day.map(sl=>{const d=sl.dId?D(sl.dId):null;const f=frozen(sl);
  return `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span><b>${hhmm(sl.t)} – ${hhmm(sl.t+45)}</b>${f?' <span class="pill gold">locked</span>':''}<br><span class="muted small">${sl.status==='booked'?esc((d?d.first+' · '+d.type:'Booked')):'Open'}</span></span>
  <span>${sl.status==='booked'?(sl.move?'<span class="pill gold">Reassign asked</span>':`<button class="btn sm" onclick="closeModal();askMove('${sl.id}')">Ask admin to move</button>`):f?(sl.ask?'<span class="pill gold">Asked admin</span>':`<button class="btn sm" onclick="closeModal();freezeAsk('${sl.id}')">Ask admin to close</button>`):`<button class="btn sm ghost" onclick="closeSlot('${sl.id}');closeModal();dayModal('${key}')">Close this slot</button>`}</span></div>`;}).join('');
 modal(`<h3>${fmtLong(key)}</h3>${isUnavail(key)?'<div class="note plain small">You marked this day unavailable.</div>':''}
 ${rows||'<p class="muted">Nothing open on this day.</p>'}
 <div class="divider"></div>
 <div class="grid2"><div class="field"><label>Add times from</label><input class="f" type="time" id="dm_s" value="10:00"></div><div class="field"><label>until</label><input class="f" type="time" id="dm_e" value="13:00"></div></div>
 ${new Date(key+'T00:00:00')-NOW < 72*3600e3 ? '<div class="note" style="margin-bottom:10px">Within 72 hours — new times here need admin too.</div>':''}
 <div class="row" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Close</button><button class="btn teal" onclick="addDay('${key}')">Open these times</button></div>`);}
function addDay(key){
 const st=mm($('dm_s').value||'10:00'), en=mm($('dm_e').value||'13:00');
 if(new Date(key+'T00:00:00')-NOW < 72*3600e3){closeModal();toast('Inside 72 hours — ask admin');return;}
 let n=0;for(let t=st;t+45<=en;t+=60){if(S.slots.some(x=>x.date===key&&x.t===t))continue;S.slots.push({id:'sl'+key+t,date:key,t,status:'open'});n++;}
 save();closeModal();render();toast(`Opened ${n} slot${n===1?'':'s'}`);}
function genSlots(){
 const date=$('av_date').value,st=mm($('av_start').value||'09:00'),en=mm($('av_end').value||'13:00'),rep=+$('av_rep').value;let n=0;
 for(let w=0;w<rep;w++){const d=addDays(date,7*w);if(isUnavail(d))continue;for(let t=st;t+45<=en;t+=60){if(S.slots.some(x=>x.date===d&&x.t===t))continue;S.slots.push({id:'sl'+d+t,date:d,t,status:'open'});n++;}}
 save();render();toast(`Opened ${n} slot${n===1?'':'s'}`);
}
function closeSlot(id){S.slots=S.slots.filter(s=>s.id!==id);save();render();toast('Slot closed');}
function markUnavailable(){
 const day=$('un_day').value,from=$('un_from').value,to=$('un_to').value||from;
 const u=day?{type:'day',day}:{type:'range',from,to};
 const hit=s=>u.type==='range'?(s.date>=u.from&&s.date<=u.to):new Date(s.date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short'})===u.day;
 const booked=S.slots.filter(s=>hit(s)&&s.status==='booked'),open=S.slots.filter(s=>hit(s)&&s.status!=='booked');
 const apply=(reassign)=>{S.unavailable.push(u);S.slots=S.slots.filter(s=>!(hit(s)&&s.status!=='booked'));if(reassign)booked.forEach(s=>s.move=true);save();closeModal();render();};
 window._unApply=apply;
 if(!booked.length){apply(false);toast(`Marked unavailable · ${open.length} open slot${open.length===1?'':'s'} closed`);return;}
 const late=booked.some(s=>{const dt=new Date(s.date+'T00:00:00');dt.setMinutes(s.t);return dt-new Date(TODAY+'T14:00:00')<48*3600e3;});
 modal(`<h3>You have ${booked.length} booked debrief${booked.length>1?'s':''} on ${booked.length>1?'these dates':'this date'}</h3>
  ${booked.map(s=>{const d=D(s.dId);return `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><span><b>${esc(d.first)}</b> · ${fmtDate(s.date)} ${hhmm(s.t)}</span></div>`;}).join('')}
  <p>Ask admin to reassign ${booked.length>1?'them':'it'}, or keep ${booked.length>1?'them':'it'} and change your unavailable dates?</p>
  ${late?'<div class="note stop small">One is <b>under 48 hours</b> away. Reassigning now counts as a <b>late drop</b>: it\'s logged, and you\'ll appear lower in admin\'s list for 30 days.</div>':''}
  <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" onclick="closeModal()">Keep them · change my dates</button><button class="btn danger" onclick="_unApply(true);toast('Reassign requested')">Ask admin to reassign</button></div>`);
}
function askMove(id){modal(`<h3>Ask admin to move this debrief</h3><p>You can't cancel a booked slot yourself. Admin reassigns it and tries to keep the client's time.</p><div class="field"><label>Why</label><textarea class="f"></textarea></div><div class="note plain small">Under 48 hours counts as a late drop.</div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" onclick="closeModal()">Back</button><button class="btn pri" onclick="S.slots.find(s=>s.id==='${id}').move=true;save();closeModal();render();toast('Move request sent')">Send request</button></div>`);}

/* =====================================================================
   C4 · My debriefs
   ===================================================================== */
function C4(){
 const tab=S.ui.c4tab,q=(S.ui.c4q||'').toLowerCase();
 const need=d=>['assigned','debriefed','sentback'].includes(d.status),up=d=>['assigned','prep'].includes(d.status),done=d=>['after','validated','closed','cancel_early','cancel_late','noshow'].includes(d.status);
 let list=S.debriefs.filter(d=>tab==='up'?up(d):tab==='need'?need(d):done(d)).filter(d=>!q||d.first.toLowerCase().includes(q));
 list.sort((a,b)=>tab==='done'?(b.date+b.time).localeCompare(a.date+a.time):(a.date+a.time).localeCompare(b.date+b.time));
 const cnt=f=>S.debriefs.filter(f).length;
 const target=d=>d.coaching?'C12':['assigned','prep'].includes(d.status)?'C5':d.status==='sentback'?'C8':'C7';
 const action=d=>{const s=d.status;
  if(d.coaching)return `<button class="btn sm teal" onclick="event.stopPropagation();go('C12')">Open session</button>`;
  if(s==='assigned')return `<button class="btn sm pri" onclick="event.stopPropagation();S.cur='${d.id}';go('C5')">Prep guide</button>`;
  if(s==='prep')return `<button class="btn sm teal" onclick="event.stopPropagation();startRun('${d.id}')">Live mode</button>`;
  if(s==='debriefed')return `<button class="btn sm pri" onclick="event.stopPropagation();S.cur='${d.id}';go('C7')">Finish</button>`;
  if(s==='sentback')return `<button class="btn sm danger" onclick="event.stopPropagation();S.cur='${d.id}';go('C8')">Revise letter</button>`;
  return '';};
 return wrap('C4',`${head(`<div class="eyebrow">My debriefs</div><h2>Everything assigned to you</h2>`)}
 ${say('Admin assigns from the times you open.','There is no accept step — if something is wrong, ask admin to move it.')}
 <div class="row between" style="margin-bottom:12px">
  <div class="tabs" style="margin:0">${[['up','Upcoming',cnt(up)],['need','Needs action',cnt(need)],['done','Done',cnt(done)]].map(([k,t,n])=>`<button aria-pressed="${tab===k}" onclick="S.ui.c4tab='${k}';save();render()">${t} · ${n}</button>`).join('')}</div>
  <input class="f" id="c4q" style="max-width:320px" placeholder="Search by first name" value="${esc(S.ui.c4q)}" oninput="S.ui.c4q=this.value;save();clearTimeout(window._q);window._q=setTimeout(()=>{render();const i=$('c4q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}},300)">
 </div>
 <div class="tscroll"><table class="t"><thead><tr><th>When</th><th>Client</th><th>Engagement</th><th>Report</th><th>Integrity</th><th>Status</th><th></th></tr></thead><tbody>
 ${list.map(d=>{const [l,c]=statusLabel(d.status);return `<tr class="click" onclick="S.cur='${d.id}';go('${target(d)}')">
  <td><b>${fmtDate(d.date)}</b><br><span class="muted small">${hhmm(mm(d.time))}</span></td>
  <td><b>${esc(d.first)}</b><br><span class="muted small">${esc(d.type)}${d.type==='Can\'t say'?' → Mid-management report':''} · ${esc(d.lang)}</span></td>
  <td>${d.org?`<span class="pill teal">${ic('organisation','sm')}${esc(ORGS[d.org].name)}</span>`:'<span class="muted small">Individual</span>'}${d.pack?`<br><span class="pill gold">${ic('session','sm')}${d.pack}-session pack</span>`:''}</td>
  <td>${d.coaching?'<span class="pill maroon">Coaching</span>':`${esc(d.report)}${d.ver&&d.ver!==d.type?`<br><span class="muted small">${esc(d.ver)} version</span>`:''}`}</td>
  <td>${integPill(d.integ)}</td><td><span class="pill ${c}">${l}</span></td><td style="text-align:right">${action(d)}</td></tr>`;}).join('')||'<tr><td colspan="7" class="muted">Nothing here.</td></tr>'}
 </tbody></table></div>
 <div class="grid3" style="margin-top:18px">
  <div class="note plain small"><b>Invalid reports never reach you.</b> They're stopped at assigning.</div>
  <div class="note plain small"><b>One report per debrief.</b> Team reports aren't in this prototype.</div>
  <div class="note plain small"><b>After Closed</b>, the report link closes. Your own notes stay.</div>
 </div>`);
}

/* =====================================================================
   C5 · Prepare — the Prep guide
   ===================================================================== */
const PRACTICE={id:'practice',first:'Practice',full:'Synthetic client',type:'Executive',report:'Trayi',ver:'Executive',integ:'Caution',date:TODAY,time:'15:00',status:'prep',lang:'English',sitting:'core'};
function curD(){if(S.cur==='practice')return PRACTICE;return D(S.cur)||S.debriefs.find(d=>d.status==='assigned'&&!d.coaching);}
let QID=0;const qid=()=>'q'+Date.now().toString(36)+(QID++);
function P(id){
 if(!S.prep[id]){
  S.prep[id]={understanding:'',notes:'',caution:false,done:false,added:null,q:[
   {id:qid(),step:'E',q:'When you first read your report, what did you notice?',why:'General routine',note:'',src:'bank'},
   {id:qid(),step:'U',q:'What would you like to try in the next month?',why:'General routine',note:'',src:'bank',opts:[{l:'Something small',f:'What is the smallest first step?'},{l:'A bigger change',f:'What would need to be true for that?'},{l:'Not sure yet',f:'What would help you decide?'}]}]};
  if(id==='d2'){Object.assign(S.prep[id],{caution:true,done:true,understanding:'Caution reading: some answers don\'t line up. Treat everything as worth checking with Arjun.'});}
 }
 return S.prep[id];
}
// a reading loaded from Aarambh is kept with the debrief, so the probe points survive a reload (16 Oct 2026)
function readingFor(id){const k=id==='practice'?'d2':id;const L=S.loaded&&S.loaded[k];return (L&&L.traits)||READINGS[k]||[];}
function points(d){
 const pts=[];const r=readingFor(d.id);
 if(d.integ==='Caution')pts.push({kind:'check',title:'Integrity: Caution',detail:'Some answers point different ways — check, don\'t assume',trait:null,why:'A discrepancy or misalignment',qs:[{step:'E',q:'Some of your answers pointed in different directions — which parts of the report felt most like you?'}]});
 const fit=t=>{const x=r.find(y=>y.t===t); const isFit=(x&&x.lane)?x.lane==='Fit':FIT.includes(t); return isFit?' · Fit lane — design around, never "develop"':'';};
 r.filter(x=>x.L<=1).forEach(x=>pts.push({kind:'high',title:`Strong reading · ${x.t} (L${x.L})`,detail:'One of the highest in this report'+fit(x.t),trait:x.t,why:'A specific high score',qs:[{step:'T',q:`Where do you see ${x.t.toLowerCase()} show up in your week?`},{step:'T',q:`When has this helped you — and when has it got in the way?`}]}));
 r.filter(x=>x.L>=4).forEach(x=>pts.push({kind:'low',title:`Low reading · ${x.t} (L${x.L})`,detail:'One of the lowest in this report'+fit(x.t),trait:x.t,why:'A specific low score',qs:[{step:'T',q:`When does ${x.t.toLowerCase()} feel harder for you?`,opts:[{l:'Often',f:'Tell me about the last time.'},{l:'Sometimes',f:'What makes the difference?'},{l:'Rarely',f:'What helps it go well?'}]}]}));
 r.filter(x=>x.median).forEach(x=>pts.push({kind:'median',title:`Median · ${x.t}`,detail:'They sat on the fence, so this one is unread — acknowledge it, ask where they actually sit, and record what you hear',trait:x.t,why:'A median answer',capture:true,qs:[{step:'T',q:`On ${x.t.toLowerCase()}, the sitting couldn't read you either way — where do you actually sit?`,opts:[{l:'More like me',f:'Where does that show up?'},{l:'Depends on the situation',f:'Which situations bring it out?'},{l:'Not really me',f:'What would you say instead?'}]}]}));
 r.filter(x=>x.caret).forEach(x=>pts.push({kind:'caret',title:`Caret · ${x.t}`,detail:'The report marks this for attention',trait:x.t,why:'A caret',qs:[{step:'T',q:`Your report marks ${x.t.toLowerCase()} — how does that sit with you?`}]}));
 r.filter(x=>x.gap==='probe').forEach(x=>pts.push({kind:'must',title:`Must probe · ${x.t}`,detail:'Aarambh marks a wide gap here — surface it with a behavioural question. Don\'t design an intervention',trait:x.t,why:'A discrepancy or misalignment',qs:[{step:'T',q:`Tell me about a recent time ${x.t.toLowerCase()} mattered — what did you actually do?`}]}));
 r.filter(x=>x.gap==='check').forEach(x=>pts.push({kind:'check',title:`Check · ${x.t}`,detail:'Aarambh marks this worth attending to — verify it with them',trait:x.t,why:'A discrepancy or misalignment',qs:[{step:'T',q:`Does this reading of ${x.t.toLowerCase()} match how you see yourself?`,opts:[{l:'Yes',f:'Where do you see it most?'},{l:'Partly',f:'Which part fits, and which doesn\'t?'},{l:'No',f:'How would you describe yourself instead?'}]}]}));
 const BUCKET={check:'clarify',median:'clarify',caret:'clarify',must:'probe',low:'probe',high:'build'};
 pts.forEach(x=>x.bucket=BUCKET[x.kind]||'clarify');
 const order={check:0,must:1,caret:2,median:3,high:4,low:5};
 if(pts.length&&pts[0].kind==='check'&&pts[0].title.startsWith('Integrity')){const c=pts.shift();pts.sort((a,b)=>order[a.kind]-order[b.kind]);pts.unshift(c);}
 else pts.sort((a,b)=>order[a.kind]-order[b.kind]);
 return pts;
}
/* ---- taking in an Aarambh JSON ---------------------------------------
   Accepts the agreed payload (GYS_Aarambh_to_SETU_Payload_v1.0.md) and also the
   raw pulse-log shape, so a file from Aarambh today still loads. ------- */
function normalise(raw){
 const rep2={found:[],missing:[],dropped:[]};
 const t0=raw.traits||[];
 if(raw.pulses)rep2.dropped.push(`pulses — ${raw.pulses.length} screens of raw answers, not needed and not kept`);
 if(raw.candidate&&raw.candidate.email)rep2.dropped.push('candidate.email — never stored in SETU');
 if(raw.candidate&&raw.candidate.fullName)rep2.dropped.push('candidate.fullName — SETU keeps a first name only');
 const traits=t0.map(t=>{
  const o={t:t.name||t.traitName};
  if(t.level!=null)o.L=+String(t.level).replace(/[^0-9]/g,'');
  if(t.lane)o.lane=t.lane;
  if(t.caret||t.flagged)o.caret=true;
  if(t.gapBand&&t.gapBand!=='none')o.gap=t.gapBand;
  else if(typeof t.gap==='number')o.gap=t.gap>20?'probe':t.gap>=10?'check':null;
  if((t.status||'')==='median')o.median=true;
  return o;});
 const has=k=>t0.some(t=>t[k]!=null)||(k==='name'&&t0.some(t=>t.traitName!=null))||(k==='caret'&&t0.some(t=>t.flagged!=null));
 [['name/traitName','name'],['level','level'],['lane','lane'],['gapBand','gapBand'],['gap','gap'],['status','status'],['caret','caret'],['flagged','flagged']]
  // gap and flagged are the raw pulse log's names; a payload that carries gapBand and caret is not missing them
  .filter(([label,k])=>!((k==='gap'&&has('gapBand'))||(k==='flagged'&&has('caret'))||(k==='gapBand'&&has('gap'))||(k==='caret'&&has('flagged'))))
  .forEach(([label,k])=>{ (has(k)?rep2.found:rep2.missing).push(label); });
 if(!has('level'))rep2.missing.push('— without level, high and low readings cannot be shown');
 if(!has('lane'))rep2.missing.push('— without lane, the "never develop a Fit trait" rule cannot run');
 // the report pages: payload v1.1 sends a list (Pancha Bhuta and Trayi); v1.0 sends one
 const reports=(Array.isArray(raw.reports)&&raw.reports.length?raw.reports:(raw.report&&raw.report.url?[raw.report]:[]))
  .filter(r=>r&&r.url).flatMap(r=>{const type=r.type||r.reportType||'Report';
   // 16 Oct 2026: every link is either the PERSON'S COPY (what they read) or the COACH COPY (numbers, cost lines,
   // what they opened). Payload B1 sends a coachUrl beside the url; until then the rig's links say which they are.
   const base={ver:r.version||''};
   const isCoach=r.audience==='coach'||/coach view/i.test(type)||/[?&](as=coach|pbcoach=)/.test(r.url);
   const out=[{...base,type:type.replace(/\s*·\s*coach view/i,''),url:r.url,who:isCoach?'coach':'person'}];
   if(r.coachUrl)out.push({...base,type,url:r.coachUrl,who:'coach'});
   return out;});
 // payload v1.2: what the person opened themselves, most opened first. A coach's own opens are never in it.
 const opened=(Array.isArray(raw.opened)?raw.opened:[]).filter(o=>o&&o.name)
  .map(o=>({report:o.report||'',kind:o.kind||'',name:o.name,band:o.band||'',times:+o.times||1}));
 if(Array.isArray(raw.opened))rep2.found.push('opened');
 return {traits:traits.filter(x=>x.t),report:raw.report||{},reports,opened,person:raw.person||raw.candidate||{},sitting:raw.sitting||{},rep:rep2};
}
function loadReading(){
 modal(`<h3>${ic('prepare','sm')} Load a reading from Aarambh</h3>
 <p class="muted">Drop in the JSON Aarambh sends. SETU reads the finished reading only — anything else in the file is ignored and not kept.</p>
 <div class="field"><label>From the Aarambh rig on this laptop</label>
  <div class="row" style="gap:8px;flex-wrap:wrap"><select class="f" id="rdsit" style="flex:1 1 260px;min-width:0"><option value="">Looking for sittings…</option></select>
  <button class="btn teal" onclick="fromRig()">Load this sitting</button></div>
  <p class="help" style="margin:6px 0 0">Laptop testing: the Aarambh rig must be running (START THE RIG). Its report pages open in the split screen.</p></div>
 <div class="field"><label>Choose a file</label><input class="f" type="file" id="rdfile" accept="application/json" onchange="readFile(this)"></div>
 <div class="field"><label>Or paste it here</label><textarea class="f" id="rdtext" style="min-height:120px" placeholder='{"version":"1.0","traits":[...]}'></textarea></div>
 <div id="rdout"></div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Back</button><button class="btn teal" onclick="useReading()">Read it</button></div>`);listRig();}
// ---- the Aarambh rig on this laptop (testing only) — 29 Sep 2026 -------------------------------
// setu.php lists the completed sittings and hands over the finished reading for one of them, with a
// read-only link to each report page. SETU still derives nothing: level, lane and gap band come from Aarambh.

function readFile(el){const f=el.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{$('rdtext').value=e.target.result;useReading(true);};r.readAsText(f);}
function useReading(auto){
 let raw;try{raw=JSON.parse($('rdtext').value);}catch(e){$('rdout').innerHTML=`<div class="note stop small">That isn't valid JSON — ${esc(e.message)}</div>`;return;}
 const n=normalise(raw);
 if(!n.traits.length){$('rdout').innerHTML='<div class="note stop small">No traits found. SETU needs a <b>traits</b> list.</div>';return;}
 const d=curD(); READINGS[d.id]=n.traits; S.loaded=S.loaded||{}; S.loaded[d.id]={rep:n.rep,when:'just now',n:n.traits.length,traits:n.traits,reports:n.reports,opened:n.opened,sitting:n.sitting.sittingId||''};S.ui.repTab=0;
 const dd=D(d.id);
 if(dd){ if(n.report.integrity)dd.integ=n.report.integrity;
  if(n.report.reportType)dd.report=n.report.reportType;
  if(n.report.version)dd.ver=n.report.version;
  if(n.person.clientType)dd.type=n.person.clientType;
  if(n.person.firstName){dd.first=n.person.firstName;
   // a payload carries a first name only, so it replaces the whole line rather than borrowing the sample's surname
   dd.full=n.person.personId?n.person.firstName:n.person.firstName+(dd.full.split(' ')[1]?' '+dd.full.split(' ')[1]:'');}
  if(n.person.language)dd.lang=n.person.language;
  if(n.sitting.sittingType)dd.sitting=n.sitting.sittingType; }
 const pts=points(d);
 $('rdout').innerHTML=`<div class="note ok small" style="margin-top:10px"><b>${n.traits.length} traits read.</b> SETU's rules turn them into <b>${pts.length} probe points</b> and suggested questions.</div>
  <div class="grid2" style="margin-top:10px"><div class="card"><h4 style="font-size:16px">Fields used</h4><p class="small" style="margin:0">${n.rep.found.map(esc).join(' · ')||'—'}</p></div>
  <div class="card"><h4 style="font-size:16px">Missing or dropped</h4><p class="small" style="margin:0">${[...n.rep.missing,...n.rep.dropped].map(esc).join('<br>')||'nothing'}</p></div></div>`;
 save();
 if(!auto)setTimeout(()=>{closeModal();render();toast(`Reading loaded — ${pts.length} probe points`);},900);
}
function checkQ(t){const s=(t||'').trim(),out=[];if(!s)return out;
 if(/\b(you should|you must|you need to|you have to)\b/i.test(s))out.push('directive — explain, never direct');
 if(/^(do|does|did|is|are|was|were|have|has|can|will|would|could)\b/i.test(s))out.push('closed start — try "What…" or "How…"');
 if(/^why (didn't|don't|did not|do not|haven't|won't)/i.test(s))out.push('blaming "why"');
 if((s.match(/\?/g)||[]).length>1)out.push('two questions in one');
 if(/\bL[0-5]\b|\d+\s?%|\bscore\b|\blevel\b/i.test(s))out.push('mentions levels or numbers');
 return out;}
const STEPHINT={E:'Empathise — feelings, open',T:'Think — explore the report',U:'Undertake — their own next step'};
function addQ(id,q){const p=P(id);const exists=p.q.some(x=>x.q===q.q);if(exists){toast('Already in your questions');return;}const n={id:qid(),note:'',src:'guide',...q};p.q.push(n);p.added=n.id;save();render();setTimeout(()=>{const el=$('qi-'+n.id);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});},60);toast('Added under '+{E:'Empathise',T:'Think',U:'Undertake'}[q.step]);}
/* ---- The coach reads the report — 16 Oct 2026 (MS: "#build the SETU coach reading pieces") ----------------
   Every report link is the PERSON'S COPY (exactly what they read) or the COACH COPY (Aarambh's coach view: numbers,
   cost lines, the four voices, what they opened). The coach copy opens only once the data undertaking is signed
   (DPDP non-negotiable 4), never in Present mode, and nothing in the report view prints, saves or downloads.
   Numbers live inside the coach copy only — SETU's own screens still show none (G9 of the SETU build list). */
function undSigned(){return !!(S.und&&S.und.signed);}
function repList(d){return (S.loaded&&S.loaded[d.id]&&S.loaded[d.id].reports)||[];}
function repPane(d,o={}){
 const LR=repList(d),ok=undSigned(),present=!!o.present;
 if(!LR.length)return `<div class="report-ph" style="min-height:${o.height||'620px'}"><b>Aarambh report page shows here</b><p>Read-only · rendered by Aarambh · the written firewall exception</p><p class="small">Load a reading from the Aarambh rig (Where to probe → Load a reading) and ${esc(d.first)}'s reports open here — their own copy, and your coach copy.</p></div>`;
 let rt=Math.min(S.ui.repTab||0,LR.length-1);
 if(present&&LR[rt].who==='coach'){const same=LR.findIndex(x=>x.who==='person'&&x.type===LR[rt].type);rt=same>=0?same:LR.findIndex(x=>x.who==='person');}   // Present mode never shows the coach copy
 const tab=(x,i)=>{const lock=x.who==='coach'&&!ok;
  return `<button class="btn sm ${i===rt?(x.who==='coach'?'gold':'teal'):''} ${lock?'tlock':''}" aria-pressed="${i===rt}" title="${lock?'Sign the data undertaking to open the coach copy':''}" onclick="S.ui.repTab=${i};save();render()">${esc(x.type)}${lock?' · locked':''}</button>`;};
 const grp=(who,label,help)=>{const xs=LR.map((x,i)=>[x,i]).filter(([x])=>x.who===who);if(!xs.length)return '';
  return `<div class="repgrp ${who}"><div class="repgrp-h"><b>${label}</b><span class="muted small">${help}</span></div><div class="reptabs">${xs.map(([x,i])=>tab(x,i)).join('')}</div></div>`;};
 const tabs=grp('person',`What ${esc(d.first)} reads`,'Their own copy · safe to share on screen')
  +(present?'':grp('coach','Coach copy · only you','All four voices and what they opened · Trayi adds numbers, cost lines and the reliability strip'));
 const zoom=o.tools?`<div class="row" style="gap:6px;justify-content:flex-end;margin:0 0 8px">
     <button class="btn sm ghost" title="Smaller" onclick="repZoom(-10)">−</button><span class="muted small">${S.ui.repZoom||100}%</span><button class="btn sm ghost" title="Bigger" onclick="repZoom(10)">+</button>
     <button class="btn sm ${S.ui.repFull?'pri':''}" onclick="S.ui.repFull=!S.ui.repFull;save();render()">${S.ui.repFull?'Back to the questions':'Read it full width'}</button></div>`:'';
 if(rt<0)return tabs+`<div class="hollow">No copy of ${esc(d.first)}'s own report came with this reading.</div>`;
 const x=LR[rt];
 if(x.who==='coach'&&!ok)return tabs+`<div class="lockbox repframe" style="height:${o.height||'640px'};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px">
   ${ic('consent','lg')}<b style="font-family:Georgia,serif;font-size:22px;color:#433C35;margin-top:10px">The coach copy is locked</b>
   <p style="max-width:none;margin:8px 0 14px">It carries what ${esc(d.first)} opened and, in Trayi, their numbers. It opens once you have signed the data undertaking ${UNDERTAKING.ver}.<br>${esc(d.first)}'s own copy is open above.</p>
   <button class="btn pri" onclick="go('S1')">Sign the undertaking (S1)</button></div>`;
 const banner=x.who==='coach'
  ?`<div class="note small" style="margin:0 0 8px"><b>Coach copy — for your eyes only.</b> Anything here that ${esc(d.first)}'s own copy does not show — numbers, cost lines, what they opened — is for your reading only. Never say a number to them, and never copy one into your notes or the letter. Nothing here prints or saves.</div>`
  :`<div class="note teal small" style="margin:0 0 8px"><b>${esc(d.first)}'s own copy</b> — exactly what they read. This is the copy Present mode shares.</div>`;
 return tabs+zoom+banner
  // sandbox without allow-modals / allow-downloads: the page inside cannot open a print dialog or save a file
  +`<iframe class="repframe" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="no-referrer" style="height:${o.height||'640px'};zoom:${(S.ui.repZoom||100)/100}" src="${esc(x.url)}" title="${esc(x.type)} — ${x.who==='coach'?'coach copy':'their copy'} — Aarambh report" onload="this.dataset.ok=1"></iframe>`
  +(/^file:/.test(x.url)&&location.protocol!=='file:'?`<div class="note small" style="margin-top:8px">This is a file on your laptop, and a page served over http cannot show it in a frame. Open the rig by double-clicking the file instead.</div>`:'');
}
function openedList(d){
 const L=S.loaded&&S.loaded[d.id];if(!L)return '';
 const O=L.opened||[];const ok=undSigned();
 const head=`<div class="row between"><h3 style="margin:0">${ic('library','sm')} What ${esc(d.first)} opened</h3><span class="pill ${O.length?'teal':''}">${O.length}</span></div>`;
 if(!ok)return `<div class="card lockbox" style="margin-bottom:18px">${head}<p class="small" style="margin:6px 0 0">Locked until you sign the data undertaking ${UNDERTAKING.ver} — it is part of the coach copy. <button class="btn sm" onclick="go('S1')">Sign it (S1)</button></p></div>`;
 const coachIdx=r=>repList(d).findIndex(x=>x.who==='coach'&&x.type.toLowerCase().startsWith(String(r).toLowerCase().split(' ')[0]));
 const row=o=>{const ci=coachIdx(o.report);
  return `<div class="opened-row"><div><b>${esc(o.name)}</b><div class="muted small">${esc(o.report)}${o.kind?' · '+esc(o.kind):''}${o.band?' · '+esc(o.band):''}</div></div>
   <div class="row" style="gap:8px"><span class="pill">${o.times===1?'Opened once':'Opened '+o.times+' times'}</span>${ci>=0?`<button class="btn sm" onclick="S.ui.repTab=${ci};S.ui.hideRep=false;save();render()">See it in the coach copy</button>`:''}</div></div>`;};
 return `<div class="card" style="margin-bottom:18px;border-top:5px solid var(--teal)">${head}
  <p class="help" style="margin:4px 0 10px">Jobs, groups of jobs and situations ${esc(d.first)} opened in their own reports, most opened first. Your own opens are never counted. Start where they were already curious — ask, don't announce what they looked at.</p>
  ${O.length?O.map(row).join(''):`<div class="hollow small" style="padding:12px 16px">${esc(d.first)} hasn't opened anything in their reports yet.</div>`}</div>`;
}
// 17 Oct 2026 (MS): the integrity read was missing from what the coach reads. It sits at the top of the Prep guide,
// with the retake beside it — most retake calls start here. Aarambh's word only; the fuller read is the Trayi coach
// copy's reliability strip (Pancha Bhuta's coach view does not carry it yet — Aarambh to add).
function integCard(d){
 const w=d.integ||'—', A=AF(d.id); A.retake=A.retake||{};
 const mean={Reliable:'The answers hang together. Read the report as written — still check, never tell.',
  Caution:'Parts of the sitting are less steady. Treat every point as something to check with them, never to assume.'}[w]||'No integrity read came with this reading.';
 const ti=repList(d).findIndex(x=>x.who==='coach'&&/trayi/i.test(x.type));
 const called=A.retake.offered;
 return `<div class="card" style="margin-bottom:18px;border-left:5px solid ${w==='Reliable'?'var(--ok)':w==='Caution'?'var(--gold)':'var(--stop)'}">
  <div class="row between" style="align-items:flex-start;gap:18px;flex-wrap:wrap">
   <div style="flex:1 1 420px"><div class="row" style="gap:10px"><h3 style="margin:0">${ic('consent','sm')} Integrity read</h3>${integPill(w)}<span class="muted small">from Aarambh — how steady the sitting was</span></div>
    <p style="margin:8px 0 0;font-size:17px">${mean}</p>
    <p class="help" style="margin:6px 0 0">The fuller read — which parts of the sitting are less steady — is on the Trayi coach copy's reliability strip.${ti>=0?(undSigned()?` <button class="btn sm" onclick="S.ui.repTab=${ti};S.ui.hideRep=false;save();render()">Open it</button>`:' Sign the undertaking to open it.'):''} Pancha Bhuta's coach view does not show it yet.</p></div>
   <div style="flex:1 1 340px;text-align:left">${called
    ?`<div class="note" style="margin:0"><b>Retake called</b> ${A.retake.at==='live'?'during the debrief':'while reading the report'}. <b>No debrief happens on this reading.</b> It waits for the new sitting; then you prepare afresh.<br><span class="small">${esc(A.retake.why)}</span></div>`
    :`<div class="note plain" style="margin:0"><b>Does this reading fit them?</b> If the integrity read or the report says the sitting did not catch them, call a retake now — before the debrief. One call per person is yours.<div class="row" style="margin-top:10px"><button class="btn gold" onclick="offerRetake('${d.id}')">This reading needs retaking</button></div></div>`}</div>
  </div></div>`;}
function C5(){
 const d=curD();if(!d)return wrap('C4','<div class="hollow">No debrief selected.</div>');
 const p=P(d.id),pts=points(d),org=d.org?ORGS[d.org]:null;
 const top=`<div class="card" style="margin-bottom:18px;background:linear-gradient(90deg,var(--maroon-soft),#fff);border-left:5px solid var(--maroon)"><div class="row between">
  <div><div class="eyebrow" style="color:var(--maroon)">${esc(d.full)}</div><div class="row" style="gap:10px"><span class="big" style="font-size:28px">${esc(d.first)}</span><span class="pill">${esc(d.type)}</span><span class="pill">${esc(d.report)}${d.ver&&d.ver!==d.type?` · ${esc(d.ver)} version`:''}</span><span class="pill">Sitting: ${d.sitting}</span>${integPill(d.integ)}${org?`<span class="pill teal">${ic('organisation','sm')}${esc(org.name)}</span>`:''}${d.pack?`<span class="pill gold">${ic('session','sm')}${d.pack}-session pack bought</span>`:''}${d.consent?`<span class="pill ${d.consent==='none'?'gold':''}">${ic(CONSENT[d.consent][4],'sm')}Chosen at booking: ${CONSENT[d.consent][0]}</span>`:''}</div></div>
  <div style="text-align:right"><div class="eyebrow">Debrief</div><b>${d.date===TODAY?'Today':fmtDate(d.date)} · ${hhmm(mm(d.time))}</b><br><span class="muted small">${esc(d.lang)}</span></div></div></div>`;
 const integ=integCard(d);
 const packNote=d.pack?`<div class="note" style="margin-bottom:14px"><b>${esc(d.first)} bought a ${d.pack}-session coaching pack at purchase.</b> The sessions are already theirs — <b>never sell</b>. Plan this debrief knowing there is more time with them afterwards.</div>`:'';
 const orgBrief=org?`<div class="note teal" style="margin-bottom:14px"><b>${esc(org.name)} — organisation brief.</b> ${esc(org.brief)}</div>`:'';
 const caution=d.integ==='Caution'?`<div class="note" style="margin-bottom:14px"><b>This reading is marked Caution.</b> Read everything as something to check with ${esc(d.first)}.<label class="check ${p.caution?'on':''}" style="margin:10px 0 0"><input type="checkbox" ${p.caution?'checked':''} onchange="P('${d.id}').caution=this.checked;save();render()"><span><b>I'll check, not assume, as I read this out</b></span></label></div>`:'';
 const BUCKETS=[['clarify','Clarify','Ask them what this means — the report is unsure, or it marks it','probe-point',''],
  ['probe','Probe further','Go behavioural — what did they actually do','prepare','gold'],
  ['build','Build on','What is already working, and where it shows','level','ok']];
 const qLine=(pt,q)=>{const inQ=p.q.some(x=>x.q===q.q);
  const step=({E:'Empathise',T:'Think',U:'Undertake'})[q.step];
  const payload=esc(JSON.stringify({...q,why:pt.why,note:pt.trait||pt.title}));
  const btn=inQ?'<span class="pill ok">✓ Added</span>'
   :'<button class="btn sm teal" onclick=\'addQ('+JSON.stringify(d.id)+','+payload+')\'>＋ Add</button>';
  return '<div class="sq"><span>“'+esc(q.q)+'” <span class="muted small">· '+step+(q.opts?' · with options':'')+'</span></span>'+btn+'</div>';};
 const ptCard=(pt,hidden)=>'<div class="point '+pt.kind+'"'+(hidden?' style="display:none"':'')+'>'
   +'<div class="row between"><b>'+esc(pt.title)+'</b><span class="pill '+(pt.capture?'gold':'')+'">'+(pt.capture?'Capture where they sit':esc(pt.why))+'</span></div>'
   +'<div class="muted small">'+esc(pt.detail)+'</div>'+pt.qs.map(q=>qLine(pt,q)).join('')+'</div>';
 const group=([bk,title,note,icn,cls])=>{const g=pts.filter(x=>x.bucket===bk);if(!g.length)return '';
  const cap=S.ui.allPts?999:(bk==='build'?2:4);
  return '<div style="margin:18px 0 6px"><div class="row between"><h4 style="margin:0">'+ic(icn,'sm')+' '+title+'</h4>'
   +'<span class="pill '+cls+'">'+g.length+'</span></div><p class="help" style="margin:2px 0 8px">'+note+'</p></div>'
   +g.map((pt,i)=>ptCard(pt,i>=cap)).join('')
   +(g.length>cap?'<p class="help">'+(g.length-cap)+' more in this group</p>':'');};
 const loadedNote=(S.loaded&&S.loaded[d.id])
   ? '<div class="note ok small" style="margin:10px 0">Reading loaded from a file — '+S.loaded[d.id].n+' traits. '
     +(S.loaded[d.id].rep.missing.length?'<b>Missing from the file:</b> '+esc(S.loaded[d.id].rep.missing.slice(0,3).join(' · ')):'Everything the rules need was present.')+'</div>' : '';
 const probe='<div class="card"><div class="row between"><h3 style="margin:0">'+ic('probe-point','sm')+' Where to probe</h3>'
  +'<span class="row"><span class="pill teal">'+pts.length+' points from the report</span>'
  +'<button class="btn sm" onclick="loadReading()">Load a reading (JSON)</button></span></div>'
  +loadedNote
  +'<p class="help" style="margin:4px 0 12px">SETU reads the finished results and applies Gyani Says\' coaching rules. You decide what to ask.</p>'
  +(pts.length?BUCKETS.map(group).join(''):'<div class="hollow">No results available for this report.</div>')
  +(pts.length>10?'<button class="btn" style="width:100%;margin-top:10px" onclick="S.ui.allPts=!S.ui.allPts;save();render()">'+(S.ui.allPts?'Show fewer':'Show every point from the report ('+pts.length+')')+'</button>':'')
  +'<p class="help">Clarify, probe, build on — then your own questions. Nothing is dropped; the rest is folded away.</p></div>';
 // THE REAL PAGE, drawn by Aarambh and shown read-only — the written firewall exception. One tab per report.
 const LR=repList(d);
 const reportPane=repPane(d,{height:S.ui.repFull?'78vh':'640px',tools:true});
 const showRep=S.view==='split'&&!S.ui.hideRep;
 const openBtns=LR.map((x,i)=>x.who==='coach'&&!undSigned()?'':`<button class="btn sm ${x.who==='coach'?'gold':'pri'}" onclick="window.open('${esc(x.url)}','gysreport','width=1200,height=900,noopener')">Open ${esc(x.type)}${x.who==='coach'?' · coach copy':''} ↗</button>`).join('');
 const tools=`<div class="splittools">${S.view==='split'?`${openBtns}<button class="btn sm" onclick="S.ui.hideRep=!S.ui.hideRep;save();render()">${S.ui.hideRep?'◧ Show report':'◨ Hide report'}</button><button class="btn sm" onclick="S.ui.swap=!S.ui.swap;save();render()">⇄ Swap sides</button><span class="muted small" style="align-self:center">Drag the middle line to resize</span>`:`${LR.length?openBtns:`<button class="btn sm" onclick="toast('Load a reading first')">Open Aarambh report ↗</button>`}`}</div>`;
 const openedCard=openedList(d);
  const topArea=(showRep&&S.ui.repFull)?`<div>${reportPane}</div>`:showRep?`<div class="splitwrap" style="flex-direction:${S.ui.swap?'row-reverse':'row'}"><div class="pane-r" id="paneR" style="width:${S.ui.splitW}%"><div class="sticky">${reportPane}</div></div><div class="gutter" id="gutter" title="Drag to resize"></div><div class="pane-f">${orgBrief}${packNote}${caution}${openedCard}${probe}</div></div>`:`${orgBrief}${packNote}${caution}${openedCard}${probe}`;
 const notes=`<div class="grid2" style="margin-top:18px"><div class="card"><h4>${ic('prepare','sm')} My understanding</h4><p class="help" style="margin-top:0">What the report says about ${esc(d.first)}, in your words. Aarambh may read this on audit.</p><textarea class="f" style="min-height:120px" oninput="P('${d.id}').understanding=this.value;save()">${esc(p.understanding)}</textarea></div>
  <div class="card"><h4>${ic('jot','sm')} Private notes <span class="pill">Only you</span></h4><p class="help" style="margin-top:0">Never shared.</p><textarea class="f" style="min-height:120px" oninput="P('${d.id}').notes=this.value;save()">${esc(p.notes)}</textarea></div></div>`;
 const qItem=(q,i)=>{const w=checkQ(q.q);return `<div class="qitem ${p.added===q.id?'new-q':''}" id="qi-${q.id}">
  <div class="qt"><input class="f" value="${esc(q.q)}" oninput="qEdit('${d.id}','${q.id}',this.value)"><button class="btn sm ghost" title="Remove" onclick="qDel('${d.id}','${q.id}')">✕</button></div>
  <div class="warnline" id="w-${q.id}">${w.length?'⚠ '+w.join(' · '):''}</div>
  <div class="qmeta"><span class="pill ${q.src==='bank'||q.src==='guide'?'ok':'gold'}">${q.src==='own'?'Own':'✓ Saarthi-validated'}</span>
   <select onchange="qSet('${d.id}','${q.id}','why',this.value)"><option value="">Why this question? (optional)</option>${WHYS.map(x=>`<option ${q.why===x?'selected':''}>${x}</option>`).join('')}</select>
   <input class="f" style="width:auto;flex:1;min-width:160px;padding:6px 10px;font-size:14.5px" placeholder="Note (e.g. which trait)" value="${esc(q.note||'')}" oninput="qSet('${d.id}','${q.id}','note',this.value,true)">
   <button class="btn sm ghost" onclick="qOpts('${d.id}','${q.id}')">${q.opts?'Options ('+q.opts.length+')':'＋ Options'}</button>
   ${q.src==='own'?`<button class="btn sm ghost" onclick="toast('Proposed to the Question Bank — faculty approve')">Propose to Bank</button>`:''}</div>
  ${q.opts?`<div style="margin-top:8px">${q.opts.map((o,k)=>`<div class="grid2" style="gap:8px;margin-bottom:6px"><input class="f" style="padding:7px 10px;font-size:15px" value="${esc(o.l)}" placeholder="Answer option" oninput="P('${d.id}').q.find(x=>x.id==='${q.id}').opts[${k}].l=this.value;save()"><input class="f" style="padding:7px 10px;font-size:15px" value="${esc(o.f||'')}" placeholder="Follow-up question" oninput="P('${d.id}').q.find(x=>x.id==='${q.id}').opts[${k}].f=this.value;save()"></div>`).join('')}</div>`:''}
 </div>`;};
 const myQs=`<div class="card"><div class="row between"><h3 style="margin:0">${ic('debriefs','sm')} My questions</h3><span class="pill">${p.q.length}</span></div><p class="help" style="margin:4px 0 10px">Settle is the fixed opening: consent, what today covers, confidentiality.</p>
  ${['E','T','U'].map(k=>`<div style="margin-top:12px"><div class="row between"><div class="eyebrow" style="margin:0">${({E:'Empathise',T:'Think',U:'Undertake'})[k]}</div><span class="muted small">${STEPHINT[k]}</span></div>
   ${p.q.filter(q=>q.step===k).map(qItem).join('')||'<div class="hollow small" style="padding:10px 14px">No questions yet</div>'}
   <button class="btn sm" onclick="addOwn('${d.id}','${k}')">＋ Write my own</button></div>`).join('')}</div>`;
 const bt=S.qbt||(pts.find(x=>x.trait)||{}).trait||TRAITS[0];
 const bank=`<div class="card sticky" style="top:88px"><div class="row between"><h3 style="margin:0">${ic('library','sm')} Question Bank</h3><span class="pill ok">✓ Saarthi-validated</span></div>
  <p class="help" style="margin:4px 0 10px">Browse by trait. Traits from this report come first.</p>
  <select class="f" onchange="S.qbt=this.value;save();render()">${[...new Set(pts.map(x=>x.trait).filter(Boolean).concat(TRAITS))].map(t=>`<option ${bt===t?'selected':''}>${t}</option>`).join('')}</select>
  ${[['E',`How did the part about ${bt.toLowerCase()} land for you?`],['T',`What do people around you notice about your ${bt.toLowerCase()}?`],['T',`When has your ${bt.toLowerCase()} helped you most?`],['U',`What's one small thing you'd like to try around this?`]].map(([k,q])=>{const inQ=p.q.some(x=>x.q===q);return `<div class="sq" style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)"><span class="small">${esc(q)}<br><span class="muted">${({E:'Empathise',T:'Think',U:'Undertake'})[k]}</span></span>${inQ?'<span class="pill ok">✓</span>':`<button class="btn sm" onclick='addQ(${JSON.stringify(d.id)},${esc(JSON.stringify({step:k,q,why:'General routine',note:bt,src:'bank'}))})'>＋ Add</button>`}</div>`;}).join('')}
  <p class="muted small" style="margin-bottom:0">Sample wording — Saarthi's Question Bank supplies the real questions.</p></div>`;
 const ready=d.integ!=='Caution'||p.caution;
 const bottom=`<div class="card" style="margin-top:18px"><div class="row between"><div><b>Prep · about 45 minutes</b> <span class="muted small">· saves automatically</span></div>
  <div class="row">${p.done?'<span class="pill ok">✓ Prep done</span>':''}<button class="btn pri" ${ready?'':'disabled'} onclick="P('${d.id}').done=true;if(D('${d.id}')&&D('${d.id}').status==='assigned')D('${d.id}').status='prep';save();render();toast('Prep done')">Mark prep done</button><button class="btn teal" ${d.status==='retake'?'disabled':''} onclick="startRun('${d.id}')">Go to Live mode →</button></div></div></div>`;
 const inner=`${head(`<div class="eyebrow">Prep guide</div><h2>Get ready for ${esc(d.first)}</h2>`)}
  ${say('SETU shows where to probe from the report. You build the questions.','Everything here carries into Live mode.')}${top}${integ}${tools}${topArea}${notes}
  <h3 style="font-size:24px;margin:26px 0 12px">${ic('debriefs','sm')} Questions</h3><div class="grid2" style="align-items:start">${myQs}${bank}</div>${bottom}`;
 return wrap('C4',inner,{practice:S.cur==='practice'});
}
function qEdit(id,q,v){const x=P(id).q.find(z=>z.id===q);x.q=v;if(x.src!=='own'&&x.src!=='edited')x.src=x.src;save();const w=checkQ(v);const el=$('w-'+q);if(el)el.textContent=w.length?'⚠ '+w.join(' · '):'';}
function qSet(id,q,k,v,quiet){P(id).q.find(z=>z.id===q)[k]=v;save();if(!quiet)render();}
function qDel(id,q){const p=P(id);p.q=p.q.filter(z=>z.id!==q);save();render();}
function qOpts(id,q){const x=P(id).q.find(z=>z.id===q);if(x.opts)delete x.opts;else x.opts=[{l:'',f:''},{l:'',f:''}];save();render();}
function addOwn(id,step){const p=P(id);const n={id:qid(),step,q:'',why:'',note:'',src:'own'};p.q.push(n);p.added=n.id;save();render();setTimeout(()=>{const el=document.querySelector('#qi-'+n.id+' input');if(el)el.focus();},60);}
// No print or save while a person's report or notes are on screen (C5, C6). The frame's sandbox stops the page inside.
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&['p','s'].includes((e.key||'').toLowerCase())&&['C5','C6'].includes(S.ui.screen)){e.preventDefault();toast('SETU screens do not print or save — the report and your notes stay on screen');}});
function repZoom(d){S.ui.repZoom=Math.max(60,Math.min(160,(S.ui.repZoom||100)+d));save();render();}
function bindGutter(){const g=$('gutter'),r=$('paneR');if(!g||!r)return;
 g.onmousedown=e=>{e.preventDefault();const wrapEl=g.parentElement,rect=wrapEl.getBoundingClientRect();
  const mv=ev=>{let pct=(ev.clientX-rect.left)/rect.width*100;if(S.ui.swap)pct=100-pct;pct=Math.max(25,Math.min(70,pct));S.ui.splitW=Math.round(pct);r.style.width=pct+'%';};
  const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);save();};
  document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);};}

/* =====================================================================
   C6 · The debrief — Live mode
   ===================================================================== */
const STEPS=[['S','Settle',5],['E','Empathise',7],['T','Think',23],['U','Undertake',10]];
const STATES={here:['here & curious','ready to go deeper'],fast:['fast & anxious','rushed, tense'],flat:['flat & "fine"','shut down, low']};
const CONSENT={record:['Record the call','Video and audio · Aarambh audit','● Recording','rec','recording'],transcript:['Transcript only','Words only · Gyani Says tool · mocked until a lawyer confirms','Transcribing','tr','transcript'],none:['Neither','No recording, no transcript — you capture their words','Not recorded','','jot']};
function freshRun(id){const dd=D(id)||{};return {id,step:'S',consent:null,booked:dd.consent||null,changed:false,covers:false,conf:false,state:null,stateSince:0,offset:0,start:Date.now(),marks:{},ans:{},jots:[],log:[{t:0,step:'S'}],menu:false,pop:false,report:false,present:false,dismissed:{},ended:false,reasons:{}};}
function startRun(id){const dd=D(id);if(dd&&dd.status==='retake'){toast('A retake was called — no debrief on this reading');return;}if(!S.runs[id])S.runs[id]=freshRun(id);S.cur=id;go('C6');}
function R(){const d=curD();if(!S.runs[d.id])S.runs[d.id]=freshRun(d.id);return S.runs[d.id];}
const mins=()=>{const r=R();return Math.floor((Date.now()-r.start)/60000)+r.offset;};
function stepStart(k){let s=0;for(const[x,,m] of STEPS){if(x===k)return s;s+=m;}return 0;}
function A(i){const r=R();return r.ans[i]=r.ans[i]||{text:'',opt:null,ftext:'',extra:[],fromTr:false};}
function lmGo(k){const r=R();if(k!=='S'&&!r.consent){toast('Choose a consent option first');return;}
 const o='SETU';if(o.indexOf(k)<o.indexOf(r.step))r.log.push({t:mins(),step:k,back:true});else if(k!==r.step)r.log.push({t:mins(),step:k});
 r.step=k;save();render();}
function setStateL(s){const r=R();r.state=s;r.stateSince=mins();r.pop=false;r.dismissed.flat=false;save();render();}
function markQ(i,v){const r=R();r.marks[i]=r.marks[i]===v?null:v;save();render();}
function pickOpt(i,o){const a=A(i);a.opt=a.opt===o?null:o;a.ftext='';save();render();}
function addJot(){const t=$('jot');const v=t.value.trim();if(!v)return;const r=R();r.jots.push({t:mins(),step:r.step,text:v});save();render();setTimeout(()=>{const j=$('jot');if(j)j.focus();},0);}
function addFollow(i){modal(`<h3>＋ Follow-up question</h3><p class="muted">Asked on the spot, logged under this question.</p><input class="f" id="fu" placeholder="e.g. Can you give me an example?"><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" onclick="closeModal()">Back</button><button class="btn teal" onclick="const v=$('fu').value.trim();if(!v)return;A(${i}).extra.push({q:v,a:''});save();closeModal();render()">Add</button></div>`);setTimeout(()=>$('fu')&&$('fu').focus(),0);}
function isTyping(){const e=document.activeElement;return e&&e.matches('textarea,input');}
function transcribe(i,q){const r=R();if(r.consent!=='transcript')return;const a=A(i);
 setTimeout(()=>{if(R().consent!=='transcript'||S.ui.screen!=='C6')return;let ch=false;
  if(!a.text&&!q.opts){a.text='(simulated transcript) '+['It felt quite accurate, honestly.','Mostly at work, when plans change.','I hadn\'t thought of it that way before.'][i%3];a.fromTr=true;ch=true;}
  if(q.opts&&a.opt!=null&&!a.ftext){a.ftext='(simulated transcript) I think it was last week, in the team meeting.';a.fromTr=true;ch=true;}
  if(ch){save();if(!isTyping())render();}},1400);}
function nudges(r){const out=[];const m=mins();
 if(r.state&&r.state!=='here'&&m-r.stateSince>=5&&!r.dismissed.flat)out.push({k:'flat',text:`${STATES[r.state][0]} for ${m-r.stateSince} min — step back to Settle?`,act:`R().dismissed.flat=true;lmGo('S')`,btn:'Step back'});
 if((r.step==='T'||r.step==='U')&&r.state&&r.state!=='here'&&!r.dismissed.gate)out.push({k:'gate',text:'Not settled yet — deep questions may land badly.',act:`R().dismissed.gate=true;lmGo('E')`,btn:'Back to Empathise'});
 const cur=STEPS.find(s=>s[0]===r.step);const over=m-(stepStart(r.step)+cur[2]);
 if(over>=8&&!r.dismissed['over'+r.step])out.push({k:'over'+r.step,text:`${cur[1]} is ${over} min over — fine if it's flowing.`});
 return out;}
function qCard(q,i,stepQs,r){
 const a=A(i),none=r.consent==='none',tr=r.consent==='transcript';
 const field=(val,oninput,ph,fromTr)=>`<input class="ans ${none&&!val?'need':''} ${fromTr&&val?'fromtr':''}" value="${esc(val)}" placeholder="${ph}" oninput="${oninput};save()">`;
 let h=`<div class="qcard"><div class="q">${esc(q.q)}</div>${q.why?`<span class="why coach-only">Why I'm asking: <b>${esc(q.why)}</b>${q.note?' · '+esc(q.note):''}</span>`:''}${q.why==='A median answer'?`<span class="why coach-only" style="background:var(--gold-soft);border-color:var(--gold-line);color:#5A4208">Median — their answer is recorded as where they sit</span>`:''}`;
 if(q.opts&&q.opts.some(o=>o.l)){
  h+=`<span class="lbl">Their choice</span><div class="opts">${q.opts.map((o,k)=>o.l?`<button class="qo ${a.opt===k?'on':''}" onclick="pickOpt(${i},${k})">${esc(o.l)}</button>`:'').join('')}</div>`;
  if(a.opt!=null&&q.opts[a.opt]){const o=q.opts[a.opt];h+=`<div class="follow"><div class="tag">Follow-up · ${esc(o.l)}</div><div class="fq">${esc(o.f||'What else?')}</div>${field(a.ftext,`A(${i}).ftext=this.value;A(${i}).fromTr=false;this.classList.remove('need','fromtr')`,'What they said',a.fromTr)}${tr&&a.ftext&&a.fromTr?'<div class="help">From transcript — edit if needed</div>':''}</div>`;}
 } else {
  h+=`<span class="lbl">What they said</span>${field(a.text,`A(${i}).text=this.value;A(${i}).fromTr=false;this.classList.remove('need','fromtr')`,tr?'Listening…':'A line in their words',a.fromTr)}${tr&&a.text&&a.fromTr?'<div class="help">From transcript — edit if needed</div>':''}`;
 }
 if(none)h+=`<div class="help" style="color:#6B4F0C;font-weight:600">Not recorded — capture their words.</div>`;
 a.extra.forEach((x,k)=>{h+=`<div class="follow"><div class="tag">Follow-up · added</div><div class="fq">${esc(x.q)}</div>${field(x.a,`A(${i}).extra[${k}].a=this.value;this.classList.remove('need')`,'What they said',false)}</div>`;});
 h+=`<div class="row" style="margin-top:18px"><button class="lbtn ok" onclick="markQ(${i},'c')">✓ Covered</button><button class="lbtn aside" onclick="markQ(${i},'a')">⤼ Put aside</button><button class="lbtn ghost sm coach-only" onclick="addFollow(${i})">${ic('follow-up','sm')} Follow-up</button></div></div>`;
 const left=stepQs.filter(x=>!r.marks[x.i]&&x.i!==i);
 if(left.length)h+=`<div class="row coach-only muted small">Then: ${left.map(x=>`<span class="pill">${esc(x.q.slice(0,50))}${x.q.length>50?'…':''}</span>`).join('')}</div>`;
 transcribe(i,q);return h;}
function C6(){
 const d=curD();if(!d)return wrap('C4','<div class="hollow">No debrief selected.</div>');
 const r=R(),p=P(d.id),QS=p.q.filter(x=>x.q);
 if(r.ended)return lmEnd(d,r,QS);
 const m=mins(),cur=STEPS.find(s=>s[0]===r.step);
 const line=STEPS.map(([k,n,mn])=>{const s0=stepStart(k);const pct=Math.max(0,Math.min(100,(m-s0)/mn*100));const over=r.step===k&&m>s0+mn;
  return `<div class="lm-seg ${r.step===k?'on':''} ${over?'over':''}" style="flex:${mn+8}" onclick="lmGo('${k}')"><div class="lbar"><i data-s="${s0}" data-m="${mn}" style="width:${pct}%"></i></div><div class="lb"><b>${n}</b><span>${mn} min</span></div></div>`;}).join('');
 const stepQs=QS.map((q,i)=>({...q,i})).filter(q=>q.step===r.step);
 const next=stepQs.find(q=>!r.marks[q.i]);
 let centre='';
 if(r.step==='S'){
  centre=`<div class="stepname">Settle · 5 min</div>
  <h2 style="font-size:28px">${r.booked?'Confirm consent — they already chose when they booked.':'Consent first — ask, then tap their choice.'}</h2>
  ${r.booked?`<div class="note plain" style="margin-bottom:6px"><b>Chosen at booking:</b> ${CONSENT[r.booked][0]}. Say it back to them and confirm. They may change it here.</div>`:''}
  <div class="tiles">${Object.entries(CONSENT).map(([k,c])=>`<button class="tile pick ${r.consent===k?'on':''}" onclick="R().consent='${k}';R().changed=('${k}'!==R().booked&&!!R().booked);save();render()">${ic(c[4],'lg')}<b style="margin-top:8px">${c[0]}</b><span>${c[1]}</span>${r.booked===k?'<span class="pill" style="margin-top:8px">Chosen at booking</span>':''}</button>`).join('')}</div>
  ${r.changed?'<div class="nudge">Changed at the session — the new choice is what counts, and admin sees it.</div>':''}
  <div class="note plain small coach-only" style="display:flex;gap:10px;align-items:center">${ic('code-of-ethics','sm')}<span>Never discuss rates or payment, and never share your own contact details, website or social handles. Aarambh handles all of that.</span></div>
  ${r.consent==='none'?'<div class="nudge">'+ic('jot','sm')+'<span class="sp">No recording and no transcript, which they were told means less gets captured. Take their words under each question — a line is enough.</span></div>':''}
  ${r.consent==='transcript'?'<div class="nudge" style="background:var(--teal-soft);border-color:var(--teal-line);color:var(--teal)">'+ic('transcript','sm')+'<span class="sp">Transcript on. Answers fill in as they speak — you only correct.</span></div>':''}
  <h2 style="font-size:22px;margin-top:4px">Then open gently.</h2>
  <div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))"><button class="tile ${r.covers?'on':''}" onclick="R().covers=!R().covers;save();render()"><b>What today covers</b><span>Their report, their pace</span></button><button class="tile ${r.conf?'on':''}" onclick="R().conf=!R().conf;save();render()"><b>Confidentiality</b><span>What stays in the room</span></button></div>
  <div class="row coach-only"><button class="lbtn teal" ${r.consent?'':'disabled'} onclick="lmGo('E')">Move to Empathise →</button><span class="muted small">Tap the state chip once you've read how they're arriving.</span></div>`;
 } else if(next){
  centre=`<div class="stepname">${cur[1]} · question ${stepQs.indexOf(next)+1} of ${stepQs.length}</div>${qCard(next,next.i,stepQs,r)}`;
 } else {
  const nx=STEPS[STEPS.findIndex(s=>s[0]===r.step)+1];
  centre=`<div class="stepname">${cur[1]}</div><div class="note teal" style="padding:22px 26px"><h3 style="font-size:24px;color:var(--teal)">${stepQs.length?'All prepared questions here are marked.':'No prepared questions for this step.'}</h3><p style="margin:8px 0 16px">Stay as long as it's useful — then move on.</p>${nx?`<button class="lbtn teal" onclick="lmGo('${nx[0]}')">Move to ${nx[1]} →</button>`:`<button class="lbtn teal" onclick="lmEndIt()">End debrief →</button>`}</div>`;
 }
 const ng=nudges(r).map(n=>`<div class="nudge coach-only">${ic('probe-point','sm')}<span class="sp">${esc(n.text)}</span>${n.act?`<button onclick="${n.act}">${n.btn}</button>`:''}<button onclick="R().dismissed['${n.k}']=true;save();render()">Dismiss</button></div>`).join('');
 const c=r.consent?CONSENT[r.consent]:null;
 const org=d.org?ORGS[d.org]:null;
 const inner=`<div class="lm-top" style="margin-bottom:6px">
   <div><div class="eyebrow" style="margin:0">${r.practice||S.cur==='practice'?'Practice · ':''}Live mode</div><span style="font-family:Georgia,serif;font-size:26px;font-weight:600">${esc(d.first)}</span> <span class="muted">${esc(d.type)} · ${esc(d.report)}${verLine(d)} · <span id="lm-min">${m}</span> min in</span></div>
   <span class="chipx gold coach-only">Integrity: ${d.integ}</span>${org?`<span class="chipx coach-only">${ic('organisation','sm')}${esc(org.name)}</span>`:''}<span class="chipx ${c?c[3]:''}">${c?c[2]:'○ Consent not chosen'}</span>
   <div class="right"><span class="chipx click coach-only" onclick="R().pop=!R().pop;R().menu=false;save();render()"><i class="sdot d-${r.state||'none'}"></i>${r.state?STATES[r.state][0]:'Read state'}</span><button class="icon coach-only" title="More" onclick="R().menu=!R().menu;R().pop=false;save();render()">⋯</button>
    ${r.pop?`<div class="pop">${Object.entries(STATES).map(([k,[t,s]])=>`<button onclick="setStateL('${k}')"><i class="sdot d-${k}"></i><div><b>${t}</b><span>${s}</span></div></button>`).join('')}</div>`:''}
    ${r.menu?`<div class="menu"><button onclick="R().present=true;R().menu=false;save();render()">◐ Present mode</button><button onclick="R().menu=false;R().report=!R().report;save();render()">${r.report?'Hide':'Show'} report</button><button onclick="R().menu=false;save();lmNoShow()">Client didn't join</button><button onclick="R().menu=false;save();offerRetake('${d.id}')">${ic('practice','sm')}This reading needs retaking — stop the debrief</button><button class="danger" onclick="R().menu=false;save();lmEndEarly()">End early</button><button onclick="R().menu=false;lmEndIt()">End debrief</button></div>`:''}
   </div></div>
  <div class="row coach-only" style="gap:8px;margin-bottom:4px"><span class="muted small">Simulate:</span><button class="btn sm ghost" onclick="R().offset+=5;save();render()">+5 min</button><button class="btn sm ghost" onclick="setStateL('flat');R().stateSince=mins()-5;save();render()">Flat for 5 min</button><button class="btn sm ghost" onclick="S.runs['${d.id}']=freshRun('${d.id}');save();render()">Restart</button></div>
  <div class="lm-line">${line}</div>
  <div class="lm">
   <div class="lm-report ${r.report?'open':''}" onclick="if(!R().report){R().report=true;save();render()}"><div class="tab">▸ ${esc(d.first)}'s report${r.present?' · their copy':''}</div><div class="inner ${repList(d).length?'has-rep':''}"><button class="icon" style="position:absolute;top:12px;right:12px;z-index:2" onclick="event.stopPropagation();R().report=false;save();render()">✕</button>${repList(d).length?repPane(d,{height:'560px',present:r.present}):`<b>Aarambh report page shows here</b><p>Read-only · the written firewall exception<br>Load a reading in the Prep guide (C5) and it opens here</p>`}</div></div>
   <div class="lm-centre">${ng}${centre}</div>
   <div class="lm-side coach-only">
    <div><h4>${ic('jot','sm')} Quick jot · ${cur[1]}</h4><textarea id="jot" class="jot" placeholder="Anything not tied to a question. Enter to save." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();addJot()}"></textarea><div class="help">Tagged to ${cur[1]} automatically.</div></div>
    <div><h4>Jotted</h4><div class="jots">${r.jots.slice().reverse().map(j=>`<div>${esc(j.text)}<small>${STEPS.find(s=>s[0]===j.step)[1]} · ${j.t} min</small></div>`).join('')||'<span class="muted small">Nothing yet.</span>'}</div></div>
    <div><h4>${ic('debriefs','sm')} Questions</h4><div class="qlist">${QS.map((q,i)=>{const a=r.ans[i];return `<div><span class="m ${r.marks[i]==='c'?'c':r.marks[i]==='a'?'a':'o'}">${r.marks[i]==='c'?'✓':r.marks[i]==='a'?'⤼':'○'}</span><span>${esc(q.q)}${a&&a.opt!=null&&q.opts&&q.opts[a.opt]?`<em>Chose: ${esc(q.opts[a.opt].l)}</em>`:''}</span></div>`;}).join('')}</div></div>
   </div>
  </div>`;
 return wrap('C4',`${r.present?'<div class="present-banner">◐ Present mode — your notes and the coach copy are hidden; only their own report shows · <u style="cursor:pointer" onclick="R().present=false;save();render()">turn off</u></div>':''}${inner}`,{practice:S.cur==='practice',present:r.present});
}
function lmNoShow(){modal(`<h3>Client didn't join</h3><p>Wait 15 minutes from the start, then mark it.</p><div class="row" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Back</button><button class="btn teal" onclick="const d=D(S.cur);if(d)d.status='noshow';save();closeModal();go('C4');toast('Marked: didn\\'t join')">Mark it</button></div>`);}
function lmEndEarly(){modal(`<h3>End early</h3><p>Admin is alerted the same day.</p><textarea class="f" id="ee" placeholder="Reason (required)"></textarea><div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Back</button><button class="btn danger" onclick="if(!$('ee').value.trim())return;const d=D(S.cur);if(d)d.endedEarly=$('ee').value;closeModal();lmEndIt()">End and alert admin</button></div>`);}
function lmEndIt(){const r=R();if(!r.consent){toast('Choose a consent option first');return;}r.log.push({t:mins(),step:'END'});r.ended=true;save();render();}
function lmEnd(d,r,QS){
 const m=mins(),all=QS.map((q,i)=>({...q,i}));
 const aside=all.filter(q=>r.marks[q.i]==='a'),open=all.filter(q=>!r.marks[q.i]),cov=all.filter(q=>r.marks[q.i]==='c').length;
 const noAns=all.filter(q=>r.marks[q.i]==='c'&&(()=>{const a=r.ans[q.i];return !a||!(a.text||a.ftext);})());
 const segs=[];for(let i=0;i<r.log.length-1;i++){const a=r.log[i],b=r.log[i+1];segs.push({step:a.step,d:Math.max(1,b.t-a.t),back:a.back,t:a.t});}
 const backs=r.log.filter(l=>l.back).length;
 const said=k=>all.filter(q=>q.step===k).map(q=>{const a=r.ans[q.i];if(!a)return '';return [a.text,a.ftext,...(a.extra||[]).map(x=>x.a)].filter(Boolean).join(' ');}).concat(r.jots.filter(j=>j.step===k).map(j=>j.text)).filter(Boolean).join(' ');
 const ready=open.length===0&&aside.every(q=>(r.reasons[q.i]||'').trim());
 const c=CONSENT[r.consent];
 const inner=`<div class="hero teal" style="margin-bottom:20px"><div class="row between"><div><div class="eyebrow">Debrief ended · ${m} min · ${c[0]}</div><h2 style="font-size:32px;color:#fff">Here's how the conversation went</h2></div><button class="btn" onclick="R().ended=false;R().log.pop();save();render()">← Back to Live mode</button></div></div>
 <div class="grid2" style="align-items:start">
  <div class="stack">
   <div class="card"><h3>${ic('conversation-map','sm')} Conversation map</h3><div class="map">${segs.map(s=>`<div class="${s.step} ${s.back?'back':''}" style="flex:${s.d+4}" title="${STEPS.find(x=>x[0]===s.step)[1]} · ${s.t} min">${STEPS.find(x=>x[0]===s.step)[1]}${s.back?' ↩':''}</div>`).join('')}</div>
    <div class="muted small">Width = time spent · ↩ = stepped back down</div>
    <div class="row" style="margin-top:14px"><span class="pill ok">✓ ${cov} covered</span><span class="pill gold">⤼ ${aside.length} put aside</span><span class="pill">${open.length} not marked</span><span class="pill">↩ ${backs} step-back${backs===1?'':'s'}</span>${r.consent==='none'?`<span class="pill gold">${noAns.length} covered with no answer</span>`:''}</div></div>
   <div class="card"><h3>${ic('transcript','sm')} What they said</h3>${all.map(q=>{const a=r.ans[q.i]||{extra:[]};const st=r.marks[q.i];const o=q.opts&&a.opt!=null?q.opts[a.opt]:null;return `<div class="qa"><div class="qq">${st==='c'?'✓':st==='a'?'⤼':'○'} ${esc(q.q)}${q.why==='A median answer'?' <span class="pill gold">Median captured</span>':''}</div>
     ${o?`<div class="aa">Chose: <b>${esc(o.l)}</b></div><div class="ff"><b>${esc(o.f||'')}</b><br>${a.ftext?esc(a.ftext):'<span class="none">No answer captured</span>'}</div>`:''}
     ${!o&&a.text?`<div class="aa">${esc(a.text)}</div>`:''}${!o&&!a.text&&st==='c'?'<div class="aa none">No answer captured</div>':''}
     ${(a.extra||[]).map(x=>`<div class="ff"><b>${esc(x.q)}</b><br>${x.a?esc(x.a):'<span class="none">No answer captured</span>'}</div>`).join('')}</div>`;}).join('')}</div>
   <div class="card"><h3>Before you finish</h3>
    ${open.map(q=>`<div class="qitem"><b>Not marked:</b> ${esc(q.q)}<div class="row" style="margin-top:8px"><button class="lbtn ok sm" onclick="R().marks[${q.i}]='c';save();render()">✓ Covered</button><button class="lbtn aside sm" onclick="R().marks[${q.i}]='a';save();render()">⤼ Put aside</button></div></div>`).join('')}
    ${aside.map(q=>`<div class="qitem"><b>Put aside:</b> ${esc(q.q)}<input class="f" style="margin-top:8px" placeholder="Why? One line" value="${esc(r.reasons[q.i]||'')}" onchange="R().reasons[${q.i}]=this.value;save();render()"></div>`).join('')}
    ${!open.length&&!aside.length?'<p style="margin:0">Every prepared question was covered.</p>':''}</div>
  </div>
  <div class="card sticky"><h3>${ic('letter','sm')} Your letter — already started</h3><p class="help" style="margin-top:-4px">From their answers and your jots. You'll read and edit it next.</p>
   <p><span class="eyebrow" style="display:block">What we talked about</span>${esc((said('S')+' '+said('E')).trim())||'<i class="muted">From Settle and Empathise</i>'}</p>
   <p><span class="eyebrow" style="display:block">What stood out for you</span>${esc(said('T'))||'<i class="muted">From Think</i>'}</p>
   <p><span class="eyebrow" style="display:block">Your next steps</span>${esc(said('U'))||'<i class="muted">From Undertake</i>'}</p>
   <button class="btn pri" ${ready?'':'disabled'} onclick="finishRun()">${S.cur==='practice'?'Send practice to faculty →':'Go to after-debrief →'}</button>
   ${ready?'':'<p class="help">Mark every question, and give a reason for each one put aside.</p>'}</div>
 </div>`;
 return wrap('C4',inner,{practice:S.cur==='practice'});
}
function finishRun(){
 const d=curD(),r=R(),QS=P(d.id).q.filter(x=>x.q);
 if(S.cur==='practice'){toast('Practice sent to faculty for feedback');go('S2');return;}
 const said=k=>QS.map((q,i)=>({...q,i})).filter(q=>q.step===k).map(q=>{const a=r.ans[q.i];return a?[a.text,a.ftext,...(a.extra||[]).map(x=>x.a)].filter(Boolean).join(' '):'';}).concat(r.jots.filter(j=>j.step===k).map(j=>j.text)).filter(Boolean).join(' ');
 const dd=D(d.id);dd.status='debriefed';
 S.after[d.id]=null;const a=AF(d.id);a.letter={talked:(said('S')+' '+said('E')).trim(),stood:said('T'),next:said('U'),note:''};
 save();go('C7');toast('After-debrief due within 24 hours');
}
let TICK=null;
function startTick(){stopTick();TICK=setInterval(()=>{if(S.ui.screen!=='C6'||isTyping())return;const d=curD();const r=d&&S.runs[d.id];if(!r||r.ended)return;const m=mins();const e=$('lm-min');if(e)e.textContent=m;document.querySelectorAll('.lm-seg .lbar i').forEach(f=>{const s=+f.dataset.s,mn=+f.dataset.m;f.style.width=Math.max(0,Math.min(100,(m-s)/mn*100))+'%';});},5000);}
function stopTick(){if(TICK)clearInterval(TICK);TICK=null;}

/* =====================================================================
   C7–C10 · After the debrief
   ===================================================================== */
const WORDS=['you should','you must','you need to'];
function hl(t){let h=esc(t);WORDS.forEach(w=>{h=h.replace(new RegExp('('+w+')','gi'),'<mark class="warn">$1</mark>');});return h;}
function AF(id){
 if(!S.after[id]){S.after[id]={recs:[],none:false,noneReason:'',letter:{talked:'',stood:'',next:'',note:''},read:false,rate:{},comment:'',reflection:'',link:'',reason:'',submitted:false,seeded:false};}
 const a=S.after[id];
 if(!a.seeded){a.seeded=true;
  if(id==='d4')Object.assign(a,{submitted:true,subDate:'14 Sep 2026',recs:[{id:'p2',why:'Wants to tell his own story better',based:['said'],asked:'asked'}],letter:{talked:'We looked at your Pancha Bhuta report together, starting with how it felt to read.',stood:'You noticed you think things through before you act.',next:'You should pick a structured role for your internship.',note:'It was good to talk with you, Rohan.'},rate:{a:4,b:4,c:5,d:3},link:'https://meet.gyanisays.in/rec/rohan-0914'});
  const d=D(id);
  if(d&&!a.submitted&&!a.recs.length){ // SETU pointers from the same reading
   const pts=points(d);const picks=[];
   pts.forEach(pt=>{PRULES.filter(r=>r.kind===pt.kind&&r.trait===pt.trait).forEach(r=>{const pr=PRODUCTS.find(x=>x.id===r.prod);const t=d.type==='Can\'t say'?'Mid-management':d.type;if(pr&&pr.types.includes(t)&&!picks.find(x=>x.id===r.prod))picks.push({id:r.prod,why:'',based:['reading'],asked:'suggested',pointer:pt.title});});});
   a.recs=picks.slice(0,3);
  }
 }
 return a;
}
const BASED=[['said','What they said'],['own','Their own next step'],['reading','A reading point'],['obs','My observation']];
function AFTER(code){
 const d=curD();if(!d||d.id==='practice')return wrap('C4','<div class="hollow">Pick a debrief from My debriefs.</div>');
 const a=AF(d.id);const sent=d.status==='sentback';const lock=a.submitted;const llock=a.submitted&&!sent;
 const org=d.org?ORGS[d.org]:null;
 const r=S.runs[d.id];const consent=r?r.consent:(a.link?'record':null);
 const lockLine=t=>`<div class="lockline lockbox" style="padding:10px 14px">${ic('put-aside','sm')} ${t}</div>`;
 const typ=d.type==='Can\'t say'?'Mid-management':d.type;
 const prodRow=(p,src)=>{const on=a.recs.find(x=>x.id===p.id);const full=!on&&a.recs.length>=3;
  return `<div class="qitem" style="${on?'border-color:var(--ok-line);background:#FBFEFB':''}"><div class="row between"><span><b>${esc(p.name)}</b> ${src==='org'?'<span class="pill teal">'+esc(org.name)+'</span>':''}${on&&on.pointer?` <span class="pill gold">SETU pointer · ${esc(on.pointer)}</span>`:''}<br><span class="muted small">${esc(p.desc)}</span></span>
   <button class="btn sm ${on?'pri':''} ${lock||a.none||full?'locked':''}" ${lock||a.none||full?'disabled':''} onclick="togRec('${d.id}','${p.id}')">${on?'✓ Chosen':'Choose'}</button></div>
   ${on?`<div style="margin-top:10px"><span class="fl">Based on — required</span><div class="row">${BASED.map(([k,t])=>`<button class="opt ${lock?'locked':''}" style="padding:7px 12px;font-size:15px;min-height:36px" ${lock?'disabled':''} aria-pressed="${on.based.includes(k)}" onclick="togBased('${d.id}','${p.id}','${k}')">${t}</button>`).join('')}</div>
    <div class="row" style="margin-top:8px">${[['asked','Client asked for this'],['suggested','I suggested it']].map(([k,t])=>`<button class="opt teal ${lock?'locked':''}" style="padding:7px 12px;font-size:15px;min-height:36px" ${lock?'disabled':''} aria-pressed="${on.asked===k}" onclick="AF('${d.id}').recs.find(x=>x.id==='${p.id}').asked='${k}';save();render()">${t}</button>`).join('')}</div>
    <input class="f" style="margin-top:8px" placeholder="One line — why (required)" value="${esc(on.why||'')}" ${lock?'disabled':''} oninput="AF('${d.id}').recs.find(x=>x.id==='${p.id}').why=this.value;save()" onchange="const y=scrollY;render();scrollTo(0,y)">${p.id==='cwm'?'<div class="help">A key reaches the client with the approved letter. Valid 60 days.</div>':''}</div>`:''}</div>`;};
 const prods=PRODUCTS.filter(p=>p.types.includes(typ)).filter(p=>!(p.id==='cwm'&&d.pack));
 const rec=`<div class="card ${lock?'locked-sec':''}" id="sec-rec"><div class="row between"><h3 style="margin:0"><span class="pill maroon">C7</span> ${ic('recommendations','sm')} Recommendations</h3><span class="pill">${lock?'Sent':'Client never sees these'}</span></div>
  ${lock?lockLine('Locked — submitted '+(a.subDate||'today')+'. Only the letter reopens if Aarambh sends it back.'):''}
  <div class="row" style="margin:12px 0"><span class="pill ${org?'teal':''}">${org?'Organisation: '+esc(org.name):'Individual'}</span><span class="muted small">Goes to: <b>${org?esc(org.name)+' (vetted coach · documented)':'Aarambh'}</b></span></div>
  ${org?'<div class="note stop small" style="margin-bottom:12px"><b>Consent check:</b> Meera hasn\'t yet consented to sharing recommendations with ABC Ltd. They\'ll be held until consent is recorded.</div>':''}
  ${d.pack?`<div class="note" style="margin-bottom:12px"><b>${esc(d.first)} already holds a ${d.pack}-session pack.</b> "Continue with me" is hidden — the sessions are theirs to book, and there is nothing to sell.</div>`:''}
  <p class="help" style="margin-top:0">SETU has pre-selected products from the reading. Confirm, change or add — at most 3. "Based on" and the one-line why are required for each.</p>
  <div class="${org?'grid2':''}" style="align-items:start"><div>${org?'<div class="eyebrow">Aarambh products</div>':''}${prods.map(p=>prodRow(p,'aar')).join('')}</div>
  ${org?`<div><div class="eyebrow">${esc(org.name)} programmes</div>${org.programmes.map(p=>prodRow(p,'org')).join('')}</div>`:''}</div>
  <label class="check ${a.none?'on':''}"><input type="checkbox" ${a.none?'checked':''} ${lock?'disabled':''} onchange="AF('${d.id}').none=this.checked;AF('${d.id}').recs=[];save();render()"><span><b>No recommendation</b></span></label>
  ${a.none?`<input class="f" placeholder="Short reason" value="${esc(a.noneReason)}" ${lock?'disabled':''} oninput="AF('${d.id}').noneReason=this.value;save()">`:''}
  <p class="muted small" style="margin-bottom:0">Sample lists — Aarambh and the organisation supply the real ones.</p></div>`;
 const allL=Object.values(a.letter).join(' ');const wc=allL.trim().split(/\s+/).filter(Boolean).length;const hits=WORDS.filter(w=>allL.toLowerCase().includes(w));
 const lt=(k,label)=>`<div class="field"><label>${label}</label><textarea class="f" ${llock?'disabled':''} oninput="AF('${d.id}').letter.${k}=this.value;save();letterCheck('${d.id}')">${esc(a.letter[k])}</textarea><div class="help" id="hl-${k}" style="color:var(--stop)">${WORDS.some(w=>a.letter[k].toLowerCase().includes(w))?hl(a.letter[k]):''}</div></div>`;
 const letter=`<div class="card ${llock?'locked-sec':''}" id="sec-letter"><div class="row between"><h3 style="margin:0"><span class="pill maroon">C8</span> ${ic('letter','sm')} Feedback for ${esc(d.first)}</h3><span class="pill ${sent?'stop':llock?'gold':''}">${sent?'Sent back':llock?'Awaiting Aarambh sign-off':'Draft'}</span></div>
  ${sent?`<div class="note stop" style="margin-top:12px"><b>Aarambh sent this back:</b> ${esc(d.sentback)}<br><span class="small">Resubmit within 24 hours.</span></div>`:''}
  ${llock?lockLine('Locked — waiting for Aarambh to validate'):''}
  <p class="help">Pre-filled from what Live mode captured — the transcript and your notes. Edit it freely. The client sees it only after Aarambh approves. In ${esc(d.lang)}. No numbers or levels. No minimum length; it turns red over 400 words.</p>
  ${lt('talked','What we talked about')}${lt('stood','What stood out for you')}${lt('next','Your next steps')}${lt('note','A note from your coach')}
  <div class="row between small" id="lt-status">${letterStatus(wc,hits)}</div>
  ${trPanel(d)}
  ${llock?'':`<label class="check ${a.read?'on':''}" style="margin-top:10px"><input type="checkbox" ${a.read?'checked':''} onchange="AF('${d.id}').read=this.checked;save();render()"><span><b>I've read and edited this letter</b></span></label>`}</div>`;
 const skip=d.status==='noshow'||d.endedEarly;
 const star=(k,label,help)=>`<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span><b>${label}</b><br><span class="muted small">${help}</span></span><span class="stars">${[1,2,3,4,5].map(n=>`<button class="${(a.rate[k]||0)>=n?'on':''}" ${lock?'disabled':''} onclick="AF('${d.id}').rate.${k}=${n};save();render()">${n}</button>`).join('')}</span></div>`;
 const rate=`<div class="card ${lock?'locked-sec':''}" id="sec-rate"><div class="row between"><h3 style="margin:0"><span class="pill maroon">C9</span> ${ic('rating','sm')} Rating of the conversation</h3><span class="pill">Gyani Says · Aarambh · never the client</span></div>
  ${lock?lockLine('Locked — submitted'):''}
  ${skip?`<div class="note plain" style="margin-top:12px">Ratings skipped — ${d.status==='noshow'?'client didn\'t join':'ended early'}.</div>`:`<p class="help">Stars rate the conversation, not the person.</p>
  ${star('a','Settled','It got calm enough to go deep')}${star('b','Understood','The report made sense to them')}${star('c','Covered','We got through what was planned')}${star('d','Next step','A clear next step they own')}
  <div class="field" style="margin-top:12px"><label>Comment (optional) — describe the conversation, not the person</label><textarea class="f" ${lock?'disabled':''} oninput="AF('${d.id}').comment=this.value;save()">${esc(a.comment)}</textarea></div>`}
  <div class="field"><label>My reflection <span class="pill">Only you${S.stage==='provisional'?' · and your mentor':''}</span></label><textarea class="f" oninput="AF('${d.id}').reflection=this.value;save()">${esc(a.reflection)}</textarea></div></div>`;
 const isTr=consent==='transcript',isNone=consent==='none';
 const recd=`<div class="card ${lock?'locked-sec':''}" id="sec-recording"><div class="row between"><h3 style="margin:0"><span class="pill maroon">C10</span> ${ic('recording','sm')} Recording</h3><span class="pill">Settle choice: ${consent?CONSENT[consent][0]:'not recorded in Live mode'}</span></div>
  ${lock?lockLine('Locked — submitted. Aarambh audit can see it.'):''}
  ${isTr?`<div class="note teal" style="margin-top:12px"><b>Transcript held in Granola.</b> SETU keeps the meeting ID, never a second copy.
   <div class="field" style="margin-top:10px"><label>Granola meeting ID</label><input class="f" placeholder="e.g. 7f3c1a90-5d62-4b18-9e07-2a5f1c8d4b31" value="${esc(a.granola||'')}" ${lock?'disabled':''} oninput="AF('${d.id}').granola=this.value;save()"></div>
   <p class="help">Entered by hand while the debriefs run on MS's own Granola. Once there is a Gyani Says workspace, SETU picks the ID up by itself.</p></div>`:''}
  ${isNone?`<div class="note plain" style="margin-top:12px"><b>Not recorded — client chose Neither.</b> Logged; admin sees it.</div>`:''}
  ${!isTr&&!isNone?`<p class="help">From the Gyani Says meeting account — never your own.</p>
  <div class="field"><label>Recording link</label><input class="f" placeholder="https://…" value="${esc(a.link)}" ${lock||a.reason?'disabled':''} oninput="AF('${d.id}').link=this.value;save();$('lk-help').innerHTML=linkHelp(this.value)" onchange="const y=scrollY;render();scrollTo(0,y)"><div id="lk-help">${linkHelp(a.link)}</div></div>
  <label class="fl">No recording?</label><div class="row">${['Technical failure','Not recorded by mistake'].map(x=>`<button class="opt ${lock?'locked':''}" ${lock?'disabled':''} aria-pressed="${a.reason===x}" onclick="AF('${d.id}').reason=AF('${d.id}').reason==='${x}'?'':'${x}';AF('${d.id}').link='';save();render()">${x}</button>`).join('')}</div>
  ${a.reason==='Not recorded by mistake'?'<div class="note plain small" style="margin-top:10px">Admin sees this. Repeats show in the ratings review.</div>':''}`:''}</div>`;
 const recsOk=a.none?a.noneReason.trim():a.recs.length&&a.recs.every(x=>x.based&&x.based.length&&(x.why||'').trim());   // why required — MS, 17 Oct 2026
 const rateOk=skip||['a','b','c','d'].every(k=>a.rate[k]);
 const linkOk=isTr||isNone||/^https:\/\/\S+\.\S+/.test(a.link)||a.reason;
 const ok=recsOk&&a.read&&rateOk&&linkOk;
 const checklist=[['C7 · Recommendations',recsOk,'sec-rec'],['C8 · Letter read and edited',a.read||llock,'sec-letter'],['C9 · Rating',rateOk,'sec-rate'],['C10 · Recording',linkOk,'sec-recording']];
 const side=`<div class="stack sticky">
  <div class="card"><div class="eyebrow">After the debrief</div><h3 style="margin:0">${esc(d.first)} · ${esc(d.report)}</h3><p class="muted small">${fmtDate(d.date)} · ${hhmm(mm(d.time))} · due within 24 hours</p>
   ${ring(checklist.filter(x=>x[1]).length/4,checklist.filter(x=>x[1]).length+' of 4','sections ready','#2F5D3A')}
   ${checklist.map(([t,v,id])=>`<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><a style="cursor:pointer" onclick="go(S.ui.screen,'${id}')">${t}</a><span class="pill ${v?'ok':''}">${v?'✓':'to do'}</span></div>`).join('')}
   ${sent?`<button class="btn pri" id="after-submit" style="width:100%;margin-top:14px" ${a.read&&!hits.length?'':'disabled'} onclick="resubmit('${d.id}')">Resubmit letter</button>${hits.length?'<p class="help">Fix the wording check first.</p>':''}`:llock?'<div class="note ok small" style="margin-top:14px">Submitted. Recommendations <b>sent</b>. Letter <b>awaiting Aarambh</b>.</div>':`<button class="btn pri" style="width:100%;margin-top:14px" ${ok?'':'disabled'} onclick="submitAfter('${d.id}')">Submit all four</button>`}
  </div><div class="note plain small">One screen, four sections, one Submit.</div></div>`;
 return wrap('C4',`${head(`<div class="eyebrow">After the debrief</div><h2>Finish ${esc(d.first)}'s debrief</h2>`)}
  ${say('Four sections, one Submit, due within 24 hours.','Your reflection stays private.')}
  <div class="grid3" style="align-items:start"><div class="stack" style="grid-column:span 2">${rec}${letter}${rate}${recd}${auditBlock(d)}</div>${side}</div>`);
}
function auditBlock(d){
 const a=AF(d.id), r=S.runs[d.id], p=P(d.id);
 const qs=p.q.filter(x=>x.q);
 const asked=qs.filter((q,i)=>r&&r.marks[i]==='c');
 const aside=qs.filter((q,i)=>r&&r.marks[i]==='a');
 const never=qs.filter((q,i)=>!r||!r.marks[i]);
 const own=qs.filter(q=>q.src==='own');
 const follow=r?Object.values(r.ans||{}).reduce((n,x)=>n+((x.extra||[]).length),0):0;
 const pct=qs.length?Math.round(asked.length/qs.length*100):0;
 a.audit=a.audit||{gaps:'',sent:[]};
 const cand=[...own.map(q=>({q:q.q,why:'written on the spot',note:q.note||''})),
   ...(r?Object.entries(r.ans||{}).flatMap(([i,x])=>(x.extra||[]).map(e=>({q:e.q,why:'follow-up in the room',note:(qs[i]||{}).note||''}))):[])];
 const row=(k,v,cls)=>`<div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>${k}</span><span class="pill ${cls||''}">${v}</span></div>`;
 return `<div class="card" id="sec-audit"><div class="row between"><h3 style="margin:0">${ic('probe-point','sm')} What this debrief taught us</h3><span class="pill">${pct}% of what you prepared</span></div>
  <p class="help" style="margin-top:0">Not a score. It is how the Question Bank grows, and how we see what the rules put in front of you that never earned its place.</p>
  ${row('Asked and covered',asked.length+' of '+qs.length,'ok')}
  ${row('Put aside, with a reason',aside.length,aside.length?'gold':'')}
  ${row('Never reached',never.length,never.length?'stop':'')}
  ${row('Questions you wrote yourself',own.length,own.length?'maroon':'')}
  ${row('Follow-ups you invented in the room',follow,follow?'maroon':'')}
  ${never.length?`<div class="note small" style="margin-top:10px"><b>Never reached:</b> ${never.slice(0,4).map(q=>esc(q.q.slice(0,60))).join(' · ')}${never.length>4?` and ${never.length-4} more`:''}<br>If a point never earns its place across many debriefs, the rule that raised it is the thing to change.</div>`:''}
  <div class="field" style="margin-top:12px"><label>Something they said that no question asked about</label>
   <textarea class="f" placeholder="One line. It becomes a candidate question for faculty to look at." oninput="AF('${d.id}').audit.gaps=this.value;save()">${esc(a.audit.gaps||'')}</textarea></div>
  ${cand.length?`<div style="margin-top:10px"><span class="fl">Candidates for the Question Bank</span>
   ${cand.map((c,i)=>`<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="small">“${esc(c.q)}”<br><span class="muted">${esc(c.why)}${c.note?' · '+esc(c.note):''}</span></span>
   ${a.audit.sent.includes(i)?'<span class="pill ok">Sent to faculty</span>':`<button class="btn sm" onclick="sendCand('${d.id}',${i},${JSON.stringify(esc(c.q))})">Send to faculty</button>`}</div>`).join('')}</div>`:''}
  </div>`;}
function sendCand(id,i,q){const a=AF(id);a.audit.sent.push(i);
 S.bankQ=S.bankQ||[];S.bankQ.push({q:q,from:S.coach.name,when:'today'});
 save();render();toast('Sent to faculty — it appears in G2 under Question Bank proposals');}
const TRDIR='_transcripts/';
function trFetch(id,mid){const a=AF(id);
 if(!mid){toast('Put the Granola meeting ID in first');return;}
 fetch(TRDIR+encodeURIComponent(mid)+'.json').then(r=>{if(!r.ok)throw 0;return r.json();})
  .then(j=>{TR[mid]={title:j.title||'',when:j.when||'',lines:(j.lines||[]).filter(l=>l&&l.text)};save();render();
            toast(`Transcript ready — ${TR[mid].lines.length} lines`);})
  .catch(()=>{TR[mid]={missing:true};render();});}
const TR={};
function trPanel(d){const a=AF(d.id),mid=(a.granola||'').trim();const t=TR[mid];
 if(!mid)return '';
 if(!t)return `<div class="row" style="margin-top:10px"><button class="btn sm" onclick="trFetch('${d.id}','${esc(mid)}')">${ic('transcript','sm')}Fetch the transcript</button><span class="muted small">Fetched when you ask, read here, never copied into SETU</span></div>`;
 if(t.missing)return `<div class="note small" style="margin-top:10px"><b>Not on this laptop yet.</b> The transcript lives in Granola. Ask for it to be pulled for meeting <code>${esc(mid)}</code>, then press Fetch again.
  <div class="row" style="margin-top:8px"><button class="btn sm" onclick="trFetch('${d.id}','${esc(mid)}')">Try again</button></div></div>`;
 const q=(S.ui.trQ||'').toLowerCase();
 const lines=t.lines.filter(l=>!q||l.text.toLowerCase().includes(q));
 return `<div class="card" style="margin-top:12px;border-left:5px solid var(--teal)"><div class="row between"><h4 style="margin:0">${ic('transcript','sm')} From the transcript</h4><span class="pill">${t.lines.length} lines</span></div>
  <p class="help" style="margin-top:0">${esc(t.title||'')} ${t.when?'· '+esc(t.when):''} — held in Granola. Use a line and it is kept; the rest is not.</p>
  <input class="f" placeholder="Search what was said" value="${esc(S.ui.trQ||'')}" oninput="S.ui.trQ=this.value;save();clearTimeout(window._tq);window._tq=setTimeout(render,350)">
  <div style="max-height:280px;overflow:auto;margin-top:10px">${lines.slice(0,60).map((l,i)=>`<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="small"><b>${esc(l.speaker||'')}</b> ${esc(l.text)}</span>
   <button class="btn sm ghost" onclick="useLine('${d.id}',${JSON.stringify(esc(l.text))})">Use this</button></div>`).join('')||'<p class="muted small">Nothing matches.</p>'}</div></div>`;}
function useLine(id,text){const a=AF(id);a.letter.talked=(a.letter.talked?a.letter.talked+' ':'')+text;save();render();letterCheck(id);toast('Added to the letter — edit it into your own words');}
// 17 Oct 2026 (MS): a retake is called while reading the report (C5) or during the debrief (C6) — never after it.
// No debrief happens on a reading that needs retaking: the debrief waits for the new sitting, then is prepared afresh.
// The call is made from integCard (C5) or the Live mode menu (C6).
function offerRetake(id){
 modal(`<h3>This reading needs retaking</h3><p class="muted">This tells Aarambh the reading needs retaking. <b>No debrief happens on this reading</b>${S.ui.screen==='C6'?' — the debrief stops here':''}. It waits for the new sitting, and you prepare afresh.</p>
 <div class="field"><label>What made you say so — required</label><textarea class="f" id="rtwhy" placeholder="e.g. She said she answered in a hurry between meetings, and half the mirror answers are missing"></textarea></div>
 <div class="note plain small">One retake per person is yours. A second is Aarambh admin's to grant. Every offer is logged, and a coach who offers many will show in the ratings review.</div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Back</button><button class="btn pri" onclick="doRetake('${id}')">Call the retake</button></div>`);}
function doRetake(id){const w=($('rtwhy')||{}).value||'';if(!w.trim()){toast('Say what made you call it');return;}
 const live=S.ui.screen==='C6';const a=AF(id);a.retake={offered:true,why:w,when:'today',at:live?'live':'prep'};
 const dd=D(id);if(dd){dd.status='retake';}
 if(live&&S.runs[id]){S.runs[id].ended=true;S.runs[id].retake=true;}
 save();closeModal();if(live)go('C5');else render();toast('Aarambh told — no debrief on this reading; it waits for the new sitting');}
function letterStatus(wc,hits){return `${wc>400?`<span class="pill stop">${wc} words — over 400. Trim if you can; it never stops you</span>`:`<span>${wc} words <span class="muted">· no minimum · red over 400</span></span>`}${hits.length?`<span class="pill stop">Wording check: "${hits.join('", "')}" — explain, never direct</span>`:'<span class="pill ok">Wording check: clear</span>'}`;}
function letterCheck(id){const a=AF(id);const all=Object.values(a.letter).join(' ');const wc=all.trim().split(/\s+/).filter(Boolean).length;const hits=WORDS.filter(w=>all.toLowerCase().includes(w));
 const st=$('lt-status');if(st)st.innerHTML=letterStatus(wc,hits);
 Object.keys(a.letter).forEach(k=>{const e=$('hl-'+k);if(e)e.innerHTML=WORDS.some(w=>a.letter[k].toLowerCase().includes(w))?hl(a.letter[k]):'';});
 const b=$('after-submit');if(b)b.disabled=!(a.read&&!hits.length);}
function linkHelp(v){return v?(/^https:\/\/\S+\.\S+/.test(v)?'<div class="help" style="color:var(--ok)">✓ Looks like a real link</div>':'<div class="help" style="color:var(--stop)">That doesn\'t look like a link</div>'):'';}
function togRec(id,pid){const a=AF(id);const i=a.recs.findIndex(x=>x.id===pid);if(i>=0)a.recs.splice(i,1);else if(a.recs.length<3)a.recs.push({id:pid,why:'',based:[],asked:'suggested'});save();render();}
function togBased(id,pid,k){const r=AF(id).recs.find(x=>x.id===pid);const i=r.based.indexOf(k);i>=0?r.based.splice(i,1):r.based.push(k);save();render();}
function submitAfter(id){const a=AF(id);a.submitted=true;a.subDate='17 Sep 2026';D(id).status='after';save();render();toast('Submitted — letter awaiting Aarambh');}
function resubmit(id){D(id).status='after';D(id).sentback='';AF(id).read=false;save();render();toast('Letter resubmitted');}

/* =====================================================================
   C11 · Coach guide  (parked)
   ===================================================================== */
const MODELS={
 GROW:{name:'GROW',steps:[['Settle',null,'GROW has no calming step — it assumes they arrive ready'],['Empathise','Reality','How things are now'],['Think','Goal · Reality · Options','What they want, what\'s true, what they could do'],['Undertake','Way forward','What they will do']]},
 OPAL:{name:'OPAL',steps:[['Settle',null,'OPAL assumes they arrive ready to think'],['Empathise',null,'Partly: why this matters to them'],['Think','Objective · Possibilities','Their objective for today; open the options'],['Undertake','Action · Learning','One small owned step; what they take away']]},
 CLEAR:{name:'CLEAR',steps:[['Settle','Contracting','Agree what today is for'],['Empathise','Listening','Hear how it is for them'],['Think','Exploring','Explore what\'s going on'],['Undertake','Action · Review','Next step; look back on the session']]},
};
function C11(){
 const md=MODELS[S.ui.model];
 return wrap('C11',`${say('This guide is one page, and it is the same for every coach.','Reading the habits stays on Aarambh\'s own page, linked at the end.')}
 <div class="row" style="margin-bottom:14px"><span class="pill">Coach guide · v1.3 · 17 Sep 2026</span><span class="pill gold">Parked — to be rewritten for the Prep guide and Live mode</span></div>
 <div class="grid3" style="align-items:start">
  <div class="card guide" style="grid-column:span 2">
   <h3 id="g1">The debrief at a glance</h3>
   <table class="t"><thead><tr><th>Step</th><th>Time</th><th>What you do</th></tr></thead><tbody>
    <tr><td><b>Settle</b></td><td>5 min</td><td>Consent (Record · Transcript · Neither) · what today covers · confidentiality</td></tr>
    <tr><td><b>Empathise</b></td><td>7 min</td><td>How the report landed · what surprised them</td></tr>
    <tr><td><b>Think</b></td><td>23 min</td><td>The questions from your Prep guide · their own insights</td></tr>
    <tr><td><b>Undertake</b></td><td>10 min</td><td>Their next steps · close</td></tr></tbody></table>
   <p><b>Two gates, in order.</b> Integrity first; then state. <b>Three states:</b> here &amp; curious · fast &amp; anxious · flat &amp; "fine".</p>
   <h3 id="g2">How we speak</h3><ul><li><b>Explain what the report says.</b> Never tell the person what to do.</li><li>Not in letters: <i>you should · you must · you need to</i>. No numbers or levels.</li><li>Stars rate the conversation, never the person. You are accountable for what you say.</li></ul>
   <h3 id="g2b">What you never do</h3>
   <div class="note stop"><b>Never discuss money, and never hand out your own contact details.</b>
   <ul style="margin:10px 0 0"><li>No rates, fees, discounts or payment talk — not yours, not Aarambh's. "That's handled by Aarambh" closes it.</li>
   <li>No personal phone, email, WhatsApp, website, Instagram, LinkedIn or any other handle — before, during or after a debrief.</li>
   <li>No coaching outside the platform with someone you met through it. Further coaching runs on the key in their Aarambh login.</li>
   <li>No gifts, and no payment from a client, in any form.</li></ul>
   <p style="margin:10px 0 0" class="small">It is in the Code of Ethics you signed. Breaking it is misconduct, and the credential can be withdrawn.</p></div>
   <h3 id="g3">Before and after</h3><ul><li><b>Prep guide</b> (~45 min): where to probe, your questions, your understanding.</li><li><b>Live mode</b>: one question at a time.</li><li><b>After</b> — within 24 hours: recommendations · letter · rating · recording.</li></ul>
   <h3 id="g4">When things go wrong</h3><ul><li>Didn't join: wait 15 minutes, then mark it.</li><li>Need to drop a booking: ask admin. Under 48 hours is a late drop.</li><li>Client distressed: End early. Admin is alerted the same day.</li></ul>
   <h3 id="g5">Further coaching</h3><p>Never sell. Choose <b>"Continue with me"</b> and say only: <i>"If you'd like to continue with me, you'll find a key in your Aarambh login."</i></p>
   <h3 id="g6">Links</h3><div class="row"><button class="btn" onclick="toast('Opens Aarambh\\'s habits guide — an Aarambh page')">Reading the habits — Aarambh ↗</button><button class="btn" onclick="go('S2')">Saarthi library</button></div>
  </div>
  <div class="stack sticky">
   <div class="card" style="border-top:5px solid var(--teal)"><h3 style="margin-bottom:6px">${ic('guide','sm')} If you know another model</h3><p class="muted small" style="margin-top:0">Where its steps sit within SETU.</p>
    <div class="tabs">${Object.keys(MODELS).map(k=>`<button aria-pressed="${S.ui.model===k}" onclick="S.ui.model='${k}';save();render()">${k}</button>`).join('')}</div>
    <div class="models"><div class="s">SETU</div><div class="s">${md.name}</div>${md.steps.map(([s,m,n])=>`<div><b>${s}</b></div><div>${m?`<b>${m}</b><br>`:'<span class="gap">No match</span><br>'}<span class="muted small">${n}</span></div>`).join('')}</div></div>
   <div class="card"><div class="eyebrow">Jump to</div><div class="jump">${[['g1','The debrief'],['g2','How we speak'],['g2b','What you never do'],['g3','Before and after'],['g4','When things go wrong'],['g5','Further coaching'],['g6','Links']].map(([i,t])=>`<a href="#${i}">${t}</a>`).join('')}</div></div>
  </div>
 </div>`);
}

/* =====================================================================
   C12 · Coaching session  (parked)
   ===================================================================== */
const TREE={
 S:{stage:'Settle',prompt:'How are you arriving today?',branches:[['Present and ready','E'],['Rushed or tense','S2'],['Low or flat','S2']]},
 S2:{stage:'Settle',prompt:'Let\'s take a moment before we start. What would help you settle?',branches:[['A little more present','E']]},
 E:{stage:'Empathise',prompt:'Since last time — how did it go with what you planned?',branches:[['It went well','T'],['Mixed','T'],['It didn\'t happen','E2']]},
 E2:{stage:'Empathise',prompt:'What got in the way? Just what happened.',branches:[['Named it','T']]},
 T:{stage:'Think',prompt:'What would you like to be different by the end of today?',branches:[['Clear focus','T2']]},
 T2:{stage:'Think',prompt:'What do you already know about this — and what are you noticing now?',branches:[['An insight came','U']]},
 U:{stage:'Undertake',prompt:'What will you do next, and when?',branches:[['Action set','END']]},
 END:{stage:'Close',prompt:'Session complete. Record the action and follow-up.',branches:[]},
};
function C12(){
 const s=S.session,n=TREE[s.node];
 const hist=[['1','18 Aug 2026','Clarity on taking a team lead role','Talk to his manager about the role'],['2','1 Sep 2026','The first week as lead','A one-to-one with each of his four people']];
 return wrap('C4',`${head(`<div class="eyebrow">Coaching session · 3 of engagement · parked for re-review</div><h2>Kabir · Mid-management</h2>`)}
 ${say('This is the ongoing S·E·T·U session — Kabir leads, and the report stays in the background.','Mon 21 Sep · 7:00 pm · 45 min.')}
 <div class="hero" style="margin-bottom:18px"><div class="row between"><div><div class="eyebrow">Last time · 1 Sep</div><h2 style="font-size:24px;color:#fff">Action: a one-to-one with each of his four people</h2></div><div><div class="eyebrow">Follow-up</div><b>21 Sep 2026</b></div></div></div>
 <div class="grid3" style="align-items:start">
  <div class="stack" style="grid-column:span 2">
   <div class="card"><div class="field"><label>Focus for today</label><input class="f" value="${esc(s.focus)}" placeholder="What Kabir wants from today" oninput="S.session.focus=this.value;save()"></div></div>
   <div class="card"><div class="row between"><div class="row">${['Settle','Empathise','Think','Undertake'].map(st=>`<span class="pill ${n.stage===st?'teal':''}">${st}</span>`).join('')}</div><button class="btn sm" onclick="S.session.node='S';save();render()">↩ Step back down</button></div>
    <div class="divider"></div><div class="eyebrow">${n.stage}</div><p style="font-family:Georgia,serif;font-size:24px;margin:4px 0 14px">${esc(n.prompt)}</p>
    <div class="row">${n.branches.map(([l,to])=>`<button class="opt" onclick="S.session.node='${to}';save();render()">${esc(l)}</button>`).join('')}</div>
    <div class="field" style="margin-top:14px"><label>Note at this step</label><textarea class="f" oninput="S.session.notes['${s.node}']=this.value;save()">${esc(s.notes[s.node]||'')}</textarea></div></div>
   <div class="card"><h3>Close</h3><div class="grid2"><div class="field"><label>Action</label><input class="f" value="${esc(s.action)}" oninput="S.session.action=this.value;save()"></div><div class="field"><label>Follow-up date</label><input class="f" type="date" value="${esc(s.follow)}" oninput="S.session.follow=this.value;save()"></div></div></div>
  </div>
  <div class="stack sticky">
   <div class="card"><div class="eyebrow">${ic('session','sm')} Engagement</div><h3 style="margin:0">Kabir · 3 sessions</h3><p class="muted small">Ends after 60 days with no booking</p>
    ${hist.map(h=>`<div style="padding:10px 0;border-bottom:1px solid var(--line)"><b>Session ${h[0]}</b> <span class="muted small">· ${h[1]}</span><br><span class="small">Focus: ${esc(h[2])}</span><br><span class="small"><b>Action:</b> ${esc(h[3])}</span></div>`).join('')}
    <div style="padding:10px 0"><b>Session 3</b> <span class="pill teal">Today</span></div></div>
  </div>
 </div>`);
}


/* =====================================================================
   G0–G10 · Gyani Says admin
   ===================================================================== */
const adm=(active,inner)=>wrap(active,inner,{kind:'admin'});
const fin=()=>fullWorkspaceAccess();
const seatBar=(b)=>{const t=b.seatsP+b.seatsO,f=b.filledP+b.filledO;return `<div class="bar ${f>=t?'ok':'gold'}" style="margin:8px 0"><i style="width:${t?Math.round(f/t*100):0}%"></i></div><div class="row between small"><span><b>${f}</b> of ${t} seats</span><span class="muted">${b.seatsP?`${b.filledP}/${b.seatsP} in person · `:''}${b.seatsO?`${b.filledO}/${b.seatsO} online`:''}</span></div>`;};
const stPill=x=>({running:'ok','nearly full':'gold',filling:'',empty:'stop',closed:''})[x]||'';

function G0(){
 const card=(icn,n,t,to)=>`<div class="card lift" style="cursor:pointer" onclick="go('${to}')"><div class="row">${ic(icn,'lg')}<div><div class="big" style="font-size:30px">${n}</div><div class="muted small">${t}</div></div></div></div>`;
 return adm('G0',`${head(`<div class="eyebrow">Gyani Says admin</div><h2>Thursday, 17 September</h2>`)}
 ${say('Three debriefs need assigning today, and two letters are overdue.','Everything below clicks through to the screen that fixes it.')}
 <div class="grid4">
  ${card('debriefs',S.toAssign.length,'to assign','G3')}
  ${card('prepare','2','prep overdue','G1')}
  ${card('letter','2','letters overdue','G1')}
  ${card('put-aside','1','sent back by Aarambh','G1')}
 </div>
 <div class="grid3" style="margin-top:18px;align-items:start">
  <div class="card" style="grid-column:span 2;border-left:5px solid var(--stop)"><h3>${ic('code-of-ethics','sm')} Same-day alerts</h3>
   ${S.alerts.map(a=>`<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span><b>${esc(a.who)}</b> · ${esc(a.what)}<br><span class="muted small">${esc(a.when)}</span></span><span class="pill ${a.kind==='stop'?'stop':a.kind==='gold'?'gold':''}">${a.kind==='stop'?'Call today':'Logged'}</span></div>`).join('')}</div>
  <div class="card"><h3>${ic('letter','sm')} Requests</h3><div class="big">${S.requests.filter(r=>r.state==='open').length}</div><p class="muted small">waiting on you</p><button class="btn sm pri" onclick="go('G1')">Open the inbox</button></div>
 </div>
 <div class="grid3" style="margin-top:18px">
  <div class="card" style="border-left:5px solid var(--gold)"><h3>${ic('level','sm')} Capacity warning</h3><p style="margin:0">Marathi · Mid-management is <b>short 6 debriefs</b> next month.</p><p class="help">Batch 9 must start by 17 Nov to close it.</p><button class="btn sm" onclick="go('G9')">Open capacity</button></div>
  <div class="card"><h3>${ic('time-commitment','sm')} Lapsing this month</h3><p style="margin:0"><b>Leela Iyer</b> — provisional window closes 2 Oct</p><p class="help">Extend once by 2 months, or she stops taking new work.</p><button class="btn sm" onclick="go('G1')">Open roster</button></div>
  <div class="card"><h3>${ic('calendar','sm')} This week in training</h3>
   <div class="small" style="padding:6px 0;border-bottom:1px solid var(--line)">Fri 18 Sep · Batch 7, module 3</div>
   <div class="small" style="padding:6px 0;border-bottom:1px solid var(--line)">Sat 19 Sep · two observed debriefs to mark</div>
   <div class="small" style="padding:6px 0">Mon 21 Sep · mentor sign-off due, Leela Iyer</div></div>
 </div>`);
}

function G1(){
 const tab=S.admin.g1tab||'roster';
 const tabs=[['roster','Roster'],['requests','Requests · '+S.requests.filter(r=>r.state==='open').length]];
 let inner;
 if(tab==='roster'){
  const undPill=r=>r.und==='ended'?'<span class="pill stop">access ended</span>':r.und?`<span class="small">${esc(r.und.replace(/ 2026$/,''))}</span>`:'<span class="pill stop">not signed · no readings</span>';
  inner=`<div class="tscroll"><table class="t"><thead><tr><th>Coach · type</th><th>Stage</th><th>Rank</th><th>Level</th><th>Languages</th><th>Category</th>${fin()?'<th>Slab</th>':''}<th>Rating</th><th>Work</th><th>Warnings</th><th>Code · undertaking</th><th>Organisations</th></tr></thead><tbody>
   ${S.roster.map((r,ri)=>`<tr class="click" onclick="coachRec(${ri})"><td style="min-width:128px"><b>${esc(r.n)}</b><br>${r.kind==='org'?`<span class="pill teal">${esc(r.org)}'s coach</span>`:'<span class="pill">Ours</span>'}${r.adv?' <span class="pill maroon">Advanced</span>':''}</td>
    <td><span class="pill ${r.stage==='Active'?'ok':r.stage==='Provisional'?'gold':''}">${r.stage}</span></td><td class="small">${r.stage==='Active'||r.stage==='Provisional'?esc(rankOf(r.rank).name):'—'}</td><td>${r.lvl}</td><td class="small">${esc(r.lang)}</td><td>${r.cat}</td>${fin()?`<td>Slab ${r.cat==='A'?'1':'2'}</td>`:''}
    <td>${r.rate?r.rate:'—'}</td><td class="small">${esc(r.work)}</td><td>${r.warn?`<span class="pill ${r.warn>1?'stop':'gold'}">${r.warn}</span>`:'—'}</td><td><span class="small">Code ${r.code}</span><br>${undPill(r)}</td><td class="small">${esc(r.orgs)}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="grid4" style="margin-top:18px"><div class="note plain small">Every change needs a <b>reason</b>, and lands in the activity log (G10).</div><div class="note plain small"><b>No undertaking, no readings.</b> A coach who has not signed the current version is held out of any debrief.</div><div class="note plain small">An <b>organisation's coach</b> takes only that organisation's people. Unassigning them ends their access the same day.</div><div class="note plain small">Enrolment happens in <b>G2</b> — there is no "approve registration".</div></div>`;
 } else {
  inner=`${say('Every message a coach sends you lands here.','Detail corrections, time changes, public cards, and requests to move a booking.')}
  ${S.requests.map(r=>`<div class="card" style="margin-bottom:12px"><div class="row between"><div><span class="pill maroon">${esc(r.type)}</span> <b>${esc(r.who)}</b><div style="margin-top:6px">${esc(r.what)}</div><div class="muted small">${esc(r.when)} · touches ${esc(r.touches)}</div></div>
   <div class="row">${r.state==='open'?`<button class="btn sm pri" onclick="reqDo('${r.id}','done')">Approve</button><button class="btn sm" onclick="reqDo('${r.id}','declined')">Decline with a reason</button>`:`<span class="pill ${r.state==='done'?'ok':''}">${r.state==='done'?'Done':'Declined'}</span>`}</div></div></div>`).join('')}
  <div class="note plain small">"Ended early" and "client didn't join" are <b>same-day alerts on G0</b>, not queue items.</div>`;
 }
 return adm('G1',`${head(`<div class="eyebrow">Roster and requests</div><h2>Every coach, and everything they've asked for</h2>`,'Ours and the coaches organisations appoint, side by side — with the rank, the level and the undertaking each one has signed.')}
 <div class="tabs">${tabs.map(([k,t])=>`<button aria-pressed="${tab===k}" onclick="S.admin.g1tab='${k}';save();render()">${t}</button>`).join('')}</div>${inner}`);
}
function coachRec(i){const r=S.roster[i];const f=fin();
 const pick=(k,opts,cur)=>opts.map(o=>{const v=Array.isArray(o)?o[0]:o,t=Array.isArray(o)?o[1]:o;return `<button class="opt" style="padding:7px 12px;font-size:15px;min-height:36px" aria-pressed="${cur===v}" onclick="setRec(${i},'${k}','${v}')">${t}</button>`;}).join('');
 modal(`<h3>${esc(r.n)}</h3><div class="row"><span class="pill ${r.stage==='Active'?'ok':'gold'}">${r.stage}</span><span class="pill">Level ${r.lvl} · from Saarthi</span><span class="pill">${esc(r.lang)}</span>${r.adv?'<span class="pill maroon">Advanced</span>':''}${r.kind==='org'?`<span class="pill teal">Appointed by ${esc(r.org)}</span>`:''}</div>
 <div class="divider"></div>
 <div class="grid2" style="align-items:start"><div>
 <span class="fl">Coach type</span><div class="row">${pick('kind',[['ours','Gyani Says coach'],['org','Appointed by an organisation']],r.kind||'ours')}</div>
 <p class="help">The two do not have the same standing: an organisation's coach is a person at that organisation, so they take only its people.</p>
 <span class="fl" style="margin-top:14px">Rank</span><div class="row">${pick('rank',RANKS.map(x=>[x.k,x.name]),r.rank||'Certified')}</div>
 <p class="help">${RANKS.map(x=>`<b>${x.name}:</b> ${esc(x.how)}`).join('<br>')}</p>
 <span class="fl" style="margin-top:14px">Data undertaking</span><div class="row">${r.und==='ended'?'<span class="pill stop">Access ended</span>':r.und?`<span class="pill ok">Signed ${esc(r.und)}</span>`:'<span class="pill stop">Not signed — no readings</span><button class="btn sm" onclick="toast(\'Reminder sent — they sign at next login\')">Send a reminder</button>'}</div>
 ${r.kind==='org'&&r.und!=='ended'?`<button class="btn sm danger" style="margin-top:10px" onclick="endAccess(${i})">Unassigned, or left ${esc(r.org)} — end access now</button>`:''}
 </div><div>
 <span class="fl">Category — admin's judgment. The coach sees the letter, never the meaning</span><div class="row">${pick('cat',['A','B','C','D'],r.cat)}</div>
 <p class="help">D is built but switched off (spec open item 11). At least 10 ratings before a change, and the quarterly review decides — never SETU.</p>
 <span class="fl" style="margin-top:14px">Fixed or growing</span><div class="row">${pick('fix',['Growing','Fixed'],r.fix||'Growing')}</div>
 <p class="help">A backlog is never cleared by pushing fixed coaches up. Admin screens say "locked"; the coach's screen says "fixed".</p>
 <span class="fl" style="margin-top:14px">May take "Can't say" clients</span><div class="row">${pick('cs',['Default rule','Yes','No'],r.cs||'Default rule')}</div>
 <span class="fl" style="margin-top:14px">Organisation certifications · Advanced</span><div class="row"><span class="pill ${r.orgs==='—'?'':'ok'}">${esc(r.orgs)}</span><span class="pill ${r.adv?'ok':''}">${r.adv?'Advanced passed':'Advanced not started'}</span><button class="btn sm ghost" onclick="closeModal();S.admin.g2tab='batches';go('G2')">Open a batch in G2</button></div>
 <span class="fl" style="margin-top:14px">Pay slab</span><div class="row">${f?pick('slab',['1','2','3','4'],r.slab||'2'):'<span class="pill">Finance admin only</span>'}</div>
 </div></div>
 <div class="divider"></div>
 <div class="field"><label>Reason — required for any change</label><input class="f" id="recwhy" placeholder="Why this changes"></div>
 <div class="note plain small">Every change is logged in G10 with your name, the time and this reason. Nothing here is ever automatic.</div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Close</button><button class="btn danger" onclick="toast('Paused — bookings move to G3');closeModal()">Pause this coach</button></div>`,true);}
const REC_LABEL={cat:'category',fix:'fixed/growing',cs:'can\'t say',slab:'slab',kind:'coach type',rank:'rank'};
function setRec(i,k,v){const why=($('recwhy')||{}).value||'';
 if(!why.trim()){toast('Give a reason first');return;}
 const r=S.roster[i];const was=r[k]||'—';r[k]=v;
 if(k==='kind'&&v==='org'&&!r.org)r.org=ORGS.abc.name;
 logAct(`${r.n} — ${REC_LABEL[k]||k} ${was} → ${v}`,why);
 save();closeModal();render();toast('Changed · logged with your reason');}
function endAccess(i){const why=($('recwhy')||{}).value||'';if(!why.trim()){toast('Give a reason first');return;}
 const r=S.roster[i];r.und='ended';logAct(`${r.n} — access to ${r.org}'s readings ended`,why);save();closeModal();render();toast('Access ended today · logged in G10');}
function reqDo(id,st){const r=S.requests.find(x=>x.id===id);r.state=st;save();render();toast(st==='done'?'Approved — the coach sees it on their screen':'Declined — reason recorded');}

/* =====================================================================
   Saarthi pass · 5 Oct 2026 — batches and seats (21) · faculty and mentor records (22) ·
   the curriculum (24) · ranks · the data undertaking and the two coach types
   ===================================================================== */
const PROGS=[['core','Core programme'],['track','Role track'],['adv','Advanced'],['org','Organisation update'],['induct','Faculty induction']];
const progName=k=>(PROGS.find(p=>p[0]===k)||[k,k])[1];
const RANKS=[
 {k:'Certified',name:'Certified Coach',how:'Pass the exam, sign the Code, reach Active',adds:'Debriefs at your level'},
 {k:'Senior',name:'Senior Coach',how:'The Advanced Programme · logged hours · observed sessions · panel review',adds:'Multi-session coaching — the key and coaching sessions — and Paradox and Team reports'},
 {k:'Lead',name:'Lead Coach',how:'Further hours · observation · panel review',adds:'Group and team coaching · CXO work · may be made mentor or faculty by admin'}];
const rankOf=k=>RANKS.find(r=>r.k===k)||RANKS[0];
const credLine=()=>`${rankOf(S.coach.rank).name}, The Saarthi System`;
const UNDERTAKING={ver:'v1.0',published:'10 Sep 2026',owner:'Gyani Says',parts:[
 'I see a person\'s reading only for a debrief or coaching I am assigned to',
 'I never copy, download, photograph or forward a reading, a note or a recording',
 'I never discuss a reading with anyone but the person it belongs to — not their employer, not a colleague, not another coach',
 'My access ends when I am unassigned, when the engagement closes, or when I leave the organisation that appointed me',
 'I report a lost device or a wrong disclosure to Gyani Says the same day',
 'Breaking this undertaking is misconduct under the Code of Ethics, and access stops at once']};
const EXAM_PARTS=['Written','Dossier practical','Observed debrief','Oral viva'];
const CITIES=['Pune','Mumbai','Bengaluru','Delhi','Chennai','Kochi','Hyderabad','Kolkata'];
const batchById=id=>S.batches.find(b=>b.id===id);
const facById=id=>S.faculty.find(f=>f.id===id);
const facNames=ids=>(ids||[]).map(id=>(facById(id)||{}).name).filter(Boolean).join(' · ')||'— none yet';
function daysTo(d){return Math.round((new Date(d+'T00:00:00')-new Date(TODAY+'T00:00:00'))/864e5);}
function batchState(b){if(b.closed||b.end<TODAY)return 'closed';if(b.start<=TODAY)return 'running';const t=b.seatsP+b.seatsO,f=b.filledP+b.filledO;if(!f)return 'empty';if(f>=t)return 'full';if(f/t>=.8)return 'nearly full';return 'filling';}
const modeLabel=b=>b.mode==='online'?'Online only':b.mode==='inperson'?`${b.city} · in person`:`${b.city} + online`;
const overlap=(a1,a2,b1,b2)=>a1<=b2&&b1<=a2;
function nextSession(b){return (b.sessions||[]).find(s=>s[0]>=TODAY)||null;}
function myBatch(){return batchById(S.saarthi.batch)||S.batches[0];}
function myTrainee(){return S.trainees.find(t=>t.n===S.saarthi.name)||{};}
function calibState(f){if(!f.calib)return ['Not calibrated','gold'];return f.calib.due<TODAY?[`Overdue since ${fmtDate(f.calib.due)}`,'stop']:[`Done ${fmtDate(f.calib.last)} · due ${fmtDate(f.calib.due)}`,'ok'];}
function canMark(f){return f.state==='active'&&f.calib&&f.calib.due>=TODAY;}
/* Who may teach a batch — every reason a trainer is left out is shown, never hidden */
function facultyFit(f,prog,start,end,mode,city,skipId){
 const why=[];
 if(f.state!=='active')why.push(f.state==='in induction'?'still in induction':'paused');
 if(!f.teaches.includes(prog))why.push('not cleared to teach this programme');
 if(mode!=='online'&&f.city!==city&&!(mode==='both'&&f.online))why.push(`not in ${city}`);
 if(mode==='online'&&!f.online)why.push('does not teach online');
 const busy=S.batches.filter(b=>b.id!==skipId&&(b.facultyIds||[]).includes(f.id)&&overlap(start,end,b.start,b.end));
 if(busy.length)why.push(`teaching ${busy[0].name} on those dates`);
 const month=start.slice(0,7),inMonth=S.batches.filter(b=>b.id!==skipId&&(b.facultyIds||[]).includes(f.id)&&b.start.slice(0,7)===month).length;
 if(inMonth>=f.capBatches)why.push(`already at ${f.capBatches} batches that month`);
 return why;}
function mentorFit(f){const why=[];if(!/Mentor/.test(f.kind))why.push('not a mentor');if(f.state!=='active')why.push('not active');if(f.mentees.length>=6)why.push('has 6 mentees already');return why;}
const stPillB=x=>({running:'ok',full:'ok','nearly full':'gold',filling:'',empty:'stop',closed:''})[x]||'';
const seatLine=(b)=>`${b.seatsP?`<div class="row between small"><span>In person</span><b>${b.filledP} of ${b.seatsP}</b></div><div class="bar ${b.filledP>=b.seatsP?'ok':'gold'}" style="margin:4px 0 8px"><i style="width:${Math.round(b.filledP/b.seatsP*100)}%"></i></div>`:''}${b.seatsO?`<div class="row between small"><span>Online</span><b>${b.filledO} of ${b.seatsO}</b></div><div class="bar ${b.filledO>=b.seatsO?'ok':'gold'}" style="margin:4px 0 8px"><i style="width:${Math.round(b.filledO/b.seatsO*100)}%"></i></div>`:''}`;
function logAct(what,why){S.activity.unshift({when:'today',who:S.admin.role==='finance'?'Finance · Rahul':'Admin · Priyanka',what,why:why||'—'});}

/* ---------------- G2 · Training: programmes, applications, faculty, curriculum, people ---------------- */
function G2(){
 const tab=S.admin.g2tab||'batches';
 const tabs=[['batches','Programmes and batches'],['apps','Applications · '+S.apps.filter(a=>!['enrolled'].includes(a.state)).length],['faculty','Faculty and mentors'],['curriculum','Curriculum'],['people','People in training']];
 let inner='';
 if(tab==='batches'){
  const pf=S.admin.g2prog||'all';
  const list=S.batches.filter(b=>pf==='all'||b.prog===pf).sort((a,b)=>a.start<b.start?-1:1);
  const needs=S.batches.filter(b=>!['closed','running'].includes(batchState(b))&&(!(b.facultyIds||[]).length||!(b.mentorIds||[]).length));
  inner=`<div class="grid2" style="align-items:start;margin-bottom:6px">${say('A batch is where seats live. Fill it, and enrolment gives someone one of those seats.','Physical and online seats are counted apart. A batch cannot run without eligible faculty and a mentor, and practical work runs at one faculty member to six learners.')}
   <div class="card" style="border-left:5px solid ${needs.length?'var(--stop)':'var(--ok)'}"><h3 style="margin-bottom:6px">${ic('calendar','sm')} Needs you</h3>${needs.length?needs.map(b=>`<div class="row between small" style="padding:7px 0;border-bottom:1px solid var(--line)"><span><b>${esc(b.name)}</b> · starts in ${daysTo(b.start)} days</span><span class="pill stop">${!(b.facultyIds||[]).length?'no faculty':'no mentor'}</span></div>`).join(''):'<p style="margin:0">Every upcoming batch has faculty and a mentor.</p>'}
    ${S.batches.filter(b=>(b.waitP||[]).length+(b.waitO||[]).length).map(b=>`<div class="row between small" style="padding:7px 0;border-bottom:1px solid var(--line)"><span><b>${esc(b.name)}</b> is full</span><span class="pill gold">${(b.waitP||[]).length+(b.waitO||[]).length} waiting</span></div>`).join('')}</div></div>
  <div class="tabs">${[['all','All programmes'],...PROGS].map(([k,t])=>`<button aria-pressed="${pf===k}" onclick="S.admin.g2prog='${k}';save();render()">${t} · ${k==='all'?S.batches.length:S.batches.filter(b=>b.prog===k).length}</button>`).join('')}</div>
  <div class="grid3">${list.map(b=>{const st=batchState(b),w=(b.waitP||[]).length+(b.waitO||[]).length,d=daysTo(b.start);
   return `<div class="card lift" style="cursor:pointer" onclick="openBatch('${b.id}')"><div class="row between"><div><div class="eyebrow" style="margin:0">${progName(b.prog)}</div><h3 style="margin:2px 0 0">${esc(b.name)}</h3></div><span class="pill ${stPillB(st)}">${st}</span></div>
   <p class="muted small" style="margin:6px 0 10px">${fmtDate(b.start)} – ${fmtDate(b.end)} · ${esc(modeLabel(b))}${st==='closed'||st==='running'?'':` · <b style="color:var(--ink)">${d} days to start</b>`}</p>
   ${seatLine(b)}
   ${w?`<div class="small"><span class="pill gold">Waitlist · ${w}</span></div>`:''}
   <dl class="kv small" style="grid-template-columns:96px 1fr;margin-top:8px"><dt>Faculty</dt><dd>${(b.facultyIds||[]).length?esc(facNames(b.facultyIds)):'<span class="pill stop">none — cannot run</span>'}</dd><dt>Mentors</dt><dd>${(b.mentorIds||[]).length?esc(facNames(b.mentorIds)):'<span class="pill stop">none yet</span>'}</dd><dt>Teaches</dt><dd>${esc(b.verLabel||'—')}</dd></dl></div>`;}).join('')}
   <button class="card lift" style="border:1px dashed var(--line-2);cursor:pointer;text-align:left" onclick="batchBuilder()"><div class="row">${ic('calendar','lg')}<div><b style="font-size:18px">New batch</b><div class="muted small">Programme · dates · venue and mode · seats in person and online · faculty and mentors, filtered to who is eligible and free</div></div></div></button>
  </div>`;
 } else if(tab==='apps'){
  inner=`${say('Applications arrive from the Apply form on the Gyani Says website, tagged with where they came from.','Screen them, offer a batch that matches what they asked for, then enrol — which assigns a seat, creates the account and sends the invite.')}
  <div class="tscroll"><table class="t"><thead><tr><th>Applicant</th><th>Applying as</th><th>Wants</th><th>Can attend</th><th>Languages</th><th>Source</th><th>State</th><th></th></tr></thead><tbody>
  ${S.apps.map(a=>`<tr class="click" onclick="appView('${a.id}')"><td><b>${esc(a.name)}</b><br><span class="muted small">${esc(a.city)} · ${a.years} years</span></td><td><span class="pill ${a.as==='trainer'?'maroon':''}">${a.as==='trainer'?'Trainer / mentor':'Coach'}</span></td><td class="small">${esc(a.mode)} · ${esc(a.pref)}${a.tracks?`<br><span class="muted">${esc(a.tracks)}</span>`:''}</td><td class="small">${esc(a.days||'—')}</td><td class="small">${esc(a.langs)}</td><td><span class="pill">${esc(a.source)}</span></td>
   <td><span class="pill ${a.state==='enrolled'?'ok':a.state==='waitlisted'||a.state==='interviewing'||a.state==='offered'?'gold':''}">${a.state}${a.offer?` · ${esc((batchById(a.offer)||{}).name||'')}`:''}</span></td>
   <td style="text-align:right;white-space:nowrap" onclick="event.stopPropagation()">${a.state==='enrolled'?'—':`<button class="btn sm" onclick="offerBatch('${a.id}')">Offer a batch</button> <button class="btn sm pri" onclick="enrol('${a.id}')">Enrol</button>`}</td></tr>`).join('')}
  </tbody></table></div>
  <p class="help">Click a row to see everything they gave on the Apply form. Details are entered once — enrolment copies them across.</p>`;
 } else if(tab==='faculty'){
  inner=`<div class="grid2" style="align-items:start">${say('Faculty and mentors have records of their own.','A batch can only be built from trainers who are eligible and free. A mentor takes at most six mentees, and never marks their own mentee\'s exam.')}
   <div class="card"><h3 style="margin-bottom:6px">${ic('faculty','sm')} Two ways in</h3><div class="grid2"><button class="opt" onclick="promoteModal()"><b>Promote an Active coach</b><em>Criteria still open (spec open item 15)</em></button><button class="opt" onclick="S.admin.g2tab='apps';save();render()"><b>An external trainer</b><em>Applies on W1 as "trainer or mentor", then the induction</em></button></div></div></div>
  <div class="tscroll"><table class="t"><thead><tr><th>Name</th><th>Role · route</th><th>Teaches</th><th>May mark</th><th>Where</th><th>Mentees</th><th>Calibration</th><th>State</th></tr></thead><tbody>
  ${S.faculty.map(f=>{const c=calibState(f);return `<tr class="click" onclick="facRec('${f.id}')"><td><b>${esc(f.name)}</b><br><span class="muted small">${esc(f.langs)}</span></td><td class="small">${esc(f.kind)}<br><span class="muted">${esc(f.route)}</span></td><td class="small">${f.teaches.length?f.teaches.map(progName).join(' · '):'—'}</td><td class="small">${f.marks.length?f.marks.join(' · '):'—'}</td><td class="small">${esc(f.city)}${f.online?' · also online':''}</td><td>${/Mentor/.test(f.kind)?`<span class="pill ${f.mentees.length>=6?'gold':''}">${f.mentees.length} of 6</span>`:'—'}</td><td><span class="pill ${c[1]}">${c[0]}</span></td><td><span class="pill ${f.state==='active'?'ok':'gold'}">${f.state}</span></td></tr>`;}).join('')}
  </tbody></table></div>
  <div class="grid3" style="margin-top:14px"><div class="note plain small">Calibration: two raters mark the same observed debrief alone; a third decides if they disagree. <b>Re-done every six months</b> — overdue means no exam marking until it is.</div><div class="note plain small">Batch building filters by programme, city or online, free dates and <b>batches a month</b>.</div><div class="note plain small">Rate band is <b>Finance admin only</b>.</div></div>`;
 } else if(tab==='curriculum'){
  const pf=S.admin.g2cprog||'core';
  const mods=S.modules.filter(m=>m.prog===pf);
  inner=`<div class="grid2" style="align-items:start">${say('Each module is a version, not a title.','A batch teaches one known version. When the assessment or the reading rules change, the module is marked, a new version is published, and certified coaches get a short update module.')}
   <div class="card"><h3 style="margin-bottom:6px">${ic('module','sm')} Waiting on a new version</h3>${S.modules.filter(m=>m.status==='needs update').map(m=>`<div class="row between small" style="padding:7px 0;border-bottom:1px solid var(--line)"><span><b>${esc(m.title)}</b> · ${esc(m.why||'')}</span><button class="btn sm pri" onclick="modRec('${m.id}')">Open</button></div>`).join('')||'<p style="margin:0">Nothing — every module is current.</p>'}</div></div>
  <div class="tabs">${PROGS.map(([k,t])=>`<button aria-pressed="${pf===k}" onclick="S.admin.g2cprog='${k}';save();render()">${t} · ${S.modules.filter(m=>m.prog===k).length}</button>`).join('')}</div>
  <div class="tscroll"><table class="t"><thead><tr><th>#</th><th>Module</th><th>Version</th><th>Published</th><th>Owner</th><th>Examined by</th><th>Batches on it</th></tr></thead><tbody>
  ${mods.map(m=>`<tr class="click" onclick="modRec('${m.id}')"><td>${esc(m.n)}</td><td><b>${esc(m.title)}</b> ${m.status!=='current'?`<span class="pill ${m.status==='needs update'?'stop':'ok'}">${m.status}</span>`:''}</td><td>${m.ver}</td><td class="small">${fmtDate(m.date)}</td><td class="small">${esc(m.owner)}</td><td class="small">${esc(m.exam)}</td><td class="small">${S.batches.filter(b=>b.vers&&b.vers[m.id]).map(b=>`${esc(b.name)} <span class="muted">(${b.vers[m.id]})</span>`).join(', ')||'—'}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="grid2" style="margin-top:16px"><div class="card"><h4>${ic('library','sm')} Library versions</h4>${LIB.map(L=>`<div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>${L.name}</span><span><span class="pill">${L.ver}</span> <button class="btn sm ghost" onclick="toast('Publish a new version — prototype')">Publish</button></span></div>`).join('')}</div>
  <div class="card"><h4>${ic('debriefs','sm')} Question Bank proposals</h4>
  ${(S.bankQ||[]).map(x=>`<div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>“${esc(x.q)}” · from ${esc(x.from)}, ${esc(x.when)}</span><button class="btn sm pri" onclick="toast('Approved into the Bank')">Approve</button></div>`).join('')}
  <div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>“What does a good week look like for you?” · from Imran Sheikh</span><button class="btn sm pri" onclick="toast('Approved into the Bank')">Approve</button></div><p class="help">Faculty approve. Approved questions appear in every coach's bank.</p></div></div>`;
 } else {
  inner=`<div class="tscroll"><table class="t"><thead><tr><th>Person</th><th>Coach type</th><th>Batch</th><th>Modules</th><th>Own assessment</th><th>Undertaking</th><th>Mentor</th><th>Exam markers</th><th>Stage</th></tr></thead><tbody>
  ${S.trainees.map((t,i)=>{const b=batchById(t.batch)||{};const mk=Object.keys(t.raters||{}).length;return `<tr><td><b>${esc(t.n)}</b></td><td>${t.kind==='org'?`<span class="pill teal">${esc(t.org)}'s coach</span>`:'<span class="pill">Gyani Says</span>'}</td><td class="small">${esc(b.name||'—')}</td><td>${t.mods} of 5</td><td><span class="pill ${t.own==='done'?'ok':'gold'}">${t.own}</span>${t.own!=='done'&&t.due?`<br><span class="muted small">due ${fmtDate(t.due)}</span>`:''}</td><td class="small">${t.und==='—'?'<span class="pill gold">at first login</span>':esc(t.und)}</td><td class="small">${esc((facById(t.mentor)||{}).name||'— to assign')}</td><td>${t.exam==='Passed'?'<span class="pill ok">marked</span>':`<button class="btn sm" onclick="ratersModal(${i})">${mk?`${mk} of 4 parts set`:'Set markers'}</button>`}</td><td><span class="pill ${/Provisional/.test(t.stage)?'gold':''}">${esc(t.stage)}</span></td></tr>`;}).join('')}
  </tbody></table></div>
  ${S.trainees.filter(t=>t.own!=='done').map(t=>`<div class="note" style="margin-top:14px">${ic('exam','sm')} <b>Own assessment not started: ${esc(t.n)}.</b> It must be done by ${fmtDate(t.due)} — two days before Day 1 — so the report exists to be debriefed. <button class="btn sm" onclick="toast('Reminder sent')">Send a reminder</button></div>`).join('')}
  <div class="grid2" style="margin-top:14px"><div class="note plain small">An <b>organisation's coach</b> trains in full, exactly like ours, and signs the same undertaking. They take only that organisation's people.</div><div class="note plain small">Exam markers come from faculty cleared for that part, with calibration in date — <b>never the trainee's own mentor</b>.</div></div>`;
 }
 return adm('G2',`${head(`<div class="eyebrow">Training</div><h2>Programmes, people and content</h2>`,'Everything Saarthi runs on: batches and seats, the people who apply, the people who teach, and what is taught.')}
 <div class="tabs">${tabs.map(([k,t])=>`<button aria-pressed="${tab===k}" onclick="S.admin.g2tab='${k}';save();render()">${t}</button>`).join('')}</div>${inner}`);
}

/* ----- a batch, opened ----- */
function openBatch(id){const b=batchById(id),st=batchState(b);
 const others=S.batches.filter(x=>x.id!==b.id&&x.prog===b.prog&&!['closed','running'].includes(batchState(x)));
 const wl=(arr,kind)=>(arr||[]).map((n,j)=>`<div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span><b>${j+1}.</b> ${esc(n)} · ${kind}</span><span class="row"><button class="btn sm" onclick="offerSeat('${b.id}','${kind}',${j})">Offer a seat</button>${others.length?`<select class="f" style="width:auto;padding:6px 10px;font-size:15px" onchange="moveWait('${b.id}','${kind}',${j},this.value)"><option value="">Move to…</option>${others.map(o=>`<option value="${o.id}">${esc(o.name)} · ${fmtDate(o.start)}</option>`).join('')}</select>`:''}</span></div>`).join('');
 modal(`<div class="row between"><div><div class="eyebrow" style="margin:0">${progName(b.prog)}</div><h3 style="margin:2px 0 0">${esc(b.name)}</h3></div><span class="pill ${stPillB(st)}">${st}</span></div>
 ${b.changed?`<div class="note" style="margin-top:12px">Dates changed ${esc(b.changed.when)} — from ${esc(b.changed.from)}. Everyone in the batch was told.</div>`:''}
 <div class="grid2" style="margin-top:14px;align-items:start"><div>
  <dl class="kv small" style="grid-template-columns:110px 1fr"><dt>Runs</dt><dd>${fmtDate(b.start)} – ${fmtDate(b.end)}${st==='closed'||st==='running'?'':` · ${daysTo(b.start)} days to start`}</dd><dt>Where</dt><dd>${esc(modeLabel(b))}${b.venue?` · ${esc(b.venue)}`:''}</dd><dt>Faculty</dt><dd>${esc(facNames(b.facultyIds))}</dd><dt>Mentors</dt><dd>${esc(facNames(b.mentorIds))}</dd><dt>Teaches</dt><dd>${esc(b.verLabel||'—')}</dd></dl>
  <div style="margin-top:12px">${seatLine(b)}</div></div>
  <div><span class="fl">Sessions</span>${(b.sessions||[]).map(s=>`<div class="row between small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${fmtDate(s[0])} · ${hhmm(mm(s[1]))}</span><span>${esc(s[2])}</span></div>`).join('')||'<p class="muted small">Sessions are set when the batch is published.</p>'}</div></div>
 <div class="divider"></div>
 <span class="fl">Waitlist</span>${wl(b.waitP,'In person')}${wl(b.waitO,'Online')}${(b.waitP||[]).length+(b.waitO||[]).length?'':'<p class="muted small" style="margin:0">Nobody waiting.</p>'}
 ${st==='closed'?'':`<div class="divider"></div><span class="fl">Change the dates — everyone in the batch is told</span>
 <div class="row"><input class="f" type="date" id="bs" value="${b.start}" style="width:auto"><input class="f" type="date" id="be" value="${b.end}" style="width:auto"><input class="f" id="bwhy" placeholder="Reason — required" style="flex:1;min-width:200px"><button class="btn" onclick="moveDates('${b.id}')">Change and tell them</button></div>`}
 <div class="row" style="justify-content:flex-end;margin-top:16px">${st==='closed'?'':`<button class="btn danger" onclick="closeBatch('${b.id}')">Close this batch</button>`}<button class="btn" onclick="closeModal()">Close</button></div>`,true);}
function moveDates(id){const b=batchById(id),s=$('bs').value,e=$('be').value,why=$('bwhy').value.trim();
 if(!why){toast('Give a reason first');return;}if(!s||!e||e<s){toast('Check the dates');return;}
 const from=`${fmtDate(b.start)} – ${fmtDate(b.end)}`;const shift=daysTo(s)-daysTo(b.start);
 b.start=s;b.end=e;b.sessions=(b.sessions||[]).map(x=>[addDays(x[0],shift),x[1],x[2]]);b.changed={when:'today',from};
 S.notices.unshift({batch:b.id,text:`${b.name} has moved: now ${fmtDate(s)} – ${fmtDate(e)} (was ${from}).`,why});
 logAct(`${b.name} — dates moved, was ${from}`,why);save();closeModal();render();toast('Dates changed · everyone in the batch told');}
function closeBatch(id){const b=batchById(id);const why=prompt('Why is this batch closing?');if(!why)return;b.closed=true;logAct(`${b.name} — closed`,why);save();closeModal();render();toast('Batch closed · logged');}
function offerSeat(id,kind,j){const b=batchById(id);const k=kind==='Online'?'O':'P';
 if(b['filled'+k]>=b['seats'+k]){toast(`No ${kind.toLowerCase()} seat free yet — they stay first in line`);return;}
 const n=b['wait'+k].splice(j,1)[0];b['filled'+k]++;const a=S.apps.find(x=>x.name===n);if(a)a.state='enrolled';
 logAct(`${n} — offered a ${kind.toLowerCase()} seat in ${b.name}`,'From the waitlist');save();openBatch(id);render();toast(`${n} offered the seat`);}
function moveWait(id,kind,j,to){if(!to)return;const b=batchById(id),t=batchById(to);const k=kind==='Online'?'O':'P';
 const n=b['wait'+k].splice(j,1)[0];const a=S.apps.find(x=>x.name===n);if(a){a.offer=to;a.state='offered';}
 logAct(`${n} — offered ${t.name} instead of ${b.name}`,'Batch full');save();closeModal();render();toast(`${n} offered ${t.name}`);}

/* ----- build a batch: faculty and mentors filtered to who is eligible and free ----- */
function batchBuilder(){
 const d=S.admin.nb||(S.admin.nb={prog:'core',name:'',start:'2026-11-24',end:'2026-12-11',mode:'both',city:'Pune',venue:'',seatsP:6,seatsO:6,fac:[],men:[]});
 const fac=S.faculty.map(f=>({f,why:facultyFit(f,d.prog,d.start,d.end,d.mode,d.city)}));
 const men=S.faculty.filter(f=>/Mentor/.test(f.kind)).map(f=>({f,why:mentorFit(f)}));
 const seats=(+d.seatsP||0)+(+d.seatsO||0),ratioOk=d.fac.length*6>=seats;
 const row=(x,arr,key)=>{const on=d[key].includes(x.f.id),ok=!x.why.length;
  return `<label class="check ${on?'on':''}" style="${ok?'':'opacity:.55;cursor:not-allowed;border-style:dashed'}"><input type="checkbox" ${on?'checked':''} ${ok?'':'disabled'} onchange="nbTog('${key}','${x.f.id}')"><span><b>${esc(x.f.name)}</b> <span class="muted small">· ${esc(x.f.city)}${x.f.online?' · online':''}${key==='men'?` · ${x.f.mentees.length} of 6 mentees`:''}</span>${ok?'<br><span class="small" style="color:var(--ok)">Eligible and free</span>':`<br><span class="small" style="color:var(--stop)">Left out: ${esc(x.why.join(' · '))}</span>`}</span></label>`;};
 const inp=(k,label,type='text',extra='')=>`<div class="field"><label>${label}</label><input class="f" type="${type}" value="${esc(d[k])}" ${extra} onchange="S.admin.nb.${k}=this.value;save();batchBuilder()"></div>`;
 modal(`<h3>New batch</h3><p class="muted" style="margin-top:0">The faculty and mentor lists re-check themselves as you change the programme, the dates or the place.</p>
 <div class="grid3"><div class="field"><label>Programme</label><select class="f" onchange="S.admin.nb.prog=this.value;S.admin.nb.fac=[];save();batchBuilder()">${PROGS.map(([k,t])=>`<option value="${k}" ${d.prog===k?'selected':''}>${t}</option>`).join('')}</select></div>
  ${inp('name','Name','text','placeholder="e.g. Batch 10"')}
  <div class="field"><label>Mode</label><select class="f" onchange="S.admin.nb.mode=this.value;S.admin.nb.fac=[];save();batchBuilder()">${[['both','In person + online'],['inperson','In person only'],['online','Online only']].map(([k,t])=>`<option value="${k}" ${d.mode===k?'selected':''}>${t}</option>`).join('')}</select></div></div>
 <div class="grid4">${inp('start','Starts','date')}${inp('end','Ends','date')}
  <div class="field"><label>City</label><select class="f" ${d.mode==='online'?'disabled':''} onchange="S.admin.nb.city=this.value;S.admin.nb.fac=[];save();batchBuilder()">${CITIES.map(c=>`<option ${d.city===c?'selected':''}>${c}</option>`).join('')}</select></div>${inp('venue','Venue','text','placeholder="Centre and room"')}</div>
 <div class="grid4">${d.mode==='online'?'<div></div>':inp('seatsP','Seats in person','number','min="0"')}${d.mode==='inperson'?'<div></div>':inp('seatsO','Seats online','number','min="0"')}
  <div style="grid-column:span 2;align-self:end"><div class="note ${ratioOk?'ok':'stop'} small">${seats} seats · ${d.fac.length} faculty — ${ratioOk?'within one faculty member to six learners':`practical work needs one faculty member to six learners: add faculty or cut ${seats-d.fac.length*6} seats`}</div></div></div>
 <div class="grid2" style="margin-top:6px;align-items:start"><div><span class="fl">Faculty — eligible and free first</span>${fac.sort((a,b)=>a.why.length-b.why.length).map(x=>row(x,fac,'fac')).join('')}</div>
  <div><span class="fl">Mentors — at most 6 mentees each</span>${men.sort((a,b)=>a.why.length-b.why.length).map(x=>row(x,men,'men')).join('')}
  <div class="note plain small" style="margin-top:8px">The batch teaches the modules at their <b>current versions</b>, fixed when you create it (see Curriculum).</div></div></div>
 <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" ${d.fac.length&&d.name.trim()&&ratioOk&&d.end>=d.start?'':'disabled'} onclick="nbSave()">Create the batch</button></div>`,true);}
function nbTog(k,id){const a=S.admin.nb[k];const i=a.indexOf(id);i>=0?a.splice(i,1):a.push(id);save();batchBuilder();}
function nbSave(){const d=S.admin.nb;const vers={};S.modules.filter(m=>m.prog===d.prog).forEach(m=>vers[m.id]=m.ver);
 S.batches.push({id:'nb'+Date.now(),prog:d.prog,name:d.name.trim(),start:d.start,end:d.end,mode:d.mode,city:d.city,venue:d.venue,seatsP:d.mode==='online'?0:+d.seatsP,filledP:0,seatsO:d.mode==='inperson'?0:+d.seatsO,filledO:0,facultyIds:d.fac.slice(),mentorIds:d.men.slice(),waitP:[],waitO:[],vers,verLabel:`${progName(d.prog)} — current versions, fixed ${fmtDate(TODAY)}`,sessions:[]});
 logAct(`New batch — ${d.name} (${progName(d.prog)})`,'Created in G2');S.admin.nb=null;save();closeModal();render();toast('Batch created · it appears in G9\'s pipeline');}

/* ----- applications ----- */
function appView(id){const a=S.apps.find(x=>x.id===id);
 if(a.publicSubmission){reviewPublicApplication(id);return;}
 modal(`<h3>${esc(a.name)}</h3><div class="row"><span class="pill ${a.as==='trainer'?'maroon':''}">${a.as==='trainer'?'Trainer / mentor':'Coach'}</span><span class="pill">Came from: ${esc(a.source)}</span><span class="pill">${a.state}</span></div>
 <dl class="kv" style="margin-top:14px"><dt>City</dt><dd>${esc(a.city)}</dd><dt>Experience</dt><dd>${a.years} years${a.work?` · ${esc(a.work)}`:''}</dd><dt>Languages</dt><dd>${esc(a.langs)}</dd><dt>Wants</dt><dd>${esc(a.mode)} · ${esc(a.pref)}</dd>${a.tracks?`<dt>${a.as==='trainer'?'Could teach':'Tracks'}</dt><dd>${esc(a.tracks)}</dd>`:''}<dt>Can attend</dt><dd>${esc(a.days||'—')}</dd>${a.band?`<dt>Time</dt><dd>${esc(a.band)}</dd>`:''}<dt>CV</dt><dd>${a.cv?'Attached — read inside SETU':'Not attached'}</dd></dl>
 <div class="row" style="margin-top:14px">${['new','screened','interviewing'].map(s=>`<button class="opt" style="padding:7px 12px;font-size:15px;min-height:36px" aria-pressed="${a.state===s}" onclick="S.apps.find(x=>x.id==='${a.id}').state='${s}';save();appView('${a.id}');render()">${s}</button>`).join('')}</div>
 <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" onclick="closeModal()">Close</button>${a.state==='enrolled'?'':`<button class="btn" onclick="offerBatch('${a.id}')">Offer a batch</button><button class="btn pri" onclick="enrol('${a.id}')">Enrol</button>`}</div>`);}
function fitBatches(a){const prog=a.as==='trainer'?'induct':'core';return S.batches.filter(b=>b.prog===prog&&!['closed','running'].includes(batchState(b)));}
function offerBatch(id){const a=S.apps.find(x=>x.id===id);const bs=fitBatches(a);
 if(a.publicSubmission&&!['accepted','offered','waitlisted'].includes(a.state)){toast('Accept this application before offering a batch.');return;}
 modal(`<h3>Offer ${esc(a.name)} a batch</h3><p class="muted" style="margin-top:0">They asked for: <b>${esc(a.mode)} · ${esc(a.pref)}</b>. Batches that match are marked.</p>
 ${bs.map(b=>{const match=(a.mode==='Online'&&b.seatsO)||(a.mode==='In person'&&b.seatsP&&b.city===a.city)||(a.mode==='Either'&&(b.seatsO||b.city===a.city));
  return `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span><b>${esc(b.name)}</b> · ${fmtDate(b.start)} · ${esc(modeLabel(b))}<br><span class="muted small">${b.seatsP-b.filledP} in person, ${b.seatsO-b.filledO} online left · ${batchState(b)}</span></span><span class="row">${match?'<span class="pill ok">matches</span>':'<span class="pill">not what they asked</span>'}<button class="btn sm pri" onclick="doOffer('${a.id}','${b.id}')">Offer</button></span></div>`;}).join('')||'<p>No open batch for this programme. Create one first.</p>'}
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Back</button></div>`);}
function doOffer(aid,bid){const a=S.apps.find(x=>x.id===aid);a.offer=bid;a.state='offered';logAct(`${a.name} — offered ${batchById(bid).name}`,'Matches their preference');save();closeModal();render();toast('Offer sent — they confirm, then you enrol');}
function enrol(id){const a=S.apps.find(x=>x.id===id);const bs=fitBatches(a);
 if(a.publicSubmission&&!['accepted','offered','waitlisted'].includes(a.state)){toast('Accept this application before enrolment.');return;}
 modal(`<h3>Enrol ${esc(a.name)}</h3><p class="muted">Assigning a seat creates the SETU account, sends the invite, and — for a coach — creates their own assessment in Aarambh. If the seat type is full, they join that batch's waitlist instead.</p>
 <div class="grid2"><div class="field"><label>Batch</label><select class="f" id="enb">${bs.map(b=>`<option value="${b.id}" ${a.offer===b.id?'selected':''}>${b.name} · ${fmtDate(b.start)} · ${b.seatsP-b.filledP} in person / ${b.seatsO-b.filledO} online left</option>`).join('')}</select></div>
 <div class="field"><label>Seat</label><select class="f" id="ens"><option ${a.mode==='In person'?'selected':''}>In person</option><option ${a.mode!=='In person'?'selected':''}>Online</option></select></div></div>
 <div class="field"><label>Coach type</label><select class="f" id="enk"><option value="ours">Gyani Says coach</option>${Object.values(ORGS).map(o=>`<option value="org:${o.name}">Appointed by ${o.name} — trains in full, takes only their people</option>`).join('')}</select></div>
 <span class="fl">Languages — tap once for Secondary, twice for Primary</span>
 <div class="row" id="enlangs">${LANGS.map(l=>`<button class="opt" style="padding:6px 11px;font-size:14.5px;min-height:34px" data-l="${l}" data-s="0" onclick="cycleLang(this)">${l}</button>`).join('')}</div>
 <p class="help">Every coach's languages are set here, once. The coach sees them read-only on S1 and C2, and admin assigns on a <b>Primary match first</b>. More than one Primary is allowed.</p>
 <div class="field" style="margin-top:12px"><label>Level or tracks this person is enrolled for</label><select class="f"><option>Students</option><option>Students · Executives</option><option selected>Students · Executives · Mid-management</option><option>All four — all-rounder</option></select></div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Back</button><button class="btn pri" ${bs.length?'':'disabled'} onclick="doEnrol('${id}')">Enrol and send the invite</button></div>`,true);}
function cycleLang(b){const s2=(+b.dataset.s+1)%3;b.dataset.s=s2;
 b.setAttribute('aria-pressed',s2>0);
 b.style.background=s2===2?'var(--maroon)':s2===1?'var(--maroon-soft)':'';
 b.style.color=s2===2?'#fff':'';
 b.textContent=b.dataset.l+(s2===2?' · Primary':s2===1?' · Secondary':'');}
function doEnrol(id){const a=S.apps.find(x=>x.id===id);const b=batchById($('enb').value);const k=$('ens').value==='Online'?'O':'P';const kind=$('enk').value;
 const picked=[...document.querySelectorAll('#enlangs .opt')].filter(x=>x.dataset.s>0).map(x=>x.dataset.l+(x.dataset.s==='2'?' (P)':''));
 a.langs=picked.length?picked.join(', '):a.langs;
 if(b['filled'+k]>=b['seats'+k]){(b['wait'+k]=b['wait'+k]||[]).push(a.name);a.state='waitlisted';a.offer=b.id;save();closeModal();render();toast(`That seat type is full — ${a.name} is number ${b['wait'+k].length} on ${b.name}'s waitlist`);return;}
 b['filled'+k]++;a.state='enrolled';a.offer=b.id;
 S.trainees.push({n:a.name,kind:kind==='ours'?'ours':'org',org:kind.startsWith('org:')?kind.slice(4):'',batch:b.id,mods:0,own:a.as==='trainer'?'n/a':'not started',due:addDays(b.start,-2),mentor:(b.mentorIds||[])[0]||null,stage:'Invited',und:'—',raters:{}});
 S.people.push({n:a.name,role:a.as==='trainer'?'Faculty (in induction)':'Coach (in training)',last:'invited today',state:'active'});
 logAct(`${a.name} — enrolled in ${b.name}, ${k==='O'?'online':'in person'} seat`,'Account created · invite sent');
 save();closeModal();render();toast('Enrolled · invite sent · own assessment created');}

/* ----- faculty records ----- */
function facRec(id){const f=facById(id),c=calibState(f);const fb=S.batches.filter(b=>(b.facultyIds||[]).includes(f.id)||(b.mentorIds||[]).includes(f.id));
 modal(`<div class="row between"><h3 style="margin:0">${esc(f.name)}</h3><span class="pill ${f.state==='active'?'ok':'gold'}">${f.state}</span></div><p class="muted" style="margin:4px 0 0">${esc(f.kind)} · ${esc(f.route)}</p>
 <div class="grid2" style="margin-top:14px;align-items:start"><dl class="kv small" style="grid-template-columns:130px 1fr">
  <dt>May teach</dt><dd>${f.teaches.length?f.teaches.map(progName).join(' · '):'— after induction'}</dd><dt>Modules</dt><dd>${esc(f.modules||'—')}</dd><dt>May mark</dt><dd>${f.marks.join(' · ')||'—'}</dd><dt>Languages</dt><dd>${esc(f.langs)}</dd><dt>Where</dt><dd>${esc(f.city)}${f.online?' · also online':''}</dd><dt>Capacity</dt><dd>${f.capBatches} batches a month${/Mentor/.test(f.kind)?' · at most 6 mentees':''}</dd>
  <dt>Code</dt><dd>${esc(f.code||'—')}</dd><dt>Agreement</dt><dd>${esc(f.agreement||'—')}</dd><dt>Undertaking</dt><dd>${esc(f.und||'not signed')}</dd><dt>Rate band</dt><dd>${fin()?esc(f.rate||'—'):'Finance admin only'}</dd></dl>
  <div><span class="fl">Calibration</span><div class="row"><span class="pill ${c[1]}">${c[0]}</span><button class="btn sm" onclick="calibrate('${f.id}')">Record a calibration today</button></div>
   <p class="help">Two raters mark the same observed debrief alone; a third decides. Re-done every six months.</p>
   ${/Mentor/.test(f.kind)?`<span class="fl" style="margin-top:12px">Mentees · ${f.mentees.length} of 6</span><div class="row">${f.mentees.map(n=>`<span class="pill">${esc(n)}</span>`).join('')||'<span class="muted small">None yet</span>'}</div><p class="help">They can never mark these people's exams.</p>`:''}
   <span class="fl" style="margin-top:12px">Batches</span>${fb.map(b=>`<div class="small" style="padding:4px 0">${esc(b.name)} · ${fmtDate(b.start)} · ${(b.facultyIds||[]).includes(f.id)?'teaching':'mentoring'}</div>`).join('')||'<span class="muted small">None</span>'}</div></div>
 <div class="divider"></div><div class="field"><label>Reason — required to change the state</label><input class="f" id="fwhy" placeholder="Why"></div>
 <div class="row" style="justify-content:flex-end">${['active','paused'].filter(s=>s!==f.state).map(s=>`<button class="btn" onclick="facState('${f.id}','${s}')">${s==='active'?'Make active':'Pause'}</button>`).join('')}<button class="btn" onclick="closeModal()">Close</button></div>`,true);}
function calibrate(id){const f=facById(id);f.calib={last:TODAY,due:addDays(TODAY,182)};logAct(`${f.name} — marking calibration recorded`,'Two raters agreed within the line');save();facRec(id);render();toast('Calibration recorded · next due in six months');}
function facState(id,s){const why=$('fwhy').value.trim();if(!why){toast('Give a reason first');return;}const f=facById(id);if(s==='active'&&!f.teaches.length&&f.state==='in induction'){toast('Finish the faculty induction first');return;}f.state=s;logAct(`${f.name} — ${s}`,why);save();closeModal();render();toast('Changed · logged');}
function promoteModal(){const cand=S.roster.filter(r=>r.stage==='Active'&&!S.faculty.some(f=>f.name===r.n));const ind=S.batches.filter(b=>b.prog==='induct'&&!['closed','running'].includes(batchState(b)));
 modal(`<h3>Promote an Active coach</h3><p class="muted" style="margin-top:0">They become faculty, a mentor, or both — after the Faculty induction. The criteria are still open (spec open item 15), so a reason is required.</p>
 <div class="field"><label>Coach</label><select class="f" id="pc">${cand.map(r=>`<option>${esc(r.n)}</option>`).join('')}</select></div>
 <div class="grid2"><div class="field"><label>As</label><select class="f" id="pk"><option>Mentor</option><option>Faculty</option><option>Faculty · Mentor</option></select></div><div class="field"><label>Induction batch</label><select class="f" id="pb">${ind.map(b=>`<option value="${b.id}">${esc(b.name)} · ${fmtDate(b.start)}</option>`).join('')}</select></div></div>
 <div class="field"><label>Reason — required</label><input class="f" id="pw" placeholder="Why this coach"></div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" ${cand.length?'':'disabled'} onclick="doPromote()">Start their induction</button></div>`);}
function doPromote(){const why=$('pw').value.trim();if(!why){toast('Give a reason first');return;}const n=$('pc').value,b=batchById($('pb').value);const r=S.roster.find(x=>x.n===n);
 S.faculty.push({id:'f'+Date.now(),name:n,kind:$('pk').value,route:'Promoted from Active coach',teaches:[],modules:'',marks:[],langs:r.lang,city:'Online',online:true,capBatches:1,mentees:[],state:'in induction',calib:null,code:'v0.6',agreement:'',und:r.und||'',rate:''});
 if(b){b.filledP<b.seatsP?b.filledP++:b.filledO++;}logAct(`${n} — promoted, starts ${b?b.name:'the induction'}`,why);save();closeModal();render();toast('Induction seat given · record created');}
function ratersModal(i){const t=S.trainees[i];t.raters=t.raters||{};
 modal(`<h3>Exam markers — ${esc(t.n)}</h3><p class="muted" style="margin-top:0">Faculty cleared for the part, calibration in date, and <b>never ${esc(t.n.split(' ')[0])}'s own mentor</b>. The observed debrief takes two raters who mark alone; a third decides if they disagree.</p>
 ${EXAM_PARTS.map(p=>`<span class="fl" style="margin-top:10px">${p}${p==='Observed debrief'?' — two raters':''}</span><div class="row">${S.faculty.map(f=>{const mentor=t.mentor===f.id,ok=canMark(f)&&f.marks.includes(p)&&!mentor;const on=(t.raters[p]||[]).includes(f.id);
  const why=mentor?'their mentor — can\'t mark':!f.marks.includes(p)?'not cleared for this part':!canMark(f)?(f.calib?'calibration overdue':'not calibrated'):'';
  return `<button class="opt" style="padding:7px 12px;font-size:15px;min-height:36px;${ok?'':'opacity:.5;cursor:not-allowed;border-style:dashed'}" aria-pressed="${on}" ${ok?`onclick="rTog(${i},'${p}','${f.id}')"`:''} title="${esc(why)}">${esc(f.name)}${why?` <em style="display:inline;margin-left:4px">· ${why}</em>`:''}</button>`;}).join('')}</div>`).join('')}
 <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn pri" onclick="closeModal();render()">Done</button></div>`,true);}
function rTog(i,p,id){const t=S.trainees[i];const a=t.raters[p]=t.raters[p]||[];const j=a.indexOf(id);if(j>=0)a.splice(j,1);else{if(p==='Observed debrief'?a.length>=2:a.length>=1){toast(p==='Observed debrief'?'Two raters — a third is called only on a disagreement':'One marker for this part');return;}a.push(id);}
 if(!a.length)delete t.raters[p];save();ratersModal(i);}

/* ----- curriculum: a module record ----- */
function modRec(id){const m=S.modules.find(x=>x.id===id);const sec=(t,arr)=>`<span class="fl" style="margin-top:12px">${t}</span><ul style="margin:0;padding-left:20px">${arr.map(x=>`<li style="padding:2px 0">${esc(x)}</li>`).join('')}</ul>`;
 const on=S.batches.filter(b=>b.vers&&b.vers[m.id]);
 modal(`<div class="row between"><div><div class="eyebrow" style="margin:0">${progName(m.prog)} · module ${esc(m.n)}</div><h3 style="margin:2px 0 0">${esc(m.title)}</h3></div><span class="pill ${m.status==='needs update'?'stop':m.status==='current'?'ok':''}">${m.ver} · ${m.status}</span></div>
 ${m.status==='needs update'?`<div class="note stop" style="margin-top:12px"><b>Needs update:</b> ${esc(m.why)}</div>`:''}
 <div class="grid2" style="align-items:start"><div>${sec('Learning outcomes',m.outcomes)}${sec('Session plan — for faculty',m.plan)}</div><div>${sec('Handed to trainees',m.material)}<span class="fl" style="margin-top:12px">Practised in PRACTICE mode</span><p style="margin:0">${esc(m.practice)}</p><span class="fl" style="margin-top:12px">How it is examined</span><p style="margin:0">${esc(m.exam)}</p></div></div>
 <div class="divider"></div><div class="grid2" style="align-items:start"><div><span class="fl">Versions</span>${m.hist.map(h=>`<div class="small" style="padding:5px 0;border-bottom:1px solid var(--line)"><b>${h[0]}</b> · ${fmtDate(h[1])} · ${esc(h[2])}</div>`).join('')}</div>
  <div><span class="fl">Batches teaching it</span>${on.map(b=>`<div class="small" style="padding:5px 0;border-bottom:1px solid var(--line)">${esc(b.name)} · <span class="pill ${b.vers[m.id]===m.ver?'ok':'gold'}">${b.vers[m.id]}</span></div>`).join('')||'<p class="muted small">None</p>'}<p class="help">A batch keeps the version it started on.</p></div></div>
 <div class="divider"></div>${m.status==='needs update'?`<div class="field"><label>What changed in the new version — required</label><input class="f" id="mwhat" placeholder="One line for the version history"></div>`:`<div class="field"><label>Mark as needing an update — why</label><input class="f" id="mwhy" placeholder="e.g. Aarambh changed the reading rules"></div>`}
 <div class="row" style="justify-content:flex-end">${m.status==='needs update'?`<button class="btn pri" onclick="publishMod('${m.id}')">Publish ${nextVer(m.ver)} · send the update module</button>`:`<button class="btn" onclick="flagMod('${m.id}')">Mark "needs update"</button>`}<button class="btn" onclick="closeModal()">Close</button></div>`,true);}
const nextVer=v=>{const [a,b]=v.slice(1).split('.').map(Number);return `v${a}.${b+1}`;};
function flagMod(id){const why=$('mwhy').value.trim();if(!why){toast('Say why it needs an update');return;}const m=S.modules.find(x=>x.id===id);m.status='needs update';m.why=why;logAct(`${m.title} — marked needs update`,why);save();modRec(id);render();}
function publishMod(id){const what=$('mwhat').value.trim();if(!what){toast('Say what changed');return;}const m=S.modules.find(x=>x.id===id);m.ver=nextVer(m.ver);m.date=TODAY;m.status='current';m.hist.unshift([m.ver,TODAY,what]);
 if(m.prog==='core')S.updates.unshift({mod:m.id,title:m.title,ver:m.ver,what,len:'45 minutes',state:'due'});
 logAct(`${m.title} — ${m.ver} published`,what);save();closeModal();render();toast(m.prog==='core'?`${m.ver} published · certified coaches get an update module on S3`:`${m.ver} published`);}

function G3(){
 const pool=S.roster.filter(r=>['Active','Provisional'].includes(r.stage));
 const pick=S.admin.g3pick||S.toAssign[0].id;
 const c=S.toAssign.find(x=>x.id===pick)||S.toAssign[0];
 const eligible=pool.map(r=>({...r,primary:r.lang.split(',')[0].trim()===c.lang}))
  .filter(r=>!c.org||r.orgs.includes('ABC'))
  .sort((a,b)=>(b.primary-a.primary)||(b.rate-a.rate));
 return adm('G3',`${head(`<div class="eyebrow">Assigning</div><h2>SETU sorts. You click.</h2>`)}
 ${say('Nothing is ever assigned automatically.','The order is: same coach for a rebook, then Primary language, then most room left in their commitment, then rating.')}
 <div class="grid3" style="align-items:start">
  <div class="card"><h3>${ic('debriefs','sm')} To assign</h3>
   ${S.toAssign.map(x=>`<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="S.admin.g3pick='${x.id}';save();render()"><span><b>${esc(x.first)}</b> · ${esc(x.type)}<br><span class="muted small">${esc(x.lang)} · ${esc(x.when)}</span><br><span class="pill ${x.org?'teal':''}">${esc(x.source)}</span></span>${pick===x.id?'<span class="pill maroon">Open</span>':''}</div>`).join('')}
   <p class="help">Assign within 24 hours.</p></div>
  <div class="card" style="grid-column:span 2"><div class="row between"><h3 style="margin:0">${ic('cohort','sm')} Suggested for ${esc(c.first)}</h3><span class="pill">${esc(c.lang)} · ${esc(c.type)}${c.org?' · ABC Ltd pool':''}</span></div>
   <div class="tscroll" style="margin-top:12px"><table class="t"><thead><tr><th>Coach</th><th>Why they're here</th><th>Room left</th><th>Rating</th><th></th></tr></thead><tbody>
   ${eligible.map((r,i)=>`<tr><td><b>${esc(r.n)}</b><br><span class="muted small">Level ${r.lvl} · ${r.stage}</span></td>
    <td class="small">${r.primary?'<span class="pill ok">Primary language</span> ':'<span class="pill">Secondary language</span> '}${c.org?'<span class="pill teal">ABC certified</span>':''}${r.warn>1?' <span class="pill gold">late drop — lower for 30 days</span>':''}</td>
    <td class="small">${['3 of 6 this week','1 of 7','4 of 5','2 of 4','—'][i]||'—'}</td><td>${r.rate||'—'}</td>
    <td style="text-align:right"><button class="btn sm ${i===0?'pri':''}" onclick="toast('Assigned — the coach sees it on their home')">Assign</button></td></tr>`).join('')}
   </tbody></table></div>
   ${c.org?'<div class="note teal small" style="margin-top:12px">Organisation client — only coaches certified for <b>ABC Ltd</b> appear.</div>':''}
   <div class="note plain small" style="margin-top:12px">An invalid report never reaches this screen. A paused coach never appears.</div></div>
 </div>`);
}


const SETTINGS=[
 ['Assigning','debriefs',[['Order of the suggested list','Same coach → Primary language → most room → rating','Admin'],['Assign within','24 hours','Admin'],['Late-drop list penalty','Lower for 30 days','Admin']]],
 ['Calendar and drops','calendar',[['Slot length','45 min + 15 min gap','Admin'],['No bookings within','48 hours','Admin'],['Late-drop line','Under 48 hours','Admin'],['Flag at','2 late drops a month','Admin']]],
 ['Money and packs','credential',[['Slab amounts','—','Finance admin'],['Per-session fee','—','Finance admin'],['Coaching packs','3 sessions · 5 sessions','Finance admin'],['Session fees','Debrief · coaching one to one · coaching group — three rates','Finance admin'],['A group session','Pays once, whatever the number of people','Finance admin'],['Pack price vs booking later','Substantially cheaper — numbers open','Finance admin'],['Cancellation shares','Open','Finance admin']]],
 ['Training and credential','module',[['Core modules','5 · about 4 days','Admin'],['Exam weights','20 / 30 / 35 / 15','Admin'],['Resits allowed','2, failed part only','Admin'],['Supervised debriefs','6','Admin'],['Mentor hours','3','Admin'],['Provisional window','6 months, extend once by 2','Admin'],['Current Code of Ethics','v0.6','Admin'],['Annual attestation','Required for a valid credential','Admin']]],
 ['Consent and recording','recording',[['Consent choices','Record · Transcript only · Neither','Admin'],['Chosen at','Booking, confirmed at Settle','Admin'],['Meeting account','Gyani Says-owned','Admin'],['Transcript tool','Granola — SETU keeps the meeting ID only','Admin'],['Granola workspace','MS\'s own for now · a Gyani Says workspace next · inside the app later','Admin'],['Transcript retention','Open — lawyer to confirm','Admin'],['Retention','Open — spec item 9','Admin']]],
 ['Coaching rules','probe-point',[['Prep guide rules','probe band · check band · caret · median · Caution · Fit lane','Admin'],['Product rules','reading point → product','Admin'],['Gap shown as','Bands only — never numbers','Admin']]],
 ['Wording lists','letter',[['Question check','directive · closed start · blaming why · two in one · levels or numbers','Admin'],['Letter check','you should · you must · you need to · numbers · levels','Admin']]],
 ['Organisations','organisation',[['Engagements','ABC Ltd — active','Admin'],['Vetted coaches','Who may recommend directly — open','Admin'],['Client consent to share','Required — open','Admin']]],
];
function G4(){
 return adm('G4',`${head(`<div class="eyebrow">Settings</div><h2>Every agreed number, in one place</h2>`)}
 ${say('A change here applies to the future only, never backwards.','Money settings belong to Finance admin. Everything else is Admin.')}
 <div class="grid2">${SETTINGS.map(([g,icn,rows])=>`<div class="card"><h3>${ic(icn,'sm')} ${g}</h3>
  <div class="tscroll" style="border:0;box-shadow:none"><table class="t" style="min-width:0"><tbody>
  ${rows.map(([k,v,who])=>{const locked=who!=='Admin'&&!fin();
   return `<tr><td style="width:46%"><b>${esc(k)}</b><br><span class="muted small">${esc(who)} may change</span></td>
   <td>${locked?'<span class="pill">hidden — Finance admin</span>':esc(v)}</td>
   <td style="text-align:right">${locked?'':`<button class="btn sm ghost" onclick="setChange('${esc(k)}')">Change</button>`}</td></tr>`;}).join('')}
  </tbody></table></div></div>`).join('')}</div>`);
}
function setChange(k){modal(`<h3>Change: ${esc(k)}</h3><div class="field"><label>New value</label><input class="f"></div><div class="field"><label>Reason — required</label><input class="f" placeholder="Why this changes"></div>
 <div class="note plain small">Applies to the future only. Bookings and debriefs already made keep the old value.</div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Back</button><button class="btn pri" onclick="closeModal();toast('Changed — logged with your reason')">Save the change</button></div>`);}

function G5(){
 const flags=[['Neel Kamath','Two late drops this month','Late drops count as warnings','gold'],['Leela Iyer','Rating 4.3 across 12 — below the group','At least 10 ratings before any category change','']];
 return adm('G5',`${head(`<div class="eyebrow">Ratings review</div><h2>SETU flags. A person decides.</h2>`)}
 ${say('SETU never proposes a grade.','It says what it saw, and why it is worth a look. The category changes only after a person reviews it.')}
 <div class="grid2" style="align-items:start">
  <div class="card"><h3>${ic('rating','sm')} Flagged this quarter</h3>
   ${flags.map(f=>`<div class="row between" style="padding:12px 0;border-bottom:1px solid var(--line)"><span><b>${esc(f[0])}</b><br>${esc(f[1])}<br><span class="muted small">${esc(f[2])}</span></span><span class="row"><span class="pill ${f[3]}">flagged</span><button class="btn sm" onclick="toast('Review opened — prototype')">Review</button></span></div>`).join('')}
   <p class="help">Quarterly review. Excluded ratings are left out and the reason recorded.</p></div>
  <div class="card"><h3>${ic('cohort','sm')} Where everyone sits</h3>
   <div class="tscroll" style="border:0;box-shadow:none"><table class="t" style="min-width:0"><thead><tr><th>Coach</th><th>Rating</th><th>Count</th><th>Category</th></tr></thead><tbody>
   ${S.roster.filter(r=>r.rate).map(r=>`<tr><td>${esc(r.n)}</td><td>${r.rate}</td><td>${[38,52,12,26][S.roster.indexOf(r)]||'—'}</td><td>${r.cat}</td></tr>`).join('')}
   </tbody></table></div>
   <p class="help">A coach never sees their category. The client rating shows publicly after 5 ratings.</p></div>
 </div>`);
}

function G6(){
 const tiers=[['Standard','The debrief as sold','Included','ok'],['Plus','A longer debrief and a written follow-up','Upgrade at booking',''],['Premium','Plus, with a senior coach and a 30-day check-in','Upgrade at booking','maroon']];
 return adm('G6',`${head(`<div class="eyebrow">Upgrade tiers</div><h2>What a client may buy on top</h2>`)}
 ${say('The client price never appears in SETU.','A tier changes what the coach must deliver — never silently, and never downgraded.')}
 <div class="grid3">${tiers.map(t=>`<div class="card lift"><div class="row between"><h3 style="margin:0">${t[0]}</h3><span class="pill ${t[3]}">${t[2]}</span></div><p style="margin:10px 0 0">${t[1]}</p>
  ${fin()?'<p class="small" style="margin-top:10px"><b>Coach uplift:</b> band set in G7</p>':'<p class="help">Money is Finance admin only.</p>'}</div>`).join('')}</div>
 <div class="grid2" style="margin-top:18px">
  <div class="card"><h4>${ic('session','sm')} Coaching packs (item 15)</h4>
   <div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>3-session pack</span><span>${fin()?'price set in G7':'<span class="pill">Finance admin</span>'}</span></div>
   <div class="row between small" style="padding:8px 0"><span>5-session pack</span><span>${fin()?'price set in G7':'<span class="pill">Finance admin</span>'}</span></div>
   <p class="help">Bought at purchase, on the Aarambh site. Sessions sit in the client's login; the coach never sells.</p></div>
  <div class="card"><h4>${ic('put-aside','sm')} Never</h4><ul style="margin:0"><li>Never show the client price to a coach</li><li>Never downgrade a tier silently</li><li>Never let a coach pitch an upgrade</li></ul></div>
 </div>`);
}

function rateCard(r,i){
 const kinds=['Standard slab','Fixed per session','Percentage of the client fee'];
 return `<div class="card" style="margin-bottom:14px"><div class="row between"><div><b style="font-size:19px">${esc(r.n)}</b>
  <div class="muted small">Level ${r.lvl} · category ${r.cat} · from ${esc(r.from)}</div></div><span class="pill ${r.kind==='Standard slab'?'':'maroon'}">${esc(r.kind)}</span></div>
 <div class="grid4" style="margin:12px 0">
  <div class="info-box ibox" style="display:block;padding:10px 12px"><div class="eyebrow" style="margin:0">Work with us</div><div class="small">${esc(r.work)}</div></div>
  <div class="info-box ibox" style="display:block;padding:10px 12px"><div class="eyebrow" style="margin:0">Rating</div><div class="small">${r.rate} from clients</div></div>
  <div class="info-box ibox" style="display:block;padding:10px 12px"><div class="eyebrow" style="margin:0">Demand</div><div class="small">${esc(r.demand)}</div></div>
  <div class="info-box ibox" style="display:block;padding:10px 12px"><div class="eyebrow" style="margin:0">Operating at</div><div class="small">Level ${r.lvl}${r.lvl===1?' — premium agreed anyway':''}</div></div>
 </div>
 <span class="fl">How this coach is paid</span><div class="row">${kinds.map(k=>`<button class="opt" style="padding:7px 12px;font-size:15px;min-height:36px" aria-pressed="${r.kind===k}" onclick="setRate(${i},'${k}')">${k}</button>`).join('')}</div>
 <div class="row between small" style="margin-top:10px;border-top:1px solid var(--line);padding-top:8px"><span>Terms: <b>${esc(r.terms)}</b> <span class="muted">— amounts open (item 1)</span></span><span class="muted">${esc(r.why)}</span></div></div>`;}
function setRate(i,k){const r=S.rates[i];
 modal(`<h3>${esc(r.n)} — how they are paid</h3><p class="muted">Changing from <b>${esc(r.kind)}</b> to <b>${esc(k)}</b>.</p>
 <div class="field"><label>${k==='Percentage of the client fee'?'Share of the client fee':k==='Fixed per session'?'Rate per session — debrief · one to one · group':'Which slab'}</label><input class="f" placeholder="Amounts are still open — item 1"></div>
 <div class="field"><label>Effective from</label><input class="f" type="date" value="2026-10-01"></div>
 <div class="field"><label>Why — required</label><input class="f" id="ratewhy" placeholder="e.g. In demand at Level 1; premium agreed case by case"></div>
 <div class="note plain small">Applies to future sessions only. Logged in G10 with your name and this reason.</div>
 <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="closeModal()">Back</button><button class="btn pri" onclick="doRate(${i},'${k}')">Agree these terms</button></div>`);}
function doRate(i,k){const why=($('ratewhy')||{}).value||'';if(!why.trim()){toast('Give a reason first');return;}
 const r=S.rates[i];const was=r.kind;r.kind=k;r.why=why;r.from='1 Oct 2026';
 S.activity.unshift({when:'today',who:'Finance · Rahul',what:`${r.n} — pay ${was} → ${k}`,why});
 save();closeModal();render();toast('Terms agreed · logged');}
function G7(){
 if(!fin())return adm('G7',`${head(`<div class="eyebrow">Payments</div><h2>Finance admin only</h2>`)}
  ${say('This screen belongs to Finance admin.','Switch the role at the top to open it.')}`);
 return adm('G7',`${head(`<div class="eyebrow">Slabs and payments</div><h2>The shape is agreed. The numbers are not.</h2>`)}
 ${say('Every amount here is blank on purpose.','The shape was agreed: a monthly commitment amount, plus a per-session fee earned when the after-debrief is complete.')}
 <div class="grid2" style="align-items:start">
  <div class="card"><h3>${ic('credential','sm')} Slabs</h3>
   <div class="tscroll" style="border:0;box-shadow:none"><table class="t" style="min-width:0"><thead><tr><th>Slab</th><th>Commitment</th><th>Monthly</th><th>Debrief</th><th>Coaching · one to one</th><th>Coaching · group</th></tr></thead><tbody>
   <tr><td>1</td><td>20+ hrs a week</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td></tr>
   <tr><td>2</td><td>10–20 hrs</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td></tr>
   <tr><td>3</td><td>5–10 hrs</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td></tr>
   <tr><td>4</td><td>Under 5 hrs</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td></tr>
   </tbody></table></div>
   <div class="note plain small" style="margin-top:10px"><b>A group session pays once.</b> The fee follows the session, never the number of people in the room — and a group carries its own rate, set apart from one-to-one coaching.</div>
   <p class="help">Open item 1: amounts, the commitment test, shares, and late-drop money.</p></div>
  <div class="card" style="grid-column:span 2"><h3>${ic('cohort','sm')} How each coach is paid</h3>
   ${say('A slab is the default, not the only way.','What a coach is worth shows in four things: how much work they do with us, what clients rate them, how much they are asked for, and the level they work at. A Level 1 coach in demand may still be on a premium.')}
   ${S.rates.map(rateCard).join('')}
   <div class="note plain small">Three ways to pay: the <b>standard slab</b> · a <b>fixed rate per session</b> · a <b>share of the client fee</b>. Each is agreed case by case, with a reason, and applies to future sessions only.</div></div>
  <div class="card"><h3>${ic('calendar','sm')} This month</h3>
   <div class="tscroll" style="border:0;box-shadow:none"><table class="t" style="min-width:0"><thead><tr><th>Coach</th><th>Debriefs</th><th>Coaching sessions</th><th>Due</th></tr></thead><tbody>
   <tr><td>Monica Rao</td><td>5</td><td>3 · <span class="muted">2 groups</span></td><td class="muted">—</td></tr>
   <tr><td>Imran Sheikh</td><td>7</td><td>2 · <span class="muted">0 groups</span></td><td class="muted">—</td></tr>
   <tr><td>Leela Iyer</td><td>3</td><td>0</td><td class="muted">—</td></tr>
   </tbody></table></div>
   <p class="help">A per-session fee is earned when the after-debrief is complete — not when the call ends.</p></div>
 </div>`);
}

function G8(){
 const o=ORGS.abc;
 return adm('G8',`${head(`<div class="eyebrow">Organisation engagements</div><h2>${esc(o.name)}</h2>`)}
 ${say('An engagement is a brief, a pool of certified coaches, and the organisation\'s own programmes.','Recommendations go to the organisation — by vetted coaches only, and always documented.')}
 <div class="grid3" style="align-items:start">
  <div class="card" style="grid-column:span 2"><h3>${ic('organisation','sm')} The brief</h3><p style="margin:0">${esc(o.brief)}</p>
   <div class="divider"></div><h4>${ic('recommendations','sm')} Their programmes</h4>
   ${o.programmes.map(pr=>`<div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span><b>${esc(pr.name)}</b> — ${esc(pr.desc)}</span><span class="pill teal">theirs</span></div>`).join('')}
   <p class="help">These appear beside Aarambh's list when a coach recommends for an ABC client.</p></div>
  <div class="stack">
   <div class="card"><h4>${ic('cohort','sm')} The pool</h4>
    <div class="row between small" style="padding:6px 0"><span>Monica Rao</span><span class="pill ok">certified</span></div>
    <div class="row between small" style="padding:6px 0"><span>Neel Kamath</span><span class="pill ok">certified</span></div>
    <div class="row between small" style="padding:6px 0"><span>Imran Sheikh</span><span class="pill gold">update module due</span></div>
    <p class="help">Only the pool takes ABC clients.</p></div>
   <div class="card" style="border-left:5px solid var(--stop)"><h4>${ic('consent','sm')} Still open</h4>
    <ul style="margin:0"><li>Client consent to share with ABC</li><li>Who grants "vetted"</li><li>Branding — the coach represents Aarambh</li></ul></div>
  </div>
 </div>`);
}

function G9(){
 const rows=[['English · Mid-management',42,48,'short 6','stop'],['Hindi · Executive',26,21,'spare 5','ok'],['Marathi · Mid-management',12,18,'short 6','stop'],['Tamil · Student',9,6,'spare 3','ok'],['English · Senior',7,9,'short 2','gold']];
 return adm('G9',`${head(`<div class="eyebrow">Capacity and demand</div><h2>Do we have enough coaches?</h2>`)}
 ${say('Plain arithmetic, not a forecast engine.','Capacity is what coaches have committed and opened. Demand is what is already booked, waiting, or bought as a pack.')}
 <div class="grid4">
  <div class="card lift">${ring(0.72,'118','debrief hours open this month','#2F5D3A')}</div>
  <div class="card lift">${ring(0.55,'41','coaching-session hours','#2F5E5B')}</div>
  <div class="card lift">${ring(0.9,'164','hours committed','#7A2B2B')}</div>
  <div class="card lift"><div class="eyebrow">Coaches</div><div class="big">18</div><p class="muted small">12 active · 4 provisional · 2 in training</p></div>
  <div class="card lift"><div class="eyebrow">Advanced</div><div class="big">2</div><p class="muted small">Paradox and Team can go to these two only</p></div>
 </div>
 <div class="grid2" style="margin-top:18px;align-items:start">
  <div class="card"><h3>${ic('level','sm')} The gap, by language and level</h3>
   <div class="tscroll" style="border:0;box-shadow:none"><table class="t" style="min-width:0"><thead><tr><th>Where</th><th>Capacity</th><th>Demand</th><th>Next month</th></tr></thead><tbody>
   ${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="pill ${r[4]}">${r[3]}</span></td></tr>`).join('')}
   </tbody></table></div>
   <div class="note" style="margin-top:12px"><b>Marathi · Mid-management is short 6 debriefs next month.</b> A coach takes about 6 months from batch to Active, so <b>Batch 9 must start by 17 Nov</b>.</div></div>
  <div class="stack">
   <div class="card"><h4>${ic('debriefs','sm')} What is coming</h4>
    <div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>Sittings done, debrief not booked</span><b>31</b></div>
    <div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>Booking run-rate</span><b>~46 a month</b></div>
    <div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>Outstanding pack sessions</span><b>23</b></div>
    <div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>ABC Ltd engagement</span><b>40 by March</b></div>
    <div class="row between small" style="padding:8px 0"><span>Coaching sessions booked</span><b>28 this month</b></div></div>
   <div class="card"><h4>${ic('module','sm')} Supply in the pipe</h4>
    ${S.batches.filter(b=>b.prog!=='induct'&&batchState(b)!=='closed').map(b=>`<div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>${esc(b.name)} · ${fmtDate(b.start)}</span><span class="pill ${(b.facultyIds||[]).length?stPillB(batchState(b)):'stop'}">${(b.facultyIds||[]).length?`${b.filledP+b.filledO} of ${b.seatsP+b.seatsO} seats · ${batchState(b)}`:'no faculty — cannot run'}</span></div>`).join('')}
    <p class="help">A batch with no faculty cannot run — faculty capacity counts too.</p></div>
  </div>
 </div>`);
}

function G10(){
 const tab=S.admin.g10tab||'roles';
 const ROLES=[['Admin','Everything except money','G0–G6, G8–G10'],['Finance admin','Money and the roster','G1 slabs, G4 money, G6, G7'],['Faculty','Their batches and marking','G2 faculty view, Question Bank proposals'],['Mentor','Their mentees only — at most six','G2 mentor view, supervised debriefs'],['Coach — Gyani Says','Their own work','S1–S4, C1–C12'],['Coach — appointed by an organisation','Their own work, for that organisation\'s people only','S1–S4, C1–C12 — access ends when unassigned or when they leave'],['Aarambh reviewer','Validation, leads, audit','A1–A3 only']];
 let inner;
 if(tab==='roles'){
  inner=`<div class="grid4">${ROLES.map(r=>`<div class="card lift"><h3 style="margin:0">${r[0]}</h3><p class="muted small" style="margin:6px 0 10px">${r[1]}</p><p class="small" style="margin:0"><b>Opens:</b> ${r[2]}</p></div>`).join('')}</div>
  <div class="grid2" style="margin-top:14px"><div class="note plain small">Nobody — not even Admin — sees a coach's <b>private notes</b>. Aarambh reviewers never leave A1–A3.</div><div class="note plain small">Every role that can open a reading has to sign the <b>data undertaking</b> first — see the Undertakings tab.</div></div>`;
 } else if(tab==='people'){
  inner=`<div class="tscroll"><table class="t"><thead><tr><th>Person</th><th>Role</th><th>Last signed in</th><th>State</th><th></th></tr></thead><tbody>
  ${S.people.map(p2=>`<tr><td><b>${esc(p2.n)}</b></td><td>${esc(p2.role)}</td><td class="small">${esc(p2.last)}</td><td><span class="pill ${p2.state==='active'?'ok':'stop'}">${p2.state}</span></td>
   <td style="text-align:right"><button class="btn sm" onclick="toast('Password reset link sent — you never see or set a password')">Send reset link</button> <button class="btn sm ghost" onclick="toast('${p2.state==='active'?'Suspended':'Restored'} — reason recorded')">${p2.state==='active'?'Suspend':'Restore'}</button></td></tr>`).join('')}
  </tbody></table></div>
  <div class="grid2" style="margin-top:14px"><div class="note plain small"><b>Password resets are links only.</b> Admin never sees or sets a password.</div><div class="note plain small">A role change <b>forces a re-login</b>.</div></div>`;
 } else if(tab==='und'){
  const rows=[...S.roster.map(r=>({n:r.n,role:'Coach',kind:r.kind==='org'?`${r.org}'s coach`:'Ours',und:r.und})),...S.faculty.map(f=>({n:f.name,role:f.kind,kind:'Ours',und:f.und})),...S.trainees.filter(t=>!S.roster.some(r=>r.n===t.n)).map(t=>({n:t.n,role:'Trainee',kind:t.kind==='org'?`${t.org}'s coach`:'Ours',und:t.und==='—'?'':t.und}))];
  const seen={};const list=rows.filter(r=>seen[r.n]?false:(seen[r.n]=1));
  inner=`<div class="grid3" style="align-items:start">
   <div class="card" style="grid-column:span 1;border-top:5px solid var(--teal)"><div class="row between"><h3 style="margin:0">${ic('consent','sm')} The undertaking</h3><span class="pill">${UNDERTAKING.ver}</span></div>
    <p class="muted small">Published ${UNDERTAKING.published} · owner ${UNDERTAKING.owner}. Signed at first login (S1), before any reading — synthetic or real.</p>
    <ol style="margin:0;padding-left:22px;font-size:15.5px">${UNDERTAKING.parts.map(p=>`<li style="padding:3px 0">${esc(p)}</li>`).join('')}</ol>
    <button class="btn" style="margin-top:12px" onclick="toast('New version drafted — everyone re-signs at next login, and readings stay closed until they do')">Publish a new version</button>
    <p class="help">The wording here is a placeholder until the lawyer's text is in (spec open item 20). Written against <i>Aarambh 2.0 / DPDP — what goes where</i>, non-negotiable 4.</p></div>
   <div style="grid-column:span 2"><div class="tscroll"><table class="t"><thead><tr><th>Person</th><th>Role</th><th>Coach type</th><th>Signed</th><th>Readings</th></tr></thead><tbody>
    ${list.map(r=>`<tr><td><b>${esc(r.n)}</b></td><td class="small">${esc(r.role)}</td><td>${/coach/.test(r.kind)?`<span class="pill teal">${esc(r.kind)}</span>`:'<span class="pill">Ours</span>'}</td><td class="small">${r.und&&r.und!=='ended'?esc(r.und):'—'}</td><td>${r.und==='ended'?'<span class="pill stop">ended</span>':r.und?'<span class="pill ok">open for assigned work</span>':'<span class="pill stop">closed until signed</span>'}</td></tr>`).join('')}
   </tbody></table></div>
   <div class="grid2" style="margin-top:14px"><div class="note plain small"><b>No signature, no access.</b> The version and date are kept, so it can be shown the undertaking was given.</div><div class="note plain small">Access ends when a coach is unassigned, when the engagement closes, or when an organisation's coach leaves — set from the coach record in G1.</div></div></div></div>`;
 } else {
  inner=`<div class="tscroll"><table class="t"><thead><tr><th>When</th><th>Who</th><th>What</th><th>Reason</th></tr></thead><tbody>
  ${S.activity.map(a=>`<tr><td class="small">${esc(a.when)}</td><td class="small">${esc(a.who)}</td><td>${esc(a.what)}</td><td class="small muted">${esc(a.why)}</td></tr>`).join('')}
  </tbody></table></div><p class="help">Every change carries a reason, and the log is never edited.</p>`;
 }
 return adm('G10',`${head(`<div class="eyebrow">People and access</div><h2>Who may sign in, and what they may open</h2>`,'Roles, people, the data undertaking each person has signed, and every change made.')}
 <div class="tabs">${[['roles','Roles'],['people','People'],['und','Undertakings'],['log','Activity log']].map(([k,t])=>`<button aria-pressed="${tab===k}" onclick="S.admin.g10tab='${k}';save();render()">${t}</button>`).join('')}</div>${inner}`);
}

/* =====================================================================
   W1 · Apply form — MOCK of the Gyani Says website (Gyani Says builds the real page)
   ===================================================================== */
const SRC=[['web','Website','gyanisays.example/saarthi/apply'],['ig','Instagram','gyanisays.example/saarthi/apply?src=ig'],['yt','YouTube','gyanisays.example/saarthi/apply?src=yt'],['gg','Google','gyanisays.example/saarthi/apply?src=gg'],['li','LinkedIn','gyanisays.example/saarthi/apply?src=li'],['dl','Direct link','gyanisays.example/saarthi/apply?src=dl'],['ref','Referral','gyanisays.example/saarthi/apply?src=ref']];
const srcOf=k=>SRC.find(s=>s[0]===k)||[k,k.startsWith('talk')?'Talk · '+k.slice(5):k,`gyanisays.example/saarthi/apply?src=${k}`];
function W1(){
 const w=S.w1,co=w.as==='coach';
 const set=(k,v)=>`S.w1.${k}=${v};save();render()`;
 const inp=(k,label,req,ph='')=>`<div class="field"><label>${label}${req?' <span style="color:var(--stop)">· required</span>':''}</label><input class="f" value="${esc(w[k])}" placeholder="${esc(ph)}" oninput="S.w1.${k}=this.value;save()"></div>`;
 const chips=(k,opts)=>`<div class="row">${opts.map(o=>`<button class="opt" style="padding:8px 14px;min-height:40px" aria-pressed="${w[k].includes(o)}" onclick="w1Tog('${k}','${o}')">${o}</button>`).join('')}</div>`;
 const one=(k,opts)=>`<div class="row">${opts.map(o=>`<button class="opt" style="padding:8px 14px;min-height:40px" aria-pressed="${w[k]===o}" onclick="${set(k,`'${o}'`)}">${o}</button>`).join('')}</div>`;
 const src=srcOf(w.src);
 if(w.submitted){
  return wrap('W1',`<div class="grid2" style="align-items:center;margin-bottom:22px"><div><div class="eyebrow">Application received</div><h2 style="font-size:40px">Thank you, ${esc(w.name.split(' ')[0]||'')}. We have your application.</h2><p class="muted" style="font-size:18px;margin:10px 0 0">You'll hear from us within a week. Nothing is needed from you until then.</p></div>
   <div class="card"><h3>${ic('calendar','sm')} What happens next</h3>${[['Your application reaches our team','tagged as coming from '+src[1]],['We read it and may call you','a short conversation'],['We offer you a batch','matched to what you asked for — '+esc(w.mode)+', '+esc(w.city)+', '+esc(w.window)],['You are enrolled','your seat, your login and the invite arrive together'],['Before Day 1','you take your own assessment first — every coach starts as a client']].map((s,i)=>`<div class="row" style="padding:9px 0;border-bottom:1px solid var(--line);align-items:flex-start"><span class="pill maroon" style="min-width:34px;justify-content:center">${i+1}</span><span><b>${s[0]}</b><br><span class="muted small">${s[1]}</span></span></div>`).join('')}</div></div>
   <div class="row"><button class="btn" onclick="S.w1.submitted=false;save();render()">Back to the form</button><button class="btn pri" onclick="S.admin.g2tab='apps';go('G2')">See it arrive in G2 →</button></div>`,{kind:'web'});
 }
 const ok=w.name.trim()&&(w.phone.trim()||w.email.trim())&&w.city&&Object.keys(w.langs).length&&w.consent;
 return wrap('W1',`<div class="grid2" style="align-items:end;margin-bottom:20px"><div><div class="eyebrow">The Saarthi System · by Gyani Says</div><h2 style="font-size:42px;line-height:1.12">Become a coach — or teach the ones who do.</h2></div>
  <div><p style="font-size:18px;margin:0 0 12px;color:var(--ink-2)">A coach reads an Aarambh report with a person and helps them make sense of it — explaining, never telling them what to do. Training is not paid and not charged. It takes about five minutes to apply.</p>
  <div class="row"><span class="pill">${ic('follow-up','sm')} You arrived from: <b style="margin-left:4px">${esc(src[1])}</b></span><span class="pill" style="font-family:ui-monospace,Menlo,monospace">${esc(src[2])}</span></div></div></div>
 <span class="fl">1 · You are applying as</span>
 <div class="grid2" style="margin-bottom:20px">${[['coach','A coach','You will train, take the exam, and debrief people in SETU.'],['trainer','A trainer or mentor','You will teach batches or mentor new coaches, after our faculty induction.']].map(([k,t,d])=>`<button class="opt" style="padding:18px 20px" aria-pressed="${w.as===k}" onclick="${set('as',`'${k}'`)}"><b style="font-size:20px">${t}</b><em style="font-size:15.5px">${d}</em></button>`).join('')}</div>
 <div class="grid3" style="align-items:start">
  <div class="card"><h3>${ic('cohort','sm')} 2 · About you</h3>${inp('name','Full name',1)}<div class="grid2">${inp('phone','Phone',0,'Phone or email is required')}${inp('email','Email',0)}</div>
   <div class="grid2"><div class="field"><label>City <span style="color:var(--stop)">· required</span></label><select class="f" onchange="S.w1.city=this.value;save()">${CITIES.map(c=>`<option ${w.city===c?'selected':''}>${c}</option>`).join('')}<option ${CITIES.includes(w.city)?'':'selected'}>Other</option></select></div>${inp('years','Years of work',0)}</div>
   ${inp('work','What you do now',0,'Role and organisation type')}${inp('coached',co?'People you have worked with':'What you have taught, and to whom',0)}${inp('quals','Qualifications',0,'Degrees, diplomas, certificates')}
   <div class="row"><button class="btn sm" onclick="${set('cv','!S.w1.cv')}">${w.cv?'✓ CV attached · remove':'Attach your CV (PDF)'}</button><span class="help" style="margin:0">Optional. Read by our team only.</span></div></div>
  <div class="stack"><div class="card"><h3>${ic('language','sm')} 3 · Languages you can work in</h3><p class="muted small" style="margin-top:0">Tap once for <b>Secondary</b>, twice for <b>Primary</b>. More than one of each is fine.</p>
   <div class="row">${LANGS.map(l=>{const s=w.langs[l]||0;return `<button class="opt" style="padding:7px 12px;min-height:38px;font-size:15.5px;${s===1?'background:var(--maroon-soft)':''}" aria-pressed="${s===2}" onclick="w1Lang('${l}')">${l}${s===2?' · Primary':s===1?' · Secondary':''}</button>`;}).join('')}</div></div>
   <div class="card"><h3>${ic('time-commitment','sm')} 4 · Time you could give, once certified</h3>${one('band',['Under 5 hrs a week','5–10 hrs a week','10–20 hrs a week','20+ hrs a week'])}<p class="help">An interest only — you choose properly when you are certified.</p></div></div>
  <div class="card"><h3>${ic('calendar','sm')} 5 · Your batch preferences</h3>
   <span class="fl">How you would like to attend</span>${one('mode',['In person','Online','Either'])}
   <span class="fl" style="margin-top:12px">When you could start</span>${one('window',['Oct–Nov 2026','Dec 2026–Jan 2027','Later in 2027'])}
   <span class="fl" style="margin-top:12px">${co?'Who you would most like to work with':'What you could teach'}</span>${chips('tracks',co?['Students','Executives','Mid-management','Senior','All four']:['Core modules','Role tracks','Advanced Programme','Mentoring new coaches'])}
   <span class="fl" style="margin-top:12px">Days you can attend</span>${chips('days',['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])}
   <p class="help">${co?'Core training is about four days, live, in a batch. We place you in one that fits.':'Every trainer takes our two-day faculty induction first, including marking calibration.'}</p></div>
 </div>
 <div class="grid3" style="margin-top:18px;align-items:start">
  <div class="card info-box" style="grid-column:span 2;border-radius:var(--r);display:block"><h3>${ic('consent','sm')} What we do with your application</h3>
   <div class="grid3 small"><div><b>What we keep</b><br>What you type here and your CV, if you attach one.</div><div><b>Why</b><br>Only to decide whether to offer you a place, and to place you in a batch.</div><div><b>Who sees it, and for how long</b><br>The Gyani Says training team only. If you are not enrolled it is deleted — the period is still to be set — or sooner if you ask.</div></div>
   <p class="help">Placeholder wording until the lawyer's text is in. You can ask to see, correct or delete it at any time.</p></div>
  <div class="card" style="border-top:5px solid var(--maroon)"><label class="check ${w.consent?'on':''}"><input type="checkbox" ${w.consent?'checked':''} onchange="${set('consent','this.checked')}"><span><b>I agree</b> to Gyani Says using my application as described.</span></label>
   <button class="btn pri" style="width:100%" ${ok?'':'disabled'} onclick="w1Submit()">${ok?'Send my application →':'Fill the required fields and agree to send'}</button></div>
 </div>`,{kind:'web'});
}
function w1Tog(k,v){const a=S.w1[k];const i=a.indexOf(v);i>=0?a.splice(i,1):a.push(v);save();render();}
function w1Lang(l){const c=S.w1.langs;c[l]=((c[l]||0)+1)%3;if(!c[l])delete c[l];save();render();}
function w1Submit(){if(publicApplicationOpen&&!workspaceSession){submitPublicApplication();return;}const w=S.w1;S.apps=S.apps.filter(a=>!(a.name===w.name.trim()&&a.state==='new'));const L=Object.entries(w.langs).sort((a,b)=>b[1]-a[1]).map(([l,s])=>l+(s===2?' (P)':'')).join(', ');
 S.apps.unshift({id:'a'+Date.now(),name:w.name.trim(),city:w.city,as:w.as,mode:w.mode,pref:`${w.city} · ${w.window}`,langs:L,source:srcOf(w.src)[1],state:'new',years:w.years||'—',work:w.work,days:w.days.join(' '),tracks:w.tracks.join(', '),band:w.band,cv:w.cv});
 w.submitted=true;save();render();toast('Application sent · it lands in G2 Applications, tagged '+srcOf(w.src)[1]);}

/* =====================================================================
   P1 · Presenter — one engine, two tracks (after the Workforce Compass presenter):
   Discovery → slide list (show, hide, reorder) → narration → full screen.
   Track 1 walks the live Saarthi screens. Track 2 is the talk for would-be coaches.
   ===================================================================== */
const WALK=[
 {id:'w1',code:'W1',t:'Someone applies',setup:()=>{S.w1.submitted=false;}},
 {id:'g2a',code:'G2',t:'Admin screens and offers a batch',setup:()=>{S.admin.g2tab='apps';}},
 {id:'g2b',code:'G2',t:'Batches and seats',setup:()=>{S.admin.g2tab='batches';S.admin.g2prog='all';}},
 {id:'g2f',code:'G2',t:'Who teaches, who mentors',setup:()=>{S.admin.g2tab='faculty';}},
 {id:'g2c',code:'G2',t:'What is taught',setup:()=>{S.admin.g2tab='curriculum';S.admin.g2cprog='core';}},
 {id:'s1',code:'S1',t:'First login',setup:()=>{S.firstLogin='invited';}},
 {id:'s2',code:'S2',t:'Core modules',setup:()=>{S.stage='training';}},
 {id:'s3',code:'S3',t:'Tracks and rank'},
 {id:'s4',code:'S4',t:'The exam',setup:()=>{S.stage='training';}},
 {id:'s4b',code:'S4',t:'The Code, time, credential',setup:()=>{S.stage='passed';}},
 {id:'g1',code:'G1',t:'The coach record',setup:()=>{S.admin.g1tab='roster';}},
 {id:'g10',code:'G10',t:'Undertakings',setup:()=>{S.admin.g10tab='und';}},
 {id:'g9',code:'G9',t:'When the next batch must start'}];
const TALK=[
 {id:'cover',t:'Become a coach'},{id:'work',t:'What the work is'},{id:'who',t:'Who we are looking for'},{id:'journey',t:'The road from applying to Active'},
 {id:'levels',t:'Levels and ranks'},{id:'exam',t:'The exam'},{id:'time',t:'Time and money'},{id:'batches',t:'Batches near you'},{id:'code',t:'What a coach never does'},{id:'apply',t:'Apply'}];
const NARR={
 walk:{
  team:{label:'For the Gyani Says team',lines:{
   w1:'It starts on our website. Every link we put out carries a tag, so we know whether someone came from Instagram, LinkedIn or a talk.',
   g2a:'The application lands here with everything they typed. Admin screens it and offers a batch that matches what they asked for.',
   g2b:'A batch is where seats live — in person and online counted apart. If it fills, the next person waits in line and can be moved to another batch.',
   g2f:'A batch can only be built from faculty who are cleared, free and under capacity. Calibration is in date, and a mentor never takes more than six.',
   g2c:'Every module is a version. A batch keeps the version it started on, and when the reading rules change, certified coaches get a short update module.',
   s1:'First login only confirms. The trainee checks their details, sees their batch, gives the confidentiality promise and signs the data undertaking.',
   s2:'Five core modules, taught live, in order. The batch dates on this page come straight from G2.',
   s3:'Levels say which clients a coach may take. Ranks — Certified, Senior, Lead — say how much experience is behind them. Neither is ever chosen.',
   s4:'Four parts, all must pass. The dossier practical runs in two halves: first unaided, then against the Prep guide.',
   s4b:'After the exam they sign the Code and choose their time. Then the credential issues, with a number anyone can verify.',
   g1:'The coach record holds the type — ours or an organisation\'s — the rank, and the undertaking. Every change needs a reason.',
   g10:'No signature, no readings. The version and date are kept, and access ends the day a coach is unassigned.',
   g9:'And it closes the loop: capacity reads the batch pipeline and says when the next batch has to start.'}},
  faculty:{label:'For faculty and mentors',lines:{
   g2f:'This is your record: what you may teach, what you may mark, your calibration date and your mentees. Overdue calibration means no exam marking until it is redone.',
   g2c:'You own module versions. Mark one "needs update", write what changed, and publish — the batches already running keep theirs.',
   s4:'You mark alone. On the observed debrief two of you mark, and a third decides a disagreement. Never your own mentee.'}},
  partner:{label:'For a partner organisation',lines:{
   s1:'A coach you appoint trains in full, exactly like ours, and signs the same data undertaking before seeing any reading.',
   g1:'Your coaches are marked as yours. They take only your people.',
   g10:'When one of your coaches leaves, or is unassigned, their access ends that day. That is what makes it safe for your people.'}}},
 talk:{
  general:{label:'Would-be coaches — general',lines:{
   cover:'Thank you for coming. In the next fifteen minutes: what the work is, how training runs, and how to apply.',
   work:'A debrief is ninety minutes of your time — forty-five to prepare, forty-five with the person. You explain what the report says. You never tell them what to do.',
   who:'You don\'t need to be a coach already. You need to work in one of our languages, give regular time, and take your own assessment first.',
   journey:'From applying to Active is about six months. Most of it is real debriefs with a mentor beside you.',
   levels:'Your level says which clients you may take. Your rank grows with experience. You choose neither — they are earned.',
   exam:'Four parts, all must pass, and you resit only what you didn\'t pass. Two faculty mark the observed debrief — never your own mentor.',
   time:'Training is not paid and not charged. Once certified, you choose the time you give, and you are paid per session.',
   batches:'These are the batches open right now for people in this room.',
   code:'This is the line we never cross. Breaking it ends the credential.',
   apply:'The link on screen is tagged for today, so we know you came from this talk. We reply within a week.'}},
  campus:{label:'Campus and early-career audience',lines:{
   cover:'Most of the people you will debrief are students and early-career professionals — people a lot like your own students.',
   who:'If you teach, counsel or place students, you already listen for a living. This turns that into a certified practice.',
   levels:'Most campus coaches start at Level 1, students, and grow from there.'}},
  trainers:{label:'Trainers and mentors',lines:{
   who:'We are looking for people to teach batches and mentor new coaches — either Active coaches we promote, or experienced trainers from outside.',
   journey:'Every trainer takes our two-day faculty induction, including marking calibration, before teaching a batch.',
   exam:'As faculty you mark alone, re-calibrate every six months, and never mark your own mentee.'}}}};
function presList(){const p=S.pres,all=p.track==='walk'?WALK:TALK;return p.order[p.track].map(id=>all.find(x=>x.id===id)).filter(x=>x&&!p.hidden[p.track].includes(x.id));}
function narrLine(id){const p=S.pres,lib=NARR[p.track],base=p.track==='walk'?'team':'general';return (lib[p.narr[p.track]]||lib[base]).lines[id]||lib[base].lines[id]||'';}
function talkTag(){const d=S.pres.disc;return `talk-${d.city.toLowerCase()}`;}
function P1(){
 const p=S.pres,d=p.disc,walk=p.track==='walk';const all=walk?WALK:TALK;const vis=presList();
 const sel=(k,opts,on)=>`<select class="f" onchange="presDisc('${k}',this.value)">${opts.map(o=>`<option ${on===o?'selected':''}>${o}</option>`).join('')}</select>`;
 return wrap('P1',`${head(`<div class="eyebrow">Presenter · not part of the app</div><h2>Present Saarthi</h2>`,'One engine, two talks. Tell it who is in the room, choose and order the slides, pick a narration, then go full screen. Arrow keys move, N hides the narration, Esc ends.')}
 <div class="grid2" style="margin-bottom:18px">${[['walk','Walk through the rig','The live Saarthi screens in journey order — W1, G2, S1–S4, G1, G10, G9 — with a narration line under each. For the team, faculty or a partner.'],['talk','Talk for would-be coaches','A recruiting talk: the work, the road, levels and ranks, the exam, batches near them, and the Apply link tagged for this talk.']].map(([k,t,x])=>`<button class="opt" style="padding:18px 20px" aria-pressed="${p.track===k}" onclick="S.pres.track='${k}';save();render()"><b style="font-size:20px">${t}</b><em style="font-size:15.5px">${x}</em></button>`).join('')}</div>
 <div class="grid3" style="align-items:start">
  <div class="card"><h3>${ic('cohort','sm')} 1 · Discovery — who is in the room</h3>
   ${walk?`<div class="field"><label>Audience</label>${sel('who',['The Gyani Says team','Faculty and mentors','A partner organisation'],d.who)}</div><p class="help">The narration follows the audience. You can still pick another below.</p><div class="hollow" style="margin-top:14px"><div class="eyebrow">While presenting</div><p style="margin:0">→ or Space: next · ← back · N: narration on or off · Esc: end. The walk-through shows the live screens, so you can click inside them; the rig goes back to how it was when you end.</p></div>`
   :`<div class="grid2"><div class="field"><label>City</label>${sel('city',CITIES,d.city)}</div><div class="field"><label>They would attend</label>${sel('mode',['In person','Online','Either'],d.mode)}</div></div>
   <div class="grid2"><div class="field"><label>They are</label>${sel('as',['Would-be coaches','Trainers and mentors'],d.as)}</div><div class="field"><label>The room</label>${sel('room',['A public talk','A webinar','A campus session'],d.room)}</div></div>
   <span class="fl">The Apply link on the last slide</span><div class="pill" style="font-family:ui-monospace,Menlo,monospace;font-size:15px">gyanisays.example/saarthi/apply?src=${talkTag()}</div><p class="help">Every application from this talk arrives in G2 tagged with it.</p>`}</div>
  <div class="card"><h3>${ic('module','sm')} 2 · Slides · ${vis.length} of ${all.length} showing</h3>
   ${p.order[p.track].map((id,j)=>{const x=all.find(y=>y.id===id);if(!x)return '';const hid=p.hidden[p.track].includes(id);
    return `<div class="row between" style="padding:6px 0;border-bottom:1px solid var(--line);flex-wrap:nowrap"><label class="row" style="cursor:pointer;flex-wrap:nowrap;${hid?'opacity:.5':''}"><input type="checkbox" style="width:20px;height:20px;accent-color:var(--maroon)" ${hid?'':'checked'} onchange="presHide('${id}')"><span>${walk?`<span class="pill" style="min-width:46px;justify-content:center">${x.code}</span> `:''}${esc(x.t)}</span></label><span class="row" style="flex-wrap:nowrap;gap:4px"><button class="btn sm ghost" ${j?'':'disabled'} onclick="presMove(${j},-1)" aria-label="Move up">↑</button><button class="btn sm ghost" ${j<p.order[p.track].length-1?'':'disabled'} onclick="presMove(${j},1)" aria-label="Move down">↓</button></span></div>`;}).join('')}
   <button class="btn sm" style="margin-top:10px" onclick="S.pres.order[S.pres.track]=(S.pres.track==='walk'?WALK:TALK).map(x=>x.id);S.pres.hidden[S.pres.track]=[];save();render()">Restore the standard order</button></div>
  <div class="card" style="border-top:5px solid var(--maroon)"><h3>${ic('jot','sm')} 3 · Narration</h3>
   <div class="field"><label>From the narration library</label><select class="f" onchange="S.pres.narr[S.pres.track]=this.value;save();render()">${Object.entries(NARR[p.track]).map(([k,v])=>`<option value="${k}" ${p.narr[p.track]===k?'selected':''}>${v.label}</option>`).join('')}</select></div>
   <p class="help">A narration is written for an audience, not a person — it carries over to the next talk unchanged. Lines it doesn't change fall back to the standard one.</p>
   ${vis[0]?`<div class="say" style="margin:12px 0"><span class="mark"><img src="${MARK}" alt="Gyani Says"></span><div class="bub"><p class="who">First line · ${esc(vis[0].t)}</p><p class="sq" style="font-size:18px">${esc(narrLine(vis[0].id))}</p></div></div>`:''}
   <label class="check ${p.notes?'on':''}"><input type="checkbox" ${p.notes?'checked':''} onchange="S.pres.notes=this.checked;save();render()"><span><b>Show the narration at the foot of each slide</b><br><span class="muted small">Press N during the talk to hide or show it</span></span></label>
   <button class="btn pri" style="width:100%;font-size:18px;min-height:54px" ${vis.length?'':'disabled'} onclick="presBegin()">Begin the presentation →</button></div>
 </div>`,{kind:'pres'});
}
function presDisc(k,v){const p=S.pres;p.disc[k]=v;
 if(k==='who')p.narr.walk={'The Gyani Says team':'team','Faculty and mentors':'faculty','A partner organisation':'partner'}[v];
 if(k==='as'||k==='room')p.narr.talk=p.disc.as==='Trainers and mentors'?'trainers':p.disc.room==='A campus session'?'campus':'general';
 save();render();}
function presHide(id){const h=S.pres.hidden[S.pres.track];const i=h.indexOf(id);i>=0?h.splice(i,1):h.push(id);save();render();}
function presMove(j,dir){const o=S.pres.order[S.pres.track];[o[j],o[j+dir]]=[o[j+dir],o[j]];save();render();}
function presBegin(){const p=S.pres;p.snap={screen:S.ui.screen,stage:S.stage,firstLogin:S.firstLogin,g1:S.admin.g1tab,g2:S.admin.g2tab,g10:S.admin.g10tab,w1:S.w1.submitted};p.on=true;p.i=0;p.applied=null;save();
 try{const r=document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();r&&r.catch&&r.catch(()=>{});}catch(e){}renderPres();}
function presExit(){const p=S.pres,s=p.snap||{};p.on=false;S.stage=s.stage||S.stage;S.firstLogin=s.firstLogin||S.firstLogin;S.admin.g1tab=s.g1;S.admin.g2tab=s.g2;S.admin.g10tab=s.g10;S.w1.submitted=!!s.w1;S.ui.screen='P1';save();
 try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}catch(e){}render();}
function presGo(n){const p=S.pres,L=presList();p.i=Math.max(0,Math.min(L.length-1,p.i+n));save();renderPres();$('pres').querySelector('.pres-body').scrollTop=0;}
function renderPres(){const el=$('pres');if(!el)return;const p=S.pres;if(!p||!p.on){el.innerHTML='';return;}
 const L=presList();if(!L.length){p.on=false;el.innerHTML='';return;}const x=L[Math.min(p.i,L.length-1)];
 let body;
 if(p.track==='walk'){if(p.applied!==x.id){x.setup&&x.setup();p.applied=x.id;save();}body=`<div class="pres-live">${screen(x.code)}</div>`;}
 else body=talkSlide(x.id);
 el.innerHTML=`<div class="pres"><div class="pres-top"><img class="smark" src="${SAARTHI_MARK}" alt="Saarthi" style="height:40px"><img src="${SAARTHI_WORD}" alt="Saarthi" style="height:26px"><img src="${MARK}" alt="Gyani Says" style="height:34px;margin-left:6px;padding-left:12px;border-left:1px solid var(--line)">
  <b style="font-family:Georgia,serif;font-size:20px;margin-left:12px">${p.track==='walk'?`<span class="pill" style="margin-right:8px">${x.code}</span>`:''}${esc(x.t)}</b>
  <span style="margin-left:auto" class="muted">${p.i+1} of ${L.length}</span><button class="btn sm" onclick="presGo(-1)" ${p.i?'':'disabled'}>‹ Back</button><button class="btn sm pri" onclick="presGo(1)" ${p.i<L.length-1?'':'disabled'}>Next ›</button><button class="btn sm" onclick="S.pres.notes=!S.pres.notes;save();renderPres()">${p.notes?'Hide':'Show'} narration</button><button class="btn sm" onclick="presExit()">End · Esc</button></div>
 <div class="pres-body">${body}</div>
 ${p.notes?`<div class="pres-foot"><img src="${MARK}" alt="" style="height:42px"><p class="pres-narr">${esc(narrLine(x.id))}</p></div>`:''}
 <div class="pdots">${L.map((y,j)=>`<button aria-current="${j===p.i}" title="${esc(y.t)}" onclick="S.pres.i=${j};save();renderPres()"></button>`).join('')}</div></div>`;}
document.addEventListener('keydown',e=>{if(!S||!S.pres||!S.pres.on)return;if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
 if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();presGo(1);}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();presGo(-1);}
 else if(e.key==='n'||e.key==='N'){S.pres.notes=!S.pres.notes;save();renderPres();}else if(e.key==='Escape'&&!$('modal').innerHTML)presExit();});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&S&&S.pres&&S.pres.on){/* leaving full screen keeps the talk open; Esc again ends it */}});

/* ----- the talk's slides — built from the rig's own data, so they stay true ----- */
function talkSlide(id){const d=S.pres.disc,tr=d.as==='Trainers and mentors';
 const P=(inner,cls='')=>`<div class="pslide ${cls}">${inner}</div>`;
 const c=(h,t,icn)=>`<div class="pcard">${icn?ic(icn,'lg'):''}<h3>${h}</h3><p>${t}</p></div>`;
 if(id==='cover')return P(`<div class="pgrid2" style="align-items:center"><div><div class="row" style="gap:14px;margin-bottom:26px"><img src="${SAARTHI_MARK}" alt="Saarthi" style="height:96px"><img src="${SAARTHI_WORD}" alt="Saarthi" style="height:58px"></div>
  <h1>${tr?'Teach and mentor with The Saarthi System':'Become a coach with The Saarthi System'}</h1><p class="lead">${esc(d.room)} · ${esc(d.city)} · ${d.mode==='Either'?'in person or online':esc(d.mode.toLowerCase())}</p></div>
  <div class="pcard" style="padding:40px 44px"><p style="font-family:Georgia,serif;font-size:34px;line-height:1.3;margin:0">“Read a report with a person. Explain what it says. Never tell them what to do.”</p><div class="row" style="margin-top:26px"><img src="${MARK}" alt="Gyani Says" style="height:54px"><span class="muted" style="font-size:19px">Gyani Says trains, certifies and runs every coach</span></div></div></div>`);
 if(id==='work')return P(`<div class="pgrid2"><h1>What the work is</h1><p class="lead" style="align-self:end">A person takes the Aarambh assessment and gets their report. You sit with them and help them make sense of it — in SETU, our coaching app.</p></div>
  <div class="pgrid3">${c('Prepare · 45 minutes','Read the report. SETU\'s Prep guide shows where to probe and suggests questions — you decide which to ask.','prepare')}${c('The debrief · 45 minutes','Settle, Empathise, Think, Undertake. One question at a time, and you capture what they say.','live-mode')}${c('After · within 24 hours','A letter for the person, checked before they see it, and recommendations recorded separately.','letter')}</div>
  <div class="pband">You explain what the report says. <b>You never tell the person what to do, and you never sell.</b></div>`);
 if(id==='who')return tr?P(`<div class="pgrid2"><h1>Teaching and mentoring with us</h1><p class="lead" style="align-self:end">Two ways in: an Active coach we promote, or an experienced trainer who applies.</p></div>
  <div class="pgrid3">${c('The faculty induction','Two days: how we teach · the Reading Guide · marking calibration · the Code · SETU and PRACTICE mode · one observed teaching session.','faculty')}${c('Teaching a batch','Live, in a batch, one faculty member to six learners in practical work. You mark exam parts you are cleared for.','module')}${c('Mentoring','At most six mentees. You review their supervised debriefs and sign them off to Active — and never mark their exam.','follow-up')}</div>`)
  :P(`<div class="pgrid2"><h1>Who we are looking for</h1><p class="lead" style="align-self:end">You don't need to be a coach already. Saarthi teaches the reading and the conversation.</p></div>
  <div class="pgrid3">${c('A language you work in','Every coach is matched by language. Primary languages are matched first.','language')}${c('Regular time','Once certified, you choose the hours you give each week — and keep to them.','time-commitment')}${c('Your own assessment first','Every coach starts as a client. You take it before Day 1, and a coach debriefs you.','exam')}</div>
  <div class="row" style="gap:10px">${LANGS.map(l=>`<span class="pill" style="font-size:18px;padding:8px 14px">${l}</span>`).join('')}</div>`);
 if(id==='journey'){const steps=tr?[['Apply','as a trainer or mentor'],['Talk with us','a short conversation'],['Induction','two days, with a seat'],['Calibration','mark alongside faculty'],['Teach or mentor','your first batch']]:[['Apply','about five minutes'],['A seat in a batch','matched to your city and mode'],['First login','confirm and sign'],['Core modules','about four days, live'],['Role tracks','one or two days each'],['The exam','four parts'],['Provisional','sign the Code, choose your time'],['Active','6 supervised debriefs · 3 mentor hours · within 6 months']];
  return P(`<h1>${tr?'The road to teaching':'The road from applying to Active'}</h1><div class="pjourney" style="grid-template-columns:repeat(${steps.length},minmax(0,1fr))">${steps.map((s,i)=>`<div class="pstep"><span>${i+1}</span><b>${s[0]}</b><em>${s[1]}</em></div>`).join('')}</div>
  <div class="pband">${tr?'A batch cannot run without eligible faculty — so trainers are planned months ahead.':'About six months from the first module to Active. Most of it is real debriefs, with a mentor beside you.'}</div>`);}
 if(id==='levels')return P(`<div class="pgrid2" style="align-items:start"><div><h1 style="font-size:50px">Levels — who you may take</h1><table class="ptable"><tr><th>Level</th><th>Track</th><th>Clients</th></tr>${[['1','Students · 1 day','Students'],['2','Executives · 1 day','+ early career'],['3','Mid-management · 2 days','+ managers'],['4','Senior · 2 days','+ senior leaders']].map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table><p class="lead" style="font-size:21px;margin-top:14px">Or all four at the start — an all-rounder takes anyone.</p></div>
  <div><h1 style="font-size:50px">Ranks — what is behind you</h1>${RANKS.map(r=>`<div class="pcard" style="margin-bottom:14px;padding:18px 22px"><h3 style="margin:0 0 6px">${r.name}</h3><p style="margin:0;font-size:19px"><b>How:</b> ${esc(r.how)}<br><b>Adds:</b> ${esc(r.adds)}</p></div>`).join('')}</div></div>`);
 if(id==='exam')return P(`<div class="pgrid2"><h1>The exam</h1><p class="lead" style="align-self:end">Four parts, all must pass. You see pass or not pass with written feedback, and resit only what you didn't pass — at most twice.</p></div>
  <div class="pgrid4">${[['Written','20%','A short in-app test'],['Dossier practical','30%','Two halves: read a report unaided and write your plan — then open the Prep guide and say where it agrees and differs'],['Observed debrief','35%','A practice debrief in SETU, marked by two faculty alone'],['Oral viva','15%','A conversation with two faculty']].map(x=>`<div class="pcard"><div class="pbig">${x[1]}</div><h3>${x[0]}</h3><p>${x[2]}</p></div>`).join('')}</div>
  <div class="pband">Never marked by your own mentor.</div>`);
 if(id==='time')return P(`<h1>Time and money, plainly</h1><div class="pgrid3">${c('Training is not paid and not charged','You never pay Gyani Says, and the training and exam are not paid time.','credential')}${c('You choose your time','Under 5 · 5–10 · 10–20 · 20+ hours a week. You can change it later, with admin.','time-commitment')}${c('Paid per session, monthly','Your terms are agreed with Gyani Says. A coach never discusses fees with a client.','calendar')}</div>`);
 if(id==='batches'){const prog=tr?'induct':'core';const bs=S.batches.filter(b=>b.prog===prog&&!['closed','running','full'].includes(batchState(b))&&(d.mode==='Online'?b.seatsO:d.mode==='In person'?(b.seatsP&&b.city===d.city):(b.seatsO||b.city===d.city))).slice(0,3);
  return P(`<div class="pgrid2"><h1>${tr?'Next faculty induction':'Batches open for you'}</h1><p class="lead" style="align-self:end">${esc(d.city)} · ${d.mode==='Either'?'in person or online':esc(d.mode.toLowerCase())} — straight from today's batch list.</p></div>
  ${bs.length?`<div class="pgrid3">${bs.map(b=>`<div class="pcard"><div class="eyebrow">${progName(b.prog)}</div><h3>${esc(b.name)}</h3><p style="margin:0 0 10px">${fmtDate(b.start)} – ${fmtDate(b.end)}<br>${esc(modeLabel(b))}</p>${b.seatsP?`<p style="margin:0"><b>${b.seatsP-b.filledP}</b> seats in person left</p>`:''}${b.seatsO?`<p style="margin:0"><b>${b.seatsO-b.filledO}</b> seats online left</p>`:''}<p class="muted" style="margin:10px 0 0">Starts in ${daysTo(b.start)} days</p></div>`).join('')}</div>`
  :`<div class="pband">No batch for ${esc(d.city)} is open yet. Apply today and you are placed in the next one.</div>`}`);}
 if(id==='code')return P(`<div class="pgrid2"><h1>What a coach never does</h1><p class="lead" style="align-self:end">It is in the Code of Ethics you sign, and in the data undertaking you sign at first login. Breaking it is misconduct.</p></div>
  <div class="pgrid3">${[['Discuss money','No rates, fees or payment — that is handled elsewhere.'],['Share contact details','No phone, email, website or social handles, before, during or after.'],['Coach off the platform','No private coaching with someone you met through it. No gifts.'],['Read aloud a flag word','The report\'s sharpest words are for you to read, never to say.'],['Copy or export anything','Readings, notes and recordings stay inside SETU.'],['Share a reading','Not with an employer, a colleague or another coach. It belongs to the person.']].map(x=>`<div class="pcard" style="border-left:6px solid var(--stop)"><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div>`);
 if(id==='apply')return P(`<div class="pgrid2" style="align-items:center"><div><h1>Apply today</h1><p class="lead">It takes about five minutes. Tell us how you'd like to attend and when you could start, and we place you in a batch.</p>
</div>
  <div class="pcard"><h3>What happens next</h3>${['We read your application, and may call you','We offer a batch that fits','You are enrolled — your seat, your login and the invite arrive together','You take your own assessment before Day 1'].map((s,i)=>`<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line);flex-wrap:nowrap;align-items:flex-start"><span class="pill maroon" style="font-size:18px;min-width:38px;justify-content:center">${i+1}</span><span style="font-size:20px">${s}</span></div>`).join('')}</div></div>
  <div><div class="plink">gyanisays.example/saarthi/apply?src=${talkTag()}</div><p class="muted" style="font-size:19px;margin:0">Tagged for this talk, so we know you came from today.</p></div>`);
 return P('');}

/* ---------------- boot ---------------- */
load();
initializeWorkspaceAccess();
if(/^#[WSCGAKP]\d+$/.test(location.hash)&&META[location.hash.slice(1)]){S.ui.screen=location.hash.slice(1);if(S.pres)S.pres.on=false;S.ui.collapsed=true;}   // e.g. …html#P1 opens the presenter
render();
if(location.hash==='#present'||location.hash==='#talk'){S.ui.screen='P1';S.pres.track=location.hash==='#talk'?'talk':'walk';S.pres.on=true;S.pres.i=0;S.pres.applied=null;S.pres.snap={screen:'P1',stage:S.stage,firstLogin:S.firstLogin,g1:S.admin.g1tab,g2:S.admin.g2tab,g10:S.admin.g10tab,w1:S.w1.submitted};save();render();}   // …html#present starts the rig walk-through, #talk the talk for would-be coaches

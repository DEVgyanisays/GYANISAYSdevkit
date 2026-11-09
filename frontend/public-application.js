/* Public applicant flow for the local prototype. Production submission/review
   must be stored and authorized by the API; no account is created on submit. */
let publicApplicationOpen=sessionStorage.getItem('saarthi-public-apply')==='true';
function addPublicApplicationEntry(select){
 const option=document.createElement('option');option.value='new';option.textContent='New user · Apply without an account';select.append(option);
 const entry=document.createElement('section');entry.className='new-applicant-entry';
 entry.innerHTML='<span class="eyebrow">NEW TO SAARTHI?</span><h3>Your journey starts here.</h3><p>Apply as a coach, trainer or mentor. No username or password needed.</p><button type="button" class="btn">New user · Apply now <span>→</span></button><small>Apply → Admin review → Acceptance → Enrolment & invite</small>';
 entry.querySelector('button').onclick=()=>startPublicApplication();
 document.getElementById('workspace-login').after(entry);
}
function startPublicApplication(){
 if(workspaceSession)return;
 const draft=sessionStorage.getItem('saarthi-applicant-draft');
 if(draft){try{S.w1=JSON.parse(draft);}catch{newApplicantDraft();}}else newApplicantDraft();
 publicApplicationOpen=true;sessionStorage.setItem('saarthi-public-apply','true');S.ui.screen='W1';render();window.scrollTo(0,0);
}
function newApplicantDraft(){S.w1={as:'coach',name:'',phone:'',email:'',city:'',years:'',work:'',coached:'',quals:'',cv:false,langs:{},band:'',mode:'Either',window:'',tracks:[],days:[],consent:false,submitted:false,src:'direct'};}
function leavePublicApplication(){
 sessionStorage.setItem('saarthi-applicant-draft',JSON.stringify(S.w1));publicApplicationOpen=false;sessionStorage.removeItem('saarthi-public-apply');render();window.scrollTo(0,0);
}
function renderPublicApplication(){
 stopTick();if(S.pres)S.pres.on=false;
 ['drawer','modal','pres','guide-assistant'].forEach(id=>{document.getElementById(id).innerHTML='';document.getElementById(id).classList.remove('open');});
 const root=document.getElementById('rig');root.className='public-application-shell';
 const receipt=S.w1.submitted;
 root.innerHTML=`<header class="public-apply-header"><span>${receipt?'APPLICATION RECEIVED':'NEW APPLICANT · NO ACCOUNT REQUIRED'}</span><button class="btn sm" onclick="leavePublicApplication()">← Back to login</button></header>${receipt?publicApplicationReceipt():W1()}`;
 root.querySelector('.mockband')?.remove();
 root.querySelector('.webbar nav')?.remove();
 const page=root.querySelector('.page');if(page)page.classList.add('application-page');
 // Public visitors cannot navigate to any staff workspace.
 root.querySelectorAll('[onclick]').forEach(el=>{if(/go\('/.test(el.getAttribute('onclick')))el.remove();});
 if(receipt)return;
 const intro=page.firstElementChild;intro.classList.add('application-intro');
 const hint=document.createElement('div');hint.className='note teal applicant-process';hint.innerHTML='<b>Apply first. Sign in after enrolment.</b><br>Your application goes to the admin team for review. Acceptance is followed by a batch offer and enrolment; your login invitation comes after that. This local demo does not send emails.';intro.after(hint);
 const city=root.querySelector('select.f');
 if(city){const blank=document.createElement('option');blank.value='';blank.textContent='Select your city';city.prepend(blank);city.value=S.w1.city;}
 root.querySelectorAll('.field').forEach((field,i)=>{const input=field.querySelector('input,select,textarea'),label=field.querySelector('label');if(input&&label){input.id='applicant-field-'+i;label.htmlFor=input.id;}});
 const cv=[...root.querySelectorAll('button')].find(el=>el.textContent.includes('CV attached')||el.textContent.includes('Attach your CV'));
 if(cv){cv.disabled=true;cv.textContent='CV upload · not connected in demo';}
 const submit=root.querySelector('button[onclick="w1Submit()"]');
 const update=()=>{const w=S.w1;const ok=Boolean(w.name.trim()&&(w.email.trim()||w.phone.trim())&&w.city&&Object.keys(w.langs).length&&w.consent);if(submit){submit.disabled=!ok;submit.textContent=ok?'Submit application for review →':'Complete required fields and consent';}sessionStorage.setItem('saarthi-applicant-draft',JSON.stringify(w));};
 root.addEventListener('input',update);root.addEventListener('change',update);update();
}
function publicApplicationReceipt(){const application=S.apps.find(a=>a.id===S.w1.applicationId);const status={new:'pending admin review',interviewing:'awaiting an interview',accepted:'accepted — awaiting batch offer and enrolment',rejected:'not accepted',offered:'offered a batch',enrolled:'enrolled',waitlisted:'on the waitlist'}[application?.state]||'pending admin review';return `<div class="page application-receipt"><img src="${MARK}" alt="Gyani Says"><span class="eyebrow">THANK YOU FOR TAKING THE FIRST STEP</span><h1>Application received, ${esc(S.w1.name.split(' ')[0])}.</h1><p>Your ${S.w1.as==='coach'?'coach':'trainer / mentor'} application is now <b>${esc(status)}</b>.</p><div class="pill teal">Reference: ${esc(S.w1.applicationId||'Submitted')}</div><div class="card"><h3>What happens next?</h3><ol><li><b>Admin reviews your application</b><p>The team can accept, reject or request a conversation.</p></li><li><b>A place is arranged</b><p>If accepted, the team offers a suitable batch and completes enrolment.</p></li><li><b>Your account is invited</b><p>In production, an email will let you set your password. Submitting this form does not create login credentials.</p></li></ol></div><div class="note plain">Demo: saved in this browser’s application queue. No email has been sent and no real account has been created.</div><div class="row" style="justify-content:center;margin-top:24px"><button class="btn pri" onclick="leavePublicApplication()">Back to login →</button><button class="btn" onclick="newApplicantDraft();render();window.scrollTo(0,0)">Start a new application</button></div></div>`;}
function submitPublicApplication(){
 const w=S.w1;if(w.submitted)return;
 if(!w.name.trim()||!(w.email.trim()||w.phone.trim())||!w.city||!Object.keys(w.langs).length||!w.consent){toast('Complete your name, contact, city, languages and consent.');return;}
 if(w.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(w.email.trim())){toast('Enter a valid email address.');return;}
 const id='APP-'+Date.now().toString(36).toUpperCase();
 const langs=Object.entries(w.langs).map(([language,level])=>language+(level===2?' (P)':'')).join(', ');
 S.apps.unshift({id,name:w.name.trim(),email:w.email.trim(),phone:w.phone.trim(),city:w.city,as:w.as,mode:w.mode,pref:`${w.city} · ${w.window||'To be discussed'}`,langs,source:'New user · login page',state:'new',years:w.years||'—',work:w.work,coached:w.coached,quals:w.quals,days:w.days.join(' '),tracks:w.tracks.join(', '),band:w.band,cv:false,publicSubmission:true,submittedAt:new Date().toISOString(),decisions:[]});
 w.submitted=true;w.applicationId=id;save();sessionStorage.setItem('saarthi-applicant-draft',JSON.stringify(w));render();window.scrollTo(0,0);
}
function decorateApplicationQueue(){
 if(!fullWorkspaceAccess())return;
 if(S.ui.screen==='G0'){
  const page=document.querySelector('.stage .page');const waiting=S.apps.filter(a=>a.publicSubmission&&['new','screened','interviewing'].includes(a.state));
  const card=document.createElement('div');card.className='note teal applicant-process';card.innerHTML=`<b>${waiting.length} new-user application${waiting.length===1?'':'s'} awaiting review</b><p>Review coach and trainer applications, make a decision, then offer a batch.</p><button class="btn sm">Review applications →</button>`;card.querySelector('button').onclick=()=>{S.admin.g2tab='apps';go('G2');};page.querySelector('.pagehead')?.after(card);
 }
 if(S.ui.screen!=='G2'||S.admin.g2tab!=='apps')return;
 document.querySelectorAll('tr.click').forEach(row=>{
  const id=row.getAttribute('onclick')?.match(/appView\('([^']+)'\)/)?.[1];const a=S.apps.find(item=>item.id===id);if(!a?.publicSubmission)return;
  const last=row.lastElementChild;last.innerHTML='<button class="btn sm pri">Review application</button>';last.querySelector('button').onclick=()=>reviewPublicApplication(id);
 });
}
function reviewPublicApplication(id){
 if(!fullWorkspaceAccess())return;
 const a=S.apps.find(item=>item.id===id);if(!a)return;
 const pending=['new','screened','interviewing'].includes(a.state);
 modal(`<div class="eyebrow">NEW USER APPLICATION · ${esc(a.id)}</div><h3>${esc(a.name)}</h3><div class="row"><span class="pill teal">${a.as==='coach'?'Coach':'Trainer / mentor'}</span><span class="pill">${esc(a.state)}</span></div><dl class="kv"><dt>Email</dt><dd>${esc(a.email||'Not provided')}</dd><dt>Phone</dt><dd>${esc(a.phone||'Not provided')}</dd><dt>City</dt><dd>${esc(a.city)}</dd><dt>Experience</dt><dd>${esc(a.years)} years · ${esc(a.work||'—')}</dd><dt>Qualifications</dt><dd>${esc(a.quals||'—')}</dd><dt>Languages</dt><dd>${esc(a.langs)}</dd><dt>Preferences</dt><dd>${esc(a.mode)} · ${esc(a.pref)}</dd><dt>Tracks / days</dt><dd>${esc(a.tracks||'—')} · ${esc(a.days||'—')}</dd></dl>${pending?'<div class="field"><label for="application-reason">Decision reason · required</label><textarea class="f" id="application-reason" placeholder="Record why you are making this decision."></textarea></div><p id="application-review-error" role="alert" class="help"></p>':''}${a.decisions?.length?`<div class="note plain">${a.decisions.map(d=>`<p><b>${esc(d.state)}</b> · ${esc(d.reason)}</p>`).join('')}</div>`:''}<div class="row" style="margin-top:20px"><button class="btn" onclick="closeModal()">Close</button>${pending?`<button class="btn" onclick="decidePublicApplication('${id}','interviewing')">Request interview</button><button class="btn danger" onclick="decidePublicApplication('${id}','rejected')">Reject</button><button class="btn pri" onclick="decidePublicApplication('${id}','accepted')">Accept application</button>`:''}${['accepted','offered','waitlisted'].includes(a.state)?`<button class="btn" onclick="offerBatch('${id}')">Offer a batch</button><button class="btn pri" onclick="enrol('${id}')">Continue to enrolment →</button>`:''}</div><p class="help">Acceptance does not create a login. Complete the existing enrolment flow afterwards. This demo records decisions locally and sends no email.</p>`);
}
function decidePublicApplication(id,state){
 if(!fullWorkspaceAccess()||!['accepted','rejected','interviewing'].includes(state))return;
 const a=S.apps.find(item=>item.id===id);if(!a||!['new','screened','interviewing'].includes(a.state))return;
 const reason=document.getElementById('application-reason').value.trim();if(!reason){document.getElementById('application-review-error').textContent='Enter a reason before recording your decision.';return;}
 a.state=state;a.decisions.push({state,reason,by:workspaceSession.user,at:new Date().toISOString()});logAct(`${a.name} — application ${state}`,reason);save();render();reviewPublicApplication(id);
}


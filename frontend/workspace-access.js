/* DEMO ONLY: UI routing is not authentication. Production must authorize every API call.
   Never put real user credentials, client reports or secrets into this static demo. */
const ROLE_PROFILES = {
 coach:{label:'Coach',user:'coach.demo',home:'C1',description:'Your clients, preparation, calendar and learning.'},
 coach_org:{label:'Organisation coach',user:'orgcoach.demo',home:'C1',description:'Your coaching and learning workspace.'},
 admin:{label:'Admin',user:'admin.demo',home:'G0',description:'All workspaces, people, operations and finance.'},
 administration:{label:'Administration',user:'operations.demo',home:'G0',description:'All workspaces and day-to-day operations.'},
 finance:{label:'Finance lead',user:'finance.demo',home:'G7',description:'Payments, rate agreements and all workspaces.'},
 trainer:{label:'Trainer / Faculty',user:'trainer.demo',home:'T1',description:'Your teaching checklist and learning resources.'},
 mentor:{label:'Mentor',user:'mentor.demo',home:'M1',description:'Your supervision checklist and mentoring resources.'},
 reviewer:{label:'Aarambh reviewer',user:'reviewer.demo',home:'A1',description:'Validation, leads and recording audit.'}
};
let workspaceSession = null;
try { const saved=JSON.parse(sessionStorage.getItem('saarthi-demo-session')); if(saved&&ROLE_PROFILES[saved.role]&&saved.user===ROLE_PROFILES[saved.role].user)workspaceSession=saved; } catch {}
let guideOpen=false, guideMessages=[];
function fullWorkspaceAccess(){return Boolean(workspaceSession&&['admin','administration','finance'].includes(workspaceSession.role));}
function roleAllows(code){
 if(!workspaceSession)return publicApplicationOpen&&code==='W1';
 if(fullWorkspaceAccess())return Boolean(META[code]);
 const role=workspaceSession.role;
 if(role==='coach'||role==='coach_org')return /^[SC]\d+$/.test(code)&&Boolean(META[code]);
 if(role==='trainer')return code==='T1';
 if(role==='mentor')return code==='M1';
 return role==='reviewer'&&/^A[123]$/.test(code);
}
function initializeWorkspaceAccess(){
 META.T1={code:'T1',name:'Faculty workspace',who:'Trainer / Faculty',built:true,group:'Faculty'};
 META.M1={code:'M1',name:'Mentor workspace',who:'Mentor',built:true,group:'Mentoring'};
 SCREENS.push({g:'Teaching & mentoring',items:[['T1','Faculty workspace'],['M1','Mentor workspace']]});
 if(workspaceSession)S.admin.role=workspaceSession.role==='finance'?'finance':'admin';
}
function renderLogin(){
 stopTick();
 if(S.pres)S.pres.on=false;
 ['drawer','modal','pres','guide-assistant'].forEach(id=>{const el=document.getElementById(id);el.innerHTML='';el.classList.remove('open');});
 const root=document.getElementById('rig');root.className='login-shell';
 root.innerHTML=`<section class="login-story"><div class="login-brand"><img src="${MARK}" alt="Gyani Says"><div><strong>Gyani Says</strong><span>THE SAARTHI SYSTEM</span></div></div><div class="login-story-copy"><div class="eyebrow">A space to learn. A space to guide.</div><h1>Good guidance<br> starts with you.</h1><p>Your people. Your purpose. Your workspace.<br>Everything you need to take the next step, together.</p><div class="login-benefits"><div><b>01</b><span>Learn with intention<small>Training, practice and certification</small></span></div><div><b>02</b><span>Guide with confidence<small>Preparation, debriefs and thoughtful follow-ups</small></span></div><div><b>03</b><span>Find your next step<small>Your Gyani Says guide is always close by</small></span></div></div></div><span class="login-story-foot">Saarthi · SETU · By Gyani Says</span></section><main class="login-main"><div class="login-card"><div class="login-wordmark"><img src="${SAARTHI_MARK}" alt=""><img src="${SAARTHI_WORD}" alt="Saarthi"></div><span class="eyebrow">WELCOME TO YOUR WORKSPACE</span><h2>Welcome back.</h2><p class="muted">Choose your role and sign in to continue.</p><form id="workspace-login"><div class="field"><label for="login-role">Login as</label><select class="f" id="login-role">${Object.entries(ROLE_PROFILES).map(([key,p])=>`<option value="${key}">${p.label}</option>`).join('')}</select><p id="role-description" class="help">${ROLE_PROFILES.coach.description}</p></div><div class="field"><label for="login-user">Username</label><input id="login-user" class="f" autocomplete="username" required placeholder="Enter your demo username"></div><div class="field"><label for="login-password">Password</label><div class="password-field"><input id="login-password" class="f" type="password" autocomplete="off" required placeholder="Enter your demo password"><button type="button" id="show-password" aria-pressed="false">Show</button></div></div><p id="login-error" role="alert"></p><button class="btn pri login-submit" type="submit">Sign in to workspace <span>→</span></button></form><div class="demo-login-note"><b>Interactive demo</b><p>Use demo credentials only. This preview does not verify real accounts.</p><button class="btn sm" id="fill-demo">Use selected role’s demo login</button><small>Password: SaarthiDemo!</small></div><p class="login-footer">Your role shapes your workspace. Need help?<br>Contact your Gyani Says administrator.</p></div></main>`;
 const role=document.getElementById('login-role');
 addPublicApplicationEntry(role);
 role.addEventListener('change',()=>{if(role.value==='new'){startPublicApplication();return;}document.getElementById('role-description').textContent=ROLE_PROFILES[role.value].description;document.getElementById('login-user').value='';document.getElementById('login-password').value='';document.getElementById('login-error').textContent='';});
 document.getElementById('fill-demo').onclick=()=>{document.getElementById('login-user').value=ROLE_PROFILES[role.value].user;document.getElementById('login-password').value='SaarthiDemo!';};
 document.getElementById('show-password').onclick=event=>{const input=document.getElementById('login-password');const show=input.type==='password';input.type=show?'text':'password';event.target.textContent=show?'Hide':'Show';event.target.setAttribute('aria-pressed',String(show));};
 document.getElementById('workspace-login').onsubmit=event=>{
  event.preventDefault();const selected=role.value;const user=document.getElementById('login-user').value.trim();const password=document.getElementById('login-password');
  if(user!==ROLE_PROFILES[selected].user||password.value!=='SaarthiDemo!'){document.getElementById('login-error').textContent='Username, password and selected role must match. Use the demo login button below.';return;}
  password.value='';load();workspaceSession={role:selected,user};sessionStorage.setItem('saarthi-demo-session',JSON.stringify(workspaceSession));
  S.admin.role=selected==='finance'?'finance':'admin';S.coachKind=selected==='coach_org'?'org':'ours';S.ui.screen=ROLE_PROFILES[selected].home;S.ui.rigPanel=false;
  guideMessages=[];guideOpen=false;history.replaceState(null,'',location.pathname);render();window.scrollTo(0,0);
 };
}
function logoutWorkspace(){sessionStorage.removeItem('saarthi-demo-session');workspaceSession=null;guideMessages=[];guideOpen=false;history.replaceState(null,'',location.pathname);render();window.scrollTo(0,0);}
function applyWorkspaceAccess(){
 const root=document.getElementById('rig');
 root.querySelectorAll('[onclick]').forEach(el=>{
  const routes=[...el.getAttribute('onclick').matchAll(/go\('([^']+)'\)/g)].map(match=>match[1]);
  if(routes.length&&routes.some(code=>!roleAllows(code)))el.remove();
 });
 root.querySelectorAll('.workspace-group').forEach(group=>{if(!group.querySelector('.navi'))group.remove();});
 if(!fullWorkspaceAccess()){root.querySelector('.review-tools')?.remove();root.querySelector('.rail-foot .row')?.remove();}
 const profile=ROLE_PROFILES[workspaceSession.role];
 const account=document.createElement('div');account.className='workspace-account';
 account.innerHTML=`<span><b>${esc(profile.label)}</b><small>${esc(workspaceSession.user)}</small></span><button class="btn sm" type="button">Sign out</button>`;
 account.querySelector('button').onclick=logoutWorkspace;root.querySelector('.strip').append(account);
 root.querySelectorAll('.appbar .user').forEach(el=>{el.innerHTML=`<span>${esc(profile.label)} · Demo workspace</span><span class="avatar">${esc(profile.label.slice(0,2).toUpperCase())}</span>`;});
 decorateApplicationQueue();
}
function staffWorkspace(code){
 const mentor=code==='M1';
 const steps=mentor?['Review the supervision plan','Prepare for the mentoring conversation','Record hours and written feedback']:['Review your session plan','Prepare the module materials','Record learning feedback'];
 return wrap(code,`${head(`<div class="eyebrow">${mentor?'MENTORING':'FACULTY'} · YOUR WORKSPACE</div><h2>${mentor?'Help a coach grow.':'Make every session count.'}</h2>`,'A focused space for your teaching and guidance.')}<div class="hero"><div class="eyebrow">YOUR NEXT STEP</div><h2>Start with the session plan.</h2><p>Use the checklist below and open the guide whenever you need a hand.</p></div><div class="grid2" style="margin-top:24px"><div class="card"><h3>${mentor?'Supervision':'Teaching'} checklist</h3>${steps.map((text,i)=>`<label class="check"><input type="checkbox"><span><b>0${i+1}</b> · ${text}</span></label>`).join('')}</div><div class="card"><h3>Your assignments</h3><p class="muted">No ${mentor?'mentees':'teaching assignments'} are linked to this demo login.</p><p class="help">Live assignments, marking and sign-offs will appear after the account and backend are connected. Other staff and coaches’ records are not shown here.</p><button class="btn" onclick="openWorkspaceGuide()">Ask the Gyani Says guide →</button></div></div>`,{kind:'saarthi'});
}
const GUIDE_TOPICS=[
 {keys:/prep|prepare|report|तैयार/i,title:'Prepare for a debrief',text:'Open My debriefs, choose your assigned session, then open the Prep guide. Check the integrity read, read both reports and prepare your questions. If a retake is needed, call it before continuing.',route:'C4'},
 {keys:/calendar|availab|slot|time|समय/i,title:'Plan your availability',text:'Open Calendar to review your slots. Use Open times for new availability. Locked or booked slots need an admin request; do not change a client booking directly.',route:'C3'},
 {keys:/pay|finance|rate|money|payment|पैस/i,title:'Review payments',text:'Open Slabs and payments to review coach rate agreements and the pay run. Check bank details and the effective date before approval. Record a reason for administrative changes.',route:'G7'},
 {keys:/assign|booking|आवंट/i,title:'Assign a coach',text:'Open Assigning coaches and select a waiting booking. Check eligibility, language, availability, organisation scope and the undertaking before assigning.',route:'G3'},
 {keys:/train|learn|module|exam|सीख/i,title:'Continue learning',text:'Open Core modules, review the next module and its material, then follow your faculty’s sign-off process. Role tracks and exams remain part of your certification journey.',route:'S2'},
 {keys:/letter|after|feedback|submit|follow/i,title:'Complete your follow-up',text:'Open your debrief and complete the after-debrief recommendations, feedback letter and rating within 24 hours. Include the reason for each recommendation. Revise sent-back letters using the reviewer’s comments.',route:'C7'},
 {keys:/people|access|account|login|password/i,title:'People and access',text:'Open People and access to review accounts and roles. In production, invite or reset access using an emailed link; administrators should never see someone’s password.',route:'G10'}
];
function openWorkspaceGuide(){guideOpen=true;renderGuideAssistant();document.getElementById('guide-question')?.focus();}
function guideAnswer(question){
 const role=workspaceSession.role;
 const topic=GUIDE_TOPICS.find(item=>item.keys.test(question));
 if(topic&&!roleAllows(topic.route))return {text:'That area belongs to a different workspace. Your '+ROLE_PROFILES[role].label+' login does not open it. Contact an administrator for help; I can guide you within your own workspace.'};
 if(topic)return topic;
 if(role==='trainer'||role==='mentor')return {text:'Start with your '+(role==='mentor'?'supervision':'teaching')+' checklist. Review your session plan, prepare your notes, and record feedback afterwards. This demo has no linked assignments yet; ask your administrator to connect them.',route:ROLE_PROFILES[role].home};
 const route=fullWorkspaceAccess()?'G0':role==='reviewer'?'A1':'C1';
 return {text:'Start from your workspace home and review what needs attention. '+(fullWorkspaceAccess()?'Check waiting assignments, training and access requests. You can also ask me about payments or coach assignment.':role==='reviewer'?'Review your validation queue. The reviewer screens are specified but not implemented in this kit.':'Check your next session, preparation and pending follow-ups. Ask me about reports, availability, training or feedback letters.')+' This is a built-in workflow guide, not a live AI chat.',route};
}
function renderGuideAssistant(){
 const host=document.getElementById('guide-assistant');if(!workspaceSession){host.innerHTML='';return;}
 const profile=ROLE_PROFILES[workspaceSession.role];
 const suggestions=fullWorkspaceAccess()?['What should I do next?','Assign a coach','Review payments']:['What should I do next?',...(['trainer','mentor','reviewer'].includes(workspaceSession.role)?[]:['Prepare for a debrief','Plan my availability'])];
 host.innerHTML=`${guideOpen?`<section class="guide-panel" role="dialog" aria-label="Gyani Says guide"><header><img src="${MARK}" alt="Gyani Says"><div><b>Your Gyani Says guide</b><small>${esc(profile.label)} · Workflow help</small></div><button id="guide-close" aria-label="Close assistant">×</button></header><div class="guide-conversation" role="log" aria-live="polite"><div class="guide-message"><b>A little guidance, whenever you need it.</b><p>Confused about the next step? Ask below or choose a topic. I’ll help you find your way.</p><small>Built-in guide · No live AI connection</small></div>${guideMessages.map(m=>`<div class="guide-message ${m.user?'from-user':''}">${esc(m.text)}${m.route&&roleAllows(m.route)?`<button class="btn sm" data-guide-route="${m.route}">Open ${esc(META[m.route].name)} →</button>`:''}</div>`).join('')}</div><div class="guide-suggestions">${suggestions.map(text=>`<button type="button">${esc(text)}</button>`).join('')}</div><form id="guide-form"><label class="guide-input-label" for="guide-question">Ask for guidance</label><div><input id="guide-question" maxlength="500" placeholder="What do I do next?" autocomplete="off" required><button type="submit" aria-label="Send question">↑</button></div></form></section>`:''}<button class="guide-launcher" aria-expanded="${guideOpen}" aria-label="${guideOpen?'Close':'Open'} Gyani Says assistant"><img src="${MARK}" alt="Gyani Says"><span>Need a hand?<b>Ask Gyani Says</b></span><i aria-hidden="true">${guideOpen?'×':'✦'}</i></button>`;
 host.querySelector('.guide-launcher').onclick=()=>{guideOpen=!guideOpen;renderGuideAssistant();if(guideOpen)document.getElementById('guide-question').focus();};
 if(!guideOpen)return;
 document.getElementById('guide-close').onclick=()=>{guideOpen=false;renderGuideAssistant();host.querySelector('.guide-launcher').focus();};
 const ask=text=>{guideMessages.push({text,user:true},guideAnswer(text));guideMessages=guideMessages.slice(-20);renderGuideAssistant();const log=host.querySelector('.guide-conversation');log.scrollTop=log.scrollHeight;document.getElementById('guide-question').focus();};
 document.getElementById('guide-form').onsubmit=e=>{e.preventDefault();const text=document.getElementById('guide-question').value.trim();if(text)ask(text);};
 host.querySelectorAll('.guide-suggestions button').forEach(button=>button.onclick=()=>ask(button.textContent));
 host.querySelectorAll('[data-guide-route]').forEach(button=>button.onclick=()=>go(button.dataset.guideRoute));
}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&guideOpen){guideOpen=false;renderGuideAssistant();document.querySelector('.guide-launcher')?.focus();}});



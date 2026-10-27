
const SUBMIT_URL='/application/api/registrations';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let submissionKey=sessionStorage.getItem('picnic-submission-key')||crypto.randomUUID();sessionStorage.setItem('picnic-submission-key',submissionKey);
let lastSubmittedPayload=null;
const EVENT_DATE = "2026-11-15";
const data = { kids: [] };
let currentStep = 1;

(function(){ const d=Math.max(0,Math.ceil((new Date(EVENT_DATE)-new Date())/86400000));
  document.getElementById('countdown').textContent=d; })();

/* tooltips: hover (desktop) + tap (mobile) */
document.querySelectorAll('.help').forEach(h=>{
  h.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation();
    const open=h.classList.contains('open');
    document.querySelectorAll('.help.open').forEach(x=>x.classList.remove('open'));
    if(!open) h.classList.add('open'); });
});
document.addEventListener('click', ()=>document.querySelectorAll('.help.open').forEach(h=>h.classList.remove('open')));

/* pills */
document.querySelectorAll('.pills').forEach(group=>{
  const key=group.dataset.pills;
  group.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      group.querySelectorAll('button').forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel'); data[key]=btn.dataset.v; handleConditionals(key,btn.dataset.v);
    });
  });
});
function show(id,on){ document.getElementById(id).classList.toggle('show',on); }
function handleConditionals(key,val){
  if(key==='rsvp'){ document.getElementById('rsvpNote').style.display = val==='Maybe'?'block':'none'; }
  if(key==='crew'){
    const sp=(val==='spouse'||val==='both'), kd=(val==='kids'||val==='both');
    data.spouseJoin=sp?'Yes':'No'; data.married=sp?'Yes':'No'; data.kidsJoin=kd?'Yes':'No';
    show('spouseDetails',sp);
    if(!kd){ data.kids=[]; document.getElementById('kidsList').innerHTML=''; var ak=document.getElementById('addKid'); if(ak) ak.style.display='block'; }
    if(val==='solo') goStep(4);
  }
}
document.getElementById('nameSelect').addEventListener('change',e=>show('nameAddWrap',e.target.value==='__add__'));
document.getElementById('dept').addEventListener('change',e=>show('deptOtherWrap',e.target.value==='__other__'));

function addKid(){
  if(data.kids.length>=4) return;
  const i=data.kids.length; data.kids.push({name:'',age:'',food:'',note:''});
  const el=document.createElement('div'); el.className='kidcard';
  el.innerHTML=`<h4>Child ${i+1}</h4>
    <div class="fields">
      <label class="field"><span class="lab">Name</span><input type="text" data-k="name" placeholder="Child's name"></label>
      <label class="field"><span class="lab">Age (years)</span><input type="number" data-k="age" min="0" max="25" placeholder="e.g. 8"></label>
      <label class="field"><span class="lab">Food preference</span>
        <div class="pills kidfood"><button type="button" data-v="Veg" class="veg">🥗 Veg</button><button type="button" data-v="Non-veg" class="non">🍗 Non-veg</button></div></label>
      <label class="field"><span class="lab">Allergies / medical note</span><input type="text" data-k="note" placeholder="Leave blank if none"></label>
    </div>`;
  el.querySelectorAll('input').forEach(inp=>inp.addEventListener('input',()=>{ data.kids[i][inp.dataset.k]=inp.value; }));
  el.querySelector('.kidfood').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    el.querySelector('.kidfood').querySelectorAll('button').forEach(x=>x.classList.remove('sel'));
    b.classList.add('sel'); data.kids[i].food=b.dataset.v; }));
  document.getElementById('kidsList').appendChild(el);
  document.getElementById('addKid').style.display = data.kids.length>=4?'none':'block';
}
document.getElementById('addKid').addEventListener('click',addKid);

function collectCore(){
  const s=document.getElementById('nameSelect').value;
  data.invitee_id = s && s !== '__add__' ? Number(s) : null;
  data.name = s==='__add__'?document.getElementById('nameAdd').value.trim():(invitees.find(p=>p.id===data.invitee_id)?.name || '');
  const dp=document.getElementById('dept').value;
  data.department = dp==='__other__'?document.getElementById('deptOther').value.trim():dp;
  data.ageGroup=document.getElementById('ageGroup').value;
  data.gender=document.getElementById('gender').value;
  data.allergies=document.getElementById('allergies').value.trim();
  data.medical=document.getElementById('medical').value.trim();
  data.special=document.getElementById('special').value.trim();
  data.spouseName=document.getElementById('spouseName').value.trim();
  data.spouseAgeGroup=document.getElementById('spouseAge').value;
  data.spouseMedical=document.getElementById('spouseMedical').value.trim();
}
function goStep(n){
  collectCore();
  if(n>1 && !validateStep1(false)) n=1;
  document.querySelectorAll('.step[data-step]').forEach(s=>s.classList.remove('active'));
  document.querySelector(`.step[data-step="${n}"]`).classList.add('active'); currentStep=n;
  const L={1:'About you',2:'Your crew',3:'Your kids',4:'Review & send'};
  document.getElementById('progfill').style.width=(n*25)+'%';
  document.getElementById('progtext').textContent=`Step ${n} of 4 · ${L[n]}`;
  if(n===3 && data.kids.length===0) addKid();
  if(n===4) buildReview();
  window.scrollTo({top:0,behavior:'smooth'});
}
function validateStep1(mark){
  const ok=data.rsvp&&data.name&&data.department&&data.ageGroup&&data.food&&data.alcohol;
  if(!ok&&mark) document.getElementById('err1').style.display='block';
  return ok;
}
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{
  const t=+b.dataset.go;
  if(currentStep===1&&t>1){ collectCore(); if(!validateStep1(true)) return; document.getElementById('err1').style.display='none'; }
  goStep(t);
}));
function buildReview(){
  collectCore(); const y=v=>esc(v||'—'); let h='';
  h+=`<p><b>Name:</b> ${y(data.name)} &nbsp;·&nbsp; <b>Dept:</b> ${y(data.department)} &nbsp;·&nbsp; <b>Age:</b> ${y(data.ageGroup)}</p>`;
  h+=`<p><b>You:</b> ${y(data.food)} · Alcohol: ${y(data.alcohol)} · Physical: ${y(data.physical)} · Strenuous: ${y(data.strenuous)}</p>`;
  if(data.allergies) h+=`<p><b>Allergies:</b> ${esc(data.allergies)}</p>`;
  if(data.medical) h+=`<p><b>Medical:</b> ${esc(data.medical)}</p>`;
  if(data.special) h+=`<p><b>Special care:</b> ${esc(data.special)}</p>`;
  if(data.spouseJoin==='Yes') h+=`<p><b>Spouse joining:</b> ${y(data.spouseName)} · ${y(data.spouseFood)} · Alcohol: ${y(data.spouseAlcohol)} · ${y(data.spouseAgeGroup)}</p>`;
  else h+=`<p><b>Spouse:</b> not joining</p>`;
  if(data.kidsJoin==='Yes'&&data.kids.length) h+=`<p><b>Kids joining (${data.kids.length}):</b> `+data.kids.map((k,i)=>`${esc(k.name||'Child '+(i+1))} (age ${esc(k.age||'?')}, ${esc(k.food||'?')})`).join(' · ')+`</p>`;
  else h+=`<p><b>Kids:</b> none joining</p>`;
  document.getElementById('reviewBox').innerHTML=h;
}
document.getElementById('regform').addEventListener('submit',e=>e.preventDefault());
document.getElementById('submitBtn').addEventListener('click',async()=>{
 collectCore();const button=document.getElementById('submitBtn'),err=document.getElementById('err4');err.style.display='none';
 if(!validateStep1(false)){goStep(1);document.getElementById('err1').style.display='block';return;}
   const payload={ invitee_id:data.invitee_id, rsvp:data.rsvp, name:data.name, department:data.department, age_group:data.ageGroup, gender:data.gender,
    food_pref:data.food, consumes_alcohol:data.alcohol, ok_physical:data.physical, ok_strenuous:data.strenuous,
    medical:data.medical, allergies:data.allergies, special_care:data.special,
    married:data.married||'No', spouse_joining:data.spouseJoin||'No',
    spouse:{name:data.spouseName,age_group:data.spouseAgeGroup,food_pref:data.spouseFood,consumes_alcohol:data.spouseAlcohol,medical:data.spouseMedical},
    kids_joining:data.kidsJoin||'No', kids:data.kids, consent:document.getElementById('privacyConsent').checked, submitted_at:new Date().toISOString() };

 if(!payload.consent){err.textContent='Please read and confirm the privacy notice.';err.style.display='block';return;}
 const serialized=JSON.stringify(payload,(k,v)=>k==='submitted_at'?undefined:v);if(lastSubmittedPayload&&lastSubmittedPayload!==serialized){submissionKey=crypto.randomUUID();sessionStorage.setItem('picnic-submission-key',submissionKey);}lastSubmittedPayload=serialized;
 button.disabled=true;button.textContent='Sending…';
 try{const r=await fetch(SUBMIT_URL,{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'GyaniSays','Idempotency-Key':submissionKey},body:JSON.stringify(payload)});const result=await r.json();if(!r.ok||!result.ok)throw Error(result.error||'Submission failed');finishUp();const receipt=document.createElement('p');receipt.textContent='Saved registration reference: '+result.reference;document.getElementById('successCard').append(receipt);sessionStorage.removeItem('picnic-submission-key');loadCount();}
 catch(e){err.textContent=e.message;err.style.display='block';button.disabled=false;button.textContent='Submit registration';}
});
function finishUp(){
  document.getElementById('regform').style.display='none';
  document.querySelector('.progwrap').style.display='none';
  document.getElementById('successCard').classList.add('active');
  document.querySelector('#successCard h2').textContent = data.rsvp === 'Maybe' ? 'Your tentative RSVP is saved!' : 'Your registration is saved!';
  document.querySelector('#successCard p').textContent = data.rsvp === 'Maybe' ? 'We have recorded your response as Maybe. Contact your organiser when you can confirm your attendance.' : 'Thank you. Your organiser has your details and will share the final event arrangements.';
  
  window.scrollTo({top:0,behavior:'smooth'});
}
document.getElementById('step2next').addEventListener('click', ()=>{
  const k=(data.crew==='kids'||data.crew==='both'); goStep(k?3:4);
});

async function loadCount(){try{const r=await fetch('/application/api/stats');if(!r.ok)throw Error();const data=await r.json();document.getElementById('regcount').textContent=data.registrations;}catch{document.getElementById('regcount').textContent='—';}}loadCount();

let invitees=[];
const namePicker=document.getElementById('nameSelect');
function renderNames(){
  const selected=namePicker.value, query=document.getElementById('nameSearch').value.trim().toLowerCase();
  namePicker.replaceChildren(new Option('— Pick your name —',''));
  for(const p of invitees.filter(p=>p.id===Number(selected)||`${p.name} ${p.department}`.toLowerCase().includes(query))){
    const same=invitees.filter(x=>x.name===p.name&&x.department===p.department).length>1;
    namePicker.add(new Option(p.name+(p.department?' · '+p.department:'')+(same?' · #'+p.id:''),String(p.id)));
  }
  namePicker.add(new Option("I'm not listed — add my name",'__add__'));
  if([...namePicker.options].some(o=>o.value===selected))namePicker.value=selected;
}
namePicker.addEventListener('change',()=>{
  const p=invitees.find(p=>p.id===Number(namePicker.value)), dept=document.getElementById('dept');
  dept.disabled=false;
  if(p?.department){
    if(![...dept.options].some(o=>o.value===p.department))dept.add(new Option(p.department,p.department));
    dept.value=p.department;dept.disabled=true;show('deptOtherWrap',false);
  }else{dept.value='';show('deptOtherWrap',false);}
});
document.getElementById('nameSearch').addEventListener('input',renderNames);
(async()=>{const status=document.getElementById('nameLoadStatus');try{
 const response=await fetch('/application/api/names');if(!response.ok)throw Error('Could not load names');
 invitees=(await response.json()).items;renderNames();
 status.textContent=invitees.length?'Search and select your name. Your department will fill automatically where available.':'The organiser has not uploaded a name list yet. You can choose “I’m not listed” to register.';
}catch{status.textContent='Could not load the name list. Reload to retry, or choose “I’m not listed” to enter your name.';}})();

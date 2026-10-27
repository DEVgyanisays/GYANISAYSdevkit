
const EVENT_DATE="2026-11-15";
const daysToGo=Math.max(0,Math.ceil((new Date(EVENT_DATE)-new Date())/86400000));
document.getElementById('dtg').textContent=daysToGo+" days to go";
let ADMIN=false;let csrf="",revision=0;let winners=[];

/* ---------- roster (sample, anonymised; stands in for MySQL) ---------- */
const REG=[];
const COLOURS=["Red","Blue","Green","Yellow"];

/* ---------- helpers ---------- */
function headcount(r){ return 1 + (r.spouse?1:0) + r.kids.length; }
function pie(parts,size){ size=size||52; const tot=parts.reduce((s,p)=>s+p.v,0); const R=size/2,r=R-2;
  if(tot===0) return `<svg width="${size}" height="${size}"><circle cx="${R}" cy="${R}" r="${r}" fill="#eee"/><circle cx="${R}" cy="${R}" r="${r*.52}" fill="#fff"/></svg>`;
  const nz=parts.filter(p=>p.v>0);
  if(nz.length===1) return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${R}" cy="${R}" r="${r}" fill="${nz[0].c}"/><circle cx="${R}" cy="${R}" r="${r*.52}" fill="#fff"/></svg>`;
  let a=-Math.PI/2,p=''; parts.forEach(pt=>{ if(pt.v<=0)return; const ang=pt.v/tot*2*Math.PI,b=a+ang;
    const x1=R+r*Math.cos(a),y1=R+r*Math.sin(a),x2=R+r*Math.cos(b),y2=R+r*Math.sin(b),lg=ang>Math.PI?1:0;
    p+=`<path d="M${R} ${R} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${lg} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${pt.c}"/>`; a=b; });
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${p}<circle cx="${R}" cy="${R}" r="${r*.52}" fill="#fff"/></svg>`;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function barChart(parts){ const max=Math.max(1,...parts.map(p=>p.v));
  return '<div class="bars">'+parts.map(p=>`<div class="barrow"><span class="blab">${esc(p.label)}</span><span class="btrack"><span class="bfill" style="width:${(p.v/max*100).toFixed(0)}%;background:${p.c}"></span></span><span class="bval">${p.v}</span></div>`).join('')+'</div>'; }

/* ---------- Responses ---------- */
function renderKpis(){
  const going=REG.filter(r=>r.rsvp==='Yes'), maybe=REG.filter(r=>r.rsvp==='Maybe');
  const heads=REG.reduce((s,r)=>s+headcount(r),0);
  const veg=REG.filter(r=>r.food==='Veg').length, drink=REG.filter(r=>r.alc==='Yes').length;
  const low=REG.filter(r=>r.stren==='No'||r.age==='60–70'||r.age==='70+').length;
  const kids=REG.reduce((s,r)=>s+r.kids.length,0);
  const confirm=(daysToGo<7)?maybe.length:0;
  const k=[["confirmed in",going.length,''],["maybe",maybe.length,'gold'],
    ["needs confirming",confirm,confirm?'warn':''],["total heads",heads,'gold'],
    ["kids",kids,''],["veg meals",veg,''],["drinkers",drink,''],["low-impact",low,'']];
  document.getElementById('kpis').innerHTML=k.map(x=>`<div class="kpi"><div class="n ${x[2]}">${x[1]}</div><div class="l">${x[0]}</div></div>`).join('');
}
function flags(r){ let h=''; if(r.med) h+='<span class="flag f-med">medical</span> ';
  if(r.stren==='No') h+='<span class="flag f-low">low-impact</span> '; if(r.stren==='Yes') h+='<span class="flag f-go">full-throttle</span> '; return h||'—'; }
const COLS=[
 {k:'RSVP',td:r=> r.rsvp==='Yes'?'<span class="rsvp-y">Yes</span>':(daysToGo<7?'<span class="confirm">confirm!</span>':'<span class="rsvp-m">Maybe</span>')},
 {k:'Name',td:r=>`<b>${esc(r.n)}</b>`},
 {k:'Department',td:r=>`${esc(r.dept)}<div class="mini" style="color:#8a90a2;font-size:11px">${esc(r.cl)}</div>`},
 {k:'Age',td:r=>esc(r.age)},{k:'Sex',td:r=>esc(r.g)},{k:'Food',td:r=>esc(r.food)},{k:'Alcohol',td:r=>esc(r.alc)},
 {k:'Flags',td:r=>flags(r)},
 {k:'Family',td:r=>((r.spouse?'+ '+esc(r.spouse):'')+(r.kids.length?` · ${r.kids.length} kid${r.kids.length>1?'s':''}`:''))||'—'},
 {k:'Team',td:r=>`<span class="dot" style="background:var(--${r.team.toLowerCase()})"></span>${esc(r.team)}`},
];
let visCols=new Set(COLS.map(c=>c.k));
function renderColPick(){
  document.getElementById('colpick').innerHTML='<span style="font-size:12.5px;color:var(--muted);font-weight:700;align-self:center;margin-right:2px;">Show columns:</span>'+
    COLS.map(c=>`<label class="${visCols.has(c.k)?'on':''}" style="padding:6px 11px;font-size:12.5px;"><input type="checkbox" data-col="${c.k}" ${visCols.has(c.k)?'checked':''}>${c.k}</label>`).join('');
  document.querySelectorAll('#colpick input').forEach(cb=>cb.addEventListener('change',()=>{ cb.checked?visCols.add(cb.dataset.col):visCols.delete(cb.dataset.col); renderTable(); renderColPick(); }));
}
function renderTable(){
  const cols=COLS.filter(c=>visCols.has(c.k));
  let t='<tr>'+cols.map(c=>`<th>${c.k}</th>`).join('')+'</tr>';
  REG.forEach(r=>{ t+='<tr>'+cols.map(c=>`<td>${c.td(r)}</td>`).join('')+'</tr>'; });
  document.getElementById('regTable').innerHTML=t;
}
function renderRespGraphs(){
  const rsvpP=[{label:'Yes',v:REG.filter(r=>r.rsvp==='Yes').length,c:'#22b07d'},{label:'Maybe',v:REG.filter(r=>r.rsvp==='Maybe').length,c:'#e8b53d'}];
  const blocks=[['RSVP',rsvpP],['Age',dimParts(REG,'Age')],['Gender',dimParts(REG,'Gender')],['Food',dimParts(REG,'Food')],['Fitness',dimParts(REG,'Fitness')]];
  document.getElementById('respGraphs').innerHTML='<h3 class="sec" style="margin:0 0 8px;">Snapshot</h3><div class="sgrid">'+
    blocks.map(b=>`<div class="scard"><div class="bt">${b[0]}</div>${barChart(b[1])}</div>`).join('')+'</div>';
}

/* ---------- choosable demographics ---------- */
const DIMS={
 Age:{get:m=>m.age, order:['Under 40','40–50','50–60','60–70','70+'], col:{'Under 40':'#22b07d','40–50':'#2f6df6','50–60':'#8b5cf6','60–70':'#e8b53d','70+':'#e0554c'}},
 Gender:{get:m=>m.g==='M'?'Male':m.g==='F'?'Female':'Not specified', order:['Male','Female','Not specified'], col:{Male:'#2f6df6',Female:'#ec4899','Not specified':'#8a90a2'}},
 Department:{get:m=>m.cl, order:['Surgical','Non-surgical','Non-clinical'], col:{Surgical:'#2f6df6','Non-surgical':'#22b07d','Non-clinical':'#8a7d4f'}},
 Fitness:{get:m=> m.stren==='Yes'?'Full-throttle':(m.stren==='No'?'Low-impact':'Not specified'), order:['Full-throttle','Not specified','Low-impact'], col:{'Full-throttle':'#e0554c','Not specified':'#8a90a2','Low-impact':'#22b07d'}},
 Food:{get:m=>m.food, order:['Veg','Non-veg'], col:{Veg:'#22b07d','Non-veg':'#e0554c'}},
 Alcohol:{get:m=>m.alc==='Yes'?'Drinks':'No', order:['Drinks','No'], col:{Drinks:'#8b5cf6',No:'#8a90a2'}},
};
let selDims=['Age','Gender','Department'];
function renderDimPick(){
  document.getElementById('dimpick').innerHTML=Object.keys(DIMS).map(k=>
    `<label class="${selDims.includes(k)?'on':''}"><input type="checkbox" data-dim="${k}" ${selDims.includes(k)?'checked':''}>${k}</label>`).join('');
  document.querySelectorAll('#dimpick input').forEach(cb=>cb.addEventListener('change',()=>{
    const k=cb.dataset.dim; if(cb.checked){ if(!selDims.includes(k)) selDims.push(k);} else selDims=selDims.filter(x=>x!==k);
    renderTeams(); renderDimPick();
  }));
}
function dimParts(mem,dim){ const D=DIMS[dim]; return D.order.map(o=>({label:o,v:mem.filter(m=>D.get(m)===o).length,c:D.col[o]})); }
function renderLegend(){ document.getElementById('legbox').innerHTML=''; }

/* ---------- Adult companies ---------- */
function dyn(mem){
  const med=mem.filter(m=>m.med).length, low=mem.filter(m=>m.stren==='No').length, old=mem.filter(m=>m.age==='60–70'||m.age==='70+').length;
  let charts=selDims.map(dim=>`<div class="bargroup"><div class="bt">${dim}</div>${barChart(dimParts(mem,dim))}</div>`).join('');
  return `<div class="dyn" style="flex-direction:column; align-items:stretch; gap:0;">${charts}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">
      <span class="flag f-med">${med} medical</span><span class="flag f-low">${low} low-impact</span><span class="flag f-go">${old} age 60+</span></div></div>`;
}
let dragIdx=null;
function renderTeams(){
  const teams={Red:[],Blue:[],Green:[],Yellow:[]};
  REG.forEach((r,i)=>teams[r.team].push({...r,_i:i}));
  document.getElementById('teamGrid').innerHTML=COLOURS.map(c=>{
    const mem=teams[c], heads=mem.reduce((s,m)=>s+headcount(m),0);
    const drag=ADMIN?'draggable="true"':''; const grip=ADMIN?'<span class="grip">⠿</span>':'';
    return `<div class="team t-${c.toLowerCase()}">
      <div class="head"><span>${c} Company</span><span>${mem.length}</span></div>
      <ul class="dz" data-team="${c}">
        ${mem.map(m=>`<li ${drag} data-i="${m._i}">${grip}<b>${esc(m.n.replace('Dr. ','Dr '))}</b> <span class="mini">${esc(m.cl)} · ${esc(m.age)} · ${esc(m.g)}${m.stren==='No'?' · low-impact':''}</span></li>`).join('')||'<li class="empty">No one here yet</li>'}
      </ul>${dyn(mem)}<div class="bal">${heads} heads incl. family</div></div>`;
  }).join('');
  renderLegend(); if(ADMIN) wireDnD();
}
function wireDnD(){
  document.querySelectorAll('.team li[draggable]').forEach(li=>{
    li.addEventListener('dragstart',e=>{ dragIdx=+li.dataset.i; li.style.opacity=.4; e.dataTransfer.setData('text/plain',li.dataset.i); });
    li.addEventListener('dragend',()=>li.style.opacity=1);
  });
  document.querySelectorAll('.dz').forEach(dz=>{
    dz.addEventListener('dragover',e=>{e.preventDefault(); dz.classList.add('over');});
    dz.addEventListener('dragleave',()=>dz.classList.remove('over'));
    dz.addEventListener('drop',e=>{e.preventDefault(); dz.classList.remove('over');
      const i=dragIdx!=null?dragIdx:+e.dataTransfer.getData('text/plain');
      if(!isNaN(i)){ REG[i].team=dz.dataset.team; dragIdx=null; renderTeams(); renderTable(); saveTeams(); }});
  });
}
function balance(){
  const order=[...REG].sort((a,b)=>{const cl={Surgical:0,'Non-surgical':1,'Non-clinical':2};
    if(cl[a.cl]!==cl[b.cl])return cl[a.cl]-cl[b.cl]; return (a.stren==='No'?0:1)-(b.stren==='No'?0:1);});
  order.forEach((r,i)=>{const idx=(Math.floor(i/4)%2===0)?(i%4):(3-(i%4)); r.team=COLOURS[idx];});
}

/* ---------- Kids squads (age bands) ---------- */
function band(a){ return a<5?'Under 5':a<=10?'5–10':a<=15?'11–15':'16+'; }
function renderKids(){
  const bands={'Under 5':[],'5–10':[],'11–15':[],'16+':[]};
  REG.forEach(r=>r.kids.forEach(k=>bands[band(k[1])].push({name:k[0],age:k[1],food:k[2],parent:r.n})));
  const cls={'Under 5':'u5','5–10':'u10','11–15':'u15','16+':'u15'};
  document.getElementById('kidGrid').innerHTML=Object.keys(bands).map(b=>{
    const kk=bands[b], veg=kk.filter(k=>k.food==='Veg').length;
    return `<div class="team t-${cls[b]}"><div class="head"><span>${b} yrs</span><span>${kk.length}</span></div>
      <ul>${kk.map(k=>`<li><b>${esc(k.name)}</b> <span class="mini">age ${esc(k.age)} · ${esc(k.food)} · ${esc(k.parent.replace('Dr. ',''))}'s</span></li>`).join('')||'<li class="empty">None yet</li>'}</ul>
      <div class="bal">${kk.length} kids · ${veg} veg · ${kk.length-veg} non-veg</div></div>`;
  }).join('');
}

/* ---------- Activities (editable) ---------- */
let ACTS=[];
function sLbl(s){return['','Low','Moderate','High'][s];}
function renderActs(){
  document.getElementById('actList').innerHTML=ACTS.map((a,i)=>`
    <div class="actcard ${a.type}">
      <h4>${esc(a.name)} <span class="pill-t">${a.type}</span> <span class="pill-s s-${a.stress}">${sLbl(a.stress)} stress</span>
        <span class="adminonly" style="margin-left:auto; gap:6px;">
          <button class="btn sm ghost" data-edit-act="${i}">Edit</button>
          <button class="btn sm ghost" data-del-act="${i}" style="color:#c0392b">Delete</button></span></h4>
      <div class="arow"><span class="k">Who it's for</span><span>${esc(a.profile)}</span>
        <span class="k">Rules</span><span>${esc(a.rules)}</span>
        <span class="k">Engagement</span><span>${esc(a.engage)}</span>
        <span class="k">Success</span><span>${esc(a.success)}</span>
        <span class="k">Failure</span><span>${esc(a.fail)}</span>
        <span class="k">Awards</span><span>${esc(a.award)}</span></div>
      <div class="warnbox">⚠️ <b>Fair warning:</b> ${esc(a.warn)}</div>
    </div>`).join('');
}
const ACT_FIELDS=[['name','Activity name','text'],['type','Type','select',['Olympics','Gamification','Battleground']],
  ['stress','Physical stress','select',[['1','Low'],['2','Moderate'],['3','High']]],
  ['profile','Who it’s for','text'],['rules','Rules','textarea'],['engage','Engagement rules','textarea'],
  ['success','Success criteria','textarea'],['fail','Failure criteria','textarea'],['warn','Fair warning','textarea'],['award','Awards / rewards','text']];
function editAct(i){ openModal('Edit activity',ACT_FIELDS,ACTS[i],v=>{v.stress=+v.stress; ACTS[i]=v; save(); renderActs();}); }
function delAct(i){ const nm=ACTS[i].name; openModal('Delete activity "'+nm+'"?',[],{},()=>{ ACTS.splice(i,1); save(); renderActs(); }); }
document.getElementById('addAct').addEventListener('click',()=>openModal('Add activity',ACT_FIELDS,
  {type:'Olympics',stress:2},v=>{v.stress=+v.stress; ACTS.push(v); save(); renderActs();}));

/* ---------- Awards (editable) ---------- */
let CATS=[];
let AWARDS=[];
function renderAwards(){
  let h='';
  CATS.forEach(cat=>{
    const items=AWARDS.filter(a=>a[0]===cat); if(!items.length) return;
    h+=`<div class="cathead">${esc(cat)}</div><div class="awardgrid">`;
    items.forEach(a=>{ const gi=AWARDS.indexOf(a);
      h+=`<div class="award"><div class="cat">${esc(a[0])}</div><div class="nm">${esc(a[1])}</div><div class="d">${esc(a[2])}</div>
        ${ADMIN?`<span class="x" data-del-award="${gi}">✕</span>`:''}</div>`; });
    h+='</div>';
  });
  document.getElementById('awardList').innerHTML=h;
}
function delAward(i){ const nm=AWARDS[i][1]; openModal('Delete award "'+nm+'"?',[],{},()=>{ AWARDS.splice(i,1); save(); renderAwards(); }); }
document.getElementById('addAward').addEventListener('click',()=>openModal('Add award',
  [['cat','Category','select',CATS],['nm','Award name','text'],['d','Description','text']],
  {cat:CATS[0]},v=>{ AWARDS.push([v.cat,v.nm,v.d]); save(); renderAwards(); }));
document.getElementById('addCat').addEventListener('click',()=>openModal('New award category',[['c','Category name','text']],{c:''},v=>{ if(v.c&&!CATS.includes(v.c)){ CATS.push(v.c); save(); renderAwards(); }}));

/* ---------- modal ---------- */
function openModal(title,fields,vals,onSave){
  document.getElementById('mTitle').textContent=title;
  document.getElementById('mFields').innerHTML=fields.map(f=>{
    const [key,lab,type,opts]=f; const v=vals[key]!=null?vals[key]:'';
    if(type==='textarea') return `<div class="mf"><label>${esc(lab)}</label><textarea data-k="${key}">${esc(''+v)}</textarea></div>`;
    if(type==='select'){ const o=opts.map(op=>{const val=Array.isArray(op)?op[0]:op,tx=Array.isArray(op)?op[1]:op;
      return `<option value="${esc(''+val)}" ${(''+v)===(''+val)?'selected':''}>${esc(''+tx)}</option>`;}).join('');
      return `<div class="mf"><label>${lab}</label><select data-k="${key}">${o}</select></div>`; }
    return `<div class="mf"><label>${lab}</label><input type="text" data-k="${key}" value="${esc(''+v)}"></div>`;
  }).join('');
  const modal=document.getElementById('modal'); modal.classList.add('open');
  document.getElementById('mSave').onclick=()=>{ const out={...vals};
    document.querySelectorAll('#mFields [data-k]').forEach(el=>out[el.dataset.k]=el.value);
    modal.classList.remove('open'); onSave(out); };
  document.getElementById('mCancel').onclick=()=>modal.classList.remove('open');
}

/* ---------- Form tab ---------- */
const FORM=[
 ["1 · About you","Can you make it? (RSVP)","Yes / Maybe","Yes"],
 ["1","Your name","Dropdown of consultants + 'add my name'","Yes"],
 ["1","Department","Surgical / non-surgical / non-clinical + Other","Yes"],
 ["1","Age group","Under 40 … 70+","Yes"],
 ["1","Gender","Male / Female / Prefer not to say","No"],
 ["1","Food preference","Veg / Non-veg","Yes"],
 ["1","Consumes alcohol","Yes / No","Yes"],
 ["1","OK with strenuous activity","Yes / No","No"],
 ["1","Comfortable with physical activity","Yes / A little / No","No"],
 ["1","Food allergies","Free text","No"],
 ["1","Medical situation","Free text (organiser-only)","No"],
 ["1","Anything specific to take care of","Free text","No"],
 ["2 · Your crew","Who's coming","Just me / +spouse / +kids / +both","Yes"],
 ["2","Spouse: name · age · food · alcohol · medical","Shown if spouse joining","No"],
 ["3 · Your kids","Each child ×4: name · age · food · allergy note","Shown if kids joining","No"],
 ["4 · Review","Confirm & submit","—","—"],
];
function renderForm(){ let t='<tr><th>Step</th><th>Field</th><th>Options / type</th><th>Required</th></tr>';
  FORM.forEach(f=>t+=`<tr><td>${f[0]}</td><td><b>${esc(f[1])}</b></td><td>${esc(f[2])}</td><td>${f[3]}</td></tr>`);
  document.getElementById('formTable').innerHTML=t; }


async function api(url,method='GET',body){const r=await fetch(url,{method,headers:{'Content-Type':'application/json','X-Requested-With':'GyaniSays','X-CSRF-Token':csrf},body:body===undefined?undefined:JSON.stringify(body)});if(r.status===401){throw Error('Admin session expired. Reload this page to sign in.');}const result=await r.json();if(!r.ok)throw Error(result.error||'Request failed');return result;}
function status(text){document.getElementById('saveStatus').textContent=text;}
function renderAll(){renderKpis();renderColPick();renderRespGraphs();renderTable();renderDimPick();renderTeams();renderKids();renderActs();renderAwards();renderForm();renderWinners();}
function cluster(d){return ['General Surgery','Orthopaedics','Cardiothoracic Surgery','Neurosurgery','Urology','ENT','Ophthalmology','Obstetrics & Gynaecology'].includes(d)?'Surgical':['Radiology','Pathology / Lab','Administration'].includes(d)?'Non-clinical':'Non-surgical';}
async function load(){const [roster,catalog,awards]=await Promise.all([api('/admin/event/api/registrants'),api('/admin/event/api/catalog'),api('/admin/event/api/winners')]);REG.splice(0,REG.length,...roster.items.map(r=>({id:r.id,n:r.name,dept:r.department,cl:cluster(r.department),age:r.age_group,g:r.gender==='Male'?'M':r.gender==='Female'?'F':'',rsvp:r.rsvp,food:r.food_pref,alc:r.consumes_alcohol,phys:r.ok_physical,stren:r.ok_strenuous,med:r.medical,team:r.team,spouse:r.spouse?.name||'',kids:r.kids.map(k=>[k.name,k.age,k.food]),details:r})));ACTS=catalog.activities;AWARDS=catalog.awards;CATS=catalog.categories;revision=catalog.revision;winners=awards.items;renderAll();}
let saving=false;
async function persist(task){if(saving){await load();return status('Please wait for the current save before editing again.');}saving=true;document.getElementById('modal').classList.remove('open');status('Saving to server…');try{await task();await load();status('Saved to the server.');}catch(e){status('Not saved: '+e.message);await load().catch(()=>{});}finally{saving=false;}}
function save(){const body={activities:ACTS,awards:AWARDS,categories:CATS,revision};return persist(()=>api('/admin/event/api/catalog','PUT',body));}
function saveTeams(){const body={items:REG.map(r=>({id:r.id,team:r.team}))};return persist(()=>api('/admin/event/api/teams','PUT',body));}
document.getElementById('adminBtn').onclick=()=>{location.href='/admin/prospects.php';};
document.getElementById('rebalance').onclick=()=>{balance();saveTeams();};document.getElementById('reloadData').onclick=()=>load().then(()=>status('Loaded current server data.')).catch(e=>status(e.message));
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.pane').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById(t.dataset.pane).classList.add('active');});
document.addEventListener('click',e=>{const b=e.target.closest('[data-edit-act],[data-del-act],[data-del-award]');if(!b||saving)return;if(b.dataset.editAct!==undefined)editAct(Number(b.dataset.editAct));if(b.dataset.delAct!==undefined)delAct(Number(b.dataset.delAct));if(b.dataset.delAward!==undefined)delAward(Number(b.dataset.delAward));});
function renderWinners(){let box=document.getElementById('winners');if(!box){box=document.createElement('section');box.id='winners';document.getElementById('awardList').after(box);}box.innerHTML='<h3>Record award recipients</h3><form id="winnerForm"><label>Award<select name="award" required>'+AWARDS.map(a=>'<option>'+esc(a[1])+'</option>').join('')+'</select></label><label>Recipient / team<input name="recipient" required maxlength="200"></label><label>Note<input name="note" maxlength="1000"></label><button class="btn" type="submit">Save recipient</button></form>'+winners.map(w=>'<p><b>'+esc(w.award)+'</b>: '+esc(w.recipient)+' — '+esc(w.note)+'</p>').join('');document.getElementById('winnerForm').onsubmit=e=>{e.preventDefault();const b=Object.fromEntries(new FormData(e.target));persist(()=>api('/admin/event/api/winners','PUT',b));};}
(async()=>{try{csrf=(await api('/admin/event/api/me')).csrf;ADMIN=true;document.body.classList.add('admin');document.getElementById('adminBtn').textContent='Website leads ↗';await load();status(REG.length?'Live registrations loaded.':'No registrations yet. Share the public form to begin.');}catch(e){status('Could not load server data: '+e.message);}})();


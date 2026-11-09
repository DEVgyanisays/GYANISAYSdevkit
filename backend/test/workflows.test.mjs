import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createApplication} from '../src/server.mjs';
import {insert,now} from '../src/db.mjs';
import {passwordHash} from '../src/core.mjs';

test('operational workflows use real records and preserve transactional boundaries',async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'saarthi-workflows-'));
 const app=createApplication({database:path.join(directory,'db.sqlite'),dataDir:directory,port:0,test:true});
 const address=await app.start(),base=`http://127.0.0.1:${address.port}`;let cookie='',csrf='';
 async function call(url,method='GET',body){const r=await fetch(base+url,{method,headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf,'Idempotency-Key':crypto.randomUUID()},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];const data=await r.json();return {status:r.status,data};}
 const success=r=>assert.ok(r.status>=200&&r.status<300,JSON.stringify(r));
 async function login(email,role){const r=await call('/api/auth/login','POST',{login:email,password:'Workflow test password 945!',role});success(r);csrf=r.data.csrf;}
 try{
  success(await call('/api/setup','POST',{full_name:'Workflow Admin',email:'admin@test.example',password:'Workflow test password 945!'}));await login('admin@test.example','admin');
  const admin=app.db.prepare('SELECT id FROM users').get().id;
  const user=insert(app.db,'users',{full_name:'Workflow Coach',first_name:'Workflow',email:'coach@test.example',password_hash:await passwordHash('Workflow test password 945!'),state:'active'});
  insert(app.db,'user_roles',{user_id:user,role:'coach_ours'});
  const coach=insert(app.db,'coaches',{user_id:user,coach_type:'ours',stage:'active'});
  await t.test('published text can be read only after signing current undertaking',async()=>{
   success(await call('/api/admin/undertaking-versions','POST',{version:'1',body:'Approved test undertaking.',reason:'Publish approved text'}));
   const r=await call('/api/admin/library','POST',{name:'Operational guide',owner_label:'Training',version:'1',body:'Actual published learning content.',reason:'Publish approved guide'});success(r);
   assert.equal((await call('/api/library/'+r.data.id)).status,403);
   success(await call('/api/me/undertaking','POST',{undertaking_version_id:1,accepted:true}));
   assert.equal((await call('/api/library/'+r.data.id)).data.content.body,'Actual published learning content.');
   success(await call('/api/library/'+r.data.id+'/read','POST',{version:'1'}));
   assert.equal(app.db.prepare('SELECT version_read FROM library_reads').get().version_read,'1');
  });
  await t.test('invalid request approvals roll back and valid approval applies the change',async()=>{
   const id=insert(app.db,'requests',{user_id:user,coach_id:coach,type:'detail_correction',summary:'Correct my name',reason:'Typo',payload:'{}'});
   assert.equal((await call(`/api/admin/requests/${id}/decide`,'POST',{state:'approved',reason:'Reviewed',changes:{}})).status,422);
   assert.equal(app.db.prepare('SELECT state FROM requests WHERE id=?').get(id).state,'open');
   success(await call(`/api/admin/requests/${id}/decide`,'POST',{state:'approved',reason:'Verified correction',changes:{full_name:'Corrected Coach'}}));
   assert.equal(app.db.prepare('SELECT full_name FROM users WHERE id=?').get(user).full_name,'Corrected Coach');
   assert.equal((await call(`/api/admin/requests/${id}/decide`,'POST',{state:'declined',reason:'Again'})).status,409);
  });
  await t.test('calibration actor is assigned by the server',async()=>{
   success(await call('/api/admin/people','POST',{full_name:'Calibrated Faculty',email:'faculty@test.example',roles:['faculty'],reason:'Appointment'}));
   const faculty=app.db.prepare('SELECT id FROM faculty').get().id;
   success(await call('/api/admin/catalog/faculty_calibrations','POST',{faculty_id:faculty,calibrated_on:'2026-10-01',due_on:'2027-04-01',reason:'Evidence checked'}));
   assert.equal(app.db.prepare('SELECT recorded_by FROM faculty_calibrations').get().recorded_by,admin);
  });
  await t.test('batch curriculum, module signoff and independent examiner permissions',async()=>{
   const batch=insert(app.db,'batches',{programme_code:'core',name:'Isolated exam batch',mode:'online',start_date:'2099-01-01',end_date:'2099-02-01',seats_online:6,created_by:admin});
   const module=insert(app.db,'modules',{programme_code:'core',number:'1',title:'Test module',current_version:'1'});
   insert(app.db,'module_versions',{module_id:module,version:'1',published_on:now().slice(0,10),change_note:'Test curriculum'});
   const enrolment=insert(app.db,'enrolments',{user_id:user,batch_id:batch,seat_type:'online',coach_type:'ours'});
   success(await call(`/api/admin/batches/${batch}/modules`,'PUT',{modules:[{module_id:module,version:'1'}],reason:'Assign curriculum'}));
   const scheduled_at=new Date(Date.now()+86400000).toISOString();
   assert.equal((await call(`/api/admin/enrolments/${enrolment}/exam`,'POST',{part:'written',scheduled_at,reason:'Schedule exam'})).status,409);
   const f=app.db.prepare('SELECT * FROM faculty').get();
   success(await call(`/api/admin/faculty/${f.id}`,'PATCH',{state:'active',may_mark:['written'],reason:'Cleared after induction'}));
   insert(app.db,'batch_staff',{batch_id:batch,faculty_id:f.id,role:'faculty'});
   app.db.prepare("UPDATE users SET state='active',password_hash=? WHERE id=?").run(await passwordHash('Workflow test password 945!'),f.user_id);
   await login('faculty@test.example','faculty');
   success(await call(`/api/staff/enrolments/${enrolment}/modules/${module}/complete`,'POST',{reason:'Observed satisfactory practice'}));
   await login('admin@test.example','admin');
   success(await call(`/api/admin/enrolments/${enrolment}/markers`,'POST',{part:'written',faculty_ids:[f.id],reason:'Independent calibrated examiner'}));
   const exam=await call(`/api/admin/enrolments/${enrolment}/exam`,'POST',{part:'written',scheduled_at,reason:'Training complete'});success(exam);
   await login('faculty@test.example','faculty');
   assert.equal((await call(`/api/staff/exams/${exam.data.id}/mark`,'POST',{result:'passed',feedback:'Meets requirements'})).status,409);
   app.db.prepare('UPDATE exam_attempts SET scheduled_at=? WHERE id=?').run(new Date(Date.now()-60000).toISOString(),exam.data.id);
   success(await call(`/api/staff/exams/${exam.data.id}/mark`,'POST',{result:'passed',feedback:'Meets requirements'}));
   assert.equal(app.db.prepare('SELECT result FROM exam_attempts WHERE id=?').get(exam.data.id).result,'passed');
   assert.equal((await call(`/api/staff/exams/${exam.data.id}/mark`,'POST',{result:'passed',feedback:'Duplicate'})).status,409);
   await login('admin@test.example','admin');
  });
  await t.test('only supported policies may change and policy persists',async()=>{
   success(await call('/api/admin/settings/coach_lock_window_hours','PUT',{value:48,reason:'Policy update'}));
   assert.equal((await call('/api/admin/settings')).data.items.find(x=>x.key==='coach_lock_window_hours').value,48);
   assert.equal((await call('/api/admin/settings/arbitrary_setting','PUT',{value:1,reason:'Unknown'})).status,422);
  });
  await t.test('pay run refuses missing rates then calculates exact integer amount',async()=>{
   const d=insert(app.db,'debriefs',{booking_ref:'isolated-test-booking',person_ref:'isolated-test-person',first_name:'Test',client_type:'executive',language_code:'en',scheduled_at:now(),coach_id:coach,status:'after'});
   insert(app.db,'after_debriefs',{debrief_id:d,due_at:now(),submitted_at:now()});
   const period=now().slice(0,7);
   assert.equal((await call('/api/admin/pay-runs','POST',{period,reason:'Monthly processing'})).status,409);
   assert.equal(app.db.prepare('SELECT count(*) n FROM pay_runs').get().n,0);
   insert(app.db,'coach_pay_agreements',{coach_id:coach,kind:'fixed_per_session',rate_debrief_minor:12500,currency:'INR',effective_from:now().slice(0,10),reason:'Signed agreement',agreed_by:admin});
   const r=await call('/api/admin/pay-runs','POST',{period,reason:'Monthly processing'});success(r);
   assert.equal((await call('/api/admin/pay-runs/'+r.data.id)).data.lines[0].amount_minor,12500);
   assert.equal((await call(`/api/admin/pay-runs/${r.data.id}/record-payment`,'POST',{payment_reference:'TEST-REF',reason:'Receipt'})).status,409);
   success(await call(`/api/admin/pay-runs/${r.data.id}/approve`,'POST',{bank_details_verified:true,reason:'Checked amount'}));
   success(await call(`/api/admin/pay-runs/${r.data.id}/record-payment`,'POST',{payment_reference:'TEST-REF',reason:'Receipt checked'}));
   assert.equal(app.db.prepare('SELECT state FROM pay_runs').get().state,'paid');
  });
  await t.test('coach repeated slots persist atomically and cannot overlap',async()=>{
   await login('coach@test.example','coach_ours');
   success(await call('/api/me/undertaking','POST',{undertaking_version_id:1,accepted:true}));
   success(await call('/api/me/slots/generate','POST',{slot_date:'2099-03-01',day_start_minute:600,day_end_minute:720,repeat_weeks:3}));
   assert.equal(app.db.prepare('SELECT count(*) n FROM slots').get().n,6);
   assert.equal((await call('/api/me/slots','POST',{slot_date:'2099-03-01',start_minutes:[630]})).status,409);
   assert.equal(app.db.prepare('SELECT count(*) n FROM slots').get().n,6);
   assert.equal((await call('/api/admin/pay-runs')).status,403);
  });
  await t.test('session consent gates, private preparation, follow-up and submit locks',async()=>{
   const d=insert(app.db,'debriefs',{booking_ref:'isolated-session',person_ref:'isolated-person-2',first_name:'Test',client_type:'executive',language_code:'en',scheduled_at:now(),coach_id:coach,status:'assigned',consent_at_booking:'none'});
   // External input fixtures exist only in this disposable test database, never in the real workspace.
   insert(app.db,'aarambh_readings',{debrief_id:d,sitting_ref:'test-sitting',person_ref:'isolated-person-2',sitting_type:'core',sitting_completed_at:now(),payload_version:'1',generated_at:now(),integrity:'reliable'});
   success(await call(`/api/debriefs/${d}/prep`,'PATCH',{understanding:'Preparation for the isolated test',private_notes:'Only this coach may read this'}));
   success(await call(`/api/debriefs/${d}/prep/done`,'POST',{}));
   const run=await call(`/api/debriefs/${d}/run`,'POST',{});success(run);
   assert.equal((await call(`/api/runs/${run.data.id}/finish`,'POST',{outcome:'completed'})).status,409);
   success(await call(`/api/runs/${run.data.id}`,'PATCH',{consent_at_session:'none',covers_done:true,confidentiality_done:true}));
   success(await call(`/api/runs/${run.data.id}/step`,'POST',{step:'E'}));
   success(await call(`/api/runs/${run.data.id}/finish`,'POST',{outcome:'completed'}));
   assert.equal((await call(`/api/debriefs/${d}/after/submit`,'POST',{})).status,422);
   success(await call(`/api/debriefs/${d}/letter`,'PUT',{talked_about:'Work choices',stood_out:'Clear priorities',next_steps:'Reflect on priorities',language_code:'en'}));
   success(await call(`/api/debriefs/${d}/after`,'PATCH',{rate_settled:4,rate_understood:4,rate_covered:4,rate_next_step:4,no_recommendation:true,no_recommendation_reason:'No programme needed',letter_read_ack:true}));
   const submitted=await call(`/api/debriefs/${d}/after/submit`,'POST',{});success(submitted);assert.equal(submitted.data.validation,'pending_external_delivery');
   assert.equal((await call(`/api/debriefs/${d}/after`,'PATCH',{rate_settled:1})).status,409);
  });
  await t.test('public card submission preserves approved snapshot until reviewed',async()=>{
   success(await call('/api/me/public-card','PUT',{years_experience:8,worked_with:'Managers',about:'I support managers through practical reflection.'}));
   assert.equal((await call('/api/me/public-card')).data.card.status,'pending');
   await login('admin@test.example','admin');const request=app.db.prepare("SELECT id FROM requests WHERE type='public_card'").get();
   success(await call(`/api/admin/requests/${request.id}/decide`,'POST',{state:'approved',reason:'Content reviewed'}));
   const card=app.db.prepare('SELECT * FROM coach_public_cards').get();assert.equal(card.status,'approved');assert.ok(card.approved_snapshot.includes('practical reflection'));
  });
 }finally{await app.close();fs.rmSync(directory,{recursive:true,force:true});}
});

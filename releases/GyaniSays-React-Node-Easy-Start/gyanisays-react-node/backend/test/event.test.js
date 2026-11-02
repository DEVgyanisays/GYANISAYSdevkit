import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openEventStore } from '../server/event/store.js';
import { createApp } from '../server/app.js';
import { parseCsv, normalizeImport } from '../server/event/import.js';
import { makeFormShare } from '../server/event/share.js';
test('share link opens the public form and QR is generated without admin credentials',async()=>{
 const result=await makeFormShare('https://gyanisays.com/admin/event/');
 assert.equal(result.url,'https://gyanisays.com/application/');assert.equal(result.localOnly,false);
 assert.match(result.qr,/^data:image\/png;base64,iVBOR/);
 assert.equal((await makeFormShare('http://127.0.0.1:3080')).localOnly,true);
 await assert.rejects(()=>makeFormShare('https://admin:secret@example.com'));
});
test('share controls remain admin-only while the generated destination is public',async t=>{
 const f=await fixture(t);assert.equal((await f.request('/admin/event/api/share')).status,401);
 const response=await f.admin('share');assert.equal(response.status,200);
 const share=await response.json();assert.equal(new URL(share.url).pathname,'/application/');
 assert.equal((await f.request('/application/')).status,200);
});
async function fixture(t){
 const db=openEventStore(':memory:');const app=createApp({eventDb:db,config:{adminUser:'admin',adminPass:'secret'}});
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>new Promise(resolve=>{server.close(()=>{db.close();resolve();});server.closeAllConnections();}));
 const origin='http://127.0.0.1:'+server.address().port;
 const request=(url,{method='GET',body,admin=false,headers={}}={})=>fetch(origin+url,{method,headers:{'Content-Type':'application/json','X-Requested-With':'GyaniSays',...(admin?{Authorization:'Basic '+Buffer.from('admin:secret').toString('base64')}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
 const admin=(url,body,method=body===undefined?'GET':'POST')=>request('/admin/event/api/'+url,{admin:true,method,body});
 return {db,request,admin};
}
const applicant={name:'Test Person',department:'Cardiology',rsvp:'Yes',age_group:'40–50',gender:'Prefer not to say',food_pref:'Veg',consumes_alcohol:'No',consent:true,spouse_joining:'Yes',spouse:{name:'Partner',age_group:'Under 40',food_pref:'Non-veg',consumes_alcohol:'No'},kids_joining:'Yes',kids:[{name:'Child',age:0,food:'Veg',note:'Allergy note'}]};
test('CSV handles BOM, commas, Unicode and duplicates; rejects malformed rows',()=>{
 assert.deepEqual(parseCsv('\uFEFFname,department\r\n"शर्मा, आशा",Cardiology\r\n'),[{name:'शर्मा, आशा',department:'Cardiology'}]);
 assert.equal(normalizeImport('name\nAsha\nAsha').duplicates,1);
 assert.throws(()=>parseCsv('name\n"bad'));
 assert.throws(()=>parseCsv('name,department\nA,B,C'));
 assert.throws(()=>parseCsv('name,medical\nA,private'));
});
test('public form requires no login; every admin path requires login',async t=>{
 const f=await fixture(t);assert.equal((await f.request('/application/')).status,200);
 assert.equal((await f.request('/application/api/names')).status,200);
 for(const route of ['/admin/event/','/admin/event/api/registrants','/admin/event/api/invitees','/admin/event/api/export'])assert.equal((await f.request(route)).status,401);
 assert.equal((await f.request('/application/dashboard.html')).status,404);
 assert.equal((await f.request('/admin/event/api/import',{method:'POST',body:{csv:'name\nA'}})).status,401);
});
test('import preview is read-only, upsert avoids duplicates, public picker exposes only names/departments',async t=>{
 const f=await fixture(t),csv='name,department,external_id\nAsha,Cardiology,A1\nAsha,Cardiology,A1';
 assert.equal((await f.admin('import-preview',{csv})).status,200);
 assert.equal((await (await f.request('/application/api/names')).json()).items.length,0);
 assert.deepEqual(await (await f.admin('import',{csv})).json(),{ok:true,added:1,updated:0,duplicates:1});
 const names=(await (await f.request('/application/api/names')).json()).items;
 assert.deepEqual(Object.keys(names[0]),['id','name','department']);
 assert.equal((await (await f.admin('import',{csv})).json()).updated,1);
 assert.equal((await (await f.request('/application/api/names')).json()).items.length,1);
 assert.equal((await f.admin('import',{csv:'name,department\nValid,Dept\n,Invalid'})).status,422);
 assert.equal(f.db.prepare('SELECT COUNT(*) n FROM invitees').get().n,1);
});
test('selected name is canonical, family persists, retries do not duplicate, clear preserves registrations',async t=>{
 const f=await fixture(t);await f.admin('import',{csv:'name,department,external_id\nAsha,Cardiology,A1'});
 const submit=body=>f.request('/application/api/registrations',{method:'POST',body,headers:{'Idempotency-Key':'test-submission-key-0001'}});
 const payload={...applicant,name:'Tampered',invitee_id:1};
 assert.equal((await submit(payload)).status,201);assert.equal((await submit(payload)).status,200);
 const items=(await (await f.admin('registrants')).json()).items;assert.equal(items.length,1);assert.equal(items[0].name,'Asha');assert.equal(items[0].kids[0].age,0);assert.equal(items[0].spouse.name,'Partner');
 assert.equal((await f.request('/application/api/registrations',{method:'POST',body:payload,headers:{'Idempotency-Key':'test-submission-key-0002'}})).status,409);
 assert.equal((await f.admin('clear-names',{confirm:'wrong'})).status,422);
 await f.admin('clear-names',{confirm:'CLEAR NAMES'});
 assert.equal((await (await f.request('/application/api/names')).json()).items.length,0);
 assert.equal((await (await f.admin('registrants')).json()).items.length,1);
 await f.admin('import',{csv:'name,department,external_id\nAsha,Cardiology,A1'});
 assert.equal((await (await f.request('/application/api/names')).json()).items[0].id,1);
});
test('validation, CSRF, confidential manifest and admin arrangements',async t=>{
 const f=await fixture(t);
 assert.equal((await f.request('/admin/event/api/import',{admin:true,method:'POST',body:{csv:'name\nA'},headers:{Origin:'https://other.example'}})).status,403);
 const submit=body=>f.request('/application/api/registrations',{method:'POST',body,headers:{'Idempotency-Key':'test-submission-key-0003'}});
 assert.equal((await submit({...applicant,consent:false})).status,422);
 assert.equal((await submit({...applicant,kids:[{name:'Child',age:-1,food:'Veg'}]})).status,422);
 assert.equal((await submit(applicant)).status,201);
 const manifest=await (await f.admin('kids-manifest')).json();assert.deepEqual(manifest.items,[{age:0,age_band:'Under 5',food:'Veg'}]);
 assert.equal((await f.admin('teams',{items:[{id:1,team:'Blue'}]},'PUT')).status,200);
 assert.equal((await (await f.admin('registrants')).json()).items[0].team,'Blue');
 const c=await (await f.admin('catalog')).json();assert.equal((await f.admin('catalog',c,'PUT')).status,200);assert.equal((await f.admin('catalog',c,'PUT')).status,409);
 const csv=await f.admin('export');assert.match(csv.headers.get('content-disposition'),/csv/);assert.match(await csv.text(),/Partner/);
});
test('event data survives closing and reopening the database',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'gys-event-'));const filename=path.join(dir,'test.sqlite');let db;
 try{db=openEventStore(filename);db.prepare('INSERT INTO invitees(import_key,name,department,external_id) VALUES(?,?,?,?)').run('id:1','Test','Dept','1');db.close();db=openEventStore(filename);assert.equal(db.prepare('SELECT name FROM invitees').get().name,'Test');}finally{db?.close();rmSync(dir,{recursive:true,force:true});}
});

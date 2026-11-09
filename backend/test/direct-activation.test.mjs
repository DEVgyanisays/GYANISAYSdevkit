import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createApplication} from '../src/server.mjs';
import {insert,now} from '../src/db.mjs';
test('admin direct activation persists classifications, skips training and rejects replay',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'activation-'));
 const app=createApplication({database:path.join(dir,'db.sqlite'),dataDir:dir,port:0,test:true});
 const address=await app.start(),base='http://127.0.0.1:'+address.port;let cookie='',csrf='';
 async function call(url,body){const r=await fetch(base+url,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf,'Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
 try{
 await call('/api/setup',{full_name:'Admin',email:'admin@test.example',password:'Secure Test Password 125!'});
 const login=await call('/api/auth/login',{login:'admin@test.example',password:'Secure Test Password 125!',role:'admin'});csrf=login.data.csrf;
 const id=insert(app.db,'applications',{applying_as:'coach',full_name:'Test Coach',email:'coach@test.example',city:'Delhi',attend_mode:'online',start_window:'Now',consent_given:1,consent_at:now(),consent_text_version:'1',submitted_at:now()});
 insert(app.db,'application_languages',{application_id:id,language_code:'en',proficiency:'primary'});
 const body={rank:'senior',tier:'premium',category:'A',reason:'Experienced coach approved by administrator',confirm_bypass:true};
 assert.equal((await call('/api/admin/applications/'+id+'/activate-coach',{...body,tier:'invalid'})).status,422);
 const result=await call('/api/admin/applications/'+id+'/activate-coach',body);assert.equal(result.status,200,JSON.stringify(result));
 const coach=app.db.prepare('SELECT * FROM coaches').get();assert.equal(coach.stage,'active');assert.equal(coach.tier,'premium');assert.equal(coach.category,'A');assert.equal(coach.rank,'senior');
 assert.equal(app.db.prepare('SELECT count(*) n FROM enrolments').get().n,0);
 assert.equal(app.db.prepare('SELECT count(*) n FROM undertaking_signatures').get().n,0);
 assert.equal((await call('/api/admin/applications/'+id+'/activate-coach',body)).status,409);
 app.db.prepare("UPDATE user_roles SET role='finance_admin' WHERE user_id=1").run();
 assert.equal((await call('/api/admin/applications/'+id+'/activate-coach',body)).status,403);
 }finally{await app.close();}
});


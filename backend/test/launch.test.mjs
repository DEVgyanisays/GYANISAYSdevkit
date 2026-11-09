import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createApplication} from '../src/server.mjs';
import {createPublicSite,validatePublicConfiguration} from '../src/public-site.mjs';
import {publicPages,appPaths} from '../web/page-manifest.js';
import {insert} from '../src/db.mjs';

test('SEO, real contact processing and local retrieval access controls',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saarthi-launch-'));
 const app=createApplication({database:path.join(dir,'test.sqlite'),dataDir:dir,port:0,test:true,localModelUrl:'http://127.0.0.1:9',localModelTimeout:200});
 const address=await app.start(),base=`http://127.0.0.1:${address.port}`;let session='',csrf='';
 const get=p=>fetch(base+p);
 async function api(p,method='GET',body,headers={}){const response=await fetch(base+p,{method,headers:{Cookie:session,'Content-Type':'application/json','X-CSRF-Token':csrf,'Idempotency-Key':crypto.randomUUID(),...headers},body:body===undefined?undefined:JSON.stringify(body)});if(response.headers.get('set-cookie'))session=response.headers.get('set-cookie').split(';')[0];return {status:response.status,data:await response.json()};}
 async function contactPage(){const r=await get('/contact'),html=await r.text();return {token:html.match(/name="csrf_token" value="([^"]+)"/)[1],cookie:r.headers.get('set-cookie').split(';')[0]};}
 try{
  await t.test('public HTML is server rendered with one H1 and unique metadata',async()=>{
   const titles=new Set(),descriptions=new Set();for(const p of Object.keys(publicPages)){const response=await get(p),html=await response.text();assert.equal(response.status,200);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,p);assert.equal((html.match(/<title>/g)||[]).length,1);const title=html.match(/<title>([^<]+)<\/title>/)[1],description=html.match(/name="description" content="([^"]+)"/)[1];assert.ok(!titles.has(title));assert.ok(!descriptions.has(description));titles.add(title);descriptions.add(description);assert.ok(html.includes('rel="canonical" href="http://127.0.0.1:4174'+p+'"'));assert.ok(html.includes('property="og:image"'));assert.ok(html.includes('application/ld+json'));assert.ok(!html.includes('googletagmanager.com/gtag'));assert.match(response.headers.get('x-robots-tag'),/noindex/);const blocks=[...html.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));assert.equal(blocks[0]['@type'],'Organization');if(p!=='/about')assert.equal(blocks[1]['@type'],'BreadcrumbList');}
  });
  await t.test('known workspace URLs have private SSR shells; arbitrary routes return branded 404',async()=>{
   for(const p of appPaths){const r=await get(p),html=await r.text();assert.equal(r.status,200,p);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);assert.ok(!html.includes('analytics-config'));}
   const r=await get('/not-a-real-page');assert.equal(r.status,404);assert.match(r.headers.get('content-type'),/text\/html/);assert.match(await r.text(),/Let’s get you back on track/);
   assert.equal((await get('/.env')).status,404);assert.equal((await get('/src/server.mjs')).status,404);assert.equal((await get('/api/admin/people')).status,401);
  });
  await t.test('canonical aliases use actual 301s and preserve query strings without reflecting external redirects',async()=>{
   for(const [p,target] of [['/index.html','/'],['/contact/','/contact'],['/privacy-policy','/privacy']]){const r=await fetch(base+p+'?ref=test',{redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('location'),target+'?ref=test');}
   const html=await (await get('/about?utm_source=test')).text();assert.ok(!html.match(/rel="canonical"[^>]+/)[0].includes('utm_'));
  });
  await t.test('staging is disallowed; production sitemap has public canonical routes only',async()=>{
   assert.equal(await (await get('/robots.txt')).text(),'User-agent: *\nDisallow: /\n');assert.ok(!(await (await get('/sitemap.xml')).text()).includes('<loc>'));
   const config={publicUrl:'https://saarthi.example.com',production:true,searchIndexing:true,gaMeasurementId:'',searchVerification:''};validatePublicConfiguration(config);const site=createPublicSite(config);assert.match(site.robots(),/Sitemap: https:\/\/saarthi.example.com\/sitemap.xml/);const urls=[...site.sitemap().matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.deepEqual(urls,Object.keys(publicPages).map(p=>config.publicUrl+p));assert.ok(!site.robots().includes('Disallow: /login'));assert.ok(!site.sitemap().includes('/workspace/'));assert.throws(()=>validatePublicConfiguration({...config,publicUrl:'https://example.com/path'}));
  });
  await t.test('contact rejects missing CSRF, invalid input and cross-origin writes',async()=>{
   const p=await contactPage();const data={csrf_token:p.token,name:'Test Visitor',email:'visitor@test.example',subject:'Training',message:'Please explain the enrolment process.',privacy:'accepted',website:''};
   assert.equal((await api('/api/public/contact','POST',data)).status,403);
   assert.equal((await api('/api/public/contact','POST',data,{Cookie:p.cookie,Origin:'https://untrusted.example'})).status,403);
   assert.equal((await api('/api/public/contact','POST',{...data,email:'bad-address'},{Cookie:p.cookie})).status,422);
   assert.equal((await api('/api/public/contact','POST',{...data,privacy:'no'},{Cookie:p.cookie})).status,422);
   assert.equal(app.db.prepare('SELECT count(*) n FROM contact_messages').get().n,0);
  });
  let reference;
  await t.test('contact receipts mean a committed record; retries do not duplicate it',async()=>{
   const p=await contactPage(),data={csrf_token:p.token,name:'Test Visitor',email:'visitor@test.example',subject:'Training',message:'Please explain the enrolment process.',privacy:'accepted',website:''};
   const result=await api('/api/public/contact','POST',data,{Cookie:p.cookie});assert.equal(result.status,201,JSON.stringify(result.data));reference=result.data.reference;assert.equal((await api('/api/public/contact','POST',data,{Cookie:p.cookie})).data.reference,reference);assert.equal(app.db.prepare('SELECT count(*) n FROM contact_messages').get().n,1);assert.equal(app.db.prepare('SELECT message FROM contact_messages').get().message,data.message);assert.equal(app.db.prepare('SELECT count(*) n FROM outbox').get().n,0);
   assert.match(await (await get('/contact?receipt='+reference)).text(),/Enquiry received/);assert.ok(!(await (await get('/contact?receipt=made-up')).text()).includes('<h2>Enquiry received</h2>'));
  });
  await t.test('no-JavaScript contact errors are accessible HTML, not a JSON screen',async()=>{
   // Reset the disposable test IP bucket after explicitly exercising the limiter above.
   app.db.prepare("DELETE FROM auth_attempts WHERE bucket LIKE 'contact:%'").run();const p=await contactPage();const r=await fetch(base+'/api/public/contact',{method:'POST',headers:{Cookie:p.cookie,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf_token:p.token,name:'Visitor',email:'bad',subject:'Other',message:'A valid length message',privacy:'accepted'})});assert.equal(r.status,422);const html=await r.text();assert.match(html,/role="alert"/);assert.match(html,/value="Visitor"/);assert.match(html,/value="bad"/);
  });
  await t.test('Admin inbox is authenticated and review is audited',async()=>{
   assert.equal((await api('/api/admin/contact-messages')).status,401);await api('/api/setup','POST',{full_name:'Launch Test Admin',email:'launch@test.example',password:'Launch test password 123!'});const login=await api('/api/auth/login','POST',{login:'launch@test.example',password:'Launch test password 123!',role:'admin'});csrf=login.data.csrf;const inbox=await api('/api/admin/contact-messages');assert.equal(inbox.status,200);assert.equal(inbox.data.items[0].reference,reference);const r=await api('/api/admin/contact-messages/1/review','POST',{state:'reviewed',reason:'Reviewed test enquiry'});assert.equal(r.status,200);assert.ok(app.db.prepare("SELECT id FROM operational_audit WHERE action='contact_reviewed'").get());
  });
  await t.test('plain HTML contact submissions redirect only after successful persistence',async()=>{
   const p=await contactPage();const r=await fetch(base+'/api/public/contact',{method:'POST',redirect:'manual',headers:{Cookie:p.cookie,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf_token:p.token,name:'No JS Visitor',email:'nojs@test.example',subject:'Other',message:'This message tests native HTML submission.',privacy:'accepted'})});assert.equal(r.status,303);assert.match(r.headers.get('location'),/^\/contact\?receipt=ENQ-/);assert.equal(app.db.prepare('SELECT count(*) n FROM contact_messages').get().n,2);
  });
  await t.test('RAG filters custom knowledge by role before retrieval and never sends private client records',async()=>{
   const created=await api('/api/admin/assistant-documents','POST',{title:'Finance access guidance',body:'Only administrators may consult the zephyrinvoice policy.',roles:['admin'],reason:'Publish reviewed guidance'});assert.equal(created.status,200);const admin={id:1,roles:['admin']},coach={id:2,roles:['coach_ours']};assert.ok(app.assistant.retrieve(admin,'zephyrinvoice').length);assert.equal(app.assistant.retrieve(coach,'zephyrinvoice').length,0);assert.equal((await app.assistant.answer(coach,'zephyrinvoice')).mode,'no_match');const fallback=await app.assistant.answer(admin,'zephyrinvoice');assert.equal(fallback.mode,'retrieval_only');assert.ok(fallback.sources.length);const result=await api('/api/assistant/ask','POST',{question:'completelyunmatchedword'});assert.equal(result.status,200);assert.equal(result.data.mode,'no_match');assert.equal(app.db.prepare("SELECT count(*) n FROM idempotency WHERE scope LIKE '%/api/assistant/ask'").get().n,0);await api('/api/admin/assistant-documents/'+created.data.id+'/retire','POST',{reason:'Retire obsolete guidance'});assert.equal(app.assistant.retrieve(admin,'zephyrinvoice').length,0);
  });
  await t.test('library retrieval requires undertaking and invalidates citations when its version changes',async()=>{
   const doc=await api('/api/admin/library','POST',{name:'Versioned guide',owner_label:'Training',version:'1',body:'libraryobsoletekeyword is the former guidance.',reason:'Publish reviewed text'});assert.equal(doc.status,200);const admin={id:1,roles:['admin']};assert.equal(app.assistant.retrieve(admin,'libraryobsoletekeyword').length,0);
   const undertaking=await api('/api/admin/undertaking-versions','POST',{version:'1',body:'Test undertaking for library access.',reason:'Publish approved text'});await api('/api/me/undertaking','POST',{undertaking_version_id:undertaking.data.id,accepted:true});const sources=app.assistant.retrieve(admin,'libraryobsoletekeyword');assert.equal(sources.length,1);
   const updated=await api('/api/admin/library/'+doc.data.id+'/versions','POST',{version:'2',body:'librarycurrentkeyword is the updated guidance.',change_note:'Replace old guidance',reason:'Approved revision'});assert.equal(updated.status,200);assert.throws(()=>app.assistant.validateSources(admin,sources),/source changed/i);assert.equal(app.assistant.retrieve(admin,'libraryobsoletekeyword').length,0);assert.equal(app.assistant.retrieve(admin,'librarycurrentkeyword').length,1);
  });
  await t.test('modern images have correct MIME types and PNG fallbacks remain available',async()=>{
   for(const name of ['gyani_mark_TRANSPARENT','saarthi_mark_v1','saarthi_wordmark_v1']){assert.equal((await get('/media/'+name+'.webp')).headers.get('content-type'),'image/webp');assert.equal((await get('/assets/'+name+'.png')).status,200);}const html=await (await get('/about')).text();assert.match(html,/<picture>/);assert.match(html,/loading="lazy"/);assert.match(html,/width="40" height="60"/);
  });
 }finally{await app.close();fs.rmSync(dir,{recursive:true,force:true});}
});

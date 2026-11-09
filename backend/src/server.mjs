import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openDatabase,kit,now,audit} from './db.mjs';
import {ensure,digest,publicUser,requireOps,privileged} from './core.mjs';
import {registerAuth} from './auth.mjs';
import {registerApplications} from './applications.mjs';
import {registerCatalog} from './catalog.mjs';
import {registerCoaching} from './coaching.mjs';
import {registerTraining} from './training.mjs';
import {registerWorkflows} from './workflows.mjs';
import {registerOperations} from './operations.mjs';
import {createPublicSite,validatePublicConfiguration} from './public-site.mjs';
import {createAssistant} from './assistant.mjs';
import {createContact} from './contact.mjs';
import {integrations} from './integrations.mjs';
import {registerGyaniSaysApi} from './gyanisays-api.mjs';
const base=fileURLToPath(new URL('../',import.meta.url));
export function configuration(overrides={}){const dataDir=process.env.DATA_DIR?path.resolve(process.env.DATA_DIR):path.resolve(base,'data');return {host:process.env.HOST||'127.0.0.1',port:Number(process.env.PORT||4174),publicUrl:process.env.PUBLIC_URL||'http://127.0.0.1:4174',production:process.env.NODE_ENV==='production',database:process.env.DATABASE_PATH?path.resolve(process.env.DATABASE_PATH):path.join(dataDir,'saarthi.sqlite'),dataDir,searchIndexing:process.env.SEARCH_INDEXING_ENABLED==='true',gaMeasurementId:process.env.GA4_MEASUREMENT_ID||'',searchVerification:process.env.GOOGLE_SITE_VERIFICATION||'',localModel:process.env.LOCAL_MODEL||'llama3.2:3b',localModelUrl:process.env.LOCAL_MODEL_URL||'http://127.0.0.1:11434',setupToken:process.env.SETUP_TOKEN,adminName:process.env.ADMIN_NAME||'Administrator',adminEmail:process.env.ADMIN_EMAIL||'',emailKey:process.env.RESEND_API_KEY,emailFrom:process.env.EMAIL_FROM,aarambhUrl:process.env.AARAMBH_BASE_URL,aarambhSecret:process.env.AARAMBH_SIGNING_SECRET,aarambhKeyId:process.env.AARAMBH_KEY_ID,aarambhGsUrl:process.env.AARAMBH_GYANISAYS_BASE_URL||process.env.AARAMBH_BASE_URL,aarambhGsApiKey:process.env.AARAMBH_GYANISAYS_API_KEY,aarambhGsInboundSecret:process.env.AARAMBH_GYANISAYS_INBOUND_SECRET,aarambhGsOutboundSecret:process.env.AARAMBH_GYANISAYS_OUTBOUND_SECRET,...overrides};}
export function createApplication(overrides={}){
 const config=configuration(overrides);validatePublicConfiguration(config);
 const site=createPublicSite(config);
 if(config.production){ensure(config.publicUrl.startsWith('https://'),500,'Production requires HTTPS PUBLIC_URL');ensure(config.setupToken?.length>=24,500,'Production requires a SETUP_TOKEN of at least 24 characters');}
 const db=openDatabase(config.database),delivery=integrations(db,config),contact=createContact(db,config),assistant=createAssistant(db,config),routes=[];
 const route=(method,pattern,auth,handler)=>{const keys=[];const regex=new RegExp('^'+pattern.replace(/:([a-z]+)/g,(_,key)=>{keys.push(key);return '([^/]+)';})+'$');routes.push({method,pattern,regex,keys,auth,handler});};
 assistant.register(route);contact.register(route);registerAuth(route,db,config,delivery);registerApplications(route,db,config,delivery);registerCatalog(route,db);registerCoaching(route,db,config,delivery);registerTraining(route,db,delivery);registerOperations(route,db,config,delivery);registerWorkflows(route,db,delivery);const gyaniSaysApi=registerGyaniSaysApi(route,db,config,delivery);
 route('GET','/api/health',false,()=>({status:'ok',instance_id:digest(base),database:db.prepare('SELECT 1 n').get().n===1,storage:'sqlite',time:now()}));
 route('GET','/api/bootstrap',true,c=>{
  const ops=privileged(c.user),coach=db.prepare('SELECT * FROM coaches WHERE user_id=?').get(c.user.id);
  return {me:c.user,csrf:c.session.csrf,coach:coach||null,enrolments:db.prepare('SELECT * FROM enrolments WHERE user_id=?').all(c.user.id),counts:ops?{applications:db.prepare("SELECT count(*) n FROM applications WHERE state IN ('new','screened','interviewing')").get().n,people:db.prepare('SELECT count(*) n FROM users').get().n,batches:db.prepare('SELECT count(*) n FROM batches').get().n,debriefs:db.prepare('SELECT count(*) n FROM debriefs').get().n}:coach?{debriefs:db.prepare('SELECT count(*) n FROM debriefs WHERE coach_id=?').get(coach.id).n,slots:db.prepare("SELECT count(*) n FROM slots WHERE coach_id=? AND status='open'").get(coach.id).n}:{},notifications:db.prepare('SELECT * FROM notifications WHERE user_id=? AND read_at IS NULL LIMIT 10').all(c.user.id)};
 });
 route('GET','/api/admin/status',true,c=>{requireOps(c.user);return {database:{engine:'SQLite',schema_tables:db.prepare("SELECT count(*) n FROM sqlite_master WHERE type='table'").get().n,migrations:db.prepare('SELECT * FROM schema_migrations').all()},email:{configured:Boolean(config.emailKey&&config.emailFrom),provider:'Resend'},aarambh:{configured:Boolean(config.aarambhUrl&&config.aarambhSecret),state:'legacy SETU connection'},aarambhCoachBriefing:{configured:Boolean(config.aarambhGsUrl&&config.aarambhGsApiKey&&config.aarambhGsInboundSecret&&config.aarambhGsOutboundSecret),state:'PDF coach API'},transcription:{configured:false},outbox:db.prepare('SELECT id,kind,state,attempts,last_error,created_at,sent_at FROM outbox ORDER BY id DESC LIMIT 100').all(),endpoints:routes.map(r=>({method:r.method,path:r.pattern}))};});
 route('GET','/api/admin/activity-log',true,c=>{requireOps(c.user);return {items:db.prepare('SELECT * FROM operational_audit ORDER BY id DESC LIMIT 500').all()};});
 route('POST','/api/admin/outbox/:id/retry',true,c=>{requireOps(c.user);const r=db.prepare('SELECT id FROM outbox WHERE id=? AND state<>\'sent\'').get(c.params.id);ensure(r,404,'Pending delivery not found');db.prepare("UPDATE outbox SET state='pending',next_attempt_at=? WHERE id=?").run(now(),r.id);audit(db,c.user,'retry_delivery','outbox',r.id,'Admin requested delivery retry');return {queued:true};});
 let requestQueue=Promise.resolve();
 const server=http.createServer(async(req,res)=>{
  let releaseLock,requestTransaction=false,htmlContact=false,submittedBody={};
  const nonce=site.nonce();
  const requestId=crypto.randomUUID();res.setHeader('X-Request-Id',requestId);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Cache-Control','no-store');const publicAnalytics=config.production&&config.gaMeasurementId&&site.publicPages[req.url.split('?')[0]];res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'nonce-"+nonce+"'"+(publicAnalytics?" https://www.googletagmanager.com":"")+"; style-src 'self' 'unsafe-inline'; img-src 'self' data:"+(publicAnalytics?" https://*.google-analytics.com":"")+"; connect-src 'self'"+(publicAnalytics?" https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com":"")+"; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');if(config.production)res.setHeader('Strict-Transport-Security','max-age=31536000');
  try{
   const origin=new URL(config.publicUrl);const host=req.headers.host;
   ensure(host===origin.host||(config.test&&host?.startsWith('127.0.0.1:')),403,'Unrecognised host');
   const url=new URL(req.url,config.publicUrl);if(!url.pathname.startsWith('/api/')){serveStatic(req,res,url,nonce);return;}
   const selected=routes.find(r=>r.method===req.method&&r.regex.test(url.pathname));ensure(selected,404,'API endpoint not found');
   const values=selected.regex.exec(url.pathname).slice(1);const params=Object.fromEntries(selected.keys.map((k,i)=>[k,decodeURIComponent(values[i])]));const ip=req.socket.remoteAddress||'unknown';
   htmlContact=url.pathname==='/api/public/contact'&&req.method==='POST'&&(req.headers['content-type']||'').startsWith('application/x-www-form-urlencoded');
   const write=!['GET','HEAD','OPTIONS'].includes(req.method);
   if(write){ensure(!req.headers.origin||req.headers.origin===origin.origin,403,'Cross-origin writes are not allowed');ensure(!req.headers['sec-fetch-site']||['same-origin','none'].includes(req.headers['sec-fetch-site']),403,'Cross-site request refused');ensure(htmlContact||(req.headers['content-type']||'').startsWith('application/json'),415,'Send application/json');}
   let raw='';for await(const chunk of req){raw+=chunk;ensure(Buffer.byteLength(raw)<=(url.pathname==='/api/public/contact'?16384:url.pathname==='/api/public/applications'?3*1024*1024:1024*1024),413,'Request exceeds the allowed size');}
   let body={};if(raw){try{body=htmlContact?Object.fromEntries(new URLSearchParams(raw)):JSON.parse(raw);}catch{ensure(false,400,'Malformed JSON');}ensure(body&&typeof body==='object'&&!Array.isArray(body),400,'Expected JSON object');}
   submittedBody=body;
   // Serialize access to this single-host connection across awaited password hashing/provider calls.
   const previous=requestQueue;requestQueue=new Promise(resolve=>{releaseLock=resolve;});await previous;
   const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(p=>p.trim().split('=')));const session=cookies.saarthi_session?db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?').get(digest(cookies.saarthi_session),now()):null;
   const row=session?db.prepare('SELECT * FROM users WHERE id=? AND session_version=? AND state=\'active\'').get(session.user_id,session.session_version):null;
   if(selected.auth)ensure(row,401,'Sign in to continue');if(selected.auth&&write)ensure(req.headers['x-csrf-token']===session.csrf,403,'Invalid CSRF token');
   const context={cookies,db,user:publicUser(db,row),session,body,params,url,ip,headers:req.headers,method:req.method,rawBody:raw,status:200,cookie:value=>res.setHeader('Set-Cookie',value)};
   const idem=req.headers['idempotency-key'];let scope,hash;
   if(selected.auth&&write&&req.method!=='DELETE'&&req.url!=='/api/auth/logout'&&url.pathname!=='/api/assistant/ask'&&!/^\/api\/admin\/people\/[^/]+\/local-invitation$/.test(url.pathname)){
    ensure(typeof idem==='string'&&/^[\w-]{16,100}$/.test(idem),400,'An Idempotency-Key is required');scope=`${row.id}:${req.method}:${url.pathname}`;hash=digest(raw);
    const prior=db.prepare('SELECT * FROM idempotency WHERE scope=? AND key=?').get(scope,idem);if(prior){ensure(prior.request_hash===hash,409,'Idempotency key reused with different input');res.writeHead(prior.status,{'Content-Type':'application/json'});res.end(prior.response);return;}
   }
   if(scope){db.exec('SAVEPOINT api_request');requestTransaction=true;}
   const pending=selected.handler(context);if(url.pathname==='/api/assistant/ask'){releaseLock?.();releaseLock=null;}const result=await pending;if(url.pathname==='/api/assistant/ask'){const prior=requestQueue;requestQueue=new Promise(resolve=>{releaseLock=resolve;});await prior;ensure(db.prepare("SELECT id FROM users WHERE id=? AND state='active' AND session_version=?").get(row.id,row.session_version)&&db.prepare('SELECT token_hash FROM sessions WHERE token_hash=? AND expires_at>?').get(session.token_hash,now()),401,'Your session changed. Sign in again.');assistant.validateSources(context.user,result.sources);}if(htmlContact&&result?.received){res.writeHead(303,{Location:'/contact?receipt='+encodeURIComponent(result.reference)});res.end();return;}if(result?.pdfBytes){res.setHeader('Content-Security-Policy',"sandbox; default-src 'none'");res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+result.filename+'"'});res.end(result.pdfBytes);return;}const response=JSON.stringify(result??{ok:true});
   if(scope)db.prepare('INSERT INTO idempotency(scope,key,request_hash,status,response) VALUES(?,?,?,?,?)').run(scope,idem,hash,context.status,response);
   if(requestTransaction){db.exec('RELEASE api_request');requestTransaction=false;}
   res.writeHead(context.status,{'Content-Type':'application/json; charset=utf-8'});res.end(response);
  }catch(error){if(requestTransaction){db.exec('ROLLBACK TO api_request');db.exec('RELEASE api_request');}let status=error.status||500;let message=error.message;if(error.code==='ERR_SQLITE_ERROR'&&/constraint/i.test(message)){status=409;message='Record conflicts with existing data or a required reference. Check the entered values.';}if(status===500){console.error(JSON.stringify({requestId,message:error.message,stack:error.stack}));message='Unexpected server error. Reference: '+requestId;}if(htmlContact){const token=contact.issue();res.setHeader('Set-Cookie',contact.cookie(token));res.writeHead(status,{'Content-Type':'text/html; charset=utf-8'});res.end(site.render('/contact',nonce,{token,error:message,values:submittedBody}));}else{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify({error:message,code:error.rule,rule:error.rule,requestId}));}}finally{releaseLock?.();}
 });
 function serveStatic(req,res,url,nonce){
  ensure(req.method==='GET'||req.method==='HEAD',405,'Method not allowed');
  const send=(status,type,body)=>{res.writeHead(status,{'Content-Type':type});res.end(req.method==='HEAD'?undefined:body);};
  if(url.pathname==='/robots.txt')return send(200,'text/plain; charset=utf-8',site.robots());
  if(url.pathname==='/sitemap.xml')return send(200,'application/xml; charset=utf-8',site.sitemap());
  let redirect=site.redirects[url.pathname];if(url.pathname.endsWith('/')&&url.pathname!=='/'&&site.isPage(url.pathname.slice(0,-1)))redirect=url.pathname.slice(0,-1);
  if(redirect){res.writeHead(301,{Location:redirect+url.search});res.end();return;}
  if(site.isPage(url.pathname)){
   const isPublic=Boolean(site.publicPages[url.pathname]);const token=url.pathname==='/contact'?contact.issue():null;
   if(token)res.setHeader('Set-Cookie',contact.cookie(token));
   const received=url.pathname==='/contact'&&Boolean(db.prepare('SELECT id FROM contact_messages WHERE reference=?').get(url.searchParams.get('receipt')||''));
   if(config.searchIndexing&&isPublic&&!received)res.removeHeader('X-Robots-Tag');
   return send(200,'text/html; charset=utf-8',site.render(url.pathname,nonce,{token,received}));
  }
  let root,relative;
  if(url.pathname.startsWith('/assets/')){root=path.join(kit,'frontend');relative=url.pathname.slice(1);}
  else if(['/styles.css','/ui-refresh.css','/workspace-access.css'].includes(url.pathname)){root=path.join(kit,'frontend');relative=url.pathname.slice(1);}
  else{root=path.join(base,'web');relative=url.pathname.slice(1);}
  let target;try{target=path.resolve(root,decodeURIComponent(relative));}catch{return send(404,'text/html; charset=utf-8',site.render('/404',nonce));}
  const allowed=['.js','.css','.png','.webp','.avif','.svg','.woff2'];
  if(!target.startsWith(root+path.sep)||relative.split('/').some(p=>p.startsWith('.'))||!allowed.includes(path.extname(target))||!fs.existsSync(target)||!fs.statSync(target).isFile())return send(404,'text/html; charset=utf-8',site.render('/404',nonce));
  const mime={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.woff2':'font/woff2'};
  const bytes=fs.readFileSync(target),etag='"'+digest(bytes)+'"';res.removeHeader('X-Robots-Tag');res.setHeader('Cache-Control',['.js','.css'].includes(path.extname(target))?'public, max-age=0, must-revalidate':'public, max-age=3600, must-revalidate');res.setHeader('ETag',etag);if(req.headers['if-none-match']===etag){res.writeHead(304);res.end();return;}return send(200,mime[path.extname(target)],bytes);
 }
 server.requestTimeout=30000;server.headersTimeout=15000;server.keepAliveTimeout=5000;
 let timer,stopping=false;
 const work=()=>{requestQueue=requestQueue.then(async()=>{if(!stopping){gyaniSaysApi.processPendingAssignments();gyaniSaysApi.processMeetingReminders();await delivery.process();}}).catch(error=>console.error('Outbox worker:',error.message));};
 return {server,db,config,routes,delivery,assistant,start:()=>new Promise(resolve=>{server.listen(config.port,config.host,()=>{timer=setInterval(work,15000);timer.unref();resolve(server.address());});}),close:()=>new Promise(resolve=>{stopping=true;clearInterval(timer);server.close(async()=>{await requestQueue;db.close();resolve();});server.closeIdleConnections();})};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const app=createApplication();await app.start();console.log(`Saarthi backend: ${app.config.publicUrl}\nDatabase: ${app.config.database}\nFirst administrator setup is available only while the database has no users.`);for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await app.close();process.exit(0);});}


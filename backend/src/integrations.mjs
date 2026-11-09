import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {insert,now} from './db.mjs';
import {ensure,token,digest} from './core.mjs';
export function integrations(db,config){
 const keyPath=path.join(config.dataDir,'outbox.key');fs.mkdirSync(config.dataDir,{recursive:true});
 if(!fs.existsSync(keyPath))fs.writeFileSync(keyPath,crypto.randomBytes(32),{mode:0o600,flag:'wx'});
 const key=fs.readFileSync(keyPath);
 const seal=value=>{const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return [iv,cipher.getAuthTag(),data].map(x=>x.toString('base64')).join('.');};
 const open=value=>{const [iv,tag,data]=value.split('.').map(x=>Buffer.from(x,'base64'));const cipher=crypto.createDecipheriv('aes-256-gcm',key,iv);cipher.setAuthTag(tag);return JSON.parse(Buffer.concat([cipher.update(data),cipher.final()]).toString());};
 const queue=(kind,payload)=>insert(db,'outbox',{kind,payload:seal(payload),next_attempt_at:now()});
 async function gyaniSaysAarambh(method,route,body){
  ensure(config.aarambhGsUrl&&config.aarambhGsApiKey&&config.aarambhGsOutboundSecret,503,'Aarambh coach integration is not configured','INTEGRATION_PENDING');
  const url=new URL(route,config.aarambhGsUrl);ensure(url.protocol==='https:'||(!config.production&&['localhost','127.0.0.1','::1'].includes(url.hostname)),503,'Aarambh requires HTTPS');
  const timestamp=String(Math.floor(Date.now()/1000)),payload=body===undefined?'':JSON.stringify(body),canonical=`${timestamp}.${method.toUpperCase()}.${url.pathname}${url.search}.${payload}`;
  const signature='sha256='+crypto.createHmac('sha256',config.aarambhGsOutboundSecret).update(canonical).digest('hex');
  const headers={'X-Api-Key':config.aarambhGsApiKey,'X-GyaniSays-Timestamp':timestamp,'X-GyaniSays-Signature':signature,Accept:'application/json'};
  if(payload)headers['Content-Type']='application/json';if(body?.eventId){headers['X-Event-Id']=body.eventId;headers['Idempotency-Key']=body.eventId;}
  const res=await fetch(url,{method,headers,body:payload||undefined,signal:AbortSignal.timeout(15000),redirect:'error'});const data=await res.json().catch(()=>({}));ensure(res.ok&&data.success!==false,502,'Aarambh did not accept the Gyani Says request');return data;
 }
 function invite(user){const raw=token();db.prepare('INSERT INTO account_invitations(user_id,token_hash,expires_at,used_at) VALUES(?,?,?,NULL) ON CONFLICT(user_id) DO UPDATE SET token_hash=excluded.token_hash,expires_at=excluded.expires_at,used_at=NULL').run(user.id,digest(raw),new Date(Date.now()+48*3600000).toISOString());return queue('email',{to:user.email,subject:'Your Saarthi invitation',text:`Welcome to Saarthi. Set your password using this single-use link (expires in 48 hours):\n${config.publicUrl}/?invite=${raw}`});}
 async function aarambh(method,route,body){
  ensure(config.aarambhUrl&&config.aarambhSecret,503,'Aarambh integration is not connected','INTEGRATION_PENDING');
  const url=new URL(route,config.aarambhUrl);ensure(url.protocol==='https:',503,'Aarambh requires HTTPS');
  const timestamp=String(Math.floor(Date.now()/1000)),nonce=token(),payload=body?JSON.stringify(body):'';
  const signature=crypto.createHmac('sha256',config.aarambhSecret).update(`${method}\n${url.pathname}\n${timestamp}\n${nonce}\n${digest(payload)}`).digest('hex');
  const res=await fetch(url,{method,headers:{'Content-Type':'application/json','X-Key-Id':config.aarambhKeyId||'','X-Timestamp':timestamp,'X-Nonce':nonce,'X-Signature':signature,'Idempotency-Key':body?.eventId||nonce},body:body?payload:undefined,signal:AbortSignal.timeout(15000),redirect:'error'});
  ensure(res.ok,502,'Aarambh did not accept the request');return res.json();
 }
 let running=false;
 async function process(){if(running)return;running=true;try{const rows=db.prepare("SELECT * FROM outbox WHERE state IN ('pending','blocked','retry') AND next_attempt_at<=? ORDER BY id LIMIT 1").all(now());for(const row of rows){try{
   if(row.kind==='email'&&(!config.emailKey||!config.emailFrom)){db.prepare("UPDATE outbox SET state='blocked',last_error='Email provider not configured',next_attempt_at=? WHERE id=?").run(new Date(Date.now()+60000).toISOString(),row.id);continue;}
   if(row.kind==='aarambh'&&!config.aarambhUrl){db.prepare("UPDATE outbox SET state='blocked',last_error='Aarambh connection deferred',next_attempt_at=? WHERE id=?").run(new Date(Date.now()+60000).toISOString(),row.id);continue;}
   const payload=open(row.payload);
   if(row.kind==='email'){const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.emailKey}`,'Content-Type':'application/json','Idempotency-Key':`saarthi-outbox-${row.id}`},body:JSON.stringify({from:config.emailFrom,to:[payload.to],subject:payload.subject,text:payload.text}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Email provider rejected delivery ('+response.status+')');}
   else if(row.kind==='aarambh')await aarambh(payload.method,payload.route,{...payload.body,eventId:'saarthi-'+row.id});
   else if(row.kind==='aarambh_gyanisays')await gyaniSaysAarambh('POST','/api/integrations/gyanisays/events',{...payload,eventId:'saarthi-'+row.id});
   else throw Error('Unrecognised delivery type');
   db.prepare("UPDATE outbox SET state='sent',sent_at=?,last_error=NULL,attempts=attempts+1 WHERE id=?").run(now(),row.id);
  }catch(e){db.prepare("UPDATE outbox SET state=?,attempts=attempts+1,last_error=?,next_attempt_at=? WHERE id=?").run(row.attempts>=(row.kind==='aarambh_gyanisays'?30:7)?'failed':'retry',String(e.message).slice(0,200),new Date(Date.now()+Math.min(3600000,30000*2**row.attempts)).toISOString(),row.id);}}}finally{running=false;}}
 return {queue,invite,aarambh,gyaniSaysEvent:event=>queue('aarambh_gyanisays',event),gyaniSaysReportLink:async bookingId=>{const data=await gyaniSaysAarambh('GET','/api/integrations/gyanisays/report-link?bookingId='+encodeURIComponent(bookingId));ensure(data.data?.url,502,'Aarambh did not return a coach report link');return data.data;},process};
}

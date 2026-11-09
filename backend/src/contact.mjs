import crypto from 'node:crypto';
import {insert,transaction,now,audit} from './db.mjs';
import {text,email,ensure,choice,rateLimit,digest,requireOps,reason,integer} from './core.mjs';
export function createContact(db,config){
 db.exec(`CREATE TABLE IF NOT EXISTS contact_messages(id INTEGER PRIMARY KEY,reference TEXT NOT NULL UNIQUE,name TEXT NOT NULL,email TEXT NOT NULL,subject TEXT NOT NULL,message TEXT NOT NULL,privacy_version TEXT NOT NULL,submission_hash TEXT NOT NULL UNIQUE,body_hash TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'new' CHECK(state IN ('new','reviewed','closed')),created_at TEXT NOT NULL,reviewed_by INTEGER REFERENCES users(id),reviewed_at TEXT);`);
 const secret=crypto.randomBytes(32),sign=value=>crypto.createHmac('sha256',secret).update(value).digest('hex');
 function issue(){const payload=Date.now()+'.'+crypto.randomBytes(24).toString('hex');return payload+'.'+sign(payload);}
 function cookie(token){return `contact_csrf=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600${config.production?'; Secure':''}`;}
 function validate(token,cookieToken){ensure(typeof token==='string'&&token.length<200&&token===cookieToken,403,'The form has expired. Reload the contact page and try again.');const parts=token.split('.'),payload=parts.slice(0,2).join('.'),mac=Buffer.from(parts[2]||'','hex'),expected=Buffer.from(sign(payload),'hex');ensure(parts.length===3&&mac.length===expected.length&&crypto.timingSafeEqual(mac,expected)&&Date.now()-Number(parts[0])>=0&&Date.now()-Number(parts[0])<=3600000,403,'The form has expired. Reload the contact page and try again.');}
 function register(route){
  route('POST','/api/public/contact',false,c=>{
   validate(c.body.csrf_token,c.cookies.contact_csrf);rateLimit(db,'contact:'+digest(c.ip),5,3600000);
   ensure(!c.body.website,422,'Unable to accept this form. Please leave the website field empty.');
   const name=text(c.body.name,'Name',120),address=email(c.body.email),subject=choice(c.body.subject,'topic',['Applications','Account access','Training','Privacy and data','Other']),message=text(c.body.message,'Message',5000);
   ensure(!/[\r\n]/.test(name+address),422,'Name and email must be single-line values');ensure(message.length>=10,422,'Please enter a message of at least 10 characters');ensure(c.body.privacy==='accepted',422,'Please acknowledge the privacy notice');
   const submission=digest(c.body.csrf_token),hash=digest(JSON.stringify({name,address,subject,message}));
   const old=db.prepare('SELECT reference,body_hash FROM contact_messages WHERE submission_hash=?').get(submission);if(old){ensure(old.body_hash===hash,409,'This form was already submitted. Reload to send a new enquiry.');return {received:true,reference:old.reference,message:'Your enquiry is saved in the administration inbox. Email delivery is not claimed.'};}
   const reference='ENQ-'+crypto.randomBytes(8).toString('hex').toUpperCase();transaction(db,()=>{const id=insert(db,'contact_messages',{reference,name,email:address,subject,message,privacy_version:'2026-10-25',submission_hash:submission,body_hash:hash,created_at:now()});audit(db,null,'contact_received','contact_messages',id,'Contact enquiry saved with privacy acknowledgement');});c.status=201;return {received:true,reference,message:'Your enquiry is saved in the administration inbox. Email delivery is not claimed.'};
  });
  route('GET','/api/admin/contact-messages',true,c=>{requireOps(c.user);const offset=integer(Number(c.url.searchParams.get('offset')||0),'offset',0,10000000);return {items:db.prepare('SELECT id,reference,name,email,subject,message,state,created_at,reviewed_at FROM contact_messages ORDER BY id DESC LIMIT 50 OFFSET ?').all(offset),total:db.prepare('SELECT count(*) n FROM contact_messages').get().n,offset};});
  route('POST','/api/admin/contact-messages/:id/review',true,c=>{requireOps(c.user);const why=reason(c.body),state=choice(c.body.state,'state',['reviewed','closed']);ensure(db.prepare('SELECT id FROM contact_messages WHERE id=?').get(c.params.id),404,'Enquiry not found');db.prepare('UPDATE contact_messages SET state=?,reviewed_by=?,reviewed_at=? WHERE id=?').run(state,c.user.id,now(),c.params.id);audit(db,c.user,'contact_'+state,'contact_messages',c.params.id,why);return {state};});
 }
 return {issue,cookie,register};
}

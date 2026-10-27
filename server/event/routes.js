import express from 'express';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { registration, check } from './validation.js';
import { normalizeImport } from './import.js';
import { renderCsv } from '../views.js';
import { makeFormShare } from './share.js';

const root = fileURLToPath(new URL('../../event-public/', import.meta.url));
const hash = value => createHash('sha256').update(value).digest('hex');
const colours = ['Red', 'Blue', 'Green', 'Yellow'];
export function eventRoutes(db, config = {}) {
  const publicRouter = express.Router(), adminRouter = express.Router();
  const roster = () => db.prepare('SELECT * FROM registrations ORDER BY id DESC').all().map(r => ({ id:r.id, reference:r.reference, ...JSON.parse(r.payload), team:r.team, created_at:r.created_at }));
  const transaction = fn => { db.exec('BEGIN IMMEDIATE'); try { const result = fn(); db.exec('COMMIT'); return result; } catch (e) { db.exec('ROLLBACK'); throw e; } };
  const writeGuard = (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      check(!origin || new URL(origin).host === req.get('host'), 'Cross-site request denied', 403);
      check(req.get('sec-fetch-site') !== 'cross-site', 'Cross-site request denied', 403);
      check(req.is('application/json') && req.get('X-Requested-With') === 'GyaniSays', 'JSON application request required', 415);
    }
    res.set('Cache-Control','no-store'); next();
  };
  for (const router of [publicRouter, adminRouter]) {
    router.use(writeGuard, express.json({ limit:'2mb' }));
    router.use((req, res, next) => { if (!['GET','HEAD'].includes(req.method)) check(req.body && typeof req.body === 'object' && !Array.isArray(req.body), 'Invalid request body',400); next(); });
  }
  publicRouter.get(['/', '/index.html'], (req,res) => res.sendFile('index.html',{root}));
  for (const name of ['form.js','app.css','privacy.html']) publicRouter.get('/'+name,(req,res)=>res.sendFile(name,{root}));
  publicRouter.get('/api/names', (req,res) => res.json({items:db.prepare('SELECT id,name,department FROM invitees WHERE active=1 ORDER BY name,department,id').all()}));
  publicRouter.get('/api/stats', (req,res) => res.json({registrations:db.prepare('SELECT COUNT(*) n FROM registrations').get().n}));
  publicRouter.post('/api/registrations', (req,res) => {
    const key=req.get('Idempotency-Key'); check(typeof key==='string' && /^[\w-]{16,100}$/.test(key),'Invalid submission key');
    const b={...req.body}; let inviteeId=null;
    if (b.invitee_id != null) {
      check(Number.isSafeInteger(b.invitee_id),'Invalid selected name');
      const person=db.prepare('SELECT * FROM invitees WHERE id=? AND active=1').get(b.invitee_id);
      check(person,'This name list has changed. Reload the form and select your name again.',409);
      inviteeId=person.id; b.name=person.name; if(person.department) b.department=person.department;
    }
    const payload=registration(b), body=JSON.stringify(payload), digest=hash(body+'|'+inviteeId);
    const prior=db.prepare('SELECT * FROM registrations WHERE request_key=?').get(key);
    if(prior){check(prior.request_hash===digest,'This submission key was already used. Reload before submitting different details.',409);return res.json({ok:true,reference:prior.reference});}
    if(inviteeId)check(!db.prepare('SELECT id FROM registrations WHERE invitee_id=?').get(inviteeId),'A registration for this name already exists. Contact the organiser for a correction.',409);
    const now=Date.now(), limitKey=hash(req.ip || '');
    db.prepare('DELETE FROM limits WHERE reset<?').run(now);
    const limit=db.prepare('SELECT count FROM limits WHERE key=?').get(limitKey);check(!limit||limit.count<30,'Too many submissions. Try again in an hour.',429);
    const reference='GYS-'+randomBytes(6).toString('hex').toUpperCase();
    transaction(()=>{
      db.prepare('INSERT INTO limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(limitKey,now+3600000);
      const counts=Object.fromEntries(colours.map(c=>[c,0]));for(const r of db.prepare('SELECT team,COUNT(*) n FROM registrations GROUP BY team').all())counts[r.team]=r.n;
      const team=[...colours].sort((a,b)=>counts[a]-counts[b])[0];
      db.prepare('INSERT INTO registrations(reference,payload,team,created_at,request_key,request_hash,invitee_id) VALUES(?,?,?,?,?,?,?)').run(reference,body,team,new Date().toISOString(),key,digest,inviteeId);
    });
    res.status(201).json({ok:true,reference});
  });
  adminRouter.get(['/', '/dashboard.html'],(req,res)=>res.sendFile('dashboard.html',{root}));
  for(const name of ['dashboard.js','planning.js','planning.css'])adminRouter.get('/'+name,(req,res)=>res.sendFile(name,{root}));
  adminRouter.get('/api/me',(req,res)=>res.json({csrf:''}));
  adminRouter.get('/api/share',async(req,res)=>res.json(await makeFormShare(config.publicSiteUrl || `${req.protocol}://${req.get('host')}`)));
  adminRouter.get('/api/registrants',(req,res)=>res.json({items:roster()}));
  adminRouter.get('/api/kids-manifest',(req,res)=>res.json({items:roster().filter(r=>r.rsvp==='Yes').flatMap(r=>r.kids.map(k=>({age:k.age,age_band:k.age_band,food:k.food})))}));
  adminRouter.get('/api/invitees',(req,res)=>res.json({items:db.prepare('SELECT i.id,i.name,i.department,i.external_id,r.reference FROM invitees i LEFT JOIN registrations r ON r.invitee_id=i.id WHERE i.active=1 ORDER BY i.name,i.id').all()}));
  adminRouter.get('/api/import-template',(req,res)=>res.type('text/csv').attachment('gyanisays-names-template.csv').send('\uFEFFname,department,external_id\r\nExample Person,Cardiology,EXAMPLE-001\r\n'));
  adminRouter.post('/api/import-preview',(req,res)=>res.json(normalizeImport(req.body.csv ?? req.body.items)));
  adminRouter.post('/api/import',(req,res)=>{
    const parsed=normalizeImport(req.body.csv ?? req.body.items);let added=0,updated=0;
    transaction(()=>{for(const person of parsed.items){
      const old=db.prepare('SELECT id FROM invitees WHERE import_key=?').get(person.key);
      db.prepare('INSERT INTO invitees(import_key,name,department,external_id) VALUES(?,?,?,?) ON CONFLICT(import_key) DO UPDATE SET name=excluded.name,department=excluded.department,external_id=excluded.external_id,active=1').run(person.key,person.name,person.department,person.external_id);
      old?updated++:added++;
    }});
    res.json({ok:true,added,updated,duplicates:parsed.duplicates});
  });
  adminRouter.post('/api/clear-names',(req,res)=>{check(req.body.confirm==='CLEAR NAMES','Type CLEAR NAMES to clear the name list');const result=db.prepare('UPDATE invitees SET active=0 WHERE active=1').run();res.json({ok:true,cleared:result.changes});});
  adminRouter.get('/api/export',(req,res)=>{
    const rows=roster().map(r=>({...r,spouse:JSON.stringify(r.spouse),kids:JSON.stringify(r.kids)}));
    // Neutralise spreadsheet formulas in organiser exports.
    for(const row of rows)for(const key of Object.keys(row))if(typeof row[key]==='string'&&/^[=+@\-\t\r]/.test(row[key]))row[key]="'"+row[key];
    res.type('text/csv').attachment('gyanisays-event-registrations.csv').send(renderCsv(rows));
  });
  adminRouter.put('/api/teams',(req,res)=>{
    check(Array.isArray(req.body.items)&&req.body.items.length<=10000,'Invalid team assignments');const ids=new Set();
    for(const r of req.body.items){check(Number.isSafeInteger(r.id)&&!ids.has(r.id)&&db.prepare('SELECT id FROM registrations WHERE id=?').get(r.id),'Unknown or duplicate registrant');check(colours.includes(r.team),'Invalid team');ids.add(r.id);}
    transaction(()=>{for(const r of req.body.items)db.prepare('UPDATE registrations SET team=? WHERE id=?').run(r.team,r.id);});res.json({ok:true});
  });
  adminRouter.get('/api/catalog',(req,res)=>{const c=db.prepare('SELECT * FROM catalog').get();res.json({...JSON.parse(c.payload),revision:c.revision});});
  adminRouter.put('/api/catalog',(req,res)=>{
    const b=req.body;check(Array.isArray(b.activities)&&b.activities.length<=150&&Array.isArray(b.awards)&&b.awards.length<=150&&Array.isArray(b.categories)&&b.categories.length<=40,'Invalid catalog');
    const text=(v,n)=>{check(typeof v==='string'&&v.length<=n,'Invalid catalog text');return v;};
    const categories=b.categories.map(c=>text(c,80));check(new Set(categories).size===categories.length,'Duplicate categories');
    const activities=b.activities.map(a=>{check(a&&['Olympics','Gamification','Battleground'].includes(a.type)&&[1,2,3].includes(a.stress),'Invalid activity');const out={type:a.type,stress:a.stress,name:text(a.name,150)};check(out.name.trim(),'Activity name required');for(const k of ['profile','rules','engage','success','fail','warn','award'])out[k]=text(a[k]||'',3000);return out;});
    const awards=b.awards.map(a=>{check(Array.isArray(a)&&a.length===3&&categories.includes(a[0]),'Invalid award');return a.map(v=>text(v,2000));});check(new Set(awards.map(a=>a[1])).size===awards.length,'Duplicate awards');
    const result=db.prepare('UPDATE catalog SET payload=?,revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify({activities,awards,categories}),Number(b.revision));check(result.changes,'Another organiser changed this catalog. Refresh first.',409);res.json({ok:true,revision:Number(b.revision)+1});
  });
  adminRouter.get('/api/winners',(req,res)=>res.json({items:db.prepare('SELECT * FROM winners').all()}));
  adminRouter.put('/api/winners',(req,res)=>{const b=req.body,c=JSON.parse(db.prepare('SELECT payload FROM catalog').get().payload);check(c.awards.some(a=>a[1]===b.award),'Unknown award');check(typeof b.recipient==='string'&&b.recipient.trim()&&b.recipient.length<=200&&typeof b.note==='string'&&b.note.length<=1000,'Invalid recipient');db.prepare('INSERT INTO winners VALUES(?,?,?) ON CONFLICT(award) DO UPDATE SET recipient=excluded.recipient,note=excluded.note').run(b.award,b.recipient.trim(),b.note);res.json({ok:true});});
  for(const router of [publicRouter,adminRouter]){
    router.use((req,res)=>res.status(404).json({error:'Not found'}));
    router.use((err,req,res,next)=>{const code=err.type==='entity.parse.failed'?400:err.status||500;res.status(code).json({error:code<500?err.message:'Could not save or load data. Please try again.'});});
  }
  return {publicRouter,adminRouter};
}

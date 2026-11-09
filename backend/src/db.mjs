import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const kit = fileURLToPath(new URL('../../', import.meta.url));
export function convertSchema(source) {
 const indexes=[];
 const clean=source.replace(/--[^\n]*/g,'').replace(/`/g,'');
 const tables=[];
 for(const match of clean.matchAll(/CREATE TABLE (\w+)\s*\(([\s\S]*?)\) ENGINE=[^;]+;/g)) {
  const name=match[1];const rows=[];
  for(let line of match[2].split('\n').map(s=>s.trim()).filter(Boolean)) {
   const ix=line.match(/^(UNIQUE )?KEY (\w+)\s*(\(.*\)),?$/);
   if(ix){indexes.push(`CREATE ${ix[1]||''}INDEX ${ix[2]} ON ${name} ${ix[3]};`);continue;}
   line=line.replace(/BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY/,'INTEGER PRIMARY KEY AUTOINCREMENT');
   line=line.replace(/\bENUM\(([^)]+)\)/g,(_,values)=>{const col=line.match(/^(\w+)/)[1];if(name==='applications'&&col==='state')values+=",'accepted','rejected'";return `TEXT CHECK (${col} IN (${values}))`;});
   line=line.replace(/\bSET\([^)]+\)/g,'TEXT').replace(/\b(?:BIGINT|SMALLINT|TINYINT|INT)(?:\(\d+\))?(?: UNSIGNED)?\b/g,'INTEGER').replace(/\b(?:VARCHAR|CHAR)\(\d+\)/g,'TEXT').replace(/\b(?:DATETIME|TIMESTAMP|DATE|TIME|JSON|LONGTEXT|MEDIUMTEXT)\b/g,'TEXT').replace(/\bDECIMAL\(\d+,\d+\)/g,'REAL').replace(/\s+ON UPDATE CURRENT_TIMESTAMP/g,'');
   rows.push(line);
  }
  tables.push(`CREATE TABLE ${name} (\n${rows.join('\n').replace(/,\s*$/,'')}\n);`);
 }
 if(tables.length!==111)throw Error(`Expected 111 source tables, found ${tables.length}`);
 return tables.join('\n')+'\n'+indexes.join('\n');
}
const extras=`
CREATE TABLE IF NOT EXISTS application_cvs(application_id INTEGER PRIMARY KEY REFERENCES applications(id),filename TEXT NOT NULL,content BLOB NOT NULL,uploaded_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','needs_revision')),review_note TEXT NOT NULL DEFAULT '',reviewed_by INTEGER REFERENCES users(id),reviewed_at TEXT);
CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,session_version INTEGER NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS auth_attempts(bucket TEXT PRIMARY KEY,attempts INTEGER NOT NULL,reset_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS application_decisions(id INTEGER PRIMARY KEY,application_id INTEGER NOT NULL REFERENCES applications(id),state TEXT NOT NULL,reason TEXT NOT NULL,actor_id INTEGER NOT NULL REFERENCES users(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS outbox(id INTEGER PRIMARY KEY,kind TEXT NOT NULL,payload TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,next_attempt_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,last_error TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,sent_at TEXT);
CREATE TABLE IF NOT EXISTS idempotency(scope TEXT NOT NULL,key TEXT NOT NULL,request_hash TEXT NOT NULL,status INTEGER NOT NULL,response TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(scope,key));
CREATE TABLE IF NOT EXISTS webhook_nonces(nonce TEXT PRIMARY KEY,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS gyanisays_assignments(assignment_id TEXT PRIMARY KEY,briefing_id TEXT NOT NULL UNIQUE,person_ref TEXT NOT NULL,first_name TEXT NOT NULL,language_code TEXT NOT NULL,sitting_ref TEXT NOT NULL,client_type TEXT NOT NULL,report_kind TEXT NOT NULL,report_version TEXT,assessment_completed_at TEXT,coach_id INTEGER REFERENCES coaches(id),status TEXT NOT NULL DEFAULT 'pending_assignment',booking_id TEXT UNIQUE,slot_id INTEGER REFERENCES slots(id),start_at TEXT,end_at TEXT,meet_link TEXT,consent_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS gyanisays_requests(request_id TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES gyanisays_assignments(assignment_id),booking_id TEXT,kind TEXT NOT NULL,message TEXT,status TEXT NOT NULL DEFAULT 'open',resolution TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS gyanisays_reminder_log(booking_id TEXT NOT NULL,start_at TEXT NOT NULL,lead_minutes INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(booking_id,start_at,lead_minutes));
CREATE TABLE IF NOT EXISTS gyanisays_idempotency(scope TEXT NOT NULL,key TEXT NOT NULL,request_hash TEXT NOT NULL,response TEXT NOT NULL,PRIMARY KEY(scope,key));
CREATE TABLE IF NOT EXISTS coach_client_batches(id INTEGER PRIMARY KEY,coach_id INTEGER NOT NULL REFERENCES coaches(id),name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 2 AND 80),description TEXT NOT NULL DEFAULT '',created_by INTEGER NOT NULL REFERENCES users(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_ccb_coach ON coach_client_batches(coach_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ccb_coach_name ON coach_client_batches(coach_id,name COLLATE NOCASE);
CREATE TABLE IF NOT EXISTS coach_client_batch_members(id INTEGER PRIMARY KEY,batch_id INTEGER NOT NULL REFERENCES coach_client_batches(id),coach_id INTEGER NOT NULL REFERENCES coaches(id),person_ref TEXT NOT NULL,added_by INTEGER NOT NULL REFERENCES users(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,removed_at TEXT,removed_by INTEGER REFERENCES users(id));
CREATE UNIQUE INDEX IF NOT EXISTS idx_ccbm_active_person ON coach_client_batch_members(coach_id,person_ref) WHERE removed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ccbm_batch ON coach_client_batch_members(batch_id,removed_at);
CREATE TABLE IF NOT EXISTS account_invitations(user_id INTEGER PRIMARY KEY REFERENCES users(id),token_hash TEXT NOT NULL UNIQUE,expires_at TEXT NOT NULL,used_at TEXT);
CREATE TABLE IF NOT EXISTS consent_read_receipts(user_id INTEGER NOT NULL REFERENCES users(id),version TEXT NOT NULL,read_at TEXT NOT NULL,PRIMARY KEY(user_id,version));
CREATE TABLE IF NOT EXISTS operational_audit(id INTEGER PRIMARY KEY,actor_id INTEGER REFERENCES users(id),action TEXT NOT NULL,entity TEXT NOT NULL,entity_id TEXT,reason TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS exam_marks(attempt_id INTEGER NOT NULL REFERENCES exam_attempts(id),faculty_id INTEGER NOT NULL REFERENCES faculty(id),result TEXT NOT NULL CHECK(result IN ('passed','not_passed')),feedback TEXT NOT NULL,marked_at TEXT NOT NULL,PRIMARY KEY(attempt_id,faculty_id));
CREATE TABLE IF NOT EXISTS library_content(document_id INTEGER NOT NULL REFERENCES library_documents(id),version TEXT NOT NULL,body TEXT NOT NULL,published_by INTEGER NOT NULL REFERENCES users(id),PRIMARY KEY(document_id,version));
CREATE TABLE IF NOT EXISTS pay_run_receipts(pay_run_id INTEGER PRIMARY KEY REFERENCES pay_runs(id),payment_reference TEXT NOT NULL,recorded_by INTEGER NOT NULL REFERENCES users(id),recorded_at TEXT NOT NULL);
CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON operational_audit BEGIN SELECT RAISE(ABORT,'Audit is append only'); END;
CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON operational_audit BEGIN SELECT RAISE(ABORT,'Audit is append only'); END;
CREATE TRIGGER IF NOT EXISTS activity_no_update BEFORE UPDATE ON activity_log BEGIN SELECT RAISE(ABORT,'Audit is append only'); END;
CREATE TRIGGER IF NOT EXISTS activity_no_delete BEFORE DELETE ON activity_log BEGIN SELECT RAISE(ABORT,'Audit is append only'); END;
`;
export function openDatabase(filename){
 if(filename!==':memory:')fs.mkdirSync(path.dirname(filename),{recursive:true});
 const db=new DatabaseSync(filename);db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()) {
  db.exec('BEGIN IMMEDIATE');
  try{db.exec(convertSchema(fs.readFileSync(path.join(kit,'schema.sql'),'utf8')));db.exec(extras);db.prepare('INSERT INTO schema_migrations(version) VALUES(1)').run();db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');db.close();throw error;}
 }
 db.exec(extras);
 if(!db.prepare('PRAGMA table_info(coaches)').all().some(c=>c.name==='tier'))db.exec("ALTER TABLE coaches ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard' CHECK(tier IN ('standard','plus','premium'))");
 // Additive migration preserves all existing application records and workflow state.
 const locationColumns=new Set(db.prepare('PRAGMA table_info(applications)').all().map(c=>c.name));
 for(const name of ['country_code','country','region_id','region','city_id'])if(!locationColumns.has(name))db.exec('ALTER TABLE applications ADD COLUMN '+name+' TEXT');
 // Extend legacy language constraints without losing saved language choices.
 for(const [table,owner,parent] of [['application_languages','application_id','applications'],['user_languages','user_id','users']]){
  const definition=db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(table)?.sql||'';
  if(!definition.includes("'other'"))transaction(db,()=>{
   db.exec(`CREATE TABLE ${table}_expanded (${owner} INTEGER NOT NULL REFERENCES ${parent}(id),language_code TEXT NOT NULL REFERENCES languages(code),proficiency TEXT NOT NULL CHECK(proficiency IN ('primary','secondary','other')),PRIMARY KEY(${owner},language_code));INSERT INTO ${table}_expanded SELECT * FROM ${table};DROP TABLE ${table};ALTER TABLE ${table}_expanded RENAME TO ${table};`);
   if(table==='user_languages')db.exec('CREATE INDEX idx_ul_lang ON user_languages(language_code,proficiency)');
  });
 }
 const refs=JSON.parse(fs.readFileSync(path.join(kit,'seed.json'),'utf8'));
 // Only agreed reference vocabularies. No people, sessions, reports, fake financial amounts or placeholder curriculum.
 for(const section of ['roles','languages','programmes','exam_part_defs','role_track_defs','rank_defs'])for(const row of refs[section]?.rows||[]){const keys=Object.keys(row);db.prepare(`INSERT OR IGNORE INTO ${section} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`).run(...Object.values(row));}
 return db;
}
export const now=()=>new Date().toISOString();
let transactionSequence=0;
export function transaction(db,fn){const name='operation_'+(++transactionSequence);db.exec('SAVEPOINT '+name);try{const result=fn();if(result?.then)throw Error('Transaction callbacks must be synchronous');db.exec('RELEASE '+name);return result;}catch(e){db.exec('ROLLBACK TO '+name);db.exec('RELEASE '+name);throw e;}}
export function insert(db,table,data){const cols=Object.keys(data);const result=db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`).run(...cols.map(k=>data[k]??null));return Number(result.lastInsertRowid);}
export function update(db,table,id,data){const cols=Object.keys(data);if(!cols.length)return;db.prepare(`UPDATE ${table} SET ${cols.map(k=>`${k}=?`).join(',')} WHERE id=?`).run(...cols.map(k=>data[k]??null),id);}
export function audit(db,user,action,entity,id,reason){insert(db,'operational_audit',{actor_id:user?.id||null,action,entity,entity_id:id==null?null:String(id),reason});}

// Explicit one-time user-requested presentation data; never run at startup.
import {DatabaseSync} from 'node:sqlite';
import {configuration} from '../src/server.mjs';
import {insert,transaction,audit} from '../src/db.mjs';
const db=new DatabaseSync(configuration().database);db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000');
const owner=db.prepare("SELECT u.id FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.role='admin' AND u.state='active' ORDER BY u.id LIMIT 1").get();
if(!owner)throw Error('Create an administrator before adding batches.');
const day=offset=>{const d=new Date();d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);};
try{transaction(db,()=>{
 for(const programme of ['core','induct'])for(const number of [1,2]){
  const name='Batch '+number;
  if(db.prepare('SELECT id FROM batches WHERE programme_code=? AND name=?').get(programme,name))continue;
  const id=insert(db,'batches',{programme_code:programme,name,mode:'both',start_date:day(number*7),end_date:day(number*7+30),seats_in_person:25,seats_online:25,curriculum_label:'Temporary presentation batch — replace schedule and capacity before actual use',created_by:owner.id});
  audit(db,null,'presentation_batch_created','batches',id,'Explicit user request: add temporary Batch 1 and Batch 2 for presentation; schedule and capacity are placeholders.');
 }
});console.log(JSON.stringify(db.prepare('SELECT id,name,programme_code,start_date,end_date,seats_online,seats_in_person FROM batches ORDER BY programme_code,id').all(),null,2));}finally{db.close();}

import crypto from 'node:crypto';
import {audit,insert,now,transaction} from './db.mjs';
import {ensure,choice,requireOps,requireRole,text} from './core.mjs';

const prefix='/api/gyanisays';
const iso=value=>new Date(value).toISOString();
const mapStage=value=>({student:'student','young-executive':'executive',executive:'executive','mid-management':'mid_management','senior-leader':'senior',senior:'senior'})[String(value||'').toLowerCase()]||'cant_say';
const mapReport=value=>({PANCHA_BHUTA:'pancha_bhuta',TRAYI:'trayi'})[String(value||'').toUpperCase()];
const mapReportVersion=value=>({student:'student',executive:'executive','mid-management':'mid_management','senior-leader':'senior',senior:'senior'})[String(value||'').toLowerCase()]||null;

function verify(c,config){
 ensure(config.aarambhGsApiKey&&config.aarambhGsInboundSecret,503,'Aarambh coach integration is not configured','INTEGRATION_PENDING');
 const key=Buffer.from(String(c.headers['x-api-key']||'')),expected=Buffer.from(config.aarambhGsApiKey);
 ensure(key.length===expected.length&&crypto.timingSafeEqual(key,expected),401,'Invalid API key');
 const timestamp=String(c.headers['x-aarambh-timestamp']||''),signature=String(c.headers['x-aarambh-signature']||''),seconds=Number(timestamp);
 ensure(Number.isInteger(seconds)&&Math.abs(Math.floor(Date.now()/1000)-seconds)<=300,401,'Signature timestamp is stale');
 const pathAndQuery=c.url.pathname.slice(prefix.length)+c.url.search;
 const canonical=`${timestamp}.${c.method.toUpperCase()}.${pathAndQuery}.${c.rawBody||''}`;
 const expectedSignature='sha256='+crypto.createHmac('sha256',config.aarambhGsInboundSecret).update(canonical).digest('hex');
 const a=Buffer.from(signature),b=Buffer.from(expectedSignature);
 ensure(a.length===b.length&&crypto.timingSafeEqual(a,b),401,'Invalid request signature');
}

function idempotent(db,c,scope,work){
 const key=c.headers['idempotency-key'];ensure(typeof key==='string'&&/^[\w-]{16,100}$/.test(key),400,'A valid Idempotency-Key is required');
 const requestHash=crypto.createHash('sha256').update(c.rawBody||'').digest('hex');
 const old=db.prepare('SELECT request_hash,response FROM gyanisays_idempotency WHERE scope=? AND key=?').get(scope,key);
 if(old){ensure(old.request_hash===requestHash,409,'Idempotency key reused with different input');return JSON.parse(old.response);}
 const result=work();db.prepare('INSERT INTO gyanisays_idempotency(scope,key,request_hash,response) VALUES(?,?,?,?)').run(scope,key,requestHash,JSON.stringify(result));return result;
}

function coachView(db,coachId,language){
 if(!coachId)return null;
 const coach=db.prepare("SELECT c.id,u.full_name,p.approved_snapshot FROM coaches c JOIN users u ON u.id=c.user_id LEFT JOIN coach_public_cards p ON p.coach_id=c.id AND p.status='approved' WHERE c.id=?").get(coachId);
 if(!coach)return null;
 const languages=db.prepare('SELECT language_code FROM user_languages WHERE user_id=(SELECT user_id FROM coaches WHERE id=?) ORDER BY proficiency').all(coachId).map(x=>x.language_code);
 let card={};try{card=JSON.parse(coach.approved_snapshot||'{}');}catch{}
 return {id:String(coach.id),name:coach.full_name,photoUrl:null,languages:languages.length?languages:[language],bio:card.about||null};
}

function assign(db,row,delivery){
 if(row.coach_id)return row;
 const coach=db.prepare(`SELECT c.id,u.full_name,
      (SELECT count(*) FROM debriefs d WHERE d.coach_id=c.id AND d.scheduled_at>=?) load_count,
      (SELECT count(*) FROM slots s WHERE s.coach_id=c.id AND s.status='open' AND datetime(s.slot_date||' 00:00:00','+'||s.start_minute||' minutes')>=datetime('now','localtime')) slot_count
    FROM coaches c JOIN users u ON u.id=c.user_id JOIN user_languages ul ON ul.user_id=u.id AND ul.language_code=?
   WHERE c.coach_type='ours' AND c.stage='active' AND u.state='active'
     AND EXISTS(SELECT 1 FROM slots s WHERE s.coach_id=c.id AND s.status='open' AND datetime(s.slot_date||' 00:00:00','+'||s.start_minute||' minutes')>=datetime('now','localtime'))
   ORDER BY load_count ASC,slot_count DESC,c.id ASC LIMIT 1`).get(now().slice(0,10),row.language_code);
 if(!coach)return row;
 db.prepare("UPDATE gyanisays_assignments SET coach_id=?,status='coach_assigned' WHERE assignment_id=? AND coach_id IS NULL").run(coach.id,row.assignment_id);
 const assigned=db.prepare('SELECT * FROM gyanisays_assignments WHERE assignment_id=?').get(row.assignment_id);
 if(delivery)delivery.gyaniSaysEvent({type:'coach.assigned',aarambhBriefingId:assigned.briefing_id,assignmentId:assigned.assignment_id,coach:coachView(db,coach.id,row.language_code)});
 return assigned;
}

function view(db,row){return {assignmentId:row.assignment_id,status:row.status,coach:coachView(db,row.coach_id,row.language_code),booking:row.booking_id?bookingView(row):null};}
function slotTime(slot){return new Date(new Date(`${slot.slot_date}T00:00:00+05:30`).getTime()+Number(slot.start_minute)*60000);}
function slotView(slot){const start=slotTime(slot);return {slotId:String(slot.id),start:start.toISOString(),end:new Date(start.getTime()+Number(slot.duration_min)*60000).toISOString()};}
function bookingView(row){return {bookingId:row.booking_id,status:row.status,start:row.start_at?iso(row.start_at):null,end:row.end_at?iso(row.end_at):null,meetLink:row.meet_link||null,coach:null};}
function getAssignment(db,id){const row=db.prepare('SELECT * FROM gyanisays_assignments WHERE assignment_id=?').get(id);ensure(row,404,'Assignment not found');return row;}
function getBooking(db,id){const row=db.prepare('SELECT * FROM gyanisays_assignments WHERE booking_id=?').get(id);ensure(row,404,'Booking not found');return row;}
function queue(delivery,type,row,fields={}){delivery.gyaniSaysEvent({type,aarambhBriefingId:row.briefing_id,assignmentId:row.assignment_id,...(row.booking_id?{bookingId:row.booking_id}:{}),...fields});}
function meetingWhen(value){return new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}
function notifyCoach(db,coachId,kind,debriefId,body){const coach=db.prepare('SELECT user_id FROM coaches WHERE id=?').get(coachId);if(coach)insert(db,'notifications',{user_id:coach.user_id,kind,debrief_id:debriefId,body});}

export function registerGyaniSaysApi(route,db,config,delivery){
 route('PATCH','/api/me/debriefs/:id/meet-link',true,c=>{
  const row=db.prepare('SELECT a.* FROM gyanisays_assignments a JOIN debriefs d ON d.booking_ref=a.booking_id JOIN coaches co ON co.id=d.coach_id WHERE d.id=? AND co.user_id=? AND a.coach_id=co.id').get(c.params.id,c.user.id);
  ensure(row,404,'Assigned booking not found');
  ensure(['confirmed','rescheduled'].includes(row.status),409,'Only upcoming bookings can receive a meeting link');
  const url=text(c.body?.meetLink,'Meeting link',500);let parsed;try{parsed=new URL(url);}catch{}
  const host=parsed?.hostname.toLowerCase()||'';
  const supportedHost=host==='meet.google.com'||host==='zoom.us'||host.endsWith('.zoom.us');
  ensure(parsed?.protocol==='https:'&&supportedHost&&!parsed.username&&!parsed.password&&parsed.pathname!=='/',422,'Enter a valid Google Meet or Zoom meeting link');
  transaction(db,()=>{
   db.prepare('UPDATE gyanisays_assignments SET meet_link=? WHERE assignment_id=?').run(parsed.href,row.assignment_id);
   audit(db,c.user,'coach_meet_link_saved','gyanisays_assignments',row.assignment_id,'Assigned coach saved meeting link');
   queue(delivery,'booking.confirmed',row,{booking:{bookingId:row.booking_id,start:iso(row.start_at),end:iso(row.end_at),meetLink:parsed.href},coach:coachView(db,row.coach_id,row.language_code)});
  });
  return {meetLink:parsed.href,delivery:'queued'};
 });
 const secure=handler=>c=>{verify(c,config);return handler(c);};
 route('GET',prefix,false,()=>({status:'ok',service:'Gyani Says ↔ Aarambh coach API',configured:Boolean(config.aarambhGsUrl&&config.aarambhGsApiKey&&config.aarambhGsInboundSecret&&config.aarambhGsOutboundSecret),authentication:'API key + timestamped HMAC'}));
 route('POST',`${prefix}/assignments`,false,secure(c=>idempotent(db,c,'assignments',()=>{
  const b=c.body,u=b?.user,x=b?.context;ensure(typeof b?.aarambhBriefingId==='string'&&b.aarambhBriefingId.length<=64&&u&&x,422,'Invalid assignment payload');
  const language=text(u.language,'language',10),report=mapReport(x.reportType)||mapReport(x.reportTypes?.[0]);ensure(db.prepare('SELECT code FROM languages WHERE code=?').get(language),422,'Unknown language code');ensure(report,422,'Unsupported report type');
  const existing=db.prepare('SELECT * FROM gyanisays_assignments WHERE briefing_id=?').get(b.aarambhBriefingId);
  if(existing){ensure(existing.person_ref===String(u.aarambhUserId)&&existing.sitting_ref===String(x.sittingId),409,'Briefing already exists with different assessment data');return view(db,assign(db,existing,delivery));}
  const assignmentId=crypto.randomUUID(),stage=mapStage(x.careerStage);
  db.prepare(`INSERT INTO gyanisays_assignments(assignment_id,briefing_id,person_ref,first_name,language_code,sitting_ref,client_type,report_kind,report_version,assessment_completed_at)
    VALUES(?,?,?,?,?,?,?,?,?,?)`).run(assignmentId,b.aarambhBriefingId,String(u.aarambhUserId),text(u.name,'name',60).split(/\s+/)[0],language,String(x.sittingId),stage,report,mapReportVersion(x.careerStage),x.assessmentCompletedAt||null);
  return view(db,assign(db,getAssignment(db,assignmentId),null));
 })));
 route('GET',`${prefix}/assignments/:id`,false,secure(c=>view(db,assign(db,getAssignment(db,c.params.id),delivery))));
 route('GET',`${prefix}/assignments/:id/slots`,false,secure(c=>{
  const row=assign(db,getAssignment(db,c.params.id),delivery);ensure(row.coach_id,409,'Coach assignment is pending','COACH_NOT_ASSIGNED');
  const from=c.url.searchParams.get('from')||new Date().toISOString(),to=c.url.searchParams.get('to')||new Date(Date.now()+14*86400000).toISOString();
  ensure(Number.isFinite(Date.parse(from))&&Number.isFinite(Date.parse(to))&&Date.parse(to)>Date.parse(from),422,'Invalid slot date range');
  const slots=db.prepare("SELECT * FROM slots WHERE coach_id=? AND status='open' ORDER BY slot_date,start_minute").all(row.coach_id).map(slotView).filter(s=>Date.parse(s.start)>=Date.parse(from)&&Date.parse(s.start)<=Date.parse(to));
  return {slots};
 }));
 route('POST',`${prefix}/bookings`,false,secure(c=>idempotent(db,c,'bookings',()=>{
  const {assignmentId,slotId,consentAt}=c.body||{},row=getAssignment(db,String(assignmentId||''));ensure(row.coach_id,409,'Coach assignment is pending');ensure(!row.booking_id,409,'Assignment already has a booking');
  ensure(typeof consentAt==='string'&&Number.isFinite(Date.parse(consentAt))&&Date.parse(consentAt)<=Date.now(),422,'A valid report-sharing consent time is required');
  const slot=db.prepare("SELECT * FROM slots WHERE id=? AND coach_id=? AND status='open'").get(slotId,row.coach_id);ensure(slot,409,'That slot is no longer available','SLOT_TAKEN');
  const start=slotTime(slot);ensure(start.getTime()>Date.now(),409,'That slot is no longer available','SLOT_TAKEN');const end=new Date(start.getTime()+Number(slot.duration_min)*60000),bookingId=crypto.randomUUID();
  const result=transaction(db,()=>{
   const debriefId=insert(db,'debriefs',{booking_ref:bookingId,person_ref:row.person_ref,sitting_ref:row.sitting_ref,first_name:row.first_name,client_type:row.client_type,language_code:row.language_code,report_kind:row.report_kind,report_version:row.report_version,scheduled_at:start.toISOString(),slot_id:slot.id,coach_id:row.coach_id,status:'assigned'});
   db.prepare("UPDATE slots SET status='booked',debrief_id=? WHERE id=? AND status='open'").run(debriefId,slot.id);
   insert(db,'client_share_consents',{debrief_id:debriefId,consented:1,consented_at:iso(consentAt),source:'booking_feed'});
   db.prepare("UPDATE gyanisays_assignments SET booking_id=?,slot_id=?,start_at=?,end_at=?,consent_at=?,status='confirmed' WHERE assignment_id=?").run(bookingId,slot.id,start.toISOString(),end.toISOString(),iso(consentAt),row.assignment_id);
   insert(db,'debrief_status_log',{debrief_id:debriefId,from_status:null,to_status:'assigned',changed_by:null,source:'aarambh',reason:'Booking received through the Gyani Says API'});
   notifyCoach(db,row.coach_id,'new_debrief',debriefId,`${row.first_name} booked a coaching meeting with you for ${meetingWhen(start)}.`);
   return db.prepare('SELECT * FROM gyanisays_assignments WHERE assignment_id=?').get(row.assignment_id);
  });
  queue(delivery,'booking.confirmed',result,{booking:{bookingId,start:start.toISOString(),end:end.toISOString(),meetLink:null},coach:coachView(db,row.coach_id,row.language_code)});
  return {bookingId,status:'confirmed',start:start.toISOString(),end:end.toISOString(),meetLink:null,coach:coachView(db,row.coach_id,row.language_code)};
 })));
 route('POST',`${prefix}/bookings/:id/reschedule`,false,secure(c=>idempotent(db,c,`reschedule:${c.params.id}`,()=>{
  const row=getBooking(db,c.params.id);ensure(['confirmed','rescheduled'].includes(row.status),409,'Only an upcoming booking can be moved');const newSlot=db.prepare("SELECT * FROM slots WHERE id=? AND coach_id=? AND status='open'").get(c.body?.slotId,row.coach_id);ensure(newSlot,409,'That slot is no longer available','SLOT_TAKEN');
  const start=slotTime(newSlot);ensure(start.getTime()>Date.now(),409,'That slot is no longer available','SLOT_TAKEN');const end=new Date(start.getTime()+Number(newSlot.duration_min)*60000);
  transaction(db,()=>{const d=db.prepare('SELECT id FROM debriefs WHERE booking_ref=? LIMIT 1').get(row.booking_id);ensure(d,404,'Booking record not found');if(row.slot_id)db.prepare("UPDATE slots SET status='open',debrief_id=NULL WHERE id=? AND status='booked'").run(row.slot_id);db.prepare("UPDATE slots SET status='booked',debrief_id=? WHERE id=? AND status='open'").run(d.id,newSlot.id);db.prepare("UPDATE debriefs SET slot_id=?,scheduled_at=? WHERE id=?").run(newSlot.id,start.toISOString(),d.id);db.prepare("UPDATE gyanisays_assignments SET slot_id=?,start_at=?,end_at=?,status='rescheduled' WHERE assignment_id=?").run(newSlot.id,start.toISOString(),end.toISOString(),row.assignment_id);notifyCoach(db,row.coach_id,'moved',d.id,`${row.first_name}'s coaching meeting with you has moved to ${meetingWhen(start)}.`);});
  const updated=getBooking(db,row.booking_id);queue(delivery,'booking.rescheduled',updated,{by:'user',newStart:start.toISOString(),newEnd:end.toISOString(),booking:{bookingId:row.booking_id,start:start.toISOString(),end:end.toISOString(),meetLink:row.meet_link||null}});
  return {bookingId:row.booking_id,status:'rescheduled',start:start.toISOString(),end:end.toISOString(),meetLink:row.meet_link||null,coach:coachView(db,row.coach_id,row.language_code)};
 })));
 route('GET',`${prefix}/bookings/:id`,false,secure(c=>{const row=getBooking(db,c.params.id);return {...bookingView(row),coach:coachView(db,row.coach_id,row.language_code)};}));
 route('POST',`${prefix}/requests`,false,secure(c=>idempotent(db,c,'requests',()=>{
  const row=getAssignment(db,String(c.body?.assignmentId||'')),kind=choice(c.body?.type,'request type',['change_time','different_coach','no_slot_fits','coach_not_joined','problem']);
  const bookingId=c.body?.bookingId?String(c.body.bookingId):null;ensure(!bookingId||bookingId===row.booking_id,404,'Booking does not belong to this assignment');
  const requestId=crypto.randomUUID();insert(db,'gyanisays_requests',{request_id:requestId,assignment_id:row.assignment_id,booking_id:bookingId,kind,message:c.body?.message?text(c.body.message,'message',500):null});
  return {requestId,status:'open'};
 })));
 route('GET','/api/admin/gyanisays/assignments',true,c=>{requireOps(c.user);return {items:db.prepare('SELECT a.*,c.user_id coach_user_id,u.full_name coach_name FROM gyanisays_assignments a LEFT JOIN coaches c ON c.id=a.coach_id LEFT JOIN users u ON u.id=c.user_id ORDER BY a.created_at DESC LIMIT 500').all()};});
 route('GET','/api/admin/gyanisays/requests',true,c=>{requireOps(c.user);return {items:db.prepare('SELECT * FROM gyanisays_requests ORDER BY created_at DESC LIMIT 500').all()};});
 route('PATCH','/api/admin/gyanisays/requests/:id',true,c=>{requireRole(c.user,['admin']);const item=db.prepare('SELECT * FROM gyanisays_requests WHERE request_id=?').get(c.params.id);ensure(item,404,'Request not found');ensure(item.status==='open',409,'Request is already resolved');const status=choice(c.body?.status,'status',['resolved','declined']),resolution=text(c.body?.resolution,'resolution',500);db.prepare('UPDATE gyanisays_requests SET status=?,resolution=?,updated_at=? WHERE request_id=?').run(status,resolution,now(),item.request_id);const row=db.prepare('SELECT * FROM gyanisays_assignments WHERE assignment_id=?').get(item.assignment_id);queue(delivery,'request.updated',row,{requestId:item.request_id,status,resolution});audit(db,c.user,'gyanisays_request_'+status,'gyanisays_requests',item.request_id,resolution);return {requestId:item.request_id,status,resolution};});
 route('PATCH','/api/admin/gyanisays/bookings/:id/meet-link',true,c=>{requireRole(c.user,['admin']);const row=getBooking(db,c.params.id),url=text(c.body?.meetLink,'Meeting link',500);let parsed;try{parsed=new URL(url);}catch{}const host=parsed?.hostname.toLowerCase()||'';ensure(parsed?.protocol==='https:'&&(host==='meet.google.com'||host==='zoom.us'||host.endsWith('.zoom.us'))&&!parsed.username&&!parsed.password&&parsed.pathname!=='/',422,'Enter a valid Google Meet or Zoom meeting link');db.prepare('UPDATE gyanisays_assignments SET meet_link=? WHERE booking_id=?').run(parsed.href,row.booking_id);audit(db,c.user,'gyanisays_meet_link_added','gyanisays_assignments',row.assignment_id,'Meeting link added by admin');queue(delivery,'booking.confirmed',row,{booking:{bookingId:row.booking_id,start:iso(row.start_at),end:iso(row.end_at),meetLink:parsed.href},coach:coachView(db,row.coach_id,row.language_code)});return {bookingId:row.booking_id,meetLink:parsed.href};});
 return {processPendingAssignments(){
  const rows=db.prepare("SELECT * FROM gyanisays_assignments WHERE status='pending_assignment' AND coach_id IS NULL ORDER BY created_at LIMIT 10").all();
  for(const row of rows)assign(db,row,delivery);
 },processMeetingReminders(){
  for(const leadMinutes of [1440,60]){
   const lower=new Date(Date.now()+(leadMinutes-5)*60000).toISOString(),upper=new Date(Date.now()+leadMinutes*60000).toISOString();
   const rows=db.prepare("SELECT a.*,d.id debrief_id FROM gyanisays_assignments a JOIN coaches c ON c.id=a.coach_id LEFT JOIN debriefs d ON d.booking_ref=a.booking_id WHERE a.status IN ('confirmed','rescheduled') AND a.booking_id IS NOT NULL AND a.start_at>? AND a.start_at<=? ORDER BY a.start_at LIMIT 100").all(lower,upper);
   for(const row of rows)transaction(db,()=>{
    const claimed=db.prepare('INSERT OR IGNORE INTO gyanisays_reminder_log(booking_id,start_at,lead_minutes) VALUES(?,?,?)').run(row.booking_id,row.start_at,leadMinutes);
    if(!claimed.changes)return;
    const when=meetingWhen(row.start_at),period=leadMinutes===1440?'tomorrow':'in about an hour';
    notifyCoach(db,row.coach_id,'new_debrief',row.debrief_id,`Reminder: your coaching meeting with ${row.first_name} is ${period} (${when}). Open My debriefs for the briefing and meeting link.`);
    delivery.gyaniSaysEvent({type:'booking.reminder',aarambhBriefingId:row.briefing_id,assignmentId:row.assignment_id,bookingId:row.booking_id,leadMinutes,booking:{bookingId:row.booking_id,start:iso(row.start_at),end:iso(row.end_at),meetLink:row.meet_link||null}});
   });
  }
 }};
}

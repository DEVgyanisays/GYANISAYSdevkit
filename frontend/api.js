/* =========================================================================
   api.js — THE SEAM  ·  Saarthi by Gyani Says (SETU coach app + Saarthi training)
   -------------------------------------------------------------------------
   The ONLY front-end file the developer edits. app.js (the frozen UI) reaches
   storage and Aarambh only through the functions below.

   1 · STORAGE — load() / save()
       Prototype: the whole state object S in this browser's localStorage.
       Production: load() -> GET /api/bootstrap (S, filtered to the caller's role
       and scope by the server); save() -> the matching POST/PATCH for what changed
       (see ../API_CONTRACT.md). Keep S as the in-memory cache; app.js is unchanged.

   2 · AARAMBH — listRig() / fromRig()
       Prototype: reads Aarambh's laptop test rig (setu.php, payload v1.2) at AAR.
       Production: there is NO file and NO browser call to Aarambh. Saarthi's server
       pulls the reading from Aarambh's API when a debrief is assigned (handshake H3
       in ../API_CONTRACT.md) and the front-end gets it with
       GET /api/debriefs/:id/reading. Swap the bodies; keep the names.

   The stores and helpers referenced here (seed, seedSlots, KEY, OLDKEY, SEEDV,
   REVIEWED_V01, OLD2NEW, $, esc, useReading) live in app.js and share the same
   global scope (classic scripts; api.js loads first). Do not redeclare them.
   ========================================================================= */

/* ---- 1 · storage ---- */
let S;
function load(){
 let old=null;
 try{const r=localStorage.getItem(KEY);if(r){const p=JSON.parse(r);if(p.seedv===SEEDV){S=p;return;}old=p;}}catch(e){}
 S=seed();seedSlots(S);
 REVIEWED_V01.forEach(c=>S.ui.reviewed[c]=true);
 if(old&&old.ui){S.ui.reviewed=Object.assign(S.ui.reviewed,old.ui.reviewed||{});S.ui.ack=Object.assign({},old.ui.ack||{});save();}
 try{const o=JSON.parse(localStorage.getItem(OLDKEY)||'null');if(o&&o.ui&&o.ui.reviewed)Object.keys(o.ui.reviewed).forEach(k=>{if(o.ui.reviewed[k]&&OLD2NEW[k])S.ui.reviewed[OLD2NEW[k]]=true;});}catch(e){}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

/* ---- 2 · Aarambh (prototype: the laptop rig; production: via Saarthi's server) ---- */
const AAR='http://127.0.0.1:8910';
function listRig(){const sel=$('rdsit');if(!sel)return;
 fetch(AAR+'/setu.php').then(r=>r.json()).then(j=>{const L=j.sittings||[];
  sel.innerHTML=L.length?L.map(x=>`<option value="${esc(x.sittingId)}">${esc(x.label)} · sitting ${esc(x.sittingId)} · ${esc(x.sittingType)}${x.imported?' · from the live system':''}</option>`).join(''):'<option value="">No completed sittings in the rig</option>';})
 .catch(()=>{sel.innerHTML='<option value="">The Aarambh rig is not running — start it, then open this again</option>';});}
function fromRig(){const id=$('rdsit')&&$('rdsit').value;if(!id){toast('Pick a sitting first');return;}
 fetch(AAR+'/setu.php?sitting='+encodeURIComponent(id)).then(r=>r.text()).then(t=>{$('rdtext').value=t;useReading();})
 .catch(()=>{$('rdout').innerHTML='<div class="note stop small">Could not reach the Aarambh rig at '+AAR+'.</div>';});}

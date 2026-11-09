import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createApplication} from '../src/server.mjs';
import {getCountry,getState,validateLocation} from '../src/locations.mjs';
test('location hierarchy validates membership and supports unlisted towns',()=>{
 const india=getCountry('IN'),mh=india.states.find(s=>s.name==='Maharashtra'),pune=mh.cities.find(c=>c.name==='Pune');
 const value={country_code:'IN',region_id:mh.id,city_id:pune.id};
 assert.deepEqual(validateLocation(value),{country_code:'IN',country:'India',region_id:mh.id,region:'Maharashtra',city_id:pune.id,city:'Pune'});
 assert.throws(()=>validateLocation({...value,country_code:'US'}),/does not belong/);
 assert.throws(()=>validateLocation({...value,city_id:'invalid'}),/does not belong/);
 assert.throws(()=>validateLocation({...value,city_id:'other',city_other:' '}),/city/);
 assert.equal(validateLocation({...value,city_id:'other',city_other:'Small town'}).city,'Small town');
 assert.equal(getState(getCountry('VA'),'none').id,'none');
 assert.throws(()=>getState(india,'none'),/Select a state/);
});
test('public location APIs and application database store canonical names',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saarthi-location-'));
 const config={database:path.join(dir,'test.sqlite'),dataDir:dir,port:0,test:true};
 const app=createApplication(config);const address=await app.start(),base=`http://127.0.0.1:${address.port}`;
 try{
  const read=async p=>{const r=await fetch(base+p);assert.equal(r.status,200);return r.json();};
  assert.equal((await read('/api/public/locations/countries')).items.length,250);
  const states=await read('/api/public/locations/IN/states');assert.equal(states.items.length,36);
  const mh=states.items.find(s=>s.name==='Maharashtra');
  const cities=await read(`/api/public/locations/IN/${mh.id}/cities`),pune=cities.items.find(c=>c.name==='Pune');assert.ok(pune);
  assert.equal((await fetch(base+`/api/public/locations/US/${mh.id}/cities`)).status,422);
  const data={applying_as:'coach',full_name:'Location Test',email:'location@example.test',country_code:'IN',region_id:mh.id,city_id:pune.id,city:'Forged city',country:'Forged country',attend_mode:'online',start_window:'Next month',languages:[{language_code:'en',proficiency:'primary'},{language_code:'hi',proficiency:'secondary'},{language_code:'pa',proficiency:'other'}],consent_given:true,consent_text_version:'1'};
  const response=await fetch(base+'/api/public/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(response.status,201,await response.text());
  const savedLanguages=app.db.prepare('SELECT language_code,proficiency FROM application_languages ORDER BY language_code').all();assert.equal(savedLanguages.length,3);assert.equal(savedLanguages.find(l=>l.language_code==='pa').proficiency,'other');
  for(const languages of [[{language_code:'en',proficiency:'primary'},{language_code:'en',proficiency:'other'}],[{language_code:'en',proficiency:'secondary'}],[{language_code:'en',proficiency:'primary'},{language_code:'hi',proficiency:'primary'}]]){const invalid=await fetch(base+'/api/public/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,languages})});assert.equal(invalid.status,422);}
  const row=app.db.prepare('SELECT country,region,city,state FROM applications').get();assert.equal(row.country,'India');assert.equal(row.region,'Maharashtra');assert.equal(row.city,'Pune');assert.equal(row.state,'new');
  await app.close();const again=createApplication(config);assert.equal(again.db.prepare('SELECT city FROM applications').get().city,'Pune');again.db.close();
 }finally{if(app.server.listening)await app.close();fs.rmSync(dir,{recursive:true,force:true});}
});

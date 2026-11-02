export async function request(url, method='GET', body, extraHeaders={}) {
  const response=await fetch(url,{method,headers:{'Content-Type':'application/json','X-Requested-With':'GyaniSays',...extraHeaders},body:body===undefined?undefined:JSON.stringify(body)});
  const result=await response.json().catch(()=>({error:'Unexpected response. Reload and try again.'}));
  if(!response.ok)throw Error(response.status===401?'Organiser login required. Reload this page to sign in.':result.error||'Request failed');
  return result;
}
export const adminApi=(path,method,body)=>request('/admin/event/api/'+path,method,body);
export const AGES=['Under 40','40–50','50–60','60–70','70+'];
export const DEPARTMENTS=['General Surgery','Orthopaedics','Cardiothoracic Surgery','Neurosurgery','Urology','ENT','Ophthalmology','Obstetrics & Gynaecology','Internal Medicine','Cardiology','Neurology','Gastroenterology','Nephrology','Pulmonology','Oncology','Paediatrics','Dermatology','Psychiatry','Anaesthesiology','Emergency Medicine','Radiology','Pathology / Lab','Administration'];
export const TEAMS=['Red','Blue','Green','Yellow'];
export const eventDate='2026-11-15';
export function attendees(rows){return rows.flatMap(r=>[{kind:'Consultants',food:r.food_pref,age:r.age_group,alcohol:r.consumes_alcohol,medical:r.medical,team:r.team},...(r.spouse?[{kind:'Spouses',food:r.spouse.food_pref,age:r.spouse.age_group,alcohol:r.spouse.consumes_alcohol,medical:r.spouse.medical,team:r.team}]:[]),...r.kids.map(k=>({kind:'Children',food:k.food,age:k.age_band,medical:k.note,team:r.team}))]);}

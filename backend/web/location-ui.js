export async function bindLocationFields(form,api){
 const country=form.elements.country_code,state=form.elements.region_id,city=form.elements.city_id,other=form.elements.city_other;
 const status=form.querySelector('[data-location-status]'),retry=form.querySelector('[data-location-retry]');
 let countryVersion=0,stateVersion=0,retryAction;
 const fill=(el,items,label)=>{el.replaceChildren(new Option(label,''),...items.map(x=>new Option(x.name,x.id)));el.disabled=!items.length;};
 const resetOther=()=>{other.value='';other.required=false;other.disabled=true;other.parentElement.hidden=true;};
 const failed=(err,action)=>{status.textContent='Location list could not load. '+err.message;retry.hidden=false;retryAction=action;};
 const ready=message=>{status.textContent=message;retry.hidden=true;};
 retry.onclick=()=>retryAction?.();
 city.onchange=()=>{resetOther();if(city.value==='other'){other.parentElement.hidden=false;other.required=true;other.disabled=false;other.focus();}};
 state.onchange=async()=>{const version=++stateVersion,selected=state.value,parent=country.value;fill(city,[],'Choose a state first');resetOther();if(!selected)return;ready('Loading cities…');
  try{const r=await api(`/api/public/locations/${encodeURIComponent(parent)}/${encodeURIComponent(selected)}/cities`);if(version!==stateVersion||parent!==country.value)return;fill(city,[...r.items,{id:'other',name:'City not listed — enter manually'}],'Select city / town');ready(`${r.items.length} cities / towns available. You can type a name while the dropdown is focused.`);}catch(e){if(version===stateVersion)failed(e,state.onchange);}
 };
 country.onchange=async()=>{const version=++countryVersion,selected=country.value;++stateVersion;fill(state,[],'Choose a country first');fill(city,[],'Choose a state first');resetOther();if(!selected){ready('Choose a country to begin.');return;}ready('Loading states / regions…');
  try{const r=await api(`/api/public/locations/${encodeURIComponent(selected)}/states`);if(version!==countryVersion)return;fill(state,r.items,'Select state / region');ready('Choose your state / region.');if(r.items.length===1&&r.items[0].id==='none'){state.value='none';await state.onchange();}}catch(e){if(version===countryVersion)failed(e,country.onchange);}
 };
 const load=async()=>{fill(country,[],'Loading countries…');fill(state,[],'Choose a country first');fill(city,[],'Choose a state first');resetOther();try{const r=await api('/api/public/locations/countries');fill(country,r.items,'Select country');ready('Choose a country to begin.');}catch(e){failed(e,load);}};
 await load();
}

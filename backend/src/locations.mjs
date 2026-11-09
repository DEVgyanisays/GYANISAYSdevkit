import fs from 'node:fs';
import {ensure,text} from './core.mjs';
const world=JSON.parse(fs.readFileSync(new URL('./locations-data/world.json',import.meta.url),'utf8'));
const countries=new Map(world.map(c=>[c.id,c]));
const brief=rows=>rows.map(({id,name})=>({id,name}));
export function getCountry(id){const c=countries.get(id);ensure(c,422,'Select a valid country');return c;}
export function getState(country,id){if(id==='none'){ensure(!country.states.length||country.cities.length,422,'Select a state / region');return {id:'none',name:'Not applicable / unassigned',cities:country.cities};}const s=country.states.find(s=>s.id===id);ensure(s,422,'State / region does not belong to the selected country');return s;}
export function validateLocation(b){const c=getCountry(b.country_code),s=getState(c,b.region_id);let city;
 if(b.city_id==='other')city=text(b.city_other,'city / town',120);
 else{city=s.cities.find(x=>x.id===b.city_id)?.name;ensure(city,422,'City does not belong to the selected state / region');}
 return {country_code:c.id,country:c.name,region_id:s.id,region:s.name,city_id:b.city_id==='other'?null:b.city_id,city};
}
export function registerLocations(route){
 route('GET','/api/public/locations/countries',false,()=>({items:brief(world)}));
 route('GET','/api/public/locations/:country/states',false,c=>{const country=getCountry(c.params.country);return {items:[...brief(country.states),...(!country.states.length||country.cities.length?[{id:'none',name:'Not applicable / unassigned'}]:[])]};});
 route('GET','/api/public/locations/:country/:region/cities',false,c=>({items:brief(getState(getCountry(c.params.country),c.params.region).cities)}));
 // Attribution and a machine-readable copy of the derived database are public.
 route('GET','/api/public/locations/dataset',false,()=>world);
 route('GET','/api/public/locations/license',false,()=>({source:'https://github.com/dr5hn/countries-states-cities-database',license:fs.readFileSync(new URL('./locations-data/LICENSE.txt',import.meta.url),'utf8')}));
}

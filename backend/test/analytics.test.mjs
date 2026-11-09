import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('../web/analytics.js',import.meta.url),'utf8');
function environment(choice=null,gpc=false){
 const store=new Map(),scripts=[],events={};let panel=null,reloads=0;
 if(choice)store.set('saarthi.analytics-consent.v1',JSON.stringify({choice,expires:Date.now()+100000}));
 const buttons=['denied','granted'].map(choice=>({dataset:{choice}}));
 const context={Date,JSON,encodeURIComponent,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},navigator:{globalPrivacyControl:gpc},location:{hostname:'saarthi.example.com',reload:()=>reloads++},document:{cookie:'_ga=test',getElementById:()=>({textContent:JSON.stringify({id:'G-ABC1234567',page:'https://saarthi.example.com/about',title:'About Saarthi'})}),querySelector:()=>panel,querySelectorAll:()=>[],createElement:tag=>tag==='script'?{}:{setAttribute(){},querySelectorAll:()=>buttons,remove:()=>{panel=null;}},head:{append:s=>scripts.push(s)},body:{append:p=>{panel=p;}}},window:{addEventListener:(name,fn)=>events[name]=fn}};
 vm.runInNewContext(code,context);return {context,scripts,buttons,get panel(){return panel;},get reloads(){return reloads;}};
}
test('basic analytics consent prevents any tag download before opt-in',()=>{const e=environment();assert.equal(e.scripts.length,0);assert.ok(e.panel);e.buttons[1].onclick();assert.equal(e.scripts.length,1);const calls=e.context.window.dataLayer.map(x=>Array.from(x));assert.equal(calls[0][1],'default');assert.equal(calls[0][2].analytics_storage,'denied');assert.equal(calls[1][2].analytics_storage,'granted');assert.equal(calls[1][2].ad_storage,'denied');assert.equal(calls.find(x=>x[0]==='config')[2].send_page_view,false);assert.equal(calls.find(x=>x[0]==='event')[2].page_referrer,'');});
test('declining or browser privacy signals never load the tag',()=>{const e=environment();e.buttons[0].onclick();assert.equal(e.scripts.length,0);assert.equal(environment('denied').scripts.length,0);assert.equal(environment('granted',true).scripts.length,0);});
test('withdrawing consent disables collection and reloads without retaining accessible GA cookies',()=>{const e=environment();e.buttons[1].onclick();e.buttons[0].onclick();assert.equal(e.context.window['ga-disable-G-ABC1234567'],true);assert.equal(e.reloads,1);assert.match(e.context.document.cookie,/Max-Age=0/);});

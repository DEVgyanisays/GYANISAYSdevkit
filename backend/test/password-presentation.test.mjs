import test from 'node:test';
import assert from 'node:assert/strict';
import {localInvitationsAllowed} from '../src/local-invitations.mjs';
import {bindPasswordToggles} from '../web/password-ui.js';

test('manual activation is disabled outside non-production loopback installs',()=>{
 assert.equal(localInvitationsAllowed({production:false,publicUrl:'http://127.0.0.1:4174'}),true);
 assert.equal(localInvitationsAllowed({production:true,publicUrl:'http://localhost:4174'}),false);
 assert.equal(localInvitationsAllowed({production:false,publicUrl:'https://example.com'}),false);
});

test('password toggle switches visibility without changing value or submitting',()=>{
 const elements=[];const input={type:'password',id:'',value:'unchanged'};
 const label={textContent:'Password',parentElement:{classList:{contains:()=>false}},before:()=>{}};
 input.closest=()=>label;
 const old=globalThis.document;
 globalThis.document={createElement:()=>{const e={attrs:{},setAttribute(k,v){this.attrs[k]=v;},append(){}};elements.push(e);return e;}};
 try{bindPasswordToggles({querySelectorAll:()=>[input]});const button=elements[1];assert.equal(button.type,'button');button.onclick();assert.equal(input.type,'text');assert.equal(button.attrs['aria-pressed'],'true');button.onclick();assert.equal(input.type,'password');assert.equal(input.value,'unchanged');assert.equal(button.textContent,'Show');}finally{globalThis.document=old;}
});

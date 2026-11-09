import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApplication} from '../src/server.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saarthi-live-rag-'));
const app=createApplication({database:path.join(dir,'test.sqlite'),dataDir:dir,test:true,port:0});
try{
 const started=Date.now();
 const result=await app.assistant.answer({id:0,roles:['admin']},'How do I accept an application and enrol the applicant into a batch?');
 assert.equal(result.mode,'local_rag',JSON.stringify(result));assert.ok(result.sources.length>0);assert.ok(result.answer.length>20);
 console.log(JSON.stringify({mode:result.mode,model:result.model,elapsed_ms:Date.now()-started,answer:result.answer,citations:result.sources.map(s=>({id:s.citation,title:s.title}))},null,2));
}finally{app.db.close();fs.rmSync(dir,{recursive:true,force:true});}

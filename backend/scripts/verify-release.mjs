import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const {release}=JSON.parse(fs.readFileSync(path.join(root,'build','latest.json'),'utf8'));
assert.ok(path.resolve(release).startsWith(path.join(root,'build')+path.sep));
const {createApplication}=await import(pathToFileURL(path.join(release,'backend','src','server.mjs')).href);
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'saarthi-release-'));
const app=createApplication({database:path.join(directory,'test.sqlite'),dataDir:directory,production:true,publicUrl:'https://release-check.example',searchIndexing:true,setupToken:'isolated-release-verification-token',test:true,port:0,gaMeasurementId:'',searchVerification:''});
try{
 const address=await app.start(),base=`http://127.0.0.1:${address.port}`;
 const about=await fetch(base+'/about');assert.equal(about.status,200);assert.match(await about.text(),/Good guidance starts with you/);assert.equal(about.headers.get('x-robots-tag'),null);
 const sitemap=await (await fetch(base+'/sitemap.xml')).text();assert.match(sitemap,/https:\/\/release-check.example\/about/);assert.ok(!sitemap.includes('/workspace/'));
 assert.equal((await fetch(base+'/api/admin/people')).status,401);assert.equal((await fetch(base+'/not-found')).status,404);assert.equal((await fetch(base+'/.env')).status,404);assert.equal((await fetch(base+'/media/gyani_mark_TRANSPARENT.webp')).status,200);
 const asset=await fetch(base+'/production.js'),etag=asset.headers.get('etag');assert.ok(etag);assert.equal((await fetch(base+'/production.js',{headers:{'If-None-Match':etag}})).status,304);
 assert.equal(app.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
 console.log(JSON.stringify({release,production_configuration_smoke:'passed',actual_hosting_deployment:false},null,2));
}finally{await app.close();fs.rmSync(directory,{recursive:true,force:true});}

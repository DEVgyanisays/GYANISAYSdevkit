import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createPublicSite,validatePublicConfiguration} from '../src/public-site.mjs';
import {publicPages,appPaths} from '../web/page-manifest.js';
const root=fileURLToPath(new URL('../',import.meta.url)),kit=path.resolve(root,'..');
// Versioned release folders avoid deleting or replacing any existing deployment/data.
const output=path.join(root,'build','release-'+new Date().toISOString().replace(/[:.]/g,'-'));
const copy=(from,to)=>{fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);};
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
for(const directory of ['src','web','knowledge'])for(const file of files(path.join(root,directory))){
 if(/\.(m?js)$/.test(file)){const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(check.status!==0)throw Error(check.stderr);}
 copy(file,path.join(output,'backend',path.relative(root,file)));
}
copy(path.join(kit,'schema.sql'),path.join(output,'schema.sql'));
const refs=JSON.parse(fs.readFileSync(path.join(kit,'seed.json'),'utf8'));
fs.writeFileSync(path.join(output,'seed.json'),JSON.stringify(Object.fromEntries(['roles','languages','programmes','exam_part_defs','role_track_defs','rank_defs'].map(key=>[key,refs[key]])),null,2));
for(const name of ['Start Saarthi.cmd','TEAM_TESTING.md'])copy(path.join(kit,name),path.join(output,name));
for(const name of ['index.html','entry.js'])copy(path.join(kit,'frontend',name),path.join(output,'frontend',name));
fs.writeFileSync(path.join(output,'frontend','connection.js'),'// Run Start Saarthi.cmd to configure this local installation.\n');
copy(path.join(root,'scripts','open-workspace.mjs'),path.join(output,'backend','scripts','open-workspace.mjs'));
if(process.platform!=='win32'||process.arch!=='x64')throw Error('Build the Windows x64 team package using Windows x64 Node.');
copy(process.execPath,path.join(output,'runtime','node.exe'));
if(process.version!=='v24.12.0')throw Error('Update NODE-LICENSE.txt for the runtime version before packaging.');
copy(path.join(root,'scripts','NODE-LICENSE.txt'),path.join(output,'runtime','LICENSE.txt'));
for(const name of ['styles.css','ui-refresh.css','workspace-access.css'])copy(path.join(kit,'frontend',name),path.join(output,'frontend',name));
for(const file of files(path.join(kit,'frontend','assets')))copy(file,path.join(output,'frontend',path.relative(path.join(kit,'frontend'),file)));
for(const name of ['README.md','IMPLEMENTATION_STATUS.md','LAUNCH_AUDIT.md','.env.example','.gitignore'])copy(path.join(root,name),path.join(output,'backend',name));
copy(path.join(root,'scripts','test-rag-live.mjs'),path.join(output,'backend','scripts','test-rag-live.mjs'));
const packageInfo=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));packageInfo.scripts={start:packageInfo.scripts.start,backup:packageInfo.scripts.backup,'test:rag-live':packageInfo.scripts['test:rag-live']};fs.writeFileSync(path.join(output,'backend','package.json'),JSON.stringify(packageInfo,null,2));
const config={publicUrl:'https://build-validation.example',production:true,searchIndexing:true,gaMeasurementId:'',searchVerification:''};validatePublicConfiguration(config);const site=createPublicSite(config);
const report={kind:'Node server release; SSR occurs at request time',publicPages:Object.keys(publicPages),privateRoutes:appPaths.length,files:[]};
for(const p of [...Object.keys(publicPages),...appPaths]){const html=site.render(p,'build-check',{token:'build-check'});if((html.match(/<h1[ >]/g)||[]).length!==1)throw Error('Expected one H1: '+p);if((html.match(/<title>/g)||[]).length!==1)throw Error('Duplicate/missing title: '+p);for(const [,href] of html.matchAll(/href="(\/[^"?#]*)/g)){if(!site.isPage(href)&&!fs.existsSync(path.join(output,'backend','web',href.slice(1)))&&!fs.existsSync(path.join(output,'frontend',href.slice(1))))throw Error('Broken internal link: '+href);}}
for(const name of ['gyani_mark_TRANSPARENT','saarthi_mark_v1','saarthi_wordmark_v1'])if(!fs.existsSync(path.join(output,'backend','web','media',name+'.webp')))throw Error('Generate optimised images first');
for(const file of files(output))report.files.push({path:path.relative(output,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});
if(report.files.some(f=>/(^|\/)(data|backups|\.env)(\/|$)/.test(f.path)))throw Error('Private runtime data must not enter a release');
fs.writeFileSync(path.join(output,'build-report.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(root,'build','latest.json'),JSON.stringify({release:output},null,2));
console.log(`Production release prepared: ${output}\n${report.files.length} allowlisted files; no runtime database, passwords or .env included.`);

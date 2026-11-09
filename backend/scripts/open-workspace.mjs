import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {configuration} from '../src/server.mjs';
import {digest} from '../src/core.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const config=configuration(), identity=digest(root);
let origin=new URL(config.publicUrl);
if(origin.protocol!=='http:'||!['localhost','127.0.0.1'].includes(origin.hostname)||origin.pathname!=='/'||origin.username||origin.password||origin.search||origin.hash)throw Error('This launcher supports local HTTP installations only.');
const stateFile=path.join(root,'logs','launcher.json');
try{const saved=JSON.parse(fs.readFileSync(stateFile,'utf8'));if(saved.identity===identity&&/^http:\/\/127\.0\.0\.1:\d+$/.test(saved.origin))origin=new URL(saved.origin);}catch{}
async function running(){try{const r=await fetch(new URL('/api/health',origin),{signal:AbortSignal.timeout(1200)});const h=await r.json();return r.ok&&h.instance_id===identity&&h.database===true;}catch{return false;}}
async function freePort(preferred){return await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',error=>error.code==='EADDRINUSE'?freePort(0).then(resolve,reject):reject(error));s.listen(preferred,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});}
if(!await running()){
 const port=await freePort(Number(origin.port)||4174);origin=new URL(`http://127.0.0.1:${port}`);
 fs.mkdirSync(path.dirname(stateFile),{recursive:true});
 const output=fs.openSync(path.join(root,'logs','server.log'),'a');
 const child=spawn(process.execPath,['--env-file-if-exists=.env','src/server.mjs'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),PUBLIC_URL:origin.origin},detached:true,windowsHide:true,stdio:['ignore',output,output]});
 child.on('error',error=>{console.error(error.message);process.exitCode=1;});child.unref();fs.closeSync(output);
 let ready=false;for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,500));if(await running()){ready=true;break;}}
 if(!ready)throw Error('Could not start Saarthi. Check backend/logs/server.log. Node.js 24+ is required.');
 fs.writeFileSync(stateFile,JSON.stringify({identity,origin:origin.origin,pid:child.pid}));
}
const entry=path.resolve(root,'../frontend/index.html');
fs.writeFileSync(path.join(path.dirname(entry),'connection.js'),`window.saarthiConnection=${JSON.stringify({url:new URL('/frontend/index.html',origin).href})};\n`);
console.log(`Saarthi: ${origin.origin}/frontend/index.html\nEntry: ${entry}\nDatabase: ${config.database}`);
if(!process.argv.includes('--check')){const child=spawn('explorer.exe',[pathToFileURL(entry).href],{detached:true,windowsHide:true,stdio:'ignore'});child.on('error',()=>console.log('Open frontend/index.html in your browser.'));child.unref();}

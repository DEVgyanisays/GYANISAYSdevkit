// Local preview only. Production uses index.js and the configured services.
import { createApp } from './app.js';
import { openEventStore } from './event/store.js';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const password=randomBytes(12).toString('hex');
const eventDb=openEventStore(fileURLToPath(new URL('../data/preview-events.sqlite',import.meta.url)));
const unavailable=async()=>{throw Error('Website lead services are not configured in event preview');};
const app=createApp({eventDb,db:{query:unavailable,execute:unavailable},mailer:{sendMail:unavailable},config:{adminUser:'preview',adminPass:password}});
const server=app.listen(3080,'127.0.0.1',()=>console.log(`Local preview: http://127.0.0.1:3080/application/\nAdmin: http://127.0.0.1:3080/admin/event/\nTemporary admin user: preview\nTemporary admin password: ${password}\nPreview data is separate from production.`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{eventDb.close();process.exit(0);}));

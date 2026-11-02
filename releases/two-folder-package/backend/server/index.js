import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import { createApp } from './app.js';
import { openEventStore } from './event/store.js';
import { fileURLToPath } from 'node:url';

const env = process.env;
const publicSiteUrl = env.GYS_PUBLIC_SITE_URL;
for (const name of ['GYS_DB_NAME', 'GYS_DB_USER', 'GYS_DB_PASS', 'GYS_SMTP_HOST', 'GYS_SMTP_USER', 'GYS_SMTP_PASS', 'GYS_SMTP_FROM', 'GYS_ADMIN_USER', 'GYS_ADMIN_PASS']) {
  if (!env[name] || env[name] === 'CHANGE_ME') throw new Error(`Configure ${name} in .env before starting`);
}
const db = mysql.createPool({ host: env.GYS_DB_HOST || 'localhost', port: Number(env.GYS_DB_PORT || 3306), user: env.GYS_DB_USER, password: env.GYS_DB_PASS, database: env.GYS_DB_NAME, charset: 'utf8mb4', dateStrings: true, connectionLimit: 10 });
const mailer = nodemailer.createTransport({ host: env.GYS_SMTP_HOST, port: Number(env.GYS_SMTP_PORT || 587), secure: env.GYS_SMTP_SECURE === 'ssl', requireTLS: env.GYS_SMTP_SECURE !== 'ssl', auth: { user: env.GYS_SMTP_USER, pass: env.GYS_SMTP_PASS }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000 });
await db.query('SELECT 1');
const eventDb = openEventStore(env.GYS_EVENT_DB || fileURLToPath(new URL('../data/events.sqlite', import.meta.url)));
const app = createApp({ db, mailer, eventDb, config: { publicSiteUrl, from: env.GYS_SMTP_FROM, fromName: env.GYS_SMTP_FROM_NAME || 'GyaniSays', mailTo: env.GYS_MAIL_TO || 'mandeep.sodhi@gyanisays.com', adminUser: env.GYS_ADMIN_USER, adminPass: env.GYS_ADMIN_PASS, trustProxy: env.TRUST_PROXY && env.TRUST_PROXY !== 'false' ? env.TRUST_PROXY : false } });
const server = app.listen(Number(env.PORT || 3000), env.HOST || '127.0.0.1', () => console.log(`Gyani Says running on ${env.HOST || '127.0.0.1'}:${env.PORT || 3000}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { mailer.close(); await db.end(); eventDb.close(); process.exit(0); }));

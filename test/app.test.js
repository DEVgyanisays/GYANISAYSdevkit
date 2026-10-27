import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createApp } from '../server/app.js';

async function fixture(t, options = {}) {
  const calls = [], mails = [];
  const db = {
    async execute(sql, values) {
      calls.push({ sql, values });
      if (options.dbError) throw new Error('DB offline');
      if (sql.startsWith('SELECT')) return [[{ count: options.count || 0 }]];
      return [{ insertId: 42 }];
    },
    async query() { return [options.rows || []]; }
  };
  const app = createApp({ db, mailer: { async sendMail(mail) { mails.push(mail); if (options.mailError) throw new Error('SMTP offline'); } }, config: { adminUser: 'admin', adminPass: 'secret', from: 'test@example.com', fromName: 'GyaniSays', mailTo: 'owner@example.com' }, logger: { error() {} } });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}`;
  return { calls, mails, get: (path, init) => fetch(url + path, init), post: body => fetch(url + '/api/submit_prospect.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) }) };
}
const lead = { name: ' Asha ', contact: 'asha@example.com', mode: 'business', mirror: { scores: { direction: 2, energy: 3, systems: 4 }, lowest: 'direction', question: '<Reflect>', when: 'today' } };
test('original form URL stores mirror fields and sends escaped notification', async t => {
  const f = await fixture(t);
  const res = await f.post(lead);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, id: 42 });
  assert.deepEqual(f.calls[1].values.slice(0, 12), ['Asha', 'asha@example.com', '', '', 'business', null, 2, 3, 4, 'direction', '<Reflect>', 'today']);
  assert.match(f.calls[1].values[12], /^[a-f0-9]{64}$/);
  assert.match(f.mails[0].html, /&lt;Reflect&gt;/);
  assert.match(f.calls[2].sql, /email_sent = 1/);
});
test('validation and methods retain the original API contract', async t => {
  const f = await fixture(t);
  assert.equal((await f.get('/api/submit_prospect.php')).status, 405);
  for (const [body, status, reason] of [['{', 400, 'invalid_json'], ['null', 400, 'invalid_json'], [{}, 422, 'missing_fields'], [{ name: 'Test', contact: 'bad' }, 422, 'invalid_contact']]) {
    const res = await f.post(body);
    assert.equal(res.status, status);
    assert.equal((await res.json()).reason, reason);
  }
  assert.equal(f.calls.length, 0);
});
test('sixth submission is rate limited', async t => {
  const f = await fixture(t, { count: 5 });
  assert.equal((await f.post(lead)).status, 429);
  assert.equal(f.calls.length, 1);
  assert.equal(f.mails.length, 0);
});
test('SMTP failure preserves successful submission', async t => {
  const f = await fixture(t, { mailError: true });
  assert.deepEqual(await (await f.post(lead)).json(), { ok: true, id: 42 });
  assert.equal(f.calls.length, 2);
});
test('database failure returns generic error', async t => {
  const f = await fixture(t, { dbError: true });
  const res = await f.post(lead);
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false, reason: 'server_error' });
});
test('admin requires authentication, escapes HTML, exports CSV with BOM', async t => {
  const f = await fixture(t, { rows: [{ id: 1, name: '<script>x</script>', msg: 'Hello,"world"\nnext', received_at: '2026-10-27 12:00:00', email_sent: 1 }] });
  const headers = { Authorization: 'Basic ' + Buffer.from('admin:secret').toString('base64') };
  for (const path of ['/admin/prospects.php', '/admin/export_csv.php']) assert.equal((await f.get(path)).status, 401);
  assert.equal((await f.get('/admin/prospects.php', { headers: { Authorization: 'Basic ' + Buffer.from('admin:wrong').toString('base64') } })).status, 401);
  const html = await (await f.get('/admin/prospects.php', { headers })).text();
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
  assert.match(html, /1 total/);
  assert.doesNotMatch(html, /<\?php|\{\{ROWS\}\}/);
  const csv = await f.get('/admin/export_csv.php', { headers });
  assert.match(csv.headers.get('content-disposition'), /gyanisays_prospects_/);
  const bytes = Buffer.from(await csv.arrayBuffer());
  assert.deepEqual([...bytes.subarray(0, 3)], [239, 187, 191]);
  assert.match(bytes.toString(), /"Hello,""world""\nnext"/);
});
test('frontend and SPA fallback serve original index; PHP files cannot leak', async t => {
  const f = await fixture(t);
  const original = await readFile(new URL('../gyanisays.com/html/index.html', import.meta.url), 'utf8');
  assert.equal(await (await f.get('/')).text(), original);
  assert.equal(await (await f.get('/coaching')).text(), original);
  assert.equal((await f.get('/api/unknown.php')).status, 404);
  assert.equal((await f.get('/config/gyanisays_db.php')).status, 404);
});
test('empty export, phone submissions, Unicode truncation and body size limit', async t => {
  const f = await fixture(t);
  const headers = { Authorization: 'Basic ' + Buffer.from('admin:secret').toString('base64') };
  assert.match(await (await f.get('/admin/export_csv.php', { headers })).text(), /No prospects yet/);
  assert.equal((await f.post({ name: '🙂'.repeat(160), contact: '+91 9876543210', mode: 'unknown' })).status, 200);
  assert.equal(Array.from(f.calls[1].values[0]).length, 150);
  assert.equal(f.calls[1].values[4], 'person');
  assert.equal((await f.post({ ...lead, msg: 'a'.repeat(70000) })).status, 413);
});

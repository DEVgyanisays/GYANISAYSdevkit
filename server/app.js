import express from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { escapeHtml, renderProspects, renderCsv, istTimestamp } from './views.js';
import { eventRoutes } from './event/routes.js';

const clean = (v, max) => Array.from(String(v ?? '').trim()).slice(0, max).join('');
const equal = (a, b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
const score = value => value == null ? null : Math.trunc(Number(value) || 0);

export function createApp({ db, mailer, config, eventDb, logger = console }) {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);
  const event = eventDb ? eventRoutes(eventDb, config) : null;
  if (event) app.use('/application', event.publicRouter);
  const submitPaths = ['/api/submit_prospect.php', '/api/submit_prospect'];
  app.all(submitPaths, (req, res, next) => {
    if (req.method !== 'POST') return res.status(405).set('Allow', 'POST').json({ ok: false, reason: 'method_not_allowed' });
    next();
  });
  app.post(submitPaths, express.text({ type: () => true, limit: '64kb' }), async (req, res) => {
    let data;
    try {
      data = JSON.parse(req.body);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
    } catch { return res.status(400).json({ ok: false, reason: 'invalid_json' }); }
    const name = clean(data.name, 150), contact = clean(data.contact, 150);
    const door = clean(data.door, 200), msg = clean(data.msg, 2000);
    const mode = ['person', 'business'].includes(data.mode) ? data.mode : 'person';
    const situation = data.situation == null ? null : clean(data.situation, 150);
    if (!name || !contact) return res.status(422).json({ ok: false, reason: 'missing_fields' });
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contact) && !/^[+0-9 ()\-]{7,20}$/.test(contact)) {
      return res.status(422).json({ ok: false, reason: 'invalid_contact' });
    }
    const ipHash = createHash('sha256').update((req.ip || '').replace(/^::ffff:/, '')).digest('hex');
    try {
      const [counts] = await db.execute('SELECT COUNT(*) AS count FROM prospects WHERE ip_hash = ? AND received_at > (NOW() - INTERVAL 10 MINUTE)', [ipHash]);
      if (Number(counts[0].count) >= 5) return res.status(429).json({ ok: false, reason: 'rate_limited' });
      const mirror = data.mirror && typeof data.mirror.scores === 'object' && data.mirror.scores ? data.mirror : null;
      const direction = score(mirror?.scores.direction), energy = score(mirror?.scores.energy), systems = score(mirror?.scores.systems);
      const lowest = mirror?.lowest == null ? null : clean(mirror.lowest, 20);
      const question = mirror?.question == null ? null : clean(mirror.question, 500);
      const when = mirror?.when == null ? null : clean(mirror.when, 40);
      const [result] = await db.execute(`INSERT INTO prospects
        (name, contact, door, msg, mode, situation, mirror_direction, mirror_energy, mirror_systems, mirror_lowest, mirror_question, mirror_when, source, status, ip_hash)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?, 'website','new', ?)`,
      [name, contact, door, msg, mode, situation, direction, energy, systems, lowest, question, when, ipHash]);
      const id = Number(result.insertId);
      const lines = ['New lead from gyanisays.com', '', `Name: ${name}`, `Contact: ${contact}`, `Interested in: ${door}`, `Lens: ${mode}${situation ? ` — situation: ${situation}` : ''}`, `Message: ${msg || '(none)'}`];
      if (lowest) {
        lines.push('', `Clarity Mirror — lowest: ${lowest} (direction=${direction ?? ''}, energy=${energy ?? ''}, systems=${systems ?? ''})`);
        if (question) lines.push(`Reflective question shown: ${question}`);
      }
      lines.push('', `Lead #${id} · received ${istTimestamp()}`);
      let sent = false;
      try {
        await mailer.sendMail({ from: { name: config.fromName, address: config.from }, to: config.mailTo, subject: `New Gyani Says lead — ${name} (${mode})`, html: escapeHtml(lines.join('\n')).replace(/\n/g, '<br>\n') });
        sent = true;
      } catch (err) { logger.error('[gyanisays] mail failed:', err.message); }
      if (sent) await db.execute('UPDATE prospects SET email_sent = 1 WHERE id = ?', [id]);
      res.json({ ok: true, id });
    } catch (err) {
      logger.error('[gyanisays] submission failed:', err.message);
      res.status(500).json({ ok: false, reason: 'server_error' });
    }
  });
  app.use('/admin', (req, res, next) => {
    const header = req.get('authorization') || '';
    const decoded = /^Basic /i.test(header) ? Buffer.from(header.slice(6), 'base64').toString('utf8') : '';
    const colon = decoded.indexOf(':');
    if (!config.adminUser || !config.adminPass || colon < 0 || !equal(decoded.slice(0, colon), config.adminUser) || !equal(decoded.slice(colon + 1), config.adminPass)) {
      return res.status(401).set('WWW-Authenticate', 'Basic realm="Gyani Says Admin", charset="UTF-8"').send('Authentication required');
    }
    res.set('Cache-Control', 'no-store');
    next();
  });
  if (event) {
    app.get('/admin', (req, res) => res.redirect('/admin/event/'));
    app.use('/admin/event', event.adminRouter);
  }
  app.get(['/admin/prospects.php', '/admin/prospects'], async (req, res) => {
    const [rows] = await db.query('SELECT * FROM prospects ORDER BY id DESC');
    res.type('html').send(renderProspects(rows));
  });
  app.get(['/admin/export_csv.php', '/admin/export_csv'], async (req, res) => {
    const [rows] = await db.query('SELECT * FROM prospects ORDER BY id DESC');
    const stamp = istTimestamp().replace(' ', '_').replace(/:/g, '');
    res.type('text/csv').attachment(`gyanisays_prospects_${stamp}.csv`).send(renderCsv(rows));
  });
  app.use(['/admin', '/api'], (req, res) => res.sendStatus(404));
  app.use((req, res, next) => /\.php(?:\/|$)/i.test(req.path) ? res.sendStatus(404) : next());
  const root = fileURLToPath(new URL('../gyanisays.com/html/', import.meta.url));
  app.use(express.static(root, { dotfiles: 'deny' }));
  app.get('/{*path}', (req, res) => res.sendFile('index.html', { root }));
  app.use((err, req, res, next) => {
    logger.error('[gyanisays] request failed:', err.message);
    res.status(err.status === 413 ? 413 : 500).json({ ok: false, reason: err.status === 413 ? 'payload_too_large' : 'server_error' });
  });
  return app;
}

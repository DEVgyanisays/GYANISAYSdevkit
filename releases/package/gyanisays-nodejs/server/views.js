import { readFileSync } from 'node:fs';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);
const template = readFileSync(new URL('./prospects.html', import.meta.url), 'utf8');
export function renderProspects(rows) {
  const body = rows.map(r => `<tr><td>#${Number(r.id)}</td><td>${escapeHtml(r.received_at)}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.contact)}</td><td><span class="tag">${escapeHtml(r.mode)}</span></td><td>${escapeHtml(r.door)}</td><td>${escapeHtml(r.situation ?? '—')}</td><td class="msg">${escapeHtml(r.msg)}</td><td>${escapeHtml(r.mirror_lowest ?? '—')}</td><td>${Number(r.email_sent) ? '✓' : '—'}</td></tr>`).join('\n');
  return template.replace('{{COUNT}}', String(rows.length)).replace('{{ROWS}}', () => body);
}
export function renderCsv(rows) {
  const cell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const keys = rows.length ? Object.keys(rows[0]) : ['No prospects yet'];
  return '\uFEFF' + [keys, ...rows.map(r => keys.map(k => r[k]))].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
export function istTimestamp(date = new Date()) {
  return new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 19).replace('T', ' ');
}

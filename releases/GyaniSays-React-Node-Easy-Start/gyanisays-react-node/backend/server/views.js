

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);
export function renderCsv(rows) {
  const cell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const keys = rows.length ? Object.keys(rows[0]) : ['No prospects yet'];
  return '\uFEFF' + [keys, ...rows.map(r => keys.map(k => r[k]))].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
export function istTimestamp(date = new Date()) {
  return new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 19).replace('T', ' ');
}

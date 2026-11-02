import { check } from './validation.js';

// RFC 4180 CSV, including quoted commas, escaped quotes and embedded newlines.
export function parseCsv(text) {
  check(typeof text === 'string' && text.length <= 2000000, 'CSV must be under 2 MB');
  text = text.replace(/^\uFEFF/, '');
  const rows = []; let row = [], value = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { value += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else value += c;
    } else if (c === '"') { check(!value && !closed, 'Unexpected quote in CSV'); quoted = true; }
    else if (c === ',' || c === '\n' || c === '\r') {
      row.push(value); value = ''; closed = false;
      if (c !== ',') { if (row.some(v => v.trim())) rows.push(row); row = []; if (c === '\r' && text[i + 1] === '\n') i++; }
    } else { check(!closed, 'Unexpected text after closing CSV quote'); value += c; }
  }
  check(!quoted, 'Unclosed quote in CSV');
  row.push(value); if (row.some(v => v.trim())) rows.push(row);
  check(rows.length > 1, 'Add a header and at least one person');
  const headers = rows.shift().map(v => v.trim().toLowerCase());
  check(headers.includes('name'), 'CSV needs a name column');
  check(new Set(headers).size === headers.length, 'Duplicate CSV headers');
  check(headers.every(k => ['name', 'department', 'external_id'].includes(k)), 'Supported columns: name, department, external_id');
  return rows.map((r, i) => { check(r.length === headers.length, `Row ${i + 2}: column count does not match`); return Object.fromEntries(headers.map((h, j) => [h, r[j]])); });
}
export function normalizeImport(input) {
  const rows = typeof input === 'string' ? parseCsv(input) : input;
  check(Array.isArray(rows) && rows.length > 0 && rows.length <= 5000, 'Import 1–5,000 rows at a time');
  const seen = new Set(); let duplicates = 0;
  const items = rows.map((r, i) => {
    check(r && typeof r === 'object', `Row ${i + 2}: invalid person`);
    const out = {};
    for (const [k, max] of [['name',160], ['department',120], ['external_id',100]]) {
      check(r[k] == null || typeof r[k] === 'string', `Row ${i + 2}: ${k} must be text`);
      out[k] = (r[k] || '').trim();
      check(out[k].length <= max && !/[\u0000-\u001f]/.test(out[k]), `Row ${i + 2}: invalid ${k}`);
    }
    check(out.name.length > 0, `Row ${i + 2}: name is required`);
    out.key = out.external_id ? `id:${out.external_id.toLowerCase()}` : `name:${out.name.toLowerCase()}|${out.department.toLowerCase()}`;
    if (seen.has(out.key)) { duplicates++; return null; }
    seen.add(out.key); return out;
  }).filter(Boolean);
  return { items, duplicates, total: rows.length };
}

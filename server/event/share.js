import QRCode from 'qrcode';

export async function makeFormShare(siteOrigin) {
  const base = new URL(siteOrigin);
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password) throw new Error('Public site URL must be an HTTP(S) address without login credentials');
  const url = new URL('/application/', base.origin).href;
  const localOnly = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname) || base.hostname.endsWith('.localhost');
  return { url, localOnly, qr: await QRCode.toDataURL(url, { width: 640, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#131c43', light: '#ffffff' } }) };
}

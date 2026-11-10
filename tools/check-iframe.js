const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const games = JSON.parse(fs.readFileSync(path.join(root, 'batch2-games.json'), 'utf8'));

function decideMode({ status, xfo, csp, html }) {
  const x = (xfo || '').toUpperCase();
  const c = csp || '';
  if (status === 404 || status === 410) return 'tab';
  if (x.includes('DENY') || x.includes('SAMEORIGIN')) return 'tab';
  const fa = (c.match(/frame-ancestors[^;]*/i) || [''])[0];
  if (fa) {
    if (/none/i.test(fa)) return 'tab';
    // itch often allows embedding only from itch domains
    if (/frame-ancestors/i.test(fa) && !/\*/.test(fa) && !/localhost|127\.0\.0\.1/i.test(fa)) {
      // if only self / itch domains, portal localhost cannot iframe it
      return 'tab';
    }
  }
  if (html && /top\.location|frameElement|refuse to display|X-Frame-Options/i.test(html)) return 'tab';
  // itch.io game pages generally are not freely embeddable on third-party localhost
  if (/itch\.io/i.test(html || '') && /data-iframe_base|iframe_url|embed\.itch\.io/i.test(html || '')) {
    // page itself may load, but gameplay often needs their embed host; keep iframe only if no restrictive headers
  }
  return 'iframe';
}

async function checkOne(url, attempt = 0) {
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (r.status === 429 && attempt < 3) {
      await new Promise((res) => setTimeout(res, 1200 * (attempt + 1)));
      return checkOne(url, attempt + 1);
    }
    const xfo = r.headers.get('x-frame-options');
    const csp = r.headers.get('content-security-policy');
    const html = await r.text();
    const mode = decideMode({ status: r.status, xfo, csp, html });
    return { status: r.status, xfo: xfo || '', csp: (csp || '').slice(0, 180), mode };
  } catch (e) {
    return { status: 'ERR', xfo: '', csp: '', mode: 'tab', err: String(e.message || e) };
  }
}

(async () => {
  const out = [];
  for (const g of games) {
    const res = await checkOne(g.url);
    out.push({ id: g.id, name: g.name, url: g.url, ...res });
    console.log(`${g.id}\t${res.mode}\t${res.status}\txfo=${res.xfo || '-'}`);
    await new Promise((r) => setTimeout(r, 350));
  }
  fs.writeFileSync(path.join(root, 'batch2-iframe-check.json'), JSON.stringify(out, null, 2));
  const iframe = out.filter((x) => x.mode === 'iframe').length;
  const tab = out.filter((x) => x.mode === 'tab').length;
  console.log(`SUMMARY iframe=${iframe} tab=${tab} total=${out.length}`);
})();

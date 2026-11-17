// Local admin backend (sirf `npm run admin` / vite dev me chalta hai).
// Articles content/articles/*.json me save hote hain, images public/images/posts/ me.
// "Publish live" -> build (tiiny mode) -> zip -> Tiiny.host API upload.
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const ROOT = process.cwd();
const ART = path.join(ROOT, 'content', 'articles');
const IMG = path.join(ROOT, 'public', 'images', 'posts');
const SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;
const IMGNAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.(jpg|jpeg|png|webp|gif)$/i;

// ---------- chhote helpers ----------
const send = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };
const readBody = (req, limit = 25 * 1024 * 1024) => new Promise((ok, no) => {
  let n = 0; const c = [];
  req.on('data', d => { n += d.length; if (n > limit) { no(new Error('Body bahut badi hai')); req.destroy(); } else c.push(d); });
  req.on('end', () => ok(Buffer.concat(c).toString('utf8'))); req.on('error', no);
});
function envFile() {
  const out = {};
  try {
    for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* file nahi hai */ }
  return out;
}
const run = (cmd, args) => new Promise((ok, no) => {
  const p = spawn(cmd, args, { cwd: ROOT, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
  let out = ''; p.stdout.on('data', d => (out += d)); p.stderr.on('data', d => (out += d));
  p.on('error', no); p.on('close', c => (c === 0 ? ok(out) : no(new Error(out.slice(-1500) || 'Command fail hui'))));
});
const rebuildIndex = () => run(process.execPath, ['scripts/build-index.mjs']);

// ---------- minimal zip writer (koi extra package nahi) ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const walk = (d, base = d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name), base) : [path.relative(base, path.join(d, e.name)).split(path.sep).join('/')]);
export function zipDir(dir) {
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const parts = [], central = []; let offset = 0;
  for (const name of walk(dir)) {
    const data = fs.readFileSync(path.join(dir, name)), comp = zlib.deflateRawSync(data), nm = Buffer.from(name), crc = crc32(data);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(time, 10); lh.writeUInt16LE(date, 12); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nm.length, 26);
    parts.push(lh, nm, comp);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(time, 12); ch.writeUInt16LE(date, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(offset, 42);
    central.push(ch, nm); offset += 30 + nm.length + comp.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(central.length / 2, 8); end.writeUInt16LE(central.length / 2, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}

// ---------- deploy ----------
let deploying = false;
const git = (...args) => run('git', args);

// GitHub mode: sirf content + images commit karke push; site ka build GitHub Actions khud karta hai.
async function publishGithub() {
  try { await git('--version'); } catch { throw new Error('Git install nahi hai. git-scm.com se install karo, phir dobara try karo.'); }
  if (!fs.existsSync(path.join(ROOT, '.git'))) throw new Error('Ye folder Git repo nahi hai. Pehle `git init`, `git remote add origin <repo-url>` karo (README me steps).');
  let remote = ''; try { remote = (await git('remote')).trim(); } catch { /* neeche error */ }
  if (!remote) throw new Error('Git remote set nahi hai. `git remote add origin https://github.com/USER/REPO.git` chalao.');
  await git('add', '-A', '--', 'content', 'public/images');
  let changed = true; try { await git('diff', '--cached', '--quiet'); changed = false; } catch { /* diff mila = change hai */ }
  if (changed) await git('commit', '-m', 'Update articles from local admin');
  const branch = (await git('rev-parse', '--abbrev-ref', 'HEAD')).trim();
  try { await git('push', '-u', 'origin', branch); }
  catch (e) { throw new Error('Push nahi hua. GitHub login/permission check karo.\n' + e.message.slice(-600)); }
  return { uploaded: true, message: changed ? 'Changes GitHub par push ho gaye ✅\nSite 1-2 minute me update hogi (GitHub repo > Actions tab me progress dikhta hai).' : 'Koi naya change nahi tha, GitHub par jo hai wahi latest hai.' };
}

async function deploy() {
  if (deploying) throw new Error('Deploy pehle se chal raha hai, thoda ruko.');
  deploying = true;
  try {
    const mode = (envFile().PUBLISH_MODE || process.env.PUBLISH_MODE || (fs.existsSync(path.join(ROOT, '.git')) ? 'github' : 'tiiny')).toLowerCase();
    if (mode === 'github') return await publishGithub();
    await rebuildIndex();
    const require = createRequire(path.join(ROOT, 'package.json'));
    const viteBin = path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
    await run(process.execPath, [viteBin, 'build', '--mode', 'tiiny']);
    const dist = path.join(ROOT, 'dist');
    if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('Build me index.html nahi bana.');
    const zip = zipDir(dist);
    fs.mkdirSync(path.join(ROOT, 'deploy'), { recursive: true });
    const zipPath = path.join(ROOT, 'deploy', 'site.zip');
    fs.writeFileSync(zipPath, zip);

    const cfg = { ...envFile(), ...process.env };
    const key = cfg.TIINY_API_KEY, domain = (cfg.TIINY_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!key) {
      return { uploaded: false, zipPath, message: `Build ready hai, lekin Tiiny API key set nahi hai, isliye auto-upload nahi hua.\nZip yahan hai: ${zipPath}\nUse tiiny.host/manage par "Upload file" se upload karo (ya .env.local me TIINY_API_KEY daalo).` };
    }
    const form = new FormData();
    form.append('files', new Blob([zip], { type: 'application/zip' }), 'site.zip');
    if (domain) form.append('domain', domain);
    const r = await fetch('https://ext.tiiny.host/v1/upload', { method: domain ? 'PUT' : 'POST', headers: { 'x-api-key': key }, body: form });
    const text = await r.text();
    if (!r.ok) throw new Error(`Tiiny upload fail (${r.status}): ${text.slice(0, 400)}`);
    return { uploaded: true, zipPath, message: `Live ho gaya ✅${domain ? '\nhttps://' + domain : ''}\n${text.slice(0, 300)}` };
  } finally { deploying = false; }
}

// ---------- API router ----------
async function handle(req, res, url) {
  const m = req.method, parts = url.split('?')[0].split('/').filter(Boolean).slice(1); // ['articles', slug]
  if (parts[0] === 'articles') {
    const slug = parts[1];
    if (!slug && m === 'GET') {
      const list = fs.existsSync(ART) ? fs.readdirSync(ART).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(ART, f), 'utf8'))) : [];
      return send(res, 200, { articles: list.sort((a, b) => (b.date || '').localeCompare(a.date || '')) });
    }
    if (!slug || !SLUG.test(slug)) return send(res, 400, { error: 'Slug galat hai' });
    const file = path.join(ART, slug + '.json');
    if (m === 'GET') return fs.existsSync(file) ? send(res, 200, { article: JSON.parse(fs.readFileSync(file, 'utf8')) }) : send(res, 404, { error: 'Article nahi mila' });
    if (m === 'PUT') {
      const a = JSON.parse(await readBody(req));
      if (a.slug !== slug || !a.title) return send(res, 400, { error: 'Article data galat hai' });
      fs.mkdirSync(ART, { recursive: true }); fs.writeFileSync(file, JSON.stringify(a, null, 2));
      await rebuildIndex(); return send(res, 200, { ok: true });
    }
    if (m === 'DELETE') { fs.rmSync(file, { force: true }); await rebuildIndex(); return send(res, 200, { ok: true }); }
  }
  if (parts[0] === 'image' && m === 'POST') {
    const { name, dataUrl } = JSON.parse(await readBody(req));
    const mm = /^data:image\/[a-z+]+;base64,(.+)$/i.exec(dataUrl || '');
    if (!IMGNAME.test(name || '') || !mm) return send(res, 400, { error: 'Image galat hai' });
    fs.mkdirSync(IMG, { recursive: true }); fs.writeFileSync(path.join(IMG, name), Buffer.from(mm[1], 'base64'));
    return send(res, 200, { path: 'images/posts/' + name });
  }
  if (parts[0] === 'deploy' && m === 'POST') return send(res, 200, await deploy());
  return send(res, 404, { error: 'Not found' });
}

export function localAdmin() {
  return {
    name: 'local-admin', apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        // Sirf apne computer ke browser se (DNS-rebinding / dusri site se request block)
        const host = (req.headers.host || '').split(':')[0], origin = req.headers.origin;
        if (!['localhost', '127.0.0.1', '[::1]'].includes(host) || (origin && !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin))) return send(res, 403, { error: 'Forbidden' });
        try { await handle(req, res, '/api' + (req.url || '')); } catch (e) { send(res, 500, { error: e.message || 'Server error' }); }
      });
    },
  };
}

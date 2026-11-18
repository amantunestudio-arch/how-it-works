import { useEffect, useState } from 'react';
export let BASE = './';
export const SITE = { name: 'How It Works', email: 'hello@howitworks.example', owner: '', repo: '', branch: 'main' };
// config.json (site ke root me) se email + GitHub repo padhta hai. Badalne ke liye rebuild ki zarurat nahi.
export async function loadConfig() {
  try { const c = await (await fetch('config.json', { cache: 'no-cache' })).json(); Object.assign(SITE, c); } catch {}
  if (SITE.owner && SITE.repo) BASE = `https://raw.githubusercontent.com/${SITE.owner}/${SITE.repo}/${SITE.branch || 'main'}/public/`;
}
export const asset = p => (!p ? '' : /^(https?:|data:|blob:)/.test(p) ? p : BASE + p.replace(/^\//, ''));
export const fmt = d => new Date(d + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
export const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
export const tint = c => 't-' + (['sky', 'sun', 'mint', 'lilac'].includes(c) ? c : 'sky');

export function useJSON(path) {
  const [s, set] = useState({ data: null, error: null });
  useEffect(() => {
    let live = true; set({ data: null, error: null });
    const get = u => fetch(u, { cache: 'no-cache' }).then(r => { if (!r.ok) throw 0; return r.json(); });
    get(BASE + path).catch(() => get('./' + path))
      .then(data => live && set({ data, error: null })).catch(() => live && set({ data: null, error: true }));
    return () => { live = false; };
  }, [path]);
  return s;
}
export function usePage(title, desc, ld) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE.name}` : `${SITE.name} – Everyday things, explained simply`;
    let m = document.querySelector('meta[name=description]');
    if (m && desc) m.content = desc;
    let s = document.getElementById('ld');
    if (!s) { s = document.createElement('script'); s.id = 'ld'; s.type = 'application/ld+json'; document.head.appendChild(s); }
    s.textContent = ld ? JSON.stringify(ld) : '';
    window.scrollTo(0, 0);
  }, [title, desc]);
}

const OK = { H2: [], H3: [], P: [], BR: [], STRONG: [], B: [], EM: [], I: [], U: [], UL: [], OL: [], LI: [], BLOCKQUOTE: [], HR: [], FIGURE: [], FIGCAPTION: [], A: ['href'], IMG: ['src', 'alt'] };
export function sanitize(html) {
  const doc = new DOMParser().parseFromString('<body>' + (html || ''), 'text/html');
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) return;
    if (c.nodeType !== 1) return c.remove();
    const ok = OK[c.tagName];
    if (!ok) { if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(c.tagName)) return c.remove(); walk(c); return c.replaceWith(...c.childNodes); }
    [...c.attributes].forEach(a => { if (!ok.includes(a.name)) c.removeAttribute(a.name); });
    ['href', 'src'].forEach(k => { if (/^\s*(javascript|vbscript):/i.test(c.getAttribute(k) || '')) c.removeAttribute(k); });
    if (c.tagName === 'A') { c.target = '_blank'; c.rel = 'noopener noreferrer'; }
    walk(c);
  });
  walk(doc.body); return doc.body.innerHTML;
}
export const withBase = h => h.replace(/src="images\//g, `src="${BASE}images/`);

// ---------- GitHub (login + save) : koi database nahi ----------
const store = () => (localStorage.getItem('hiw') ? localStorage : sessionStorage);
export const session = () => { try { return JSON.parse(sessionStorage.getItem('hiw') || localStorage.getItem('hiw')); } catch { return null; } };
export function logout() { localStorage.removeItem('hiw'); sessionStorage.removeItem('hiw'); }
async function api(path, opt = {}, raw = false, s = session()) {
  const r = await fetch(`https://api.github.com/repos/${s.owner}/${s.repo}${path}`, { ...opt, cache: 'no-store', headers: { Authorization: 'Bearer ' + s.token, Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
  if (r.status === 401) { logout(); throw new Error('Token galat ya expire ho gaya. Dobara login karo.'); }
  if (!r.ok && r.status !== 404) throw new Error('GitHub error ' + r.status);
  return r;
}
export async function login(cfg, remember) {
  const r = await api('', {}, false, cfg);
  if (r.status === 404) throw new Error('Repo nahi mila, ya token ko is repo ka access nahi hai.');
  const j = await r.json();
  if (!j.permissions?.push) throw new Error('Token mein "Contents: Read and write" permission chahiye.');
  logout(); (remember ? localStorage : sessionStorage).setItem('hiw', JSON.stringify({ ...cfg, branch: j.default_branch }));
}
const b64 = t => btoa(unescape(encodeURIComponent(t)));
async function sha(path) { const r = await api(`/contents/${path}?ref=${session().branch}`); return r.status === 404 ? undefined : (await r.json()).sha; }
async function put(path, content, message) {
  const body = { message, content, branch: session().branch }, sh = await sha(path); if (sh) body.sha = sh;
  const r = await api(`/contents/${path}`, { method: 'PUT', body: JSON.stringify(body) });
  if (!r.ok) throw new Error('Save nahi hua (' + r.status + ')');
}
export async function readArticle(slug) {
  const r = await api(`/contents/content/articles/${slug}.json?ref=${session().branch}`, {}, true);
  return r.status === 404 ? null : JSON.parse(await r.text());
}
export async function listArticles() {
  const r = await api(`/contents/content/articles?ref=${session().branch}`);
  if (r.status === 404) return [];
  const files = (await r.json()).filter(f => f.name.endsWith('.json'));
  const all = await Promise.all(files.map(f => readArticle(f.name.replace('.json', '')).catch(() => null)));
  return all.filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
}
const words = h => h.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
// Site jo JSON padhti hai (docs/data) use dashboard khud update karta hai, to koi build/Action nahi chahiye.
async function rebuildData(removed) {
  const all = (await listArticles()).filter(a => a.status !== 'draft');
  await put('docs/data/index.json', b64(JSON.stringify(all.map(({ content, faq, note, ...x }) => ({ ...x, minutes: Math.max(1, Math.round(words(content || '') / 200)) })))), 'Update site index');
  for (const a of all) await put(`docs/data/articles/${a.slug}.json`, b64(JSON.stringify(a)), 'Publish: ' + a.title);
  if (removed) { const p = `docs/data/articles/${removed}.json`, sh = await sha(p); if (sh) await api(`/contents/${p}`, { method: 'DELETE', body: JSON.stringify({ message: 'Unpublish ' + removed, sha: sh, branch: session().branch }) }); }
}
export const syncSite = () => rebuildData();
export async function saveArticle(a) {
  await put(`content/articles/${a.slug}.json`, b64(JSON.stringify(a, null, 2)), 'Update article: ' + a.title);
  await rebuildData(a.status === 'draft' ? a.slug : null);
}
export async function uploadImage(dataUrl, name) { await put('docs/images/posts/' + name, dataUrl.split(',')[1], 'Add image ' + name); return 'images/posts/' + name; }
export async function deleteArticle(slug) {
  const p = `content/articles/${slug}.json`, sh = await sha(p);
  await api(`/contents/${p}`, { method: 'DELETE', body: JSON.stringify({ message: 'Delete ' + slug, sha: sh, branch: session().branch }) });
  await rebuildData(slug);
}
export function fileToDataUrl(file, max = 1400) {
  return new Promise((res, rej) => {
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', .82)); };
    im.onerror = () => rej(new Error('Image padhi nahi gayi')); im.src = u;
  });
}

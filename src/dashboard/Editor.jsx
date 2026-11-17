import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { BASE, asset, fileToDataUrl, readArticle, sanitize, saveArticle, session, slugify, uploadImage, withBase } from '../lib.js';
import RichEditor from './RichEditor.jsx';
import { DHead } from './Dashboard.jsx';

const blank = () => ({ slug: '', title: '', category: '', excerpt: '', date: new Date().toISOString().slice(0, 10), status: 'published', color: 'sky', image: '', imageAlt: '', imageCaption: '', content: '', faq: [], note: '', showRelated: true });
const hue = s => ['sky', 'sun', 'mint', 'lilac'][[...s].reduce((n, c) => n + c.charCodeAt(0), 0) % 4];

export default function Editor() {
  const { slug: editing } = useParams(); const nav = useNavigate();
  const [a, setA] = useState(editing ? null : blank());
  const html = useRef(''); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  useEffect(() => {
    if (!editing || !session()) return;
    readArticle(editing).then(x => { if (!x) return setErr('Article nahi mila'); html.current = x.content = withBase(x.content || ''); setA({ ...blank(), ...x }); }).catch(e => setErr(e.message));
  }, [editing]);
  if (!session()) return <Navigate to="/dashboard/login" replace />;
  if (!a) return <div className="dash"><DHead /><main className="dmain">{err ? <p className="err">{err}</p> : 'Loading…'}</main></div>;
  const set = k => e => setA({ ...a, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setFaq = (i, k, v) => setA({ ...a, faq: a.faq.map((f, j) => (j === i ? { ...f, [k]: v } : f)) });

  async function save(status) {
    setErr('');
    const slug = editing || slugify(a.slug || a.title);
    if (!a.title.trim() || !slug) return setErr('Title zaroori hai.');
    try {
      setMsg('Saving…');
      const doc = new DOMParser().parseFromString('<body>' + sanitize(html.current), 'text/html');
      let n = 0;
      for (const im of doc.body.querySelectorAll('img')) {
        const src = im.getAttribute('src') || '';
        if (src.startsWith('data:')) { setMsg(`Image upload ho rahi hai (${++n})…`); im.setAttribute('src', await uploadImage(src, `${slug}-${Date.now()}-${n}.jpg`)); }
        else if (src.startsWith(BASE + 'images/')) im.setAttribute('src', src.slice(BASE.length));
      }
      let image = a.image;
      if (image.startsWith('data:')) { setMsg('Feature image upload ho rahi hai…'); image = await uploadImage(image, `${slug}-cover-${Date.now()}.jpg`); }
      setMsg('Article save ho raha hai…');
      await saveArticle({ ...a, slug, status, image, color: a.color || hue(slug), content: doc.body.innerHTML, faq: a.faq.filter(f => f.q.trim() && f.a.trim()) });
      nav('/dashboard');
    } catch (e) { setErr(e.message); setMsg(''); }
  }
  return (
    <div className="dash"><DHead><Link className="btn ghost sm" to="/dashboard">← Back</Link></DHead>
      <main className="dmain narrow"><h1>{editing ? 'Edit article' : 'New article'}</h1>
        <div className="dcard">
          <label>Title<input value={a.title} onChange={set('title')} /></label>
          <div className="row"><label>Category<input value={a.category} onChange={set('category')} placeholder="e.g. Engineering" /></label>
            <label>Date<input type="date" value={a.date} onChange={set('date')} /></label></div>
          <label>Short description <small>(card, Google result aur article ke upar dikhta hai)</small><textarea rows="2" value={a.excerpt} onChange={set('excerpt')} /></label>
        </div>
        <div className="dcard"><b>Feature image</b>
          {a.image && <img className="prev" src={asset(a.image)} alt="" />}
          <input type="file" accept="image/*" onChange={async e => { const f = e.target.files[0]; if (f) setA({ ...a, image: await fileToDataUrl(f) }); }} />
          <div className="row"><label>Image description<input value={a.imageAlt} onChange={set('imageAlt')} /></label>
            <label>Caption <small>(optional)</small><input value={a.imageCaption} onChange={set('imageCaption')} /></label></div>
        </div>
        <div className="dcard"><b>Article content</b>
          <p className="hint">Heading, bold, list, link aur image toolbar se. Word/Google Docs se paste karoge to formatting bhi aa jaati hai.</p>
          <RichEditor initial={a.content} onChange={h => (html.current = h)} /></div>
        <div className="dcard"><b>FAQs</b>
          {a.faq.map((f, i) => <div className="faq" key={i}>
            <input placeholder="Question" value={f.q} onChange={e => setFaq(i, 'q', e.target.value)} />
            <textarea rows="2" placeholder="Answer" value={f.a} onChange={e => setFaq(i, 'a', e.target.value)} />
            <button type="button" className="btn ghost sm danger" onClick={() => setA({ ...a, faq: a.faq.filter((_, j) => j !== i) })}>Remove</button></div>)}
          <button type="button" className="btn ghost sm" onClick={() => setA({ ...a, faq: [...a.faq, { q: '', a: '' }] })}>+ Add question</button></div>
        <div className="dcard"><label><b>Note</b> <small>(article ke end mein highlighted box)</small><textarea rows="3" value={a.note} onChange={set('note')} /></label></div>
        <div className="dcard sw"><label className="switch"><input type="checkbox" checked={a.showRelated} onChange={set('showRelated')} /><i /> <span>Related articles dikhao: <b>{a.showRelated ? 'ON' : 'OFF'}</b></span></label></div>
        {err && <p className="err" role="alert">{err}</p>}{msg && <p className="hint">{msg}</p>}
        <div className="bar"><button className="btn pri" disabled={!!msg} onClick={() => save('published')}>Publish</button>
          <button className="btn ghost" disabled={!!msg} onClick={() => save('draft')}>Save as draft</button></div>
      </main></div>
  );
}

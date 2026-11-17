import { useState } from 'react';
import { useJSON, usePage } from '../lib.js';
import Card from '../components/Card.jsx';
export default function Blog() {
  usePage('Blog', 'All How It Works explainers in one place, filtered by topic.');
  const { data, error } = useJSON('data/index.json');
  const [cat, setCat] = useState('All');
  const cats = ['All', ...new Set((data || []).map(a => a.category).filter(Boolean))];
  const list = (data || []).filter(a => cat === 'All' || a.category === cat);
  return (
    <>
      <section className="pagehead"><div className="wrap"><h1>Blog</h1><p>Every explainer we have published, newest first.</p></div></section>
      <section className="wrap sec">
        <div className="chips" role="group" aria-label="Filter by topic">
          {cats.map(c => <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="grid">{list.map(a => <Card key={a.slug} a={a} />)}</div>
        {error && <p className="empty">Articles could not be loaded. Please refresh the page.</p>}
        {data && !list.length && <p className="empty">Nothing here yet.</p>}
      </section>
    </>
  );
}

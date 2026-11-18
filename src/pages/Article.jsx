import { Link, useParams } from '../router.jsx';
import { asset, fmt, sanitize, tint, usePage, useJSON, withBase, SITE } from '../lib.js';
import Card from '../components/Card.jsx';
import NotFound from './NotFound.jsx';

export default function Article() {
  const { slug } = useParams();
  const { data: a, error } = useJSON(`data/articles/${slug}.json`);
  const { data: all } = useJSON('data/index.json');
  const faq = (a?.faq || []).filter(f => f.q && f.a);
  const ld = a && [
    { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.excerpt, datePublished: a.date, author: { '@type': 'Organization', name: SITE.name } },
    ...(faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
  ];
  usePage(a?.title || 'Article', a?.excerpt, ld);
  if (error) return <NotFound />;
  if (!a) return <div className="prose"><p>Loading…</p></div>;
  const related = a.showRelated ? (all || []).filter(x => x.slug !== a.slug).sort((x, y) => (y.category === a.category) - (x.category === a.category)).slice(0, 3) : [];
  return (
    <article className={tint(a.color)}>
      <header className="ahead"><div className="wrap">
        <Link to="/blog" className="back">← All articles</Link>
        <span className="tag">{a.category}</span>
        <h1>{a.title}</h1>
        <p>{a.excerpt}</p>
        <small>{fmt(a.date)}</small>
      </div></header>
      {a.image && <figure className="cover"><img src={asset(a.image)} alt={a.imageAlt || ''} />{a.imageCaption && <figcaption>{a.imageCaption}</figcaption>}</figure>}
      <div className="prose art" dangerouslySetInnerHTML={{ __html: withBase(sanitize(a.content)) }} />
      <div className="prose">
        {faq.length > 0 && <section><h2>Frequently asked questions</h2>{faq.map((f, i) => <details key={i}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>}
        {a.note && <aside className="note"><b>Quick note</b><p>{a.note}</p></aside>}
      </div>
      {related.length > 0 && <section className="wrap sec"><h2>Related articles</h2><div className="grid">{related.map(r => <Card key={r.slug} a={r} />)}</div></section>}
    </article>
  );
}

import { Link } from 'react-router-dom';
import { asset, tint } from '../lib.js';
export default function Card({ a }) {
  return (
    <Link to={`/articles/${a.slug}`} className={`card ${tint(a.color)}`}>
      {a.image && <img src={asset(a.image)} alt="" loading="lazy" />}
      <div className="cb">
        <span className="tag">{a.category}</span>
        <h3>{a.title}</h3>
        <p>{a.excerpt}</p>
        <span className="rd">{a.minutes} min read</span>
      </div>
    </Link>
  );
}

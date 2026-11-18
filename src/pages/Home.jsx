import { Link } from '../router.jsx';
import { useJSON, usePage } from '../lib.js';
import Card from '../components/Card.jsx';

function Flow() {
  const nodes = [[60, 70, 'Press'], [200, 170, 'Sense'], [340, 90, 'Decide'], [480, 250, 'Move']];
  return (
    <svg className="flow" viewBox="0 0 560 320" role="img" aria-label="A signal travels through four steps: press, sense, decide, move">
      <path className="line" d="M60 70H200V170H340V90H480V250" pathLength="1" />
      {nodes.map(([x, y, t], i) => (
        <g key={t} className="node" style={{ animationDelay: `${0.5 + i * 0.45}s` }}>
          <circle cx={x} cy={y} r="26" /><circle cx={x} cy={y} r="9" className="dot" />
          <text x={x} y={y + 52} textAnchor="middle">{t}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Home() {
  usePage('', 'Plain-English explainers on how lifts, search engines, automatic doors and other everyday systems actually work.');
  const { data } = useJSON('data/index.json');
  const latest = data?.slice(0, 3) || [];
  return (
    <>
      <section className="hero"><div className="wrap hg">
        <div>
          <h1>Press a button, open a door, ask a question. Here is what really happens next.</h1>
          <p>Short, careful explainers on the machines and software you use every day, written so you can follow them without an engineering degree.</p>
          <div className="btns">
            {latest[0] && <Link className="btn pri" to={`/articles/${latest[0].slug}`}>Read the newest explainer</Link>}
            <Link className="btn ghost" to="/blog">Browse all articles</Link>
          </div>
        </div>
        <Flow />
      </div></section>

      <section className="wrap sec">
        <h2>Latest explainers</h2>
        <div className="grid">{latest.map(a => <Card key={a.slug} a={a} />)}</div>
        {data && !data.length && <p className="empty">No articles yet. Publish one from the dashboard.</p>}
        {data?.length > 3 && <p className="more"><Link className="btn pri" to="/blog">See every article</Link></p>}
      </section>

      <section className="band"><div className="wrap">
        <h2>How we write each explainer</h2>
        <ol className="steps">
          <li><h3>Start with something you have noticed</h3><p>Every article begins with a small, real moment, like a lift that skips your floor or a door that opens for no one.</p></li>
          <li><h3>Follow the signal</h3><p>We trace what the sensor, program or controller actually does, in the order it does it.</p></li>
          <li><h3>Say it in plain words</h3><p>Technical terms appear only when they help, and each one is explained the first time it shows up.</p></li>
        </ol>
      </div></section>
    </>
  );
}

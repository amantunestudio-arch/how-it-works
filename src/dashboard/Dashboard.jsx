import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from '../router.jsx';
import { deleteArticle, listArticles, logout, session, syncSite } from '../lib.js';
import { Logo } from '../components/Layout.jsx';

export function DHead({ children }) {
  const nav = useNavigate();
  return (
    <header className="dtop"><div className="brand dark"><Logo /><span>dashboard</span></div><span className="sp" />
      {children}<Link className="btn ghost sm" to="/" target="_blank">View site</Link>
      <button className="btn ghost sm" onClick={() => { logout(); nav('/dashboard/login'); }}>Logout</button></header>
  );
}
export default function Dashboard() {
  const [list, setList] = useState(null); const [err, setErr] = useState('');
  const load = () => listArticles().then(setList).catch(e => setErr(e.message));
  useEffect(() => { if (session()) load(); }, []);
  if (!session()) return <Navigate to="/dashboard/login" replace />;
  async function del(a) {
    if (!confirm(`"${a.title}" delete karna hai?`)) return;
    try { await deleteArticle(a.slug); setList(list.filter(x => x.slug !== a.slug)); } catch (e) { setErr(e.message); }
  }
  return (
    <div className="dash"><DHead><button className="btn ghost sm" onClick={() => { setErr(''); syncSite().then(() => alert('Site sync ho gayi.')).catch(e => setErr(e.message)); }}>Sync site</button><Link className="btn pri sm" to="/dashboard/new">+ New article</Link></DHead>
      <main className="dmain"><h1>Articles</h1>
        <p className="hint">Save karte hi site update ho jaati hai (GitHub cache ki wajah se 1–5 minute lag sakte hain).</p>
        {err && <p className="err" role="alert">{err}</p>}
        {!list && !err && <p>Loading…</p>}
        {list && !list.length && <p className="empty">Abhi koi article nahi hai. “New article” se shuru karo.</p>}
        {list && list.length > 0 && <div className="dcard"><table><thead><tr><th>Title</th><th>Date</th><th>Status</th><th /></tr></thead><tbody>
          {list.map(a => <tr key={a.slug}><td>{a.title}</td><td>{a.date}</td>
            <td><span className={'pill ' + a.status}>{a.status}</span></td>
            <td className="acts"><Link className="btn ghost sm" to={`/dashboard/edit/${a.slug}`}>Edit</Link>
              <button className="btn ghost sm danger" onClick={() => del(a)}>Delete</button></td></tr>)}
        </tbody></table></div>}
      </main></div>
  );
}

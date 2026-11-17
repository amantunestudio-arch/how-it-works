import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LOCAL, deleteArticle, listArticles, logout, publishLive, session } from '../lib.js';
import { Logo } from '../components/Layout.jsx';

export function DHead({ children }) {
  const nav = useNavigate();
  return (
    <header className="dtop"><div className="brand dark"><Logo /><span>dashboard</span></div><span className="sp" />
      {children}<Link className="btn ghost sm" to="/" target="_blank">View site</Link>
      {!LOCAL && <button className="btn ghost sm" onClick={() => { logout(); nav('/dashboard/login'); }}>Logout</button>}</header>
  );
}
export default function Dashboard() {
  const [list, setList] = useState(null); const [err, setErr] = useState('');
  const [pub, setPub] = useState({ busy: false, msg: '', ok: true });
  async function goLive() {
    if (!confirm('Site live update karni hai? (push/upload me thoda time lag sakta hai)')) return;
    setPub({ busy: true, msg: 'Publish ho raha hai…', ok: true });
    try { const r = await publishLive(); setPub({ busy: false, msg: r.message, ok: true }); }
    catch (e) { setPub({ busy: false, msg: e.message, ok: false }); }
  }
  const load = () => listArticles().then(setList).catch(e => setErr(e.message));
  useEffect(() => { if (session()) load(); }, []);
  if (!session()) return <Navigate to="/dashboard/login" replace />;
  async function del(a) {
    if (!confirm(`"${a.title}" delete karna hai?`)) return;
    try { await deleteArticle(a.slug); setList(list.filter(x => x.slug !== a.slug)); } catch (e) { setErr(e.message); }
  }
  return (
    <div className="dash"><DHead>{LOCAL && <button className="btn sm" disabled={pub.busy} onClick={goLive}>{pub.busy ? 'Publishing…' : 'Publish live'}</button>}<Link className="btn pri sm" to="/dashboard/new">+ New article</Link></DHead>
      <main className="dmain"><h1>Articles</h1>
        <p className="hint">{LOCAL ? 'Save karne par change sirf is computer par dikhta hai (localhost). Sabko dikhane ke liye upar “Publish live” dabao.' : 'Save ke 1–2 minute baad site apne aap update ho jaati hai.'}</p>
        {pub.msg && <p className={pub.ok ? 'hint' : 'err'} role="status" style={{ whiteSpace: 'pre-line' }}>{pub.msg}</p>}
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

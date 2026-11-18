import { useState } from 'react';
import { Navigate, useNavigate } from '../router.jsx';
import { login, session } from '../lib.js';
import { Logo } from '../components/Layout.jsx';
export default function Login() {
  const nav = useNavigate();
  const [f, setF] = useState({ owner: '', repo: '', token: '' });
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (session()) return <Navigate to="/dashboard" replace />;
  const set = k => e => setF({ ...f, [k]: e.target.value.trim() });
  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(f, remember); nav('/dashboard'); } catch (x) { setErr(x.message || 'Login nahi hua'); }
    setBusy(false);
  }
  return (
    <div className="dlogin"><form className="lbox" onSubmit={submit}>
      <div className="brand dark"><Logo /><span>how it works</span></div>
      <h1>Dashboard login</h1>
      <p className="hint">Sirf wahi login kar sakta hai jiske paas GitHub token hai.</p>
      <label>GitHub username<input value={f.owner} onChange={set('owner')} autoComplete="username" required /></label>
      <label>Repository name<input value={f.repo} onChange={set('repo')} required /></label>
      <label>Access token<input type="password" value={f.token} onChange={set('token')} autoComplete="current-password" required /></label>
      <label className="chk"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Is device par yaad rakho</label>
      <button className="btn pri" disabled={busy}>{busy ? 'Checking…' : 'Login'}</button>
      {err && <p className="err" role="alert">{err}</p>}
    </form></div>
  );
}

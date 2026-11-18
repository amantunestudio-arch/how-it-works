// Chhota hash-router (react-router-dom ki jagah). Static hosting par 404 nahi aata: URL /#/blog jaisa hota hai.
import React, { createContext, useContext, useEffect, useState } from 'react';
const Ctx = createContext({ path: '/', params: {}, outlet: null });
const cur = () => { let p = location.hash.replace(/^#/, '') || '/'; p = p.split('?')[0]; return p.startsWith('/') ? p : '/' + p; };
export const useNavigate = () => (to, o) => { const h = '#' + to; if (o && o.replace) location.replace(h); else location.hash = h; };
export const useParams = () => useContext(Ctx).params;
export const Outlet = () => useContext(Ctx).outlet;
export function Link({ to, children, ...r }) { return <a href={'#' + to} {...r}>{children}</a>; }
export function NavLink({ to, end, className, children, ...r }) {
  const { path } = useContext(Ctx);
  const on = end ? path === to : path === to || path.startsWith(to + '/');
  return <a href={'#' + to} className={[typeof className === 'string' ? className : '', on ? 'active' : ''].join(' ').trim()} aria-current={on ? 'page' : undefined} {...r}>{children}</a>;
}
export function Navigate({ to, replace }) { useEffect(() => { useNavigate()(to, { replace: true }); }, [to]); return null; }
export const Route = () => null;
function match(pattern, path) {
  const ps = pattern.split('/').filter(Boolean), xs = path.split('/').filter(Boolean), params = {};
  for (let i = 0; i < ps.length; i++) {
    if (ps[i] === '*') return params;
    if (xs[i] === undefined) return null;
    if (ps[i][0] === ':') params[ps[i].slice(1)] = decodeURIComponent(xs[i]); else if (ps[i] !== xs[i]) return null;
  }
  return xs.length === ps.length ? params : null;
}
function flatten(children, layout = null, out = []) {
  React.Children.forEach(children, c => {
    const p = c.props;
    if (p.children && !p.path && !p.index) flatten(p.children, p.element, out);
    else out.push({ pattern: p.index ? '' : p.path, element: p.element, layout, star: p.path === '*' });
  });
  return out;
}
export function Routes({ children }) {
  const [path, setPath] = useState(cur());
  useEffect(() => { const f = () => { setPath(cur()); window.scrollTo(0, 0); }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  const rs = flatten(children);
  let hit = null;
  for (const r of rs) { if (r.star) continue; const m = match(r.pattern, path); if (m) { hit = { r, m }; break; } }
  if (!hit) { const r = rs.find(x => x.star); if (r) hit = { r, m: {} }; }
  if (!hit) return null;
  const inner = <Ctx.Provider value={{ path, params: hit.m, outlet: null }}>{hit.r.element}</Ctx.Provider>;
  if (!hit.r.layout) return inner;
  return <Ctx.Provider value={{ path, params: hit.m, outlet: inner }}>{hit.r.layout}</Ctx.Provider>;
}
export const HashRouter = ({ children }) => children;

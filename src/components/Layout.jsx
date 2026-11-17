import { Link, NavLink, Outlet } from 'react-router-dom';
import { SITE } from '../lib.js';
export const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#F4B63F"/><path d="M14 20h14v24h8V20h14" fill="none" stroke="#0F3B45" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
export default function Layout() {
  return (
    <>
      <header className="top"><div className="wrap bar">
        <Link to="/" className="brand" aria-label={SITE.name + ' home'}><Logo /><span>how it works</span></Link>
        <nav aria-label="Main menu">
          <NavLink to="/" end>Home</NavLink><NavLink to="/blog">Blog</NavLink>
          <NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink>
        </nav>
      </div></header>
      <main><Outlet /></main>
      <footer><div className="wrap foot">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span className="fl"><Link to="/blog">Blog</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></span>
      </div></footer>
    </>
  );
}

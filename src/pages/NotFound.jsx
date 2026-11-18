import { Link } from '../router.jsx';
import { usePage } from '../lib.js';
export default function NotFound() {
  usePage('Page not found');
  return <div className="prose"><h1>This page does not exist</h1><p>The link may be old or mistyped.</p><p><Link className="btn pri" to="/">Go to the home page</Link></p></div>;
}

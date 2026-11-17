import { Link } from 'react-router-dom';
import { usePage } from '../lib.js';
export default function About() {
  usePage('About', 'How It Works explains everyday machines and software in plain English. Learn who we write for and how we keep things accurate.');
  return (
    <>
      <section className="pagehead"><div className="wrap"><h1>About How It Works</h1><p>We explain the ordinary things that quietly work around you.</p></div></section>
      <div className="prose">
        <h2>Why this site exists</h2>
        <p>Most of us use lifts, search engines and automatic doors dozens of times a week and never learn what makes them tick. The explanations that do exist tend to be either a one-line shortcut or a textbook chapter. We aim for the space in between.</p>
        <h2>Who it is for</h2>
        <p>Curious readers, students, and anyone who has ever said "wait, how does that actually work?" You do not need a technical background. If a term is needed, we explain it right where it appears.</p>
        <h2>How we keep it accurate</h2>
        <p>Each article is built around what the technology is known to do, with careful wording where designs differ between manufacturers. When something varies, we say so instead of pretending there is one answer.</p>
        <p><Link className="btn pri" to="/blog">Start reading</Link></p>
      </div>
    </>
  );
}

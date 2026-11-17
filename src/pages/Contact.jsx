import { SITE, usePage } from '../lib.js';
export default function Contact() {
  usePage('Contact', 'Suggest a topic, report a mistake or just say hello.');
  return (
    <>
      <section className="pagehead"><div className="wrap"><h1>Contact</h1><p>Suggest something we should explain, or tell us if we got a detail wrong.</p></div></section>
      <div className="prose">
        <form action={`mailto:${SITE.email}`} method="post" encType="text/plain" className="form">
          <label>Your name<input name="name" autoComplete="name" required /></label>
          <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
          <label>Message<textarea name="message" required /></label>
          <button className="btn pri" type="submit">Send message</button>
        </form>
      </div>
    </>
  );
}

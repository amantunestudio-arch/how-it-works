// content/articles/*.json  ->  public/data/ (sirf published articles site par jaate hain)
import fs from 'fs';
const src = 'content/articles', out = 'public/data';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out + '/articles', { recursive: true });
const all = (fs.existsSync(src) ? fs.readdirSync(src) : [])
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(`${src}/${f}`, 'utf8')))
  .filter(a => a.status !== 'draft')
  .sort((a, b) => b.date.localeCompare(a.date));
all.forEach(a => fs.writeFileSync(`${out}/articles/${a.slug}.json`, JSON.stringify(a)));
const words = h => h.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
fs.writeFileSync(`${out}/index.json`, JSON.stringify(all.map(({ content, faq, note, ...s }) => ({ ...s, minutes: Math.max(1, Math.round(words(content || '') / 200)) }))));
const idx = JSON.parse(fs.readFileSync(`${out}/index.json`, 'utf8'));
fs.writeFileSync(`${out}/all.js`, 'window.HIW_DATA=' + JSON.stringify({ index: idx, articles: Object.fromEntries(all.map(a => [a.slug, a])) }) + ';');
console.log('Published articles:', all.length);

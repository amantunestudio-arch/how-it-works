import { build } from '/opt/npm-tools/node_modules/esbuild/lib/main.js';
import fs from 'fs';
fs.rmSync('dist', { recursive: true, force: true }); fs.mkdirSync('dist/assets', { recursive: true });
await build({ entryPoints: ['src/main.jsx'], bundle: true, minify: true, outfile: 'dist/assets/app.js', jsx: 'automatic', loader: { '.js': 'jsx' }, define: { 'import.meta.env.BASE_URL': '"./"', 'process.env.NODE_ENV': '"production"' }, nodePaths: [process.env.GNODE], format: 'iife' });
fs.cpSync('public', 'dist', { recursive: true });
let h = fs.readFileSync('index.html', 'utf8').replace('<script type="module" src="/src/main.jsx"></script>', '<link rel="stylesheet" href="assets/app.css"><script src="assets/app.js"></script>').replace('href="/favicon.svg"', 'href="favicon.svg"');
fs.writeFileSync('dist/index.html', h);

import { useEffect, useRef } from 'react';
import { fileToDataUrl, sanitize } from '../lib.js';
export default function RichEditor({ initial, onChange }) {
  const ref = useRef();
  useEffect(() => { document.execCommand('defaultParagraphSeparator', false, 'p'); ref.current.innerHTML = initial || '<p><br></p>'; }, []);
  const out = () => onChange(ref.current.innerHTML);
  const cmd = (c, v) => { ref.current.focus(); document.execCommand(c, false, v); out(); };
  const link = () => {
    const u = prompt('Link ka URL (https://...)'); if (!u) return;
    getSelection().isCollapsed ? cmd('insertHTML', `<a href="${u.replace(/"/g, '')}">${u.replace(/</g, '')}</a>`) : cmd('createLink', u);
  };
  const addFile = async f => { if (f?.type.startsWith('image/')) cmd('insertImage', await fileToDataUrl(f)); };
  const onPaste = e => {
    const h = e.clipboardData.getData('text/html');
    if (h) { e.preventDefault(); document.execCommand('insertHTML', false, sanitize(h)); out(); }
    else if (e.clipboardData.files[0]) { e.preventDefault(); addFile(e.clipboardData.files[0]); }
  };
  const B = ({ t, c, v, label }) => <button type="button" title={label || t} onMouseDown={e => { e.preventDefault(); cmd(c, v); }}>{t}</button>;
  return (
    <div className="rte">
      <div className="tb">
        <B t="H2" c="formatBlock" v="h2" label="Heading" /><B t="H3" c="formatBlock" v="h3" label="Sub-heading" /><B t="¶" c="formatBlock" v="p" label="Paragraph" />
        <B t="B" c="bold" label="Bold" /><B t="I" c="italic" label="Italic" />
        <B t="• List" c="insertUnorderedList" /><B t="1. List" c="insertOrderedList" /><B t="❝" c="formatBlock" v="blockquote" label="Quote" />
        <button type="button" onMouseDown={e => { e.preventDefault(); link(); }}>Link</button>
        <B t="Unlink" c="unlink" />
        <label className="up">Image<input type="file" accept="image/*" hidden onChange={e => { addFile(e.target.files[0]); e.target.value = ''; }} /></label>
        <button type="button" onMouseDown={e => { e.preventDefault(); const u = prompt('Image ka URL (https://...)'); if (u) cmd('insertImage', u); }}>Image URL</button>
        <B t="↶" c="undo" label="Undo" /><B t="↷" c="redo" label="Redo" />
      </div>
      <div ref={ref} className="prose ed" contentEditable suppressContentEditableWarning onInput={out} onPaste={onPaste}
        onDrop={e => { if (e.dataTransfer.files[0]) { e.preventDefault(); addFile(e.dataTransfer.files[0]); } }} />
    </div>
  );
}

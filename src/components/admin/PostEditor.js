import React, { useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { refreshCategories, useCategories, usePageTitle } from '../../utils';
import ArticleBody from '../ArticleBody';
import { ErrorMessage, Loading } from '../States';
import { prepareImage } from './image';

const EMPTY = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  author: '',
  imageUrl: '',
  imageCaption: '',
  featured: false,
  status: 'draft',
};

const fromPost = (post) => ({
  title: post.title,
  excerpt: post.autoExcerpt ? '' : post.excerpt,
  content: post.content,
  category: post.category,
  author: post.author || '',
  imageUrl: post.imageUrl || '',
  imageCaption: post.imageCaption || '',
  featured: post.featured,
  status: post.status,
});

const FORMAT_BUTTONS = [
  { kind: 'heading', label: 'Heading', title: 'Sub-heading: turns the current line into a heading' },
  { kind: 'bold', label: 'B', title: 'Bold (Ctrl+B)' },
  { kind: 'quote', label: '“ ”', title: 'Pull quote: turns the current line(s) into a quote' },
  { kind: 'list', label: '• List', title: 'Bullet list: turns the current line(s) into list items' },
];

const LINE_PREFIX = { heading: /^#{2,3}\s+/, quote: /^>\s?/, list: /^[-*]\s+/ };
const PLACEHOLDER = { heading: 'Sub-heading', quote: 'Quote', list: 'List item', bold: 'bold text' };

// Works out the edit for a formatting button: which range of the text to replace, with what,
// and what to select afterwards (the placeholder, so typing replaces it).
// Heading/quote/list act on the whole line(s) under the cursor and toggle off when applied twice.
export function formatEdit(value, start, end, kind) {
  if (kind === 'bold') {
    const selected = value.slice(start, end);
    if (value.slice(start - 2, start) === '**' && value.slice(end, end + 2) === '**') {
      return { from: start - 2, to: end + 2, text: selected, select: [start - 2, end - 2] };
    }
    const inner = selected || PLACEHOLDER.bold;
    return { from: start, to: end, text: `**${inner}**`, select: [start + 2, start + 2 + inner.length] };
  }

  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = value.indexOf('\n', end > start && value[end - 1] === '\n' ? end - 1 : end);
  if (lineEnd === -1) lineEnd = value.length;
  const lines = value.slice(lineStart, lineEnd).split('\n');
  const prefix = LINE_PREFIX[kind];
  const filled = lines.filter((l) => l.trim());

  let block;
  let placeholder = false;
  if (filled.length && filled.every((l) => prefix.test(l))) {
    block = lines.map((l) => l.replace(prefix, '')).join('\n'); // already formatted: remove it
  } else if (!filled.length) {
    placeholder = true;
    block = `${kind === 'heading' ? '## ' : kind === 'quote' ? '> ' : '- '}${PLACEHOLDER[kind]}`;
  } else if (kind === 'heading') {
    block = `## ${filled.map((l) => l.trim()).join(' ')}`; // a heading must be a single line
  } else {
    const mark = kind === 'quote' ? '> ' : '- ';
    block = filled.map((l) => mark + l.replace(LINE_PREFIX.list, '').replace(LINE_PREFIX.quote, '').trim()).join('\n');
  }

  // Formatted blocks need an empty line before and after them to be recognised.
  const before = value.slice(0, lineStart);
  const after = value.slice(lineEnd);
  const pre = before && !before.endsWith('\n\n') ? '\n' : '';
  const post = after && !after.startsWith('\n\n') ? '\n' : ''; // `after` always starts at a line break
  const blockStart = lineStart + pre.length;
  const select = placeholder
    ? [blockStart + block.length - PLACEHOLDER[kind].length, blockStart + block.length]
    : [blockStart + block.length, blockStart + block.length];
  return { from: lineStart, to: lineEnd, text: pre + block + post, select };
}

// Replaces text the way typing would, so Ctrl+Z still works and the page doesn't jump.
function replaceText(el, from, to, text) {
  el.focus({ preventScroll: true });
  el.setSelectionRange(from, to);
  let done = false;
  try {
    done = document.execCommand('insertText', false, text);
  } catch {
    done = false;
  }
  if (!done || el.value.slice(from, from + text.length) !== text) {
    el.setRangeText(text, from, to, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Unsaved text is copied to this browser while you type, so it survives an expired login,
// a closed tab or a crash. The copy is offered back when the article is opened again.
const backupKey = (id) => `ipps_editor_backup_${id || 'new'}`;

function readBackup(key) {
  try {
    const backup = JSON.parse(localStorage.getItem(key));
    return backup && backup.form ? backup : null;
  } catch {
    return null;
  }
}

function writeBackup(key, value) {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // Storage full or blocked: the backup is a convenience, so carry on without it.
  }
}

export default function PostEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const categories = useCategories();
  const contentRef = useRef(null);
  const cursorPlaced = useRef(false); // has the writer clicked or typed in the article text yet?
  const [formatHint, setFormatHint] = useState(false);

  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(EMPTY);
  const [pendingImage, setPendingImage] = useState(null); // data URL waiting to be uploaded on save
  const [loadState, setLoadState] = useState(isNew ? 'ready' : 'loading');
  const [tab, setTab] = useState('write');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [imageBusy, setImageBusy] = useState(false);
  const [backup, setBackup] = useState(null); // unsaved text found from an earlier visit
  usePageTitle(isNew ? 'New article' : 'Edit article');

  useEffect(() => {
    cursorPlaced.current = false;
    setFormatHint(false);
    setBackup(null);
    const ready = (loaded) => {
      setForm(loaded);
      setSaved(loaded);
      setPendingImage(null);
      setLoadState('ready');
      const found = readBackup(backupKey(id));
      if (found && JSON.stringify(found.form) !== JSON.stringify(loaded)) setBackup(found);
    };
    if (isNew) {
      ready(EMPTY);
      return;
    }
    setLoadState('loading');
    api.getPost(id).then(({ post }) => ready(fromPost(post)), (err) => setLoadState(err.message));
  }, [id, isNew]);

  const dirty = pendingImage !== null || JSON.stringify(form) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty || loadState !== 'ready') return undefined;
    const timer = setTimeout(() => writeBackup(backupKey(id), { form, savedAt: Date.now() }), 600);
    return () => clearTimeout(timer);
  }, [dirty, form, id, loadState]);

  const restoreBackup = () => {
    setForm({ ...backup.form });
    setBackup(null);
  };

  const discardBackup = () => {
    writeBackup(backupKey(id), null);
    setBackup(null);
  };

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Same warning when leaving through a link inside the site (All articles, Log out, the menu…).
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !saving && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('You have unsaved changes. Leave without saving?\n\nA copy is kept on this device and offered when you open the article again.')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setMessage('');
  };

  const applyFormat = (kind) => {
    const el = contentRef.current;
    if (!el) return;
    // Until the writer has clicked into the text, the browser puts the cursor at the very end,
    // which used to send headings to the bottom of the article. Ask where to put it instead.
    if (!cursorPlaced.current && el.value.trim()) {
      setFormatHint(true);
      el.focus({ preventScroll: true });
      return;
    }
    setFormatHint(false);
    const { scrollX, scrollY } = window;
    const edit = formatEdit(el.value, el.selectionStart, el.selectionEnd, kind);
    replaceText(el, edit.from, edit.to, edit.text);
    el.setSelectionRange(...edit.select);
    cursorPlaced.current = true;
    window.scrollTo(scrollX, scrollY);
  };

  const onContentKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('bold');
    }
  };

  const markCursor = () => {
    cursorPlaced.current = true;
    setFormatHint(false);
  };

  const chooseImage = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setImageBusy(true);
    try {
      setPendingImage(await prepareImage(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setImageBusy(false);
    }
  };

  const removeImage = () => {
    setPendingImage(null);
    setForm((f) => ({ ...f, imageUrl: '', imageCaption: '' }));
  };

  const save = async (nextStatus) => {
    setError('');
    setMessage('');
    if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
      setError('Title, category and article text are required.');
      return;
    }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (pendingImage) imageUrl = (await api.uploadImage(pendingImage)).url;
      const payload = { ...form, imageUrl, status: nextStatus };
      const { post } = isNew ? await api.createPost(payload) : await api.updatePost(id, payload);
      const fresh = fromPost(post);
      setForm(fresh);
      setSaved(fresh);
      setPendingImage(null);
      setBackup(null);
      writeBackup(backupKey(id), null);
      writeBackup(backupKey(post.id), null);
      refreshCategories();
      const wasPublished = !isNew && saved.status === 'published';
      if (post.status === 'published') setMessage(wasPublished ? 'Changes saved. The live article is updated.' : 'Published! The article is live on the site.');
      else setMessage(wasPublished ? 'Unpublished. The article is hidden from readers and saved as a draft.' : 'Draft saved. It is not visible to readers yet.');
      if (isNew) navigate(`/admin/edit/${post.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadState === 'loading') return <Loading label="Loading article…" />;
  if (loadState !== 'ready') return <ErrorMessage message={loadState} />;

  const previewImage = pendingImage || form.imageUrl;
  const isPublished = saved.status === 'published' && !isNew;

  return (
    <form
      className="editor"
      onSubmit={(e) => {
        e.preventDefault();
        save(isPublished ? 'published' : 'draft');
      }}
    >
      <div className="admin-head">
        <div>
          <Link to="/admin" className="text-link">
            ← All articles
          </Link>
          <h1>{isNew ? 'New article' : 'Edit article'}</h1>
        </div>
        <div className="editor__status">
          {dirty ? <span className="badge badge--draft">Unsaved changes</span> : !isNew && <span className="badge badge--published">Saved</span>}
          {isPublished && (
            <Link to={`/article/${id}`} target="_blank" rel="noopener noreferrer" className="text-link">
              View on site ↗
            </Link>
          )}
        </div>
      </div>

      {backup && (
        <div className="admin-notice editor__backup" role="status">
          <span>
            You have unsaved changes to this article from{' '}
            {new Date(backup.savedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}. Do you want them back?
          </span>
          <span className="editor__backup-actions">
            <button type="button" className="btn btn--small" onClick={restoreBackup}>
              Restore
            </button>
            <button type="button" className="btn btn--small btn--outline" onClick={discardBackup}>
              Discard
            </button>
          </span>
        </div>
      )}
      {error && (
        <p className="admin-notice admin-notice--error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="admin-notice admin-notice--success" role="status">
          {message}
        </p>
      )}

      <div className="editor__grid">
        <div className="editor__main">
          <label htmlFor="title">Headline</label>
          <input id="title" className="editor__title" value={form.title} onChange={set('title')} maxLength={300} placeholder="Write a clear, specific headline" required />

          <label htmlFor="excerpt">
            Summary <span className="optional">(optional, shown under the headline and on cards; generated from the text if empty)</span>
          </label>
          <textarea id="excerpt" rows={2} value={form.excerpt} onChange={set('excerpt')} maxLength={500} />

          <div className="editor__tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'write'} className={tab === 'write' ? 'is-active' : ''} onClick={() => setTab('write')}>
              Write
            </button>
            <button type="button" role="tab" aria-selected={tab === 'preview'} className={tab === 'preview' ? 'is-active' : ''} onClick={() => setTab('preview')}>
              Preview
            </button>
            {tab === 'write' && (
              <div className="editor__format">
                {FORMAT_BUTTONS.map((b) => (
                  <button key={b.kind} type="button" title={b.title} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat(b.kind)}>
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {tab === 'write' ? (
            <>
              {formatHint && (
                <p className="admin-notice editor__hint" role="status">
                  Click in the article text where you want the formatting first, or select the text you want to format, then press the
                  button again.
                </p>
              )}
              <label htmlFor="content" className="sr-only">
                Article text
              </label>
              <textarea
                id="content"
                ref={contentRef}
                className="editor__content"
                value={form.content}
                onChange={set('content')}
                onKeyDown={onContentKeyDown}
                onMouseUp={markCursor}
                onTouchEnd={markCursor}
                onKeyUp={markCursor}
                placeholder="Write the article here. Leave an empty line between paragraphs."
                required
              />
              <p className="editor__help">
                Leave an empty line between paragraphs. <code>## Heading</code> for a sub-heading, <code>**bold**</code>, <code>&gt; quote</code>,{' '}
                <code>- item</code> for lists. Links starting with https:// become clickable.{' '}
                <Link to="/admin/guide#format" target="_blank" rel="noopener noreferrer">
                  Formatting guide ↗
                </Link>
              </p>
            </>
          ) : (
            <div className="editor__preview">
              {form.content.trim() ? <ArticleBody content={form.content} /> : <p className="meta">Nothing to preview yet.</p>}
            </div>
          )}
        </div>

        <aside className="editor__side">
          <section className="panel">
            <h2>Publish</h2>
            <p className="meta">
              Status: <strong>{isPublished ? 'Published' : 'Draft'}</strong>
            </p>
            <div className="panel__actions">
              {isPublished ? (
                <>
                  <button type="button" className="btn" disabled={saving} onClick={() => save('published')}>
                    {saving ? 'Saving…' : 'Update'}
                  </button>
                  <button type="button" className="btn btn--outline" disabled={saving} onClick={() => save('draft')}>
                    Unpublish
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn" disabled={saving} onClick={() => save('published')}>
                    {saving ? 'Saving…' : 'Publish'}
                  </button>
                  <button type="button" className="btn btn--outline" disabled={saving} onClick={() => save('draft')}>
                    Save draft
                  </button>
                </>
              )}
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={form.featured} onChange={set('featured')} />
              <span>
                <strong>Headline</strong>
                <small>Show as the top story and in the headlines ticker</small>
              </span>
            </label>
          </section>

          <section className="panel">
            <h2>Details</h2>
            <label htmlFor="category">Category</label>
            <input id="category" list="category-options" value={form.category} onChange={set('category')} maxLength={60} placeholder="e.g. Patents, Technology" required />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>
            <label htmlFor="author">
              Author <span className="optional">(optional)</span>
            </label>
            <input id="author" value={form.author} onChange={set('author')} maxLength={100} />
          </section>

          <section className="panel">
            <h2>Image</h2>
            {previewImage ? (
              <div className="image-field">
                <img src={previewImage} alt="Selected" />
                <div className="image-field__actions">
                  <label className="btn btn--small btn--outline">
                    Replace
                    <input type="file" accept="image/*" onChange={chooseImage} hidden />
                  </label>
                  <button type="button" className="btn btn--small btn--danger" onClick={removeImage}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="dropzone">
                <input type="file" accept="image/*" onChange={chooseImage} hidden />
                {imageBusy ? 'Processing…' : 'Click to choose an image'}
                <small>JPEG, PNG, WebP or GIF. Large photos are resized automatically.</small>
              </label>
            )}
            {previewImage && (
              <>
                <label htmlFor="imageCaption">
                  Caption <span className="optional">(optional)</span>
                </label>
                <input id="imageCaption" value={form.imageCaption} onChange={set('imageCaption')} maxLength={300} />
              </>
            )}
          </section>
        </aside>
      </div>
    </form>
  );
}

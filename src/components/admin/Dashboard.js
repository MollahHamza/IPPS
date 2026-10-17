import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { api } from '../../api';
import { formatDate, refreshCategories, usePageTitle } from '../../utils';
import { ErrorMessage, Loading } from '../States';

async function fetchAllPosts() {
  const all = [];
  for (;;) {
    const page = await api.listPosts({ status: 'all', limit: 100, offset: all.length });
    all.push(...page.posts);
    if (!page.posts.length || all.length >= page.total) return all;
  }
}

export default function Dashboard() {
  usePageTitle('Admin');
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    setStatus('loading');
    fetchAllPosts().then(
      (all) => {
        setPosts(all);
        setStatus('ready');
      },
      (err) => setStatus(err.message)
    );
  }, []);

  useEffect(load, [load]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
      featured: posts.filter((p) => p.featured).length,
    }),
    [posts]
  );

  const visible = posts.filter((p) => {
    if (filter === 'featured' ? !p.featured : filter !== 'all' && p.status !== filter) return false;
    const q = search.trim().toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const toggleFeatured = async (post) => {
    setBusyId(post.id);
    setNotice('');
    try {
      const { post: updated } = await api.updatePost(post.id, { featured: !post.featured });
      setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, featured: updated.featured } : p)));
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBusyId(post.id);
    setNotice('');
    try {
      await api.deletePost(post.id);
      setPosts((list) => list.filter((p) => p.id !== post.id));
      refreshCategories();
      setNotice(`Deleted “${post.title}”.`);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (status === 'loading') return <Loading label="Loading articles…" />;
  if (status !== 'ready') return <ErrorMessage message={status} onRetry={load} />;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Articles</h1>
          <p className="meta">
            New here? Read the <Link to="/admin/guide">admin guide</Link>.
          </p>
        </div>
        <Link to="/admin/new" className="btn">
          + New article
        </Link>
      </div>

      <div className="admin-stats">
        {[
          ['all', 'All articles'],
          ['published', 'Published'],
          ['draft', 'Drafts'],
          ['featured', 'Headlines'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`admin-stat ${filter === key ? 'is-active' : ''}`}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
          >
            <strong>{counts[key]}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by title or category…"
          aria-label="Search articles"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {notice && (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="state-message">
          <p>{posts.length ? 'No articles match this filter.' : 'No articles yet. Write the first one!'}</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Article</th>
                <th scope="col">Status</th>
                <th scope="col" title="Headline articles appear in the top story and the headlines ticker">
                  Headline
                </th>
                <th scope="col">Date</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="admin-article">
                      {post.imageUrl ? <img src={post.imageUrl} alt="" /> : <span className="admin-article__noimg" />}
                      <div>
                        <Link to={`/admin/edit/${post.id}`} className="admin-article__title">
                          {post.title}
                        </Link>
                        <span className="admin-article__cat">{post.category}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge--${post.status}`}>{post.status === 'draft' ? 'Draft' : 'Published'}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`star ${post.featured ? 'is-on' : ''}`}
                      onClick={() => toggleFeatured(post)}
                      disabled={busyId === post.id}
                      aria-label={post.featured ? 'Remove from headlines' : 'Mark as headline'}
                      title={post.featured ? 'Remove from headlines' : 'Mark as headline'}
                    >
                      {post.featured ? <FaStar /> : <FaRegStar />}
                    </button>
                  </td>
                  <td className="admin-date">{formatDate(post.publishedAt || post.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <div className="admin-actions">
                      <Link to={`/admin/edit/${post.id}`} className="btn btn--small btn--outline">
                        Edit
                      </Link>
                      {post.status === 'published' && (
                        <Link to={`/article/${post.id}`} target="_blank" rel="noopener noreferrer" className="btn btn--small btn--outline">
                          View
                        </Link>
                      )}
                      <button type="button" className="btn btn--small btn--danger" onClick={() => remove(post)} disabled={busyId === post.id}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

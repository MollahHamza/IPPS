import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { usePageTitle } from '../utils';
import ArticleCard from './ArticleCard';
import { ErrorMessage, Loading } from './States';

const PAGE_SIZE = 12;

// Shared by /category/:name and /search?q=
export default function ListingPage({ mode }) {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim();
  const filter = mode === 'category' ? { category: name } : { q };
  const title = mode === 'category' ? name : q ? `Search: “${q}”` : 'Search';
  usePageTitle(title);

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const filterKey = JSON.stringify(filter);

  const load = useCallback(() => {
    const params = JSON.parse(filterKey);
    if (mode === 'search' && !params.q) {
      setPosts([]);
      setTotal(0);
      setStatus('ready');
      return;
    }
    setStatus('loading');
    api.listPosts({ ...params, limit: PAGE_SIZE }).then(
      (data) => {
        setPosts(data.posts);
        setTotal(data.total);
        setStatus('ready');
      },
      (err) => setStatus(err.message)
    );
  }, [filterKey, mode]);

  useEffect(load, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await api.listPosts({ ...filter, limit: PAGE_SIZE, offset: posts.length });
      setPosts((current) => [...current, ...data.posts]);
      setTotal(data.total);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="container listing">
      <header className="listing__header">
        <p className="kicker">{mode === 'category' ? 'Section' : 'Search results'}</p>
        <h1>{mode === 'category' ? name : q ? `“${q}”` : 'Search'}</h1>
        {status === 'ready' && (mode === 'category' || q) && (
          <p className="meta">
            {total} {total === 1 ? 'article' : 'articles'}
          </p>
        )}
      </header>

      {status === 'loading' && <Loading />}
      {status !== 'loading' && status !== 'ready' && <ErrorMessage message={status} onRetry={load} />}
      {status === 'ready' && !posts.length && (
        <div className="state-message">
          <p>{mode === 'search' && !q ? 'Type something in the search box to find articles.' : 'No articles found.'}</p>
          <Link to="/" className="text-link">
            ← Back to the front page
          </Link>
        </div>
      )}

      {status === 'ready' && posts.length > 0 && (
        <>
          <div className="story-list">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="row" />
            ))}
          </div>
          {posts.length < total && (
            <div className="load-more">
              <button type="button" className="btn btn--outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'More stories'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

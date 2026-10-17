import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { categoryPath, useCategories, usePageTitle } from '../utils';
import ArticleCard from './ArticleCard';
import Ticker from './Ticker';
import { ErrorMessage, Loading } from './States';

const FIRST_PAGE = 24;
const PAGE_SIZE = 12;
const TOP_STORIES = 4;

function Sidebar() {
  const categories = useCategories();
  return (
    <>
      {categories.length > 0 && (
        <section className="side-box">
          <h2 className="section-title">Sections</h2>
          <ul className="side-categories">
            {categories.map((c) => (
              <li key={c.name}>
                <Link to={categoryPath(c.name)}>
                  {c.name}
                  <span>{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="side-box side-box--promo">
        <p className="kicker">In focus</p>
        <h3>Intellectual Property in Bangladesh</h3>
        <p>Statistics, regional comparisons, laws and the offices that protect patents, trademarks and designs.</p>
        <Link to="/ip-bangladesh" className="btn">
          Explore the data
        </Link>
      </section>
      <section className="side-box">
        <h2 className="section-title">About IPPS</h2>
        <p className="side-text">
          We work to build a strong intellectual property ecosystem that protects invention and creativity in Bangladesh.
        </p>
        <Link to="/about" className="text-link">
          Read more about us →
        </Link>
      </section>
    </>
  );
}

const HomePage = () => {
  usePageTitle(null);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState('');

  const load = useCallback(() => {
    setStatus('loading');
    api.listPosts({ limit: FIRST_PAGE }).then(
      (data) => {
        setPosts(data.posts);
        setTotal(data.total);
        setStatus('ready');
      },
      (err) => setStatus(err.message)
    );
  }, []);

  useEffect(load, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    setMoreError('');
    try {
      const data = await api.listPosts({ limit: PAGE_SIZE, offset: posts.length });
      setPosts((current) => [...current, ...data.posts.filter((p) => !current.some((c) => c.id === p.id))]);
      setTotal(data.total);
    } catch (err) {
      setMoreError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  if (status === 'loading') return <Loading label="Loading the latest news…" />;
  if (status !== 'ready') return <ErrorMessage message={status} onRetry={load} />;

  if (!posts.length) {
    return (
      <div className="container">
        <div className="empty-front">
          <h2>No articles yet</h2>
          <p>Articles published from the admin panel will appear here.</p>
        </div>
      </div>
    );
  }

  const featured = posts.filter((p) => p.featured);
  const lead = featured[0] || posts[0];
  const rest = posts.filter((p) => p.id !== lead.id);
  const topStories = rest.slice(0, TOP_STORIES);
  const latest = rest.slice(TOP_STORIES);
  const tickerPosts = (featured.length ? featured : posts).slice(0, 8);

  return (
    <>
      <Ticker posts={tickerPosts} />
      <div className="container">
        <section className={`front-top ${topStories.length ? '' : 'front-top--solo'}`} aria-label="Top stories">
          <ArticleCard post={lead} variant="lead" />
          {topStories.length > 0 && (
            <div className="top-stories">
              <h2 className="section-title">Top Stories</h2>
              {topStories.map((post) => (
                <ArticleCard key={post.id} post={post} variant="compact" />
              ))}
            </div>
          )}
        </section>

        {latest.length > 0 ? (
          <div className="front-body">
            <section className="latest" aria-label="Latest news">
              <h2 className="section-title">Latest News</h2>
              <div className="story-grid">
                {latest.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
              {posts.length < total && (
                <div className="load-more">
                  {moreError && <p className="form-error">{moreError}</p>}
                  <button type="button" className="btn btn--outline" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading…' : 'More stories'}
                  </button>
                </div>
              )}
            </section>
            <aside className="sidebar">
              <Sidebar />
            </aside>
          </div>
        ) : (
          <div className="front-extras">
            <Sidebar />
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;

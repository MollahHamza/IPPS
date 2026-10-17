import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaFacebookF, FaLink, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { api } from '../api';
import { categoryPath, formatDate, usePageTitle } from '../utils';
import ArticleBody from './ArticleBody';
import ArticleCard from './ArticleCard';
import { ErrorMessage, Loading, NotFound } from './States';
import './ArticlePage.css';

function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable (e.g. plain http): fall back to a temporary text field.
      const field = document.createElement('textarea');
      field.value = url;
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-bar">
      <span>Share</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
        <FaFacebookF />
      </a>
      <a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <FaWhatsapp />
      </a>
      <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
        <FaXTwitter />
      </a>
      <button type="button" onClick={copy} aria-label="Copy link">
        <FaLink />
      </button>
      {copied && (
        <span className="copy-popup" role="status">
          Link copied to clipboard!
        </span>
      )}
    </div>
  );
}

const ArticlePage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading');
  usePageTitle(post?.title);

  const load = useCallback(() => {
    setStatus('loading');
    setRelated([]);
    window.scrollTo(0, 0);
    api.getPost(id).then(
      ({ post: loaded }) => {
        setPost(loaded);
        setStatus('ready');
        // Same section first, topped up with the latest stories.
        Promise.all([
          api.listPosts({ category: loaded.category, exclude: loaded.id, limit: 3 }),
          api.listPosts({ exclude: loaded.id, limit: 6 }),
        ])
          .then(([same, latest]) => {
            const merged = [...same.posts, ...latest.posts.filter((p) => !same.posts.some((s) => s.id === p.id))];
            setRelated(merged.slice(0, 3));
          })
          .catch(() => {});
      },
      (err) => setStatus(err.status === 404 ? 'missing' : err.message)
    );
  }, [id]);

  useEffect(load, [load]);

  if (status === 'loading') return <Loading label="Loading article…" />;
  if (status === 'missing') return <NotFound title="Article not found" message="This article may have been removed or the link is incorrect." />;
  if (status !== 'ready') return <ErrorMessage message={status} onRetry={load} />;

  const date = post.publishedAt || post.createdAt;
  const updated = post.updatedAt && post.updatedAt.slice(0, 10) !== (date || '').slice(0, 10);

  return (
    <div className="container">
      <article className="article">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to={categoryPath(post.category)}>{post.category}</Link>
        </nav>

        <header className="article__header">
          <Link to={categoryPath(post.category)} className="kicker">
            {post.category}
          </Link>
          <h1>{post.title}</h1>
          {!post.autoExcerpt && post.excerpt && <p className="article__standfirst">{post.excerpt}</p>}
          <div className="article__byline">
            <div className="meta">
              {post.author && <strong>By {post.author}</strong>}
              <span>
                <time dateTime={date}>{formatDate(date)}</time>
                {updated && <> · Updated {formatDate(post.updatedAt)}</>}
              </span>
              <span>{post.readingMinutes} min read</span>
            </div>
            <ShareBar title={post.title} />
          </div>
        </header>

        {post.imageUrl && (
          <figure className="article__figure">
            <img src={post.imageUrl} alt={post.imageCaption || post.title} />
            {post.imageCaption && <figcaption>{post.imageCaption}</figcaption>}
          </figure>
        )}

        <ArticleBody content={post.content} />

        <footer className="article__footer">
          <ShareBar title={post.title} />
        </footer>
      </article>

      {related.length > 0 && (
        <section className="related" aria-label="More stories">
          <h2 className="section-title">More Stories</h2>
          <div className="story-grid story-grid--3">
            {related.map((p) => (
              <ArticleCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ArticlePage;

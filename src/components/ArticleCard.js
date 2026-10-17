import React from 'react';
import { Link } from 'react-router-dom';
import { categoryPath, formatDate, timeAgo } from '../utils';

// One component for every way a story appears on the site:
//   lead    - the big top story
//   card    - image on top, used in grids
//   compact - small thumbnail beside the headline (top stories, related)
//   row     - wide image left, text right (category and search pages)
export default function ArticleCard({ post, variant = 'card', showExcerpt = true }) {
  const href = `/article/${post.id}`;
  const date = post.publishedAt || post.createdAt;

  return (
    <article className={`story story--${variant}`}>
      {post.imageUrl && (
        <Link to={href} className="story__media" tabIndex={-1} aria-hidden="true">
          <img src={post.imageUrl} alt="" loading={variant === 'lead' ? 'eager' : 'lazy'} />
        </Link>
      )}
      <div className="story__text">
        <Link to={categoryPath(post.category)} className="kicker">
          {post.category}
        </Link>
        {variant === 'lead' ? (
          <h2 className="story__title">
            <Link to={href}>{post.title}</Link>
          </h2>
        ) : (
          <h3 className="story__title">
            <Link to={href}>{post.title}</Link>
          </h3>
        )}
        {showExcerpt && variant !== 'compact' && post.excerpt && <p className="story__excerpt">{post.excerpt}</p>}
        <p className="meta">
          <time dateTime={date} title={formatDate(date)}>
            {timeAgo(date)}
          </time>
          {variant !== 'compact' && post.readingMinutes ? <span> · {post.readingMinutes} min read</span> : null}
        </p>
      </div>
    </article>
  );
}

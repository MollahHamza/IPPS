import React from 'react';
import { Link } from 'react-router-dom';

// "Headlines" strip under the navigation. Scrolls when there's more than one story;
// pauses on hover/focus and stays still for people who prefer reduced motion.
export default function Ticker({ posts }) {
  if (!posts.length) return null;
  const animate = posts.length > 1;
  const items = animate ? [...posts, ...posts] : posts;

  return (
    <div className="ticker" aria-label="Headlines">
      <div className="container ticker__inner">
        <span className="ticker__label">Headlines</span>
        <div className="ticker__viewport">
          <ul className={`ticker__track ${animate ? 'is-animated' : ''}`} style={{ '--ticker-duration': `${posts.length * 9}s` }}>
            {items.map((post, i) => (
              <li key={`${post.id}-${i}`} aria-hidden={i >= posts.length ? 'true' : undefined}>
                <Link to={`/article/${post.id}`} tabIndex={i >= posts.length ? -1 : undefined}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

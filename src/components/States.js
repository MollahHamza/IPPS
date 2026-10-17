import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../utils';

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="state-message" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-message state-message--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function NotFound({ title = 'Page not found', message = "The page you're looking for doesn't exist or has been moved." }) {
  usePageTitle(title);
  return (
    <div className="container not-found">
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/" className="btn">
        Back to the front page
      </Link>
    </div>
  );
}

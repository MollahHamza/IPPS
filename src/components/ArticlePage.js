// src/components/ArticlePage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArticles } from '../services/airtable';
import './ArticlePage.css';

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCopyPopup, setShowCopyPopup] = useState(false);

  useEffect(() => {
    const getArticle = async () => {
      try {
        const articles = await fetchArticles();
        const foundArticle = articles.find((article) => article.id === id);
        if (foundArticle) {
          setArticle(foundArticle.fields);
          // Set meta tags for social media preview
          document.title = foundArticle.fields.Title;
          updateMetaTags(foundArticle.fields);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    getArticle();
  }, [id]);

  const updateMetaTags = (articleData) => {
    // Update Open Graph meta tags
    const metaTags = {
      'og:title': articleData.Title,
      'og:description': articleData.Content.substring(0, 200),
      'og:image': articleData.Image?.[0]?.url || '',
      'og:url': window.location.href,
      'og:type': 'article'
    };

    Object.entries(metaTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyPopup(true);
      setTimeout(() => setShowCopyPopup(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="article-page">
      <h1>{article.Title}</h1>
      {article.Image && article.Image[0] && (
        <img src={article.Image[0].url} alt={article.Title} />
      )}
      <div className="article-content">
        <p dangerouslySetInnerHTML={{ __html: article.Content.replace(/\n/g, '<br/>') }} />
      </div>
      <button onClick={handleShare} className="share-button">
        Share Article
      </button>
      {showCopyPopup && (
        <div className="copy-popup">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default ArticlePage;

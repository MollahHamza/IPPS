// src/components/ArticlePage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArticles } from '../services/airtable';

const ArticlePage = () => {
  const { id } = useParams(); // Get the article ID from the URL
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getArticle = async () => {
      try {
        const articles = await fetchArticles();
        const foundArticle = articles.find((article) => article.id === id); // Find the article by ID
        if (foundArticle) {
          setArticle(foundArticle.fields);
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
  }, [id]); // Re-run when `id` changes

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="article-page">
      <h1>{article.Title}</h1>
      <img src={article.Image[0]?.url} alt={article.Title} />
      <div>{article.Content}</div>
    </div>
  );
};

export default ArticlePage;

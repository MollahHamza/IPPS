import React, { useState, useEffect } from 'react';
import { addArticle, fetchArticles, deleteArticle } from '../services/airtable';
import './AdminPanel.css';

const AdminPanel = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const fetchedArticles = await fetchArticles();
      setArticles(fetchedArticles);
    } catch (err) {
      setError('Failed to load articles');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      if (imageFile) {
        // Use the file name as the URL for now
        // In a production environment, you would upload the image to a storage service
        // and use the returned URL
        imageUrl = URL.createObjectURL(imageFile);
      }

      const articleData = {
        Title: title,
        Content: content,
        Image: imageUrl ? [{ url: imageUrl }] : [],
        Category: category,
      };
      
      await addArticle(articleData);
      alert('Article added successfully!');
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreview('');
      setCategory('');
      loadArticles(); // Refresh the article list
    } catch (err) {
      setError('Failed to add article');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(articleId);
        alert('Article deleted successfully!');
        loadArticles(); // Refresh the article list
      } catch (err) {
        setError('Failed to delete article');
      }
    }
  };

  return (
    <div className="admin-panel">
      <h2>Add New Article</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="image">Image Upload:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Article'}
        </button>
      </form>

      <div className="articles-list">
        <h2>Existing Articles</h2>
        {articles.map((article) => (
          <div key={article.id} className="article-item">
            <h3>{article.fields.Title}</h3>
            <button
              onClick={() => handleDeleteArticle(article.id)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;

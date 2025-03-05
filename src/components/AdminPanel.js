import React, { useState } from 'react';
import { addArticle } from '../services/airtable'; // Import the addArticle function
import './AdminPanel.css';

const AdminPanel = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');  // Single line text input for category
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const articleData = {
        Title: title,
        Content: content,
        Image: imageUrl ? [{ url: imageUrl }] : [],  // Optional image
        Category: category,  // Category now as a single line text
      };
      const result = await addArticle(articleData);
      alert('Article added successfully!');
      setTitle('');
      setContent('');
      setImageUrl('');
      setCategory('');
    } catch (err) {
      setError('Failed to add article');
    } finally {
      setLoading(false);
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
          <label htmlFor="image">Image URL:</label>
          <input
            type="text"
            id="image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
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
    </div>
  );
};

export default AdminPanel;

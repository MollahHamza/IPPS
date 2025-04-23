import React, { useState, useEffect } from 'react';
import { addArticle, fetchArticles, deleteArticle } from '../services/airtable';
import './AdminPanel.css';

const AdminPanel = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [category, setCategory] = useState('');
  const [headline, setHeadline] = useState(false);
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
      console.error('Error loading articles:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size - limit to 1MB
    if (file.size > 1024 * 1024) {
      setError('Image size exceeds 1MB. Please choose a smaller image.');
      setImageFile(null);
      setImagePreview('');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      setImageFile(null);
      setImagePreview('');
      return;
    }
    
    setImageFile(file);
    setError(''); // Clear any previous errors
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setImageFile(null);
      setImagePreview('');
    };
    reader.readAsDataURL(file);
  };

  // Function to convert file to base64 string with compression
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Validate file size and type
      if (file.size > 1024 * 1024) {
        reject(new Error('Image size exceeds 1MB'));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        reject(new Error('Invalid file type'));
        return;
      }
      
      // For all images, we'll use compression to ensure they're under Airtable's limits
      const img = new Image();
      const canvas = document.createElement('canvas');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 800; // Reduce dimensions if larger than this
          
          if (width > height && width > maxDimension) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas with new dimensions
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get compressed data URL (JPEG with quality adjusted based on size)
          // Use lower quality for larger images
          const quality = file.size > 500 * 1024 ? 0.6 : 0.8;
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!content.trim()) {
        throw new Error('Content is required');
      }
      
      if (!category.trim()) {
        throw new Error('Category is required');
      }

      let imageData = null;
      if (imageFile) {
        try {
          // Convert image file to base64 string with compression
          imageData = await convertFileToBase64(imageFile);
        } catch (imgError) {
          throw new Error(`Image processing error: ${imgError.message}`);
        }
      }

      const articleData = {
        Title: title.trim(),
        Content: content.trim(),
        // Format image data for Airtable
        Image: imageData ? [{
          filename: imageFile.name,
          type: 'image/jpeg', // We're converting all images to JPEG
          base64: imageData.split(',')[1] // Remove the data URL prefix
        }] : [],
        Category: category.trim(),
        headline: headline,
      };
      
      await addArticle(articleData);
      
      // Reset form after successful submission
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreview('');
      setCategory('');
      setHeadline(false);
      
      // Show success message and refresh article list
      alert('Article added successfully!');
      loadArticles();
    } catch (err) {
      setError(err.message || 'Failed to add article. Please try again.');
      console.error('Article submission error:', err);
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
        console.error('Delete error:', err);
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
          <label htmlFor="image">Image Upload (Max 1MB):</label>
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

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="headline"
            checked={headline}
            onChange={(e) => setHeadline(e.target.checked)}
          />
          <label htmlFor="headline">Mark as Headline</label>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Article'}
        </button>
      </form>

      <div className="articles-list">
        <h2>Existing Articles</h2>
        {articles.length === 0 ? (
          <p>No articles found.</p>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="article-item">
              <h3>{article.fields.Title}</h3>
              <button
                onClick={() => handleDeleteArticle(article.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

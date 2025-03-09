import React, { useEffect, useState } from 'react';
import { fetchArticles } from '../services/airtable';
import { Link } from 'react-router-dom';
import '../components/ArticleList.css'; // Import the CSS file

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [visibleArticles, setVisibleArticles] = useState(8); // Changed from 5 to 8
  const [allArticlesFetched, setAllArticlesFetched] = useState(false);

  // Fetch articles and categories when the component mounts
  useEffect(() => {
    const getArticles = async () => {
      const fetchedArticles = await fetchArticles();
      setArticles(fetchedArticles);

      // Extract unique categories from the articles
      const uniqueCategories = [
        ...new Set(fetchedArticles.map((article) => article.fields.Category)), // Ensure "Category" matches the Airtable field name
      ];
      setCategories(uniqueCategories);
    };
    getArticles();
  }, []);

  // Filter articles based on the selected category
  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.fields.Category === selectedCategory)
    : articles;

  // Show More functionality
  const loadMoreArticles = () => {
    if (visibleArticles + 5 <= filteredArticles.length) {
      setVisibleArticles(visibleArticles + 5);
    } else {
      setVisibleArticles(filteredArticles.length);
      setAllArticlesFetched(true); // All articles are fetched, so disable "Show More"
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setVisibleArticles(5); // Reset the number of visible articles
    setAllArticlesFetched(false); // Reset the "Show More" button
  };

  return (
    <div className="article-list">
      <h2>Latest Articles</h2>

      {/* Category Filter - Horizontal Bar */}
      <div className="category-filter">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-btn ${category === selectedCategory ? 'selected' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
        <button
          className={`category-btn ${!selectedCategory ? 'selected' : ''}`}
          onClick={() => handleCategoryChange('')}
        >
          All Categories
        </button>
      </div>

      {/* Articles Display */}
      <div className="articles">
        {filteredArticles.slice(0, visibleArticles).map((article) => (
          <div className="article" key={article.id}>
            <h3>{article.fields.Title}</h3>
            {article.fields.Image && (
              <img
                src={article.fields.Image[0].url}
                alt={article.fields.Title}
                className="article-image"
              />
            )}
            <p>{article.fields.Content.substring(0, 200)}{article.fields.Content.length > 200 ? '...' : ''}</p>
            <Link to={`/article/${article.id}`} className="read-more">
              Read More
            </Link>
          </div>
        ))}

        {filteredArticles.length === 0 && <p>No articles found.</p>}
      </div>

      {/* Show More Button */}
      {!allArticlesFetched && filteredArticles.length > visibleArticles && (
        <button className="show-more-btn" onClick={loadMoreArticles}>
          Show More
        </button>
      )}
    </div>
  );
};

export default ArticleList;

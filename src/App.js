// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // Import Header
import Footer from './components/Footer'; // Import Footer
import ArticleList from './components/ArticleList';
import ArticlePage from './components/ArticlePage';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header /> {/* Add the Header here */}
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<ArticleList />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>

        <Footer /> {/* Add the Footer here */}
      </div>
    </Router>
  );
}

export default App;

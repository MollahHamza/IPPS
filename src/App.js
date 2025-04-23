// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleList from './components/ArticleList';
import ArticlePage from './components/ArticlePage';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import AboutUs from './components/AboutUs';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="App">
        <Header />
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<ArticleList />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login setAuthenticated={setIsAuthenticated} />} />
            <Route
              path="/admin"
              element={
                isAuthenticated ? (
                  <AdminPanel />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

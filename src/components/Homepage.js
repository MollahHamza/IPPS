// src/components/HomePage.js
import React from "react";
import "./HomePage.css";
import { Link } from "react-router-dom";
import HeaderImage from "../assets/header-image.png"; // Replace with your logo path

const HomePage = () => {
  return (
    <div className="homepage">
      <header className="header">
        <img src={HeaderImage} alt="Logo" className="header-logo" />
      </header>

      <main className="main-content">
        <h2>Recent Articles</h2>
        {/* You can add a section here for displaying recent articles */}
      </main>

      <footer className="footer">
        <p>© 2025 Article Website. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;

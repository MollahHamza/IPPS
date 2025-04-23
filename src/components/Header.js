// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link to enable navigation
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        {/* Wrapping the logo image inside the Link component */}
        <Link to="/">
          <img src={process.env.PUBLIC_URL + '/2.jpg'} alt="Logo" />
        </Link>
      </div>
      <div className="site-title">
        <h1>IPPS</h1>
        <p>Empowering Bangladesh Through Awareness</p>
      </div>
      <nav className="main-nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

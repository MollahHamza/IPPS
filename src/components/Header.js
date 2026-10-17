import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import { categoryPath, formatDate, useCategories } from '../utils';
import './Header.css';

const MAX_NAV_CATEGORIES = 5;

const Header = () => {
  const categories = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const today = formatDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar__inner">
          <span>{today}</span>
          <span className="topbar__links">
            <Link to="/ip-bangladesh">IP in Bangladesh</Link>
            <Link to="/about">About Us</Link>
          </span>
        </div>
      </div>

      <div className="masthead">
        <div className="container masthead__inner">
          <Link to="/" className="masthead__logo" aria-label="IPPS home">
            <img src={process.env.PUBLIC_URL + '/2.jpg'} alt="IPPS logo" />
          </Link>
          <div className="masthead__title">
            <Link to="/">IPPS</Link>
            <p>Empowering Bangladesh Through Awareness</p>
          </div>
        </div>
      </div>

      <nav className="navbar" aria-label="Main">
        <div className="container navbar__inner">
          <button
            type="button"
            className="navbar__toggle"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
            <span>Menu</span>
          </button>

          <ul id="main-menu" className={`navbar__links ${menuOpen ? 'is-open' : ''}`}>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            {categories.slice(0, MAX_NAV_CATEGORIES).map((c) => (
              <li key={c.name}>
                <NavLink to={categoryPath(c.name)}>{c.name}</NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/ip-bangladesh">IP in Bangladesh</NavLink>
            </li>
            <li>
              <NavLink to="/about">About Us</NavLink>
            </li>
          </ul>

          <form className="navbar__search" role="search" onSubmit={submitSearch}>
            <input
              type="search"
              placeholder="Search news…"
              aria-label="Search news"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <FaSearch aria-hidden="true" />
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
};

export default Header;

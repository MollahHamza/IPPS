import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { categoryPath, useCategories } from '../utils';
import './Footer.css';

const Footer = () => {
  const categories = useCategories();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__about">
          <Link to="/" className="footer__brand">
            IPPS
          </Link>
          <p>
            Fostering Bangladesh's transition towards a knowledge economy through the promotion and protection of
            intellectual property rights.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="IPPS on Facebook">
              <FaFacebook size={24} />
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" aria-label="Message IPPS on WhatsApp">
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>

        <div>
          <h3>Sections</h3>
          <ul>
            <li>
              <Link to="/">Front page</Link>
            </li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.name}>
                <Link to={categoryPath(c.name)}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/ip-bangladesh">IP in Bangladesh</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Contact Us</h3>
          <ul className="footer__contact">
            <li>Dhaka, Bangladesh</li>
            <li>
              <a href="mailto:contact@ipps.org.bd">contact@ipps.org.bd</a>
            </li>
            <li>
              <a href="tel:+8801234567890">+880 1234-567890</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} IPPS. All rights reserved.</span>
          <Link to="/admin" className="footer__admin">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

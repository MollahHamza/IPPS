// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Importing the CSS file for footer styling
import { FaFacebook, FaWhatsapp } from 'react-icons/fa'; // Importing social media icons

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Address: Dhaka, Bangladesh</p>
          <p>Email: contact@ipps.org.bd</p>
          <p>Phone: +880 1234-567890</p>
        </div>
        
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook size={30} />
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp size={30} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

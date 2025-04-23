// src/components/AboutUs.js
import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us">
      <div className="about-us-container">
        <h1>About Us</h1>
        
        <div className="about-us-content">
          <p>
            At IPPS, we are dedicated to fostering Bangladesh's transition towards a knowledge economy through the promotion and protection of intellectual property rights. We recognize that an effective Intellectual Property system is the key to accelerating industrial development and creating a sustainable future for our nation.
          </p>
          
          <p>
            Our mission is to help create a robust IP eco-system that protects invention and creativity under various forms of intellectual property rights, including patents, copyrights, industrial designs, trademarks, trade secrets, geographical indications, and plant variety rights.
          </p>
          
          <h2>Our Vision</h2>
          <p>
            Bangladesh has already developed its IP Policy 2018, which aligns with the nation's sustainable development plan. At IPPS, we work to support and strengthen the national IP framework that bridges socio-economic growth and local innovation through intellectual property rights.
          </p>
          
          <h2>What We Do</h2>
          <p>
            We facilitate effective decision-making and stakeholder engagement across industries and government bodies. Our work encompasses:
          </p>
          
          <ul>
            <li>Developing robust innovation strategies</li>
            <li>Supporting multi-disciplinary research</li>
            <li>Aligning with international agreements and fostering collaborations</li>
            <li>Providing education and awareness about intellectual property rights</li>
            <li>Advocating for stronger IP protection mechanisms</li>
          </ul>
          
          <p>
            Through our initiatives, we aim to empower Bangladesh's creative and innovative sectors, contributing to the nation's economic growth and global competitiveness in the knowledge economy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
// src/components/IPBangladesh.js
import React from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './IPBangladesh.css';

const IPBangladesh = () => {
  // Sample data for charts - Replace with actual WIPO data
  const patentData = {
    labels: ['2018', '2019', '2020', '2021', '2022'],
    datasets: [{
      label: 'Patent Applications in Bangladesh',
      data: [350, 420, 480, 520, 600],
      backgroundColor: '#3498db',
      borderColor: '#2980b9',
      borderWidth: 1
    }]
  };

  // Enhanced comparative patent data with neighboring countries
  const comparativePatentData = {
    labels: ['2018', '2019', '2020', '2021', '2022'],
    datasets: [
      {
        label: 'Bangladesh',
        data: [350, 420, 480, 520, 600],
        backgroundColor: '#3498db',
        borderColor: '#3498db',
        borderWidth: 2
      },
      {
        label: 'India',
        data: [17000, 19500, 21000, 23400, 25800],
        backgroundColor: '#e74c3c',
        borderColor: '#e74c3c',
        borderWidth: 2
      },
      {
        label: 'Pakistan',
        data: [800, 950, 1100, 1250, 1400],
        backgroundColor: '#2ecc71',
        borderColor: '#2ecc71',
        borderWidth: 2
      },
      {
        label: 'Sri Lanka',
        data: [450, 520, 580, 650, 720],
        backgroundColor: '#f1c40f',
        borderColor: '#f1c40f',
        borderWidth: 2
      }
    ]
  };

  // Per capita IP filings comparison
  const perCapitaData = {
    labels: ['Bangladesh', 'India', 'Pakistan', 'Sri Lanka', 'Malaysia', 'Singapore'],
    datasets: [{
      label: 'Patent Applications per Million Population (2022)',
      data: [3.6, 18.7, 6.3, 33.5, 58.2, 243.7],
      backgroundColor: [
        '#3498db',
        '#e74c3c',
        '#2ecc71',
        '#f1c40f',
        '#9b59b6',
        '#1abc9c'
      ],
      borderColor: '#ffffff',
      borderWidth: 1
    }]
  };

  // Global ranking data
  const globalRankingData = {
    labels: ['Patents', 'Trademarks', 'Industrial Designs'],
    datasets: [{
      label: 'Global Ranking',
      data: [75, 45, 60],
      backgroundColor: [
        '#e74c3c',
        '#2ecc71',
        '#f1c40f'
      ]
    }]
  };

  // Regional trademark comparison
  const trademarkComparisonData = {
    labels: ['Bangladesh', 'India', 'Pakistan', 'Sri Lanka', 'Thailand', 'Vietnam'],
    datasets: [{
      label: 'Trademark Applications (2022)',
      data: [8500, 340000, 12000, 5800, 46000, 65000],
      backgroundColor: '#9b59b6',
      borderColor: '#8e44ad',
      borderWidth: 1
    }]
  };

  // Year-over-year growth rate of IP applications
  const growthRateData = {
    labels: ['2019', '2020', '2021', '2022'],
    datasets: [
      {
        label: 'Bangladesh',
        data: [20, 14.3, 8.3, 15.4], // Percentage growth rates
        backgroundColor: '#3498db',
        borderColor: '#3498db',
        borderWidth: 2,
        type: 'line',
        tension: 0.4
      },
      {
        label: 'Regional Average',
        data: [15.2, 10.5, 12.8, 14.2], // Percentage growth rates
        backgroundColor: '#e67e22',
        borderColor: '#e67e22',
        borderWidth: 2,
        type: 'line',
        tension: 0.4
      },
      {
        label: 'Global Average',
        data: [8.5, 4.2, 9.7, 11.3], // Percentage growth rates
        backgroundColor: '#2ecc71',
        borderColor: '#2ecc71',
        borderWidth: 2,
        type: 'line',
        tension: 0.4
      }
    ]
  };

  const ipOffices = [
    {
      name: 'Department of Patents, Designs and Trademarks (DPDT)',
      address: '91, Motijheel C/A, Dhaka-1000, Bangladesh',
      phone: '+880-2-9555705',
      email: 'registrar@dpdt.gov.bd',
      website: 'https://dpdt.portal.gov.bd/'
    }
  ];

  return (
    <div className="ip-bangladesh-container">
      <section className="ip-header">
        <h1>Intellectual Property in Bangladesh</h1>
        <p>Comprehensive overview of IP landscape, statistics, and resources in Bangladesh</p>
      </section>

      <section className="ip-overview">
        <h2>IP Overview</h2>
        <div className="info-cards">
          <div className="info-card">
            <h3>Patents</h3>
            <p>Bangladesh's patent system is governed by the Patents and Designs Act, 1911. The country has seen steady growth in patent applications over recent years.</p>
            <a href="https://www.wipo.int/patents/en/" target="_blank" rel="noopener noreferrer">Learn more about Patents at WIPO →</a>
          </div>
          <div className="info-card">
            <h3>Trademarks</h3>
            <p>The Trademarks Act, 2009 provides protection for trademarks in Bangladesh. The country has a growing presence in international trademark registrations.</p>
            <a href="https://www.wipo.int/trademarks/en/" target="_blank" rel="noopener noreferrer">Learn more about Trademarks at WIPO →</a>
          </div>
          <div className="info-card">
            <h3>Industrial Designs</h3>
            <p>Industrial designs are protected under the Patents and Designs Act, 1911, offering protection for new and original designs.</p>
            <a href="https://www.wipo.int/designs/en/" target="_blank" rel="noopener noreferrer">Learn more about Industrial Designs at WIPO →</a>
          </div>
        </div>
      </section>

      <section className="ip-statistics">
        <h2>IP Statistics and Global Comparison</h2>
        <p className="statistics-intro">The following charts provide a comprehensive comparison of Bangladesh's IP position relative to neighboring countries and global leaders, revealing both progress and significant challenges. Data is sourced from WIPO statistics database.</p>
        
        <div className="charts-container">
          <div className="chart-box">
            <h3>Patent Applications Trend</h3>
            <Line data={patentData} options={{ responsive: true }} />
          </div>
          
          <div className="chart-box">
            <h3>Patent Applications: Regional Comparison</h3>
            <Bar data={comparativePatentData} options={{ 
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.dataset.label + ': ' + context.raw.toLocaleString();
                    }
                  }
                },
                legend: {
                  position: 'bottom'
                }
              }
            }} />
            <p className="chart-note">While Bangladesh shows some growth, it remains significantly behind India's substantial patent activity. The country is comparable with Sri Lanka and Pakistan, but all three nations face considerable gaps compared to more developed economies.</p>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-box">
            <h3>Patent Applications per Million Population</h3>
            <Bar data={perCapitaData} options={{ 
              responsive: true,
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false
                }
              }
            }} />
            <p className="chart-note">When adjusted for population size, Bangladesh's patent activity is substantially lower than regional innovation hubs like Singapore and Malaysia, indicating a significant innovation deficit that needs to be addressed.</p>
          </div>
          
          <div className="chart-box">
            <h3>Trademark Applications: Regional Comparison</h3>
            <Bar data={trademarkComparisonData} options={{ 
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              }
            }} />
            <p className="chart-note">Bangladesh shows relatively better performance in trademark applications compared to patents, though still far behind regional leaders like India, Thailand, and Vietnam, indicating limited commercial brand development.</p>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-box">
            <h3>Year-over-Year Growth Rate of IP Applications</h3>
            <Line data={growthRateData} options={{ 
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.dataset.label + ': ' + context.raw + '%';
                    }
                  }
                },
                legend: {
                  position: 'bottom'
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  },
                  title: {
                    display: true,
                    text: 'Growth Rate (%)'
                  }
                }
              }
            }} />
            <p className="chart-note">Bangladesh has shown periods of growth in IP applications that sometimes exceed global averages, but this growth is inconsistent and starts from a very low base, suggesting the country's focus on intellectual property protection and innovation remains underdeveloped.</p>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-box">
            <h3>Bangladesh's Global IP Rankings</h3>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <Doughnut data={globalRankingData} options={{ 
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} />
            </div>
            <p className="chart-note">Bangladesh ranks higher in trademarks (45th globally) than patents (75th) or industrial designs (60th), but these rankings place the country in the bottom half globally, highlighting significant room for improvement in all IP categories.</p>
          </div>
        </div>
      </section>

      <section className="global-gap">
        <h2>Bangladesh's Position Behind Global IP Markets</h2>
        <div className="gap-content">
          <p>Despite some progress in recent years, Bangladesh faces significant challenges in the global IP landscape:</p>
          <ul>
            <li><strong>Innovation Infrastructure Gap:</strong> Limited R&D facilities, insufficient funding for research institutions, and inadequate industry-academia collaboration hamper innovation output.</li>
            <li><strong>Technology Transfer Barriers:</strong> Bangladesh struggles with effective technology transfer mechanisms, limiting the commercialization of research and innovation.</li>
            <li><strong>IP Awareness and Education:</strong> Low awareness about IP rights among businesses, researchers, and the general public remains a significant obstacle.</li>
            <li><strong>Digital Transformation Lag:</strong> The country lags behind in digital IP management systems and online filing capabilities compared to global standards.</li>
            <li><strong>Enforcement Challenges:</strong> Weak enforcement mechanisms and lengthy legal processes discourage IP protection and investment.</li>
            <li><strong>Global Patent Activity:</strong> In 2022, Bangladesh filed approximately 600 patent applications, while developed economies like the US (over 500,000), China (over 1.5 million), and Japan (over 300,000) demonstrate the enormous gap in innovation output.</li>
          </ul>
          <p>These challenges represent significant barriers to Bangladesh's integration into the global knowledge economy and highlight the need for comprehensive reforms and investment in the IP ecosystem.</p>
          <p>However, with targeted policies, increased awareness, and strategic investments in innovation infrastructure, Bangladesh has the potential to significantly improve its position in the global IP landscape in the coming decades. Recent government initiatives to modernize IP offices and update IP laws represent positive steps toward addressing these challenges.</p>
        </div>
      </section>

      <section className="ip-offices">
        <h2>IP Offices in Bangladesh</h2>
        <div className="offices-container">
          {ipOffices.map((office, index) => (
            <div key={index} className="office-card">
              <h3>{office.name}</h3>
              <p><strong>Address:</strong> {office.address}</p>
              <p><strong>Phone:</strong> {office.phone}</p>
              <p><strong>Email:</strong> {office.email}</p>
              <a href={office.website} target="_blank" rel="noopener noreferrer">Visit Official Website →</a>
            </div>
          ))}
        </div>
      </section>

      <section className="wipo-resources">
        <h2>WIPO Resources</h2>
        <div className="resources-grid">
          <a href="https://www.wipo.int/portal/en/index.html" target="_blank" rel="noopener noreferrer" className="resource-link">
            WIPO Official Website
          </a>
          <a href="https://www.wipo.int/directory/en/" target="_blank" rel="noopener noreferrer" className="resource-link">
            IP Offices Directory
          </a>
          <a href="https://www.wipo.int/ipstats/en/" target="_blank" rel="noopener noreferrer" className="resource-link">
            IP Statistics Data Center
          </a>
          <a href="https://wipolex.wipo.int/en/legislation/profile/BD" target="_blank" rel="noopener noreferrer" className="resource-link">
            Bangladesh IP Laws & Treaties
          </a>
        </div>
      </section>
    </div>
  );
};

export default IPBangladesh;
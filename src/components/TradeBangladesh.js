// src/components/TradeBangladesh.js
import React from 'react';
import { usePageTitle } from '../utils';
import './IPBangladesh.css'; // shares the cards, headings and resource links of the IP page
import './TradeBangladesh.css';

const SECTIONS = [
  ['basics', 'Trade, manufacturing and production'],
  ['items', 'What is traded'],
  ['compare', 'Comparative assessment'],
  ['tables', 'Comparison tables'],
];

const KEY_FACTS = [
  ['80%+', 'of export earnings come from ready-made garments (RMG)'],
  ['2nd', 'largest garment exporter in the world, after China'],
  ['EU & US', 'the biggest markets for Bangladeshi exports'],
  ['China & India', 'the largest sources of imports'],
];

const TRADE_ITEMS = [
  {
    name: 'Goods',
    text: 'Physical products that can be touched, shipped and stored: clothes, jute, leather, frozen fish, medicines, rice, fuel and machinery.',
    example: 'Bangladesh exports garments, knitwear, jute goods, leather and medicines, and imports fuel, cotton, machinery and food grains.',
  },
  {
    name: 'Services',
    text: 'Work done for someone rather than a product handed over: software, call centres, transport, banking, tourism, consulting and freelancing.',
    example: 'IT and software exports, BPO, and online freelancing, where Bangladesh has one of the largest freelancer workforces in the world.',
  },
  {
    name: 'E-commerce',
    text: 'Buying and selling goods or services over the internet, with online payment or cash on delivery. It is a way of trading, not a product.',
    example: 'Online marketplaces, grocery delivery, Facebook shops ("F-commerce") and mobile wallets such as bKash and Nagad for payment.',
  },
  {
    name: 'Intellectual property (IP)',
    text: 'Ideas and creations that can be owned, sold or licensed: brands, patents, designs, software, music, films and books.',
    example: 'Licensing a brand or medicine formula, selling software or music rights, and protecting a garment design or a GI product such as Jamdani.',
  },
];

// Each comparison table: column headings, then one row per aspect.
const TABLES = [
  {
    id: 'table-items',
    title: 'Trade items at a glance',
    columns: ['Aspect', 'Goods', 'Services', 'E-commerce', 'IP'],
    rows: [
      ['What is sold', 'A physical product', 'Work, skill or time', 'Goods or services, sold online', 'Rights to an idea, brand or creation'],
      ['Can you touch it?', 'Yes', 'No', 'The product may be physical; the sale is digital', 'No'],
      ['How it crosses borders', 'Ship, air, road, through customs', 'Online, or people travel', 'Courier, post and online payment', 'Licence or assignment agreement'],
      ['Bangladesh examples', 'Garments, jute, leather, fish', 'Software, BPO, freelancing', 'Online shops, F-commerce', 'Brands, patents, designs, GI products'],
      ['Main rules', 'Import & Export Policy, customs, VAT', 'Service rules, foreign exchange rules', 'Digital Commerce Policy, consumer rights law', 'Trademarks, patents and copyright laws; WTO TRIPS'],
      ['Main government body', 'Ministry of Commerce, NBR (Customs)', 'Bangladesh Bank, ICT Division', 'Ministry of Commerce, DNCRP', 'DPDT, Copyright Office'],
    ],
  },
  {
    id: 'table-local-foreign',
    title: 'Local (domestic) trade vs foreign (international) trade',
    columns: ['Aspect', 'Local trade', 'Foreign trade'],
    rows: [
      ['Meaning', 'Buying and selling inside Bangladesh', 'Buying from (import) or selling to (export) other countries'],
      ['Currency', 'Taka only', 'Foreign currency, mostly US dollars'],
      ['Paperwork', 'Trade licence, TIN, VAT registration', 'Also IRC/ERC certificates, letter of credit (LC), customs and shipping documents'],
      ['Taxes', 'VAT and local taxes', 'Import duties and VAT on imports; exports often get incentives'],
      ['Transport', 'Road, rail, river; short distances', 'Sea ports (Chattogram, Mongla), airports and land ports'],
      ['Risks', 'Local demand and prices', 'Exchange rates, global demand, shipping delays, foreign rules'],
      ['Who regulates', 'Ministry of Commerce, local authorities', 'Ministry of Commerce, EPB, Bangladesh Bank, NBR'],
      ['Example', 'A Dhaka wholesaler selling rice to shops in Sylhet', 'A Gazipur factory exporting shirts to Germany'],
    ],
  },
  {
    id: 'table-made-imported',
    title: 'Locally made vs imported products',
    columns: ['Aspect', 'Made in Bangladesh', 'Imported'],
    rows: [
      ['Price', 'Often lower: no import duty or long shipping', 'Often higher: duties, shipping and exchange rates add cost'],
      ['Availability', 'Steady, and easy to restock', 'Depends on shipments, LCs and dollar supply'],
      ['Range and technology', 'Growing, strongest in clothing, food, medicine and electronics assembly', 'Wider choice, especially for machinery, cars and high-tech goods'],
      ['Effect on the economy', 'Creates local jobs and saves foreign currency', 'Uses foreign currency, but brings goods and inputs not made locally'],
      ['Quality checks', 'BSTI standards', 'BSTI standards plus customs checks'],
      ['Examples', 'Garments, packaged food, medicines, phones and fridges assembled locally', 'Fuel, cotton, wheat, cars, industrial machinery'],
    ],
  },
  {
    id: 'table-manufacturing-production',
    title: 'Manufacturing vs production',
    columns: ['Aspect', 'Manufac\u00ADturing', 'Production'], // soft hyphen: lets the heading break on narrow phones
    rows: [
      ['Meaning', 'Turning raw materials into finished goods, usually with machines and factories', 'Any activity that creates goods or services of value'],
      ['Scope', 'Narrow: one part of production', 'Broad: includes manufacturing, farming, mining and services'],
      ['Output', 'Physical, finished goods', 'Goods, crops, raw materials or services'],
      ['Inputs', 'Raw materials, machines, workers, energy', 'Land, labour, capital, skills; depends on the sector'],
      ['Where it happens', 'Factories, mills, export processing zones (EPZs)', 'Farms, rivers, gas fields, studios, offices and factories'],
      ['Bangladesh examples', 'Garments, cement, steel, medicines, ships', 'Rice and jute farming, fish, natural gas, films, software'],
    ],
  },
];

const RESOURCES = [
  ['Ministry of Commerce', 'https://mincom.gov.bd/'],
  ['Export Promotion Bureau (EPB)', 'https://epb.gov.bd/'],
  ['Bangladesh Investment Development Authority', 'https://bida.gov.bd/'],
  ['Bangladesh Bank', 'https://www.bb.org.bd/'],
  ['WTO: Bangladesh profile', 'https://www.wto.org/english/thewto_e/countries_e/bangladesh_e.htm'],
];

function CompareTable({ table }) {
  const [, ...valueColumns] = table.columns;
  return (
    // Tables comparing more than two things don't fit a phone screen; those become cards there.
    <div className={`trade-table ${valueColumns.length > 2 ? 'trade-table--wide' : ''}`} id={table.id}>
      <h3>{table.title}</h3>
      <table>
        <thead>
          <tr>
            {table.columns.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map(([aspect, ...values]) => (
            <tr key={aspect}>
              <th scope="row">{aspect}</th>
              {values.map((value, i) => (
                // data-label shows the column name when the table stacks on phones
                <td key={valueColumns[i]} data-label={valueColumns[i]}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TradeBangladesh = () => {
  usePageTitle('Trade in Bangladesh');
  return (
    <div className="ip-bangladesh-container trade-page">
      <section className="ip-header">
        <h1>Trade in Bangladesh</h1>
        <p>What trade is, what Bangladesh buys and sells, and how local and foreign trade compare</p>
      </section>

      <nav className="trade-toc" aria-label="On this page">
        {SECTIONS.map(([id, label], i) => (
          <a key={id} href={`#${id}`}>
            <span>{i + 1}</span> {label}
          </a>
        ))}
      </nav>

      <div className="trade-facts">
        {KEY_FACTS.map(([value, label]) => (
          <div key={value} className="trade-fact">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <section id="basics" className="ip-overview">
        <h2>1. What is trade, manufacturing and production?</h2>
        <div className="info-cards">
          <div className="info-card">
            <h3>Trade</h3>
            <p>
              Trade is the buying and selling of goods and services. It can happen inside the country (local or domestic trade) or with other
              countries (foreign or international trade). Selling abroad is <strong>export</strong>; buying from abroad is <strong>import</strong>.
            </p>
          </div>
          <div className="info-card">
            <h3>Manufacturing</h3>
            <p>
              Manufacturing turns raw materials into finished products using machines, tools and workers, usually in a factory. A garment factory
              that turns cotton fabric into shirts is manufacturing.
            </p>
          </div>
          <div className="info-card">
            <h3>Production</h3>
            <p>
              Production is wider: it means creating anything of value. Growing rice, catching fish, extracting gas, making a film or writing
              software are all production. Manufacturing is one kind of production.
            </p>
          </div>
        </div>
        <p className="trade-note">
          In short: <strong>production</strong> creates goods and services, <strong>manufacturing</strong> is the factory part of production,
          and <strong>trade</strong> moves what is produced to the people who buy it.
        </p>
      </section>

      <section id="items" className="ip-overview">
        <h2>2. What is traded: goods, services, e-commerce and IP</h2>
        <div className="info-cards trade-items">
          {TRADE_ITEMS.map((item) => (
            <div key={item.name} className="info-card">
              <h3>{item.name}</h3>
              <p>{item.text}</p>
              <p className="trade-example">
                <strong>In Bangladesh:</strong> {item.example}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="compare" className="global-gap">
        <h2>3. Comparative assessment</h2>
        <div className="gap-content trade-assessment">
          <h3>Local vs foreign</h3>
          <p>
            Local trade keeps money circulating inside the country and is simpler: everything is in taka and needs fewer documents. Foreign trade
            brings in the dollars Bangladesh needs to pay for fuel, machinery and raw materials, but it depends on world prices, exchange rates and
            the rules of other countries.
          </p>
          <p>
            Bangladesh's exports rely heavily on one product, garments. Spreading exports across more goods (leather, medicines, light engineering,
            agro-processing) and services (IT, software) would make the economy less exposed if garment demand falls.
          </p>
          <h3>Manufacturing vs production</h3>
          <p>
            Agriculture, fishing and natural gas are important kinds of production, and they feed people and supply raw materials. Manufacturing
            adds more value: a kilo of raw jute earns far less than a jute bag made from it. Moving from selling raw materials to selling finished
            products is one of the main ways a country increases its export earnings.
          </p>
          <h3>Why IP matters for trade</h3>
          <p>
            As Bangladesh graduates from Least Developed Country (LDC) status, some trade benefits and exemptions it now enjoys, such as duty-free
            access to some markets and flexibility on pharmaceutical patents, are set to change. Strong brands, registered designs and protected
            inventions help local products compete on quality and value instead of price alone.
          </p>
        </div>
      </section>

      <section id="tables" className="ip-statistics">
        <h2>4. Comparison tables</h2>
        <p className="statistics-intro">
          Quick side-by-side comparisons of the ideas above. The facts are a general guide; for official trade figures see the{' '}
          <a href="https://epb.gov.bd/" target="_blank" rel="noopener noreferrer">
            Export Promotion Bureau
          </a>{' '}
          and{' '}
          <a href="https://www.bb.org.bd/" target="_blank" rel="noopener noreferrer">
            Bangladesh Bank
          </a>
          .
        </p>
        {TABLES.map((table) => (
          <CompareTable key={table.id} table={table} />
        ))}
      </section>

      <section className="wipo-resources">
        <h2>Trade resources</h2>
        <div className="resources-grid">
          {RESOURCES.map(([label, url]) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="resource-link">
              {label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TradeBangladesh;

import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // gunakan useLocation untuk tahu URL aktif
import './css/home.css';
import homeImage from './asset/home.png'; // gambar hero
import profile from './asset/profile.png'; // gambar profile

function Home() {
  const location = useLocation(); // dapatkan path sekarang
  const currentPath = location.pathname;

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar container">
        <div className="navbar-logo">
          AprioMarket
        </div>
        <div className="navbar-menu">
          <Link to="/" className={currentPath === '/' ? 'active' : ''}>Home</Link>
          <Link to="/upload" className={currentPath === '/upload' ? 'active' : ''}>Upload Data</Link>
          <Link to="/promotions" className={currentPath === '/promotions' ? 'active' : ''}>Promotions</Link>
          <Link to="/about" className={currentPath === '/about' ? 'active' : ''}>About</Link>
          {/* Avatar */}
          <img
            src={profile}
            alt="Avatar"
            className="navbar-avatar"
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero container" id="home">
        <div className="hero-text">
          <h1>Grow Your Business with Smart Promotions!</h1>
          <p>Analyze your sales data easily and discover best promo strategies like Bundling, Buy 1 Get 1, and Tebus Murah!</p>
          <button>Analyze My Sales Now</button>
        </div>
        <div className="hero-image">
          <img src={homeImage} alt="Hero Illustration" style={{ width: '100%' }} />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works container" id="how-it-works">
        <h2 className="section-title">How AprioMarket Works</h2>
        <div className="how-step">
          <img src="https://img.icons8.com/color/96/000000/upload.png" alt="Upload" />
          <h3>Upload Your Sales Data</h3>
          <p>Kirimkan data penjualanmu ke sistem kami</p>
        </div>
        <div className="how-step">
          <img src="https://img.icons8.com/color/96/000000/data-configuration.png" alt="Analyze" />
          <h3>Analyze Automatically</h3>
          <p>Sistem kami akan memproses dan mencari pola terbaik</p>
        </div>
        <div className="how-step">
          <img src="https://img.icons8.com/color/96/000000/idea.png" alt="Promotion Ideas" />
          <h3>Get Promotion Ideas</h3>
          <p>Dapatkan rekomendasi promosi yang siap diterapkan!</p>
        </div>
      </section>

      {/* Discover Promotion Section */}
      <section className="promotions container" id="promotions">
        <h2 className="section-title">Discover the Perfect Promotion for Your Business</h2>
        <div className="promo-card" style={{ backgroundColor: '#E0F2FE' }}>
          <h3>Diskon Bundling</h3>
          <p>Gabungkan beberapa produk dalam satu harga spesial untuk meningkatkan volume transaksi.</p>
        </div>
        <div className="promo-card" style={{ backgroundColor: '#FEF9C3' }}>
          <h3>Buy One Get One</h3>
          <p>Beli satu produk, dapatkan produk kedua gratis — strategi klasik mempercepat perputaran stok!</p>
        </div>
        <div className="promo-card" style={{ backgroundColor: '#DCFCE7' }}>
          <h3>Tebus Murah</h3>
          <p>Beli produk utama, tebus produk lainnya dengan harga spesial untuk cross-sell maksimal!</p>
        </div>
      </section>

      {/* About Section */}
      <section className="about container" id="about">
        <h2 className="section-title">About AprioMarket</h2>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '16px', color: '#4B5563' }}>
          AprioMarket is your partner in analyzing sales data and providing the best promotion strategies to boost your business growth!
        </p>
      </section>

      {/* Footer */}
      <footer>
        © 2025 AprioMarket. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import './css/home.css';

// Diasumsikan gambar-gambar ini ada di direktori asset Anda
// Nama variabel ini disesuaikan dari file .js lama Anda untuk kemudahan
import heroImage from './asset/home.png';
import bogoIcon from './asset/bogo.png';
import bundlingIcon from './asset/bundling.png';
import pwpIcon from './asset/tebus_murah.png';
import diskonIcon from './asset/diskon.png';
import uploadIcon from './asset/upload.png';
import analyzeIcon from './asset/analisa.png';
import resultIcon from './asset/result.png';
import logoPutih from './asset/logo_putih.png';
import profileIcon from './asset/profile.png';

function Home() {
  return (
    <div className="page-container">
      {/* =============== NAV SECTION =============== */}
       {/* ====================== HEADER====================*/}
            <header className="nav-container">
                <nav className="nav-bar">
                    {/* Logo Section */}
                    <Link to="/" className="nav-logo">
                        <img src={logoPutih} alt="AprioMarket Logo" className="logo-putih-img" />
                        <span className="nav-brand-text">AprioMarket</span>
                    </Link>

                    {/* Menu Links Section */}
                    <div className="nav-menu-frame">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/upload" className="nav-link">Upload Data</Link>
                        <Link to="/promotion" className="nav-link">Promotion</Link>
                        <Link to="/profile" className="nav-profile-link">
                        <img src={profileIcon} alt="Profile" className="nav-profile-icon" />
                    </Link>
                    </div>
                </nav>
            </header>
            {/* ==================================================*/}

      {/* =============== HERO/MAIN SECTION =============== */}
      <main> 
        <section className="main-section">
          <div className="main-description">
            <h1 className="main-title">GROW YOUR BUSINESS WITH SMART PROMOTION</h1>
            <p className="main-subtitle">
              Biarkan kami yang bekerja. Temukan pola belanja unik dari data penjualan Anda dan dapatkan rekomendasi promo (Buy One Get One, Bundling, Tebus Murah dan Diskon) yang terbukti meningkatkan keuntungan.
            </p>
          </div>
          <Link to="/upload" className="analyze-button-container">
            <span className="analyze-button-text">Analisa Sekarang</span>
          </Link>
          <div className="main-hero-image" style={{ backgroundImage: `url(${heroImage})` }}></div>
        </section>

        {/* =============== DISCOVER PROMOTION SECTION =============== */}
        <section className="promotion-section">
          {/* Elemen div untuk background rectangle dekoratif */}
          <div className="promo-bg-1"></div>
          <div className="promo-bg-2"></div>

          <h2 className="discover-promotion-title">Discover The Perfect promotion</h2>
          <div className="promo-cards-container">
            <div className="promo-card bogo-card">
              <h3>BOGO</h3>
              <p>Dengan fitur yang lebih mudah digunakan membantu memudahkan pengguna dalam proses adaptasi.</p>
              <img src={bogoIcon} alt="BOGO Icon" className="promo-icon"/>
            </div>

            <div className="promo-card bundling-card">
              <h3>Bundling</h3>
              <p>Dengan antarmuka yang ramah dan panduan langkah demi langkah.</p>
              <img src={bundlingIcon} alt="Bundling Icon" className="promo-icon"/>
            </div>

            <div className="promo-card tebus-murah-card">
              <h3>Tebus Murah</h3>
              <p>Dengan antarmuka yang ramah dan panduan langkah demi langkah.</p>
              <img src={pwpIcon} alt="Tebus Murah Icon" className="promo-icon"/>
            </div>

            <div className="promo-card diskon-card">
              <h3>DISKON %</h3>
              <p>Proses rekap akan lebih aman karena adanya sistem transparansi antar pekerja.</p>
              <img src={diskonIcon} alt="Diskon Icon" className="promo-icon"/>
            </div>
          </div>
        </section>

        {/* =============== HOW APRIOMARKET WORKS SECTION =============== */}
        <section className="how-it-works-section">
          {/* Elemen div untuk background rectangle dekoratif */}
          <div className="how-it-works-bg-1"></div>
          <div className="how-it-works-bg-2"></div>
        
          <h2 className="how-it-works-title">How AprioMarket Works</h2>
          <div className="steps-container">
            <div className="step-card upload-step">
              <img src={uploadIcon} alt="Upload Data" className="step-icon" />
              <h3>Upload Data Penjualan</h3>
              <p>Unggah file CSV atau Excel Anda dengan mudah. Sistem kami akan secara otomatis membaca dan memvalidasi data Anda.</p>
            </div>

            <div className="step-card analyze-step">
              <img src={analyzeIcon} alt="Mulai Analisa" className="step-icon" />
              <h3>Sistem Memulai Analisa</h3>
              <p>Sistem akan menganalisa data transaksi dan anda dapat mengatur parameter analisa.</p>
            </div>

            <div className="step-card result-step">
              <img src={resultIcon} alt="Dapatkan Hasil" className="step-icon" />
              <h3>Dapatkan Hasil Analisa</h3>
              <p>Dapatkan insight laporan produkmu dan rekomendasi promosi yang relevan.</p>
            </div>
          </div>
        </section>
      </main>

      {/* =============== FOOTER SECTION =============== */}
      <footer className="footer-container">
         <div className="footer-background"></div>
         <div className="footer-content">
            <div className="footer-column footer-about">
               <div className="footer-logo-text">
                  <img src={logoPutih} alt="Logo Putih" className="footer-logo-img"/>
                  <span className="footer-brand-text">AprioMarket</span>
               </div>
               <p>Website yang membantu pengguna dalam proses rekap data barang secara digital.</p>
            </div>
            <div className="footer-column footer-services">
               <h4>Layanan</h4>
               <ul>
                  <li>Analisa Data Penjualan</li>
                  <li>Rekomendasi promosi</li>
                  <li>Laporan Performa Produk</li>
               </ul>
            </div>
            <div className="footer-column footer-contact">
               <h4>Contact Us</h4>
               <ul>
                  <li>+62 812 3456 7890</li>
                  <li>Apriomarket@gmail.com</li>
                  <li>@Aprimarket</li>
               </ul>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default Home;
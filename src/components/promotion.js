import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './css/promotion.css';
import logoPutih from './asset/logo_putih.png';

// --- Asset Imports for New Section ---
import buyIcon from './asset/buy_7028760.png';
import questionIcon from './asset/question.png';
import problemIcon from './asset/problem.png';
import profileIcon from './asset/profile.png';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Pie } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faArrowRight,
  faTags,
  faShoppingCart,
  faGift,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const PromoBadge = ({ type }) => {
  const typeClass = type ? type.toLowerCase().replace(/\s+/g, '-') : '';
  return <span className={`promo-badge ${typeClass}`}>{type}</span>;
};

/* ============================= PAGINATION COMPONENT ============================= */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination-controls">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

const PromotionPieChart = ({ associationRules }) => {
  const [allPromoTypes, setAllPromoTypes] = useState([]);
  const [selectedPromos, setSelectedPromos] = useState(new Set());
  const colorMap = useMemo(
    () => ({
      'buy 1 get 1': '#052659',
      bogo: '#052659',
      'tebus murah': '#206679',
      diskon: '#7DA0CA',
      bundling: '#9FD6D2',
      lainnya: '#AEB8C2',
    }),
    []
  );

  useEffect(() => {
    if (!associationRules || associationRules.length === 0) return;
    const promoCounts = {};
    associationRules.forEach((rule) => {
      let promoType = rule?.recommendation?.promoType || 'Lainnya';
      const cleanPromoType = promoType.trim().toLowerCase();
      promoCounts[cleanPromoType] = (promoCounts[cleanPromoType] || 0) + 1;
    });
    const uniqueTypes = Object.keys(promoCounts);
    setAllPromoTypes(uniqueTypes);
    setSelectedPromos(new Set(uniqueTypes));
  }, [associationRules]);

  const chartConfig = useMemo(() => {
    const filteredCounts = {};
    let hasSelection = false;
    allPromoTypes.forEach((type) => {
      if (selectedPromos.has(type)) {
        hasSelection = true;
        const count = associationRules.filter(
          (rule) =>
            (rule?.recommendation?.promoType || 'Lainnya')
              .trim()
              .toLowerCase() === type
        ).length;
        filteredCounts[type] = count;
      }
    });
    if (!hasSelection) return null;
    const displayTypes = Object.keys(filteredCounts);
    const pieChartData = {
      labels: displayTypes.map(
        (label) => label.charAt(0).toUpperCase() + label.slice(1)
      ),
      datasets: [
        {
          data: displayTypes.map((label) => filteredCounts[label]),
          backgroundColor: displayTypes.map(
            (label) => colorMap[label] || colorMap['lainnya']
          ),
          borderColor: '#FFFFFF',
          borderWidth: 2,
        },
      ],
    };
    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Proporsi Rekomendasi per Jenis Promosi' },
        datalabels: {
          display: true,
          color: '#FFFFFF',
          font: { weight: 'bold', size: 16 },
          formatter: (value, context) => {
            const total = context.chart.data.datasets[0].data.reduce(
              (a, b) => a + b,
              0
            );
            const percentage = (value / total) * 100;
            return percentage > 5 ? `${Math.round(percentage)}%` : '';
          },
        },
      },
    };
    return { pieChartData, pieOptions };
  }, [selectedPromos, allPromoTypes, associationRules, colorMap]);

  const handleCheckboxChange = (promoType) => {
    setSelectedPromos((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(promoType)) newSelected.delete(promoType);
      else newSelected.add(promoType);
      return newSelected;
    });
  };

  return (
    <div className="chart-container-pie">
      <div className="pie-wrapper">
        {chartConfig ? (
          <Pie options={chartConfig.pieOptions} data={chartConfig.pieChartData} />
        ) : (
          <p>Pilih jenis promosi untuk ditampilkan.</p>
        )}
      </div>
      <div className="custom-legend-container">
        {allPromoTypes.map((type) => (
          <div key={type} className="legend-item">
            <input
              type="checkbox"
              id={`promo-${type}`}
              checked={selectedPromos.has(type)}
              onChange={() => handleCheckboxChange(type)}
            />
            <span
              className="legend-color-swatch"
              style={{
                backgroundColor: colorMap[type] || colorMap['lainnya'],
              }}
            ></span>
            <label htmlFor={`promo-${type}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

const SalesDashboard = ({ results, previewData }) => {
  const dashboardData = useMemo(() => {
    if (!previewData || !results) return null;
    const productCounts = {};
    let totalItemsSold = 0;
    previewData.forEach((item) => {
      const productName = item['Nama Produk'];
      if (productName) {
        productCounts[productName] = (productCounts[productName] || 0) + 1;
        totalItemsSold++;
      }
    });
    const sortedProducts = Object.entries(productCounts).sort(
      ([, a], [, b]) => b - a
    );
    const top5 = sortedProducts.slice(0, 5);
    const bottom5 = sortedProducts.slice(-5).reverse();
    const barChartProducts = [...top5, ...bottom5];
    const barChartData = {
      labels: barChartProducts.map(([name]) =>
        name.length > 15 ? name.substring(0, 12) + '...' : name
      ),
      datasets: [
        {
          label: 'Jumlah Penjualan',
          data: barChartProducts.map(([, count]) => count),
          backgroundColor: '#052659',
          borderRadius: 5,
        },
      ],
    };
    const dominantProduct =
      sortedProducts.length > 0
        ? {
            name: sortedProducts[0][0],
            percentage: ((sortedProducts[0][1] / totalItemsSold) * 100).toFixed(
              0
            ),
          }
        : { name: 'N/A', percentage: 0 };
    const kpis = {
      totalTransactions: new Set(previewData.map((item) => item['ID Transaksi']))
        .size,
      totalProducts: sortedProducts.length,
      totalRecommendations: results.associationRules.length,
    };
    return { barChartData, dominantProduct, kpis };
  }, [results, previewData]);

  if (!dashboardData) return <div className="loading-container">Menyiapkan dasbor...</div>;

  const { dominantProduct, kpis, barChartData } = dashboardData;
  const salesBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="dashboard-card">
      <h3>Tingkat Penjualan Produk</h3>
      <div className="dashboard-content">
        <div className="dashboard-left">
          <div className="chart-container-bar">
            <Bar options={salesBarOptions} data={barChartData} />
          </div>
          <p className="chart-subtitle">
            * 5 Produk Terlaris dan 5 Produk Kurang Laris
          </p>
        </div>
        <div className="dashboard-right">
          <div className="dominant-product-card">
            <FontAwesomeIcon icon={faChartLine} size="2x" />
            <p>
              <strong>{dominantProduct.name}</strong> mendominasi hingga{' '}
              <strong>{dominantProduct.percentage}%</strong> dari total penjualan
            </p>
          </div>
          <div className="kpi-and-pie-container">
            <PromotionPieChart associationRules={results.associationRules} />
            <div className="kpi-container">
              <div className="kpi-box">
                <span>{kpis.totalTransactions.toLocaleString('id-ID')}</span>
                <label>Data Transaksi</label>
              </div>
              <div className="kpi-box">
                <span>{kpis.totalProducts.toLocaleString('id-ID')}</span>
                <label>Produk</label>
              </div>
              <div className="kpi-box">
                <span>{kpis.totalRecommendations.toLocaleString('id-ID')}</span>
                <label>Rekomendasi</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LowSalesRecommendation = ({ results, previewData }) => {
  const featuredRule = useMemo(() => {
    if (!previewData || !results || !results.associationRules) return null;
    const productCounts = {};
    previewData.forEach((item) => {
      const productName = item['Nama Produk'];
      if (productName)
        productCounts[productName] = (productCounts[productName] || 0) + 1;
    });
    const sortedProducts = Object.entries(productCounts).sort(
      ([, a], [, b]) => a - b
    );
    for (const [lowProduct] of sortedProducts) {
      const potentialRules = results.associationRules.filter(
        (rule) => rule.antecedent.length === 1 && rule.antecedent[0] === lowProduct
      );
      if (potentialRules.length > 0) {
        return potentialRules.sort((a, b) => b.confidence - a.confidence)[0];
      }
    }
    return null;
  }, [results, previewData]);

  if (!featuredRule) return null;

  return (
    <div className="low-sales-rec-card">
      <h3>Rekomendasi untuk Produk dengan Penjualan Rendah</h3>
      <div className="rec-flow-container">
        <div className="rec-flow-step">
          <div className="rec-flow-icon-circle">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div className="rec-flow-text">
            <label>Jika Beli Produk Ini</label>
            <span>{featuredRule.antecedent.join(', ')}</span>
          </div>
        </div>
        <FontAwesomeIcon icon={faArrowRight} className="rec-flow-arrow" />
        <div className="rec-flow-step">
          <div className="rec-flow-icon-circle">
            <FontAwesomeIcon icon={faGift} />
          </div>
          <div className="rec-flow-text">
            <label>Tawarkan Produk Pasangan</label>
            <span>{featuredRule.consequent.join(', ')}</span>
          </div>
        </div>
        <FontAwesomeIcon icon={faArrowRight} className="rec-flow-arrow" />
        <div className="rec-flow-step">
          <div className="rec-flow-icon-circle">
            <FontAwesomeIcon icon={faTags} />
          </div>
          <div className="rec-flow-text">
            <label>Dengan Program Promo</label>
            <span>{featuredRule.recommendation.promoType}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductPairingRecommendation = ({ results, previewData }) => {
  const [selectedLowSaleProduct, setSelectedLowSaleProduct] = useState(null);

  const { top5Pairs, bottom5Products, productSales } = useMemo(() => {
    if (!previewData || !results || !results.associationRules) {
      return { top5Pairs: [], bottom5Products: [], productSales: {} };
    }

    const sales = {};
    previewData.forEach(item => {
      const productName = item['Nama Produk'];
      if (productName) {
        sales[productName] = (sales[productName] || 0) + 1;
      }
    });

    const sortedRules = [...results.associationRules].sort((a, b) => b.confidence - a.confidence);
    const pairs = sortedRules.slice(0, 5).map(rule => ({
      ...rule,
      transactions: `${(rule.confidence * 100).toFixed(0)}% Conf.` 
    }));

    const sortedBySales = Object.entries(sales).sort(([, a], [, b]) => a - b);
    const bottomProducts = sortedBySales.slice(0, 5).map(([name, sales]) => ({ name, sales }));
    
    return { top5Pairs: pairs, bottom5Products: bottomProducts, productSales: sales };
  }, [results, previewData]);

  const handleLowSaleProductClick = (product) => {
    const bestRule = [...results.associationRules]
      .filter(rule => {
        const antecedent = Array.isArray(rule.antecedent) ? rule.antecedent : [rule.antecedent];
        return antecedent.includes(product.name);
      })
      .sort((a, b) => b.confidence - a.confidence)[0];

    const partnerProduct = bestRule 
      ? (Array.isArray(bestRule.consequent) ? bestRule.consequent.join(', ') : bestRule.consequent) 
      : "Produk Terlaris";

    setSelectedLowSaleProduct({
      name: product.name,
      sales: product.sales,
      partner: partnerProduct,
      promo: bestRule ? bestRule.recommendation.promoType : "Tebus Murah",
    });
  };

  if (top5Pairs.length === 0 || bottom5Products.length === 0) {
    return null;
  }

  return (
    <div className="product-pairing-section">
      <div className="often-bought-card">
        <h4>PRODUK YANG SERING DIBELI BERSAMAAN</h4>
        <div className="product-pairs-list">
          {top5Pairs.map((pair, index) => (
            <div className="pair-item" key={index}>
              <img src={buyIcon} alt="buy together icon" className="pair-icon" />
              <div className="pair-details">
                <p>{Array.isArray(pair.antecedent) ? pair.antecedent.join(', ') : pair.antecedent}</p>
                <p>{Array.isArray(pair.consequent) ? pair.consequent.join(', ') : pair.consequent}</p>
              </div>
              <span className="pair-transactions">{pair.transactions}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="low-sales-interactive-card">
        <h4>Rekomendasi untuk Produk dengan Penjualan Rendah</h4>
        <div className="low-sales-products-selector">
          {bottom5Products.map((product, index) => (
            <button key={index} onClick={() => handleLowSaleProductClick(product)}>
              {product.name}
            </button>
          ))}
        </div>
        
        {selectedLowSaleProduct && (
          <div className="interactive-flow-container">
            <div className="flow-step-box">
              <img src={problemIcon} alt="problem icon" className="flow-icon" />
              <span>{selectedLowSaleProduct.sales}</span>
              <p>Produk Terjual</p>
            </div>
            
            <div className="flow-arrow">&gt;&gt;&gt;</div>

            <div className="flow-step-box">
              <img src={questionIcon} alt="question icon" className="flow-icon" />
              <p>Pasangkan <strong>{selectedLowSaleProduct.name}</strong> dengan <strong>{selectedLowSaleProduct.partner}</strong></p>
            </div>

            <div className="flow-arrow">&gt;&gt;&gt;</div>

            <div className="flow-step-box recommendation">
              <img src={questionIcon} alt="question icon" className="flow-icon" />
              <p>Coba Promo <strong>{selectedLowSaleProduct.promo}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


function Promotion() {
  const location = useLocation();
  const navigate = useNavigate();
  // ================== PERUBAHAN DIMULAI DI SINI (1) ==================
  // Ambil fungsi handleAnalyze dan state loading dari context
  const { results, fileName, previewData, handleAnalyze, loading } = useData();
  // =================== PERUBAHAN SELESAI DI SINI (1) ===================

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPromoFilter, setSelectedPromoFilter] = useState('all');
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  const rowsPerPage = 5;

  // ================== PERUBAHAN DIMULAI DI SINI (2) ==================
  // State lokal untuk menyimpan nilai input parameter baru
  const [newSupport, setNewSupport] = useState(results?.minSupport || 0.1);
  const [newConfidence, setNewConfidence] = useState(results?.minConfidence || 0.5);
  // =================== PERUBAHAN SELESAI DI SINI (2) ===================

  useEffect(() => {
    if (!results) navigate('/upload');
  }, [results, navigate]);

  // ================== PERUBAHAN DIMULAI DI SINI (3) ==================
  // Efek untuk update state lokal jika 'results' berubah (setelah analisis ulang)
  useEffect(() => {
    if (results) {
      setNewSupport(results.minSupport);
      setNewConfidence(results.minConfidence);
    }
  }, [results]);
  // =================== PERUBAHAN SELESAI DI SINI (3) ===================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isHeaderDropdownOpen &&
        !event.target.closest('.promo-header-cell')
      ) {
        setIsHeaderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHeaderDropdownOpen]);

  const uniquePromoTypes = useMemo(() => {
    const allRules = results?.associationRules || [];
    const types = new Set(allRules.map((rule) => rule.recommendation.promoType));
    const sortedTypes = [...Array.from(types)].sort();
    return ['Semua Jenis Promosi', ...sortedTypes];
  }, [results]);

  const filteredRules = useMemo(() => {
    let allRules = results?.associationRules || [];

    if (selectedPromoFilter !== 'all' && selectedPromoFilter !== 'Semua Jenis Promosi') {
      allRules = allRules.filter(
        (rule) => rule.recommendation.promoType === selectedPromoFilter
      );
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      allRules = allRules.filter((rule) => {
        const antecedentText = (
          Array.isArray(rule.antecedent)
            ? rule.antecedent.join(' ')
            : rule.antecedent
        ).toLowerCase();
        const consequentText = (
          Array.isArray(rule.consequent)
            ? rule.consequent.join(' ')
            : rule.consequent
        ).toLowerCase();
        return (
          antecedentText.includes(lowerCaseSearchTerm) ||
          consequentText.includes(lowerCaseSearchTerm)
        );
      });
    }

    return allRules;
  }, [results, searchTerm, selectedPromoFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPromoFilter]);

  const totalPages = Math.ceil(filteredRules.length / rowsPerPage);
  const currentRows = filteredRules.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (!results) return <div className="loading-container">Memuat data...</div>;

  const { minSupport, minConfidence } = results;
  const getNavLinkClass = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <div className="page-container promotion-page">
  <div className="promotion-background"></div>


      <header className="nav-container">
        <nav className="nav-bar">
          <Link to="/" className="nav-logo">
            <img src={logoPutih} alt="AprioMarket Logo" className="logo-putih-img" />
            <span className="nav-brand-text">AprioMarket</span>
          </Link>
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
      
      <main className="promotion-main-content">
        <div className="top-content-wrapper">
          <aside className="left-panel">
            <div className="summary-card" style={{ height: 'auto', marginBottom: '25px' }}>
              <h4>1. Data Transaksi</h4>
              <div style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '20px',
                fontFamily: "'Inria Sans', sans-serif"
              }}>
                <p style={{
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '16px',
                  color: '#333',
                  margin: '0 0 20px 0'
                }}>
                  {fileName || 'Namafile.csv'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                  <span>Nilai Support</span>
                  <span style={{ fontWeight: '700' }}>{(minSupport * 100).toFixed(0)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span>Nilai Confidence</span>
                  <span style={{ fontWeight: '700' }}>{(minConfidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            
            {/* ================== PERUBAHAN DIMULAI DI SINI (4) ================== */}
            <div className="summary-card-parameter" style={{ height: 'auto' }}>
              <h4>2. Atur Ulang Parameter Analisa</h4>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontFamily: "'Inria Sans', sans-serif" }}>Minimum Support</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSupport}
                  onChange={(e) => setNewSupport(parseFloat(e.target.value))}
                  disabled={loading}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                />
                <small style={{ fontSize: '12px', color: '#666', marginTop: '5px', display: 'block', fontFamily: "'Inria Sans', sans-serif" }}>*Nilai antara 0 dan 1 (contoh: 0.1 untuk 10%)</small>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontFamily: "'Inria Sans', sans-serif" }}>Minimum Confidence</label>
                <input
                  type="number"
                  step="0.01"
                  value={newConfidence}
                  onChange={(e) => setNewConfidence(parseFloat(e.target.value))}
                  disabled={loading}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                />
                <small style={{ fontSize: '12px', color: '#666', marginTop: '5px', display: 'block', fontFamily: "'Inria Sans', sans-serif" }}>*Nilai antara 0 dan 1 (contoh: 0.5 untuk 50%)</small>
              </div>
              <button
                onClick={() => handleAnalyze(newSupport, newConfidence)}
                disabled={loading}
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading ? '#ccc' : '#206679', // Warna hijau toska
                    color: 'white',
                    textAlign: 'center',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Inria Sans', sans-serif"
                }}
              >
                {loading ? 'Menganalisa...' : 'Atur ulang'}
              </button>
            </div>
            {/* =================== PERUBAHAN SELESAI DI SINI (4) =================== */}

            <Link to="/upload" style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              backgroundColor: '#052659',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              marginTop: '-15px',
              fontFamily: "'Inria Sans', sans-serif"
            }}>
              Kembali ke halaman Upload
            </Link>
          </aside>

          <section className="right-panel">
            <div className="results-card">
              <div className="results-header">
                <div className="results-title">
                  <h2>Ditemukan {filteredRules.length} Aturan</h2>
                  <div className="summary-text">
                    <span>
                      Support: <strong>{(minSupport * 100).toFixed(0)}%</strong>
                    </span>{' '}
                    |{' '}
                    <span>
                      Confidence: <strong>{(minConfidence * 100).toFixed(0)}%</strong>
                    </span>
                  </div>
                </div>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Cari nama produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Aturan Asosiasi</th>
                      <th className="promo-header-cell">
                        <div
                          className="promo-header-container"
                          onClick={() =>
                            setIsHeaderDropdownOpen(!isHeaderDropdownOpen)
                          }
                        >
                          <span>Rekomendasi Promosi</span>
                          <FontAwesomeIcon
                            icon={faCaretDown}
                            className={`header-dropdown-icon ${isHeaderDropdownOpen ? 'open' : ''}`}
                          />
                        </div>
                        {isHeaderDropdownOpen && (
                          <div className="header-dropdown-menu">
                            {uniquePromoTypes.map((promo) => (
                              <div
                                key={promo}
                                className="header-dropdown-item"
                                onClick={() => {
                                  setSelectedPromoFilter(promo === 'Semua Jenis Promosi' ? 'all' : promo);
                                  setIsHeaderDropdownOpen(false);
                                }}
                              >
                                {promo}
                              </div>
                            ))}
                          </div>
                        )}
                      </th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length > 0 ? (
                      currentRows.map((rule, index) => (
                        <tr key={index}>
                          <td>
                            Jika membeli <strong>{Array.isArray(rule.antecedent)
                              ? rule.antecedent.join(', ')
                              : rule.antecedent}</strong> maka akan membeli{' '}
                            <strong>{Array.isArray(rule.consequent)
                              ? rule.consequent.join(', ')
                              : rule.consequent}</strong>
                          </td>
                          <td>
                            <PromoBadge type={rule.recommendation.promoType} />
                            <p className="promo-text">{rule.recommendation.promoText}</p>
                          </td>
                          <td className="confidence-value">
                            {(rule.confidence * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center' }}>
                          Tidak ada hasil yang cocok dengan filter Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </section>
        </div>
        <div className="full-width-wrapper">
          <SalesDashboard results={results} previewData={previewData} />
          <LowSalesRecommendation results={results} previewData={previewData} />
          <ProductPairingRecommendation results={results} previewData={previewData} />
        </div>
      </main>
      {/* ======================== Footer Section ========================*/}
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

export default Promotion;
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoPutih from './asset/logo_putih.png';
import uploadLogo from './asset/upload.png';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './css/upload.css';


// Komponen kecil untuk menampilkan badge promosi
  <div className="page-container">
      {/* =============== NAV SECTION =============== */}
      <header className="nav-container">
        <nav className="nav-bar">
          <Link to="/" className="nav-logo">
            <img src={logoPutih} alt="AprioMarket Logo" className="logo-putih-img" />
            <span className="nav-brand-text">AprioMarket</span>
          </Link>
          <div className="nav-menu-frame">
            <Link to="/" className="nav-link home-link">Home</Link>
            <Link to="/upload" className="nav-link">Upload Data</Link>
            <Link to="/promotion" className="nav-link">Promotion</Link>
          </div>
        </nav>
      </header>
      </div>

function Upload() {
    const location = useLocation();
    const currentPath = location.pathname;

    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10); // Dibuat statis untuk pratinjau
    const [previewData, setPreviewData] = useState([]);
    const [transactionalData, setTransactionalData] = useState([]);
    const [minSupport, setMinSupport] = useState(0.1);
    const [minConfidence, setMinConfidence] = useState(0.5);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const processData = (data) => {
        const cleanData = data.filter(row => row && row.length > 0 && row.some(cell => cell != null && cell.toString().trim() !== ''));
        if (cleanData.length < 2) {
            setError("Data tidak valid. Pastikan file berisi header dan setidaknya satu baris transaksi.");
            setPreviewData([]);
            setTransactionalData([]);
            return;
        }
        const headers = cleanData[0];
        const rows = cleanData.slice(1);
        const detailedData = rows.map(row => {
            let rowObject = {};
            headers.forEach((header, index) => { rowObject[header] = row[index]; });
            return rowObject;
        });
        setPreviewData(detailedData);
        const groupedByTransaction = {};
        detailedData.forEach(row => {
            const transId = row['ID Transaksi'];
            const productName = row['Nama Produk'];
            if (transId && productName) {
                if (!groupedByTransaction[transId]) { groupedByTransaction[transId] = []; }
                groupedByTransaction[transId].push(productName);
            }
        });
        const aprioriData = Object.values(groupedByTransaction);
        setTransactionalData(aprioriData);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFileName(selectedFile.name);
            setFile(selectedFile);
            setPreviewData([]);
            setTransactionalData([]);
            setResults(null);
            setError('');
            if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    processData(jsonData);
                };
                reader.readAsArrayBuffer(selectedFile);
            } else if (selectedFile.name.endsWith('.csv')) {
                Papa.parse(selectedFile, {
                    complete: (result) => processData(result.data),
                    error: () => setError("Gagal mem-parsing file CSV."),
                });
            }
        }
    };
    
    const handleAnalyze = async () => {
        if (transactionalData.length === 0) {
            setError('Data transaksi belum ada atau format tidak sesuai.');
            return;
        }
        setLoading(true);
        setError('');
        setResults(null);
        try {
            const response = await axios.post('http://localhost:5000/api/analyze', {
                transactions: transactionalData,
                minSupport: parseFloat(minSupport),
                minConfidence: parseFloat(minConfidence)
            });
            setResults(response.data);
        } catch (err) {
            setError('Gagal menghubungi server. Pastikan server backend berjalan.');
            console.error("Axios error:", err);
        }
        setLoading(false);
    };

    const handleDragEvents = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(e.type === 'dragover' || e.type === 'dragenter'); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { handleFileChange({ target: { files: e.dataTransfer.files } }); } };
    
    return (
        <div>
            <nav className="navbar">
                 <div className="navbar-logo">AprioMarket</div>
                 <div className="navbar-menu">
                     <Link to="/" className={currentPath === '/' ? 'active' : ''}>Home</Link>
                     <Link to="/upload" className={currentPath === '/upload' ? 'active' : ''}>Upload Data</Link>
                     <Link to="/promotions" className={currentPath === '/promotions' ? 'active' : ''}>Promotions</Link>
                     <Link to="/about" className={currentPath === '/about' ? 'active' : ''}>About</Link>

                 </div>
            </nav>

            <main className="main-container">
                <aside className="left-panel">
                    <div className="card">
                        <h3>1. Unggah Data Transaksi</h3>
                        <div 
                            className={`upload-box ${isDragOver ? 'drag-over' : ''}`}
                            onDragEnter={handleDragEvents} onDragOver={handleDragEvents}
                            onDragLeave={handleDragEvents} onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <img src={uploadLogo} alt="Upload" />
                            <p>Tarik & Lepas file di sini</p>
                            <p className="or-text">atau <span className="browse-button">Cari File</span></p>
                            <input id="file-input" type="file" accept=".csv, .xls, .xlsx" onChange={handleFileChange} />
                        </div>
                        {fileName && (
                            <div className="file-confirmation">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span>{fileName}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="card">
                        <h3>2. Atur Parameter</h3>
                        <div className="param-group">
                            <label>Minimum Support</label>
                            <input type="number" step="0.01" value={minSupport} onChange={e => setMinSupport(e.target.value)} />
                            <small>Nilai antara 0 dan 1 (contoh: 0.1 untuk 10%)</small>
                        </div>
                        <div className="param-group">
                            <label>Minimum Confidence</label>
                            <input type="number" step="0.01" value={minConfidence} onChange={e => setMinConfidence(e.target.value)} />
                             <small>Nilai antara 0 dan 1 (contoh: 0.5 untuk 50%)</small>
                        </div>
                    </div>
                    
                    <button className="analyze-button" onClick={handleAnalyze} disabled={loading || !file}>
                        {loading ? 'Menganalisa...' : 'Mulai Analisa Sekarang'}
                    </button>
                </aside>

                <section className="right-panel">
                    {error && <p className="error-message">{error}</p>}
                    
                    {!file && !results && !error && (
                        <div className="placeholder-view card">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                            <h2>Selamat Datang di AprioMarket</h2>
                            <p>Unggah data transaksi di panel sebelah kiri untuk memulai analisa pola belanja.</p>
                        </div>
                    )}

                    {previewData.length > 0 && !results && (
                        <div className="preview-card card">
                             <h3>Pratinjau Data</h3>
                             <p className="result-summary">Menampilkan {Math.min(10, previewData.length)} dari {previewData.length} baris data.</p>
                             <table className="table">
                                 <thead>
                                     <tr>
                                         <th>ID Transaksi</th>
                                         <th>Nama Produk</th>
                                         <th>Qty</th>
                                         <th>Tanggal Transaksi</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {previewData.slice(0, 10).map((row, index) => (
                                         <tr key={index}>
                                             <td>{row['ID Transaksi']}</td>
                                             <td>{row['Nama Produk']}</td>
                                             <td>{row['Qty']}</td>
                                             <td>{row['Tanggal Transaksi']}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                        </div>
                    )}
                    
                    {results && (
                        <div className="results-card card">
                            <h2>Ditemukan {results.associationRules.length} Aturan & Rekomendasi Promosi</h2>
                             <div className="result-summary">
                                <span>Support: <strong>{(minSupport * 100)}%</strong></span> | <span>Confidence: <strong>{(minConfidence * 100)}%</strong></span>
                            </div>
                            {results.associationRules.length > 0 ? (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Aturan Asosiasi</th>
                                            <th>Rekomendasi Promosi</th>
                                            <th>Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.associationRules.map((rule, index) => (
                                            <tr key={index}>
                                                <td>Jika membeli <strong>{rule.antecedent}</strong> maka akan membeli <strong>{rule.consequent}</strong></td>
                                                <td>
                                                    <PromoBadge type={rule.recommendation.promoType} />
                                                    <p className="promo-text">{rule.recommendation.promoText}</p>
                                                </td>
                                                <td className="font-bold">{(rule.confidence * 100).toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>Tidak ada aturan yang ditemukan dengan parameter yang diberikan.</p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Upload;

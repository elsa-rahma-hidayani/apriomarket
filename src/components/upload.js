import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext'; // <-- Menggunakan Context
import './css/upload.css';
import logoPutih from './asset/logo_putih.png';
import profileIcon from './asset/profile.png';

// Komponen Pagination untuk pratinjau data
const Pagination = ({ currentPage, totalPages, onPageChange, dataLength, rowsPerPage }) => {
    if (dataLength <= rowsPerPage) {
        return null;
    }
    return (
        <div className="pagination-controls">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
    );
};

function Upload() {
    const location = useLocation();
    // Ambil state dan fungsi dari Context
    const { fileName, previewData, loading, error, handleFileChange, handleAnalyze } = useData();

    // State lokal hanya untuk form di halaman ini
    const [minSupport, setMinSupport] = useState(0.1);
    const [minConfidence, setMinConfidence] = useState(0.5);
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewCurrentPage, setPreviewCurrentPage] = useState(1);
    const rowsPerPage = 15; // Jumlah baris per halaman untuk pratinjau data

    // Fungsi pembungkus untuk memanggil handleFileChange dari context
    const onFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
        }
    };

    const onFileDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    const handleDragEvents = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(e.type === 'dragover' || e.type === 'dragenter'); };

    const getNavLinkClass = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    // Logika paginasi untuk pratinjau data
    const totalPreviewPages = Math.ceil(previewData.length / rowsPerPage);
    const indexOfLastPreviewRow = previewCurrentPage * rowsPerPage;
    const indexOfFirstPreviewRow = indexOfLastPreviewRow - rowsPerPage;
    const currentPreviewRows = previewData.slice(indexOfFirstPreviewRow, indexOfLastPreviewRow);

    return (
        <div className="page-container upload-page">
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
            
            <main className="upload-main-content">
                <aside className="left-panel">
                    <div className="left-panel-main">
                        <div className="upload-card">
                            <h3>1. Unggah Data Transaksi</h3>
                            <div className={`upload-box ${isDragOver ? 'drag-over' : ''}`}
                                onDragEnter={handleDragEvents}
                                onDragOver={handleDragEvents}
                                onDragLeave={handleDragEvents}
                                onDrop={onFileDrop}
                                onClick={() => document.getElementById('file-input').click()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <p>Tarik & Lepas file di sini</p>
                                <input id="file-input" type="file" accept=".csv, .xls, .xlsx" onChange={onFileSelect} hidden />
                            </div>
                            {fileName && <div className="file-confirmation"><span>{fileName}</span></div>}
                        </div>

                        <div className="upload-card-parameter">
                            <h4>2. Atur Parameter Analisa</h4>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontFamily: "'Inria Sans', sans-serif" }}>Minimum Support</label>
                                <input
                                type="number"
                                step="0.01"
                                value={minSupport}
                                onChange={(e) => setMinSupport(parseFloat(e.target.value))}
                                disabled={loading}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                                <small style={{ fontSize: '12px', color: '#666', marginTop: '5px', display: 'block', fontFamily: "'Inria Sans', sans-serif" }}>*Nilai antara 0 dan 1 (contoh: 0.1 untuk 10%)</small>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontFamily: "'Inria Sans', sans-serif" }}>Minimum Confidence</label>
                                <input
                                type="number"
                                step="0.01"
                                value={minConfidence}
                                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                                disabled={loading}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                                <small style={{ fontSize: '12px', color: '#666', marginTop: '5px', display: 'block', fontFamily: "'Inria Sans', sans-serif" }}>*Nilai antara 0 dan 1 (contoh: 0.5 untuk 50%)</small>
                            </div>                      
                            </div>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => handleAnalyze(minSupport, minConfidence)} disabled={loading || previewData.length === 0}>
                        {loading ? 'Menganalisa...' : 'Mulai Analisa'}
                    </button>
                </aside>
                <section className="right-panel">
                    {error && <div className="error-message">{error}</div>}
                    
                    {previewData.length > 0 ? (
                        <div className="preview-card upload-card">
                            <h2>Pratinjau Data</h2>
                            <p className="summary-text">Menampilkan baris {indexOfFirstPreviewRow + 1} sampai {Math.min(indexOfLastPreviewRow, previewData.length)} dari {previewData.length} data.</p>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID Transaksi</th>
                                            <th>Nama Produk</th>
                                            <th>Qty</th>
                                            <th>Tanggal Transaksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPreviewRows.map((row, index) => (
                                            <tr key={`${row['ID Transaksi']}-${index}`}>
                                                <td>{row['ID Transaksi']}</td>
                                                <td>{row['Nama Produk']}</td>
                                                <td>{row['Qty']}</td>
                                                <td>{row['Tanggal Transaksi']}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={previewCurrentPage}
                                totalPages={totalPreviewPages}
                                onPageChange={setPreviewCurrentPage}
                                dataLength={previewData.length}
                                rowsPerPage={rowsPerPage}
                            />
                        </div>
                    ) : (
                        <div className="placeholder-view upload-card">
                            <h2>Mulai Analisa Pola Belanja</h2>
                            <p>Unggah data transaksi Anda di panel sebelah kiri untuk menemukan rekomendasi promosi.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Upload;
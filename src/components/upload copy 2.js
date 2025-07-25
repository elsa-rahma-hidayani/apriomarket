import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './css/upload.css';
import logoPutih from './asset/logo_putih.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';


// Komponen kecil untuk menampilkan badge promosi
const PromoBadge = ({ type }) => {
    const typeClass = type.toLowerCase().replace(/\s+/g, '-');
    return <span className={`promo-badge ${typeClass}`}>{type}</span>;
};

// --- KOMPONEN BARU UNTUK KONTROL PAGINASI ---
const Pagination = ({ currentPage, totalPages, onPageChange, dataLength, rowsPerPage }) => {
    // Jangan tampilkan paginasi jika data tidak cukup untuk lebih dari satu halaman
    if (dataLength <= rowsPerPage) {
        return null;
    }

    return (
        <div className="pagination-controls">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
            </button>
        </div>
    );
};


function Upload() {
    const location = useLocation();
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [previewData, setPreviewData] = useState([]);
    const [transactionalData, setTransactionalData] = useState([]);
    const [minSupport, setMinSupport] = useState(0.1);
    const [minConfidence, setMinConfidence] = useState(0.5);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    // --- STATE BARU UNTUK PAGINASI ---
    const [previewCurrentPage, setPreviewCurrentPage] = useState(1);
    const [resultsCurrentPage, setResultsCurrentPage] = useState(1);
    const rowsPerPage = 10; // User dapat melihat maksimal 15 baris data
    const rowsPerPageResult=6

    // --- LOGIKA LAMA (TIDAK DIUBAH) ---
    const processData = (data) => {
        // ... (fungsi processData tetap sama)
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
            // Reset paginasi ke halaman pertama
            setPreviewCurrentPage(1);
            setResultsCurrentPage(1);
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
        // Reset paginasi hasil ke halaman pertama
        setResultsCurrentPage(1);
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

    const getNavLinkClass = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    // --- LOGIKA BARU UNTUK MENGHITUNG DATA & HALAMAN PAGINASI ---
    // Paginasi untuk Pratinjau Data
    const totalPreviewPages = Math.ceil(previewData.length / rowsPerPage);
    const indexOfLastPreviewRow = previewCurrentPage * rowsPerPage;
    const indexOfFirstPreviewRow = indexOfLastPreviewRow - rowsPerPage;
    const currentPreviewRows = previewData.slice(indexOfFirstPreviewRow, indexOfLastPreviewRow);

    // Paginasi untuk Hasil Analisa
    const totalResultsPages = results ? Math.ceil(results.associationRules.length / rowsPerPageResult) : 0;
    const indexOfLastResultRow = resultsCurrentPage * rowsPerPageResult;
    const indexOfFirstResultRow = indexOfLastResultRow - rowsPerPageResult;
    const currentResultRows = results ? results.associationRules.slice(indexOfFirstResultRow, indexOfLastResultRow) : [];

    // Render JSX
    return (
        <div className="page-container upload-page">
            <header className="nav-container">
                <nav className="nav-bar">
                    <Link to="/" className="nav-logo">
                        <img src={logoPutih} alt="AprioMarket Logo" className="logo-putih-img" />
                        <span className="nav-brand-text">AprioMarket</span>
                    </Link>
                    <div className="nav-menu-frame">
                        <Link to="/" className={getNavLinkClass('/')}>Home</Link>
                        <Link to="/upload" className={getNavLinkClass('/upload')}>Upload Data</Link>
                        <Link to="/promotion" className={getNavLinkClass('/promotion')}>Promotion</Link>
                    </div>
                </nav>
            </header>
            
            <main className="upload-main-content">
                <aside className="left-panel">

                    {/* ... (Panel Kiri tetap sama) ... */}
                    <div className="upload-card">
                        <h3>1. Unggah Data Transaksi</h3>
                        <div
                            className={`upload-box ${isDragOver ? 'drag-over' : ''}`}
                            onDragEnter={handleDragEvents} onDragOver={handleDragEvents}
                            onDragLeave={handleDragEvents} onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <p>Tarik & Lepas file di sini</p>
                            <p className="upload-box-alt">atau <span className="browse-button">Cari File</span></p>
                            <input id="file-input" type="file" accept=".csv, .xls, .xlsx" onChange={handleFileChange} hidden />
                        </div>
                        {fileName && (
                            <div className="file-confirmation">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span>{fileName}</span>
                            </div>
                        )}
                    </div>
                    <div className="upload-card">
                        <h3>2. Atur Parameter</h3>
                        <div className="param-group">
                            <label htmlFor="min-support">Minimum Support</label>
                            <input id="min-support" type="number" step="0.01" value={minSupport} onChange={e => setMinSupport(e.target.value)} />
                            <small>Nilai antara 0 dan 1 (contoh: 0.1 untuk 10%)</small>
                        </div>
                        <div className="param-group">
                            <label htmlFor="min-confidence">Minimum Confidence</label>
                            <input id="min-confidence" type="number" step="0.01" value={minConfidence} onChange={e => setMinConfidence(e.target.value)} />
                            <small>Nilai antara 0 dan 1 (contoh: 0.5 untuk 50%)</small>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleAnalyze} disabled={loading || !file}>
                        {loading ? 'Menganalisa...' : 'Mulai Analisa'}
                    </button>
                </aside>

                <section className="right-panel">
                    {error && <div className="error-message">{error}</div>}
                    
                    {!file && !results && !error && (
                         <div className="placeholder-view upload-card">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                            <h2>Mulai Analisa Pola Belanja</h2>
                            <p>Unggah data transaksi Anda di panel sebelah kiri untuk menemukan rekomendasi promosi terbaik untuk bisnis Anda.</p>
                        </div>
                    )}

                    {previewData.length > 0 && !results && (
                        <div className="preview-card upload-card">
                            <h3>Pratinjau Data</h3>
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
                                        {/* Gunakan data yang sudah dipaginasi */}
                                        {currentPreviewRows.map((row, index) => (
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
                            {/* Tambahkan kontrol paginasi */}
                            <Pagination
                                currentPage={previewCurrentPage}
                                totalPages={totalPreviewPages}
                                onPageChange={setPreviewCurrentPage}
                                dataLength={previewData.length}
                                rowsPerPage={rowsPerPage}
                            />
                        </div>
                    )}
                    
                    {results && (
                        <div className="results-card upload-card">
                            <h2>Ditemukan {results.associationRules.length} Aturan & Rekomendasi Promosi</h2>
                            <div className="summary-text">
                                <span>Support: <strong>{(minSupport * 100)}%</strong></span> | <span>Confidence: <strong>{(minConfidence * 100)}%</strong></span>
                            </div>
                            <div className="table-container">
                                {results.associationRules.length > 0 ? (
                                    <>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Aturan Asosiasi</th>
                                                    <th>Rekomendasi Promosi</th>
                                                    <th>Confidence</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Gunakan data yang sudah dipaginasi */}
                                                {currentResultRows.map((rule, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            Jika membeli <strong>{Array.isArray(rule.antecedent) ? rule.antecedent.join(', ') : rule.antecedent}</strong> maka akan membeli <strong>{Array.isArray(rule.consequent) ? rule.consequent.join(', ') : rule.consequent}</strong>
                                                        </td>
                                                        <td>
                                                            <PromoBadge type={rule.recommendation.promoType} />
                                                            <p className="promo-text">{rule.recommendation.promoText}</p>
                                                        </td>
                                                        <td className="confidence-value">{(rule.confidence * 100).toFixed(2)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* Tambahkan kontrol paginasi */}
                                        <Pagination
                                            currentPage={resultsCurrentPage}
                                            totalPages={totalResultsPages}
                                            onPageChange={setResultsCurrentPage}
                                            dataLength={results.associationRules.length}
                                            rowsPerPage={rowsPerPage}
                                        />
                                    </>
                                ) : (
                                    <p>Tidak ada aturan yang ditemukan dengan parameter yang diberikan.</p>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Upload;
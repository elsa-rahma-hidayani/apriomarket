// src/context/DataContext.js
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [fileName, setFileName] = useState('');
    const [previewData, setPreviewData] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const processAndSetData = (parsedData) => {
        // Filter baris kosong untuk memastikan data bersih
        const cleanData = parsedData.filter(row => row && row.length > 0 && row.some(cell => cell != null && cell.toString().trim() !== ''));
        if (cleanData.length < 2) {
            setError("Data tidak valid atau file kosong. Pastikan file memiliki header dan setidaknya satu baris data.");
            setPreviewData([]);
            return;
        }
        const headers = cleanData[0].map(h => h.trim());
        const rows = cleanData.slice(1);
        const detailedData = rows.map(row => {
            let rowObject = {};
            headers.forEach((header, index) => {
                rowObject[header] = row[index];
            });
            return rowObject;
        });
        setPreviewData(detailedData);
    };
    
    const handleFileChange = (selectedFile) => {
        if (selectedFile) {
            setFileName(selectedFile.name);
            setResults(null);
            setError('');
            setPreviewData([]); // Kosongkan pratinjau saat file baru diunggah

            const fileReader = new FileReader();
            if (selectedFile.name.endsWith('.csv')) {
                fileReader.onload = (e) => Papa.parse(e.target.result, {
                    complete: (res) => processAndSetData(res.data)
                });
                fileReader.readAsText(selectedFile);
            } else { // Untuk .xlsx dan .xls
                fileReader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const ws = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    processAndSetData(jsonData);
                };
                fileReader.readAsArrayBuffer(selectedFile);
            }
        }
    };

    // **FUNGSI HANDLEANALYZE YANG SUDAH DIPERBAIKI**
    // Buka file: src/context/DataContext.js

// Ganti fungsi handleAnalyze Anda dengan yang ini:
const handleAnalyze = async (minSupport, minConfidence) => {
    if (previewData.length === 0) {
        setError('Tidak ada data untuk dianalisa. Silakan unggah file terlebih dahulu.');
        return;
    }

    setLoading(true);
    setError(null);

    // 1. KELOMPOKKAN DATA MENTAH MENJADI FORMAT TRANSAKSI
    // Ini adalah langkah kunci yang hilang atau salah pada kode Anda.
    const groupedByTransaction = {};
    previewData.forEach(row => {
        const transId = row['ID Transaksi'];
        const productName = row['Nama Produk'];
        if (transId && productName) {
            if (!groupedByTransaction[transId]) {
                groupedByTransaction[transId] = new Set(); // Gunakan Set untuk menghindari produk duplikat dalam satu transaksi
            }
            groupedByTransaction[transId].add(productName);
        }
    });
    // Ubah hasil pengelompokan menjadi format array di dalam array
    const transactionalData = Object.values(groupedByTransaction).map(set => Array.from(set));

    // 2. Ambil token dan kirim data ke backend
    const token = localStorage.getItem('token');
    if (!token) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        setLoading(false);
        navigate('/login');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/upload-and-analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                transactions: previewData, // Data mentah untuk disimpan
                fileName: fileName,
                minSupport: parseFloat(minSupport),
                minConfidence: parseFloat(minConfidence),
                transactionalDataForApriori: transactionalData // Data yang sudah dikelompokkan untuk dianalisa
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal menganalisa data.');
        }

        setResults({ ...data, minSupport, minConfidence });
        navigate('/promotion');
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
    // Nilai yang akan disediakan oleh Context Provider
    const value = {
        fileName,
        previewData,
        results,
        loading,
        error,
        handleFileChange,
        handleAnalyze,
        setFileName,      // <-- Tambahkan ini
        setPreviewData,   // <-- Tambahkan ini
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
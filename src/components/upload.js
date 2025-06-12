import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import profile from './asset/profile.png'; 
import uploadLogo from './asset/upload.png'; 
import Papa from 'papaparse'; 
import * as XLSX from 'xlsx'; 
import './css/upload.css'; 

function Upload() {
  const location = useLocation(); 
  const currentPath = location.pathname;

  const [file, setFile] = useState(null); 
  const [tableData, setTableData] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [rowsPerPage, setRowsPerPage] = useState(10);  

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // Process file immediately after selection
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.ms-excel" || selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const binaryStr = e.target.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          let jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Format the date to dd/mm/yy and process "Qty"
          jsonData = jsonData.map(row => {
            if (row['Tanggal Transaksi']) {
              row['Tanggal Transaksi'] = formatDate(row['Tanggal Transaksi']);
            }

            // Process the "Qty" column that contains comma-separated values
            if (row['Qty']) {
              row['Qty'] = processQty(row['Qty']);
            }

            return row;
          });

          setTableData(jsonData);  // Set all data without pagination
        };
        reader.readAsBinaryString(selectedFile);
      } else if (selectedFile.type === "text/csv") {
        Papa.parse(selectedFile, {
          complete: function (result) {
            let jsonData = result.data;

            // Format the date to dd/mm/yy and process "Qty"
            jsonData = jsonData.map(row => {
              if (row['Tanggal Transaksi']) {
                row['Tanggal Transaksi'] = formatDate(row['Tanggal Transaksi']);
              }

              // Process the "Qty" column that contains comma-separated values
              if (row['Qty']) {
                row['Qty'] = processQty(row['Qty']);
              }

              return row;
            });

            setTableData(jsonData);  // Set all data without pagination
          },
        });
      }
    }
  };

  const formatDate = (date) => {
    // If the date is a number (Excel serial date format)
    let parsedDate;
    if (!isNaN(date)) {
      // Convert Excel serial date to JavaScript Date
      parsedDate = new Date((date - 25569) * 86400 * 1000); // Adjust for Excel date system
    } else {
      parsedDate = new Date(date);
    }

    if (isNaN(parsedDate)) {
      return date; // Return as-is if still invalid
    }

    const day = ("0" + parsedDate.getDate()).slice(-2);
    const month = ("0" + (parsedDate.getMonth() + 1)).slice(-2);
    const year = parsedDate.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const processQty = (qty) => {
    // Ensure "Qty" is treated as a string with comma-separated numbers
    if (qty) {
      // Remove any non-numeric characters (e.g., spaces) and split by comma
      const qtyArray = qty.split(',').map(item => {
        const num = parseInt(item.trim()); // Remove any extra spaces and convert to number
        return isNaN(num) ? 0 : num; // Ensure the value is a valid number or default to 0
      });
      return qtyArray; // Return the array of quantities
    }
    return [0]; // Default to an array with 0 if "Qty" is missing or invalid
  };
  

  const paginateData = (data, page) => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const changePage = (newPage) => {
    const totalPages = Math.ceil(tableData.length / rowsPerPage);  // Total number of pages
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);  // Reset to first page
  };

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
          <img src={profile} alt="Avatar" className="navbar-avatar" />
        </div>
      </nav>

      {/* Upload Section */}
      <section className="upload-section container">
        <h2 className="upload-title">Upload Your Data</h2>
        <p className="upload-description">Silakan unggah file data penjualan Anda untuk memulai analisis.</p>
        <div className="upload-area">
          <div className="upload-box">
            <img src={uploadLogo} alt="Upload Logo" className="upload-logo" />
            <i className="fa fa-cloud-upload"></i>
            <p>Drag and Drop your file here</p>
            <p className="or-text">or</p>
            <input 
              id="file-upload" 
              type="file" 
              accept=".csv, .xls, .xlsx" 
              onChange={handleFileChange} 
              className="file-input" 
              required 
            />
            <button 
              type="button" 
              className="browse-button" 
              onClick={() => document.getElementById('file-upload').click()}
            >
              Browse
            </button>
          </div>
        </div>
      </section>

      {/* Tabel Data Upload */}
      {tableData.length > 0 && (
        <section className="data-table container">
          <h3>Uploaded Data</h3>
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
              {paginateData(tableData, currentPage).map((row, index) => (
                <tr key={index}>
                  <td>{row['ID Transaksi']}</td>
                  <td>{row['Nama Produk']}</td>
                  <td>{Array.isArray(row['Qty']) ? row['Qty'].join(', ') : row['Qty']}</td> {/* Ensure qty is an array */}
                  <td>{row['Tanggal Transaksi']}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
              &lt; Previous
            </button>
            <span>{currentPage} of {Math.ceil(tableData.length / rowsPerPage)}</span>
            <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === Math.ceil(tableData.length / rowsPerPage)}>
              Next &gt;
            </button>
          </div>

          {/* Rows per page selection */}
          <div className="rows-per-page">
            <label htmlFor="rowsPerPage">Rows per page: </label>
            <select id="rowsPerPage" value={rowsPerPage} onChange={handleRowsPerPageChange}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer>
        © 2025 AprioMarket. All rights reserved.
      </footer>
    </div>
  );
}

export default Upload;

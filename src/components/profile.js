import React, { useState, useEffect } from 'react';
import './css/profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Ikon yang tidak terpakai (faCheck, faTimes) telah dihapus untuk kebersihan kode
import { faUserCircle, faPen, faKey, faTrashAlt, faEye, faSignOutAlt, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

// Komponen Popup diimpor di sini
import ResetPasswordPopup from './resetpasswordpopup';
import DeleteAccountPopup from './deleteaccountpopup';

// Aset gambar diimpor di sini
import logoPutih from './asset/logo_putih.png';
import profileIcon from './asset/profile.png';

const Profile = () => {
    // Semua state dan hooks harus berada di dalam fungsi komponen
    const { setPreviewData, setFileName } = useData();
    const [user, setUser] = useState({ User_name: 'Memuat...', Email: 'Memuat...' });
    const [recentUploads, setRecentUploads] = useState([]);
    const navigate = useNavigate();

    // State untuk kontrol popup
    const [isResetPopupOpen, setResetPopupOpen] = useState(false);
    const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);

    // State untuk mengedit username (hanya dideklarasikan sekali)
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    // State untuk mengedit email (hanya dideklarasikan sekali)
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    // Fungsi untuk menyimpan username baru
    const handleUsernameSave = async () => {
        if (newUsername.trim() === '' || newUsername === user.User_name) {
            setIsEditingUsername(false);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/update-username', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newUsername })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal memperbarui username.');
            }

            alert(data.message);
            setUser(currentUser => ({ ...currentUser, User_name: data.newUsername }));
            setIsEditingUsername(false);

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            setIsEditingUsername(false);
        }
    };

    // Fungsi untuk menyimpan email baru
    const handleEmailSave = async () => {
        if (newEmail.trim() === '' || newEmail === user.Email) {
            setIsEditingEmail(false);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/update-email', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newEmail })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal memperbarui email.');
            }

            alert(data.message);
            setUser(currentUser => ({ ...currentUser, Email: data.newEmail }));
            setIsEditingEmail(false);

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            setIsEditingEmail(false);
        }
    };

    // Fungsi untuk menghapus akun
    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/delete-account', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Gagal menghapus akun.');
            }

            alert('Akun Anda telah berhasil dihapus.');
            localStorage.removeItem('token');
            navigate('/login');

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setDeletePopupOpen(false);
        }
    };

    // Efek untuk mengambil data profil dan unggahan
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchProfileAndUploads = async () => {
            try {
                const profileResponse = await fetch('http://localhost:5000/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!profileResponse.ok) throw new Error('Gagal memuat profil');
                const profileData = await profileResponse.json();
                setUser(profileData);

                const uploadsResponse = await fetch('http://localhost:5000/api/recent-uploads', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!uploadsResponse.ok) throw new Error('Gagal memuat riwayat unggahan');
                const uploadsData = await uploadsResponse.json();
                setRecentUploads(uploadsData);

            } catch (error) {
                console.error('Gagal mengambil data:', error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchProfileAndUploads();
    }, [navigate]);

    // Fungsi untuk melihat detail unggahan
    const handleViewUpload = async (fileId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/file/${fileId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Tidak bisa mengambil data file.');

            const fileData = await response.json();
            setFileName(fileData.fileName);
            setPreviewData(fileData.previewData);
            navigate('/upload');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };
    
    // Fungsi untuk membatalkan mode edit
    const handleCancelEdit = () => {
        setIsEditingUsername(false);
        setIsEditingEmail(false);
    };

    // Fungsi untuk logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Struktur JSX yang sudah diperbaiki dan ditata ulang
    return (
        <div className="profile-page">
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

            <div className="profile-content-wrapper">
                <aside className="profile-sidebar">
                    <div className="profile-card">
                        <h3>Profile</h3>
                        
                        {/* Logika kondisional untuk menampilkan mode edit atau default */}
                        {!isEditingUsername && !isEditingEmail ? (
                            <div className="profile-info-container">
                                <FontAwesomeIcon icon={faUserCircle} className="profile-icon-large" />
                                <div className="profile-info-item">
                                    <p>{user.User_name}</p>
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className="edit-icon"
                                        onClick={() => {
                                            setIsEditingUsername(true);
                                            setNewUsername(user.User_name);
                                        }}
                                    />
                                </div>
                                <div className="profile-info-item">
                                    <p>{user.Email}</p>
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className="edit-icon"
                                        onClick={() => {
                                            setIsEditingEmail(true);
                                            setNewEmail(user.Email);
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="profile-edit-box">
                        <FontAwesomeIcon
                            icon={faChevronLeft}
                            className="edit-back-icon"
                            onClick={handleCancelEdit}
                        />
                        <FontAwesomeIcon icon={faUserCircle} className="profile-icon-large" />

                        {isEditingUsername && (
                            <div className="edit-form-group">
                                <input
                                    type="text"
                                    className="edit-input"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="NewUsername"
                                    autoFocus
                                />
                                <button className="edit-ok-button" onClick={handleUsernameSave}>OK</button>
                            </div>
                        )}
                        {isEditingEmail && (
                            <div className="edit-form-group">
                                <input
                                    type="email"
                                    className="edit-input"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="NewEmail"
                                    autoFocus
                                />
                                <button className="edit-ok-button" onClick={handleEmailSave}>OK</button>
                            </div>
                        )}
                    </div>

                        )}
                        
                        <button onClick={handleLogout} className="logout-button-card">
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span>Keluar</span>
                        </button>
                    </div>
                </aside>

                <main className="profile-main-content">
                    <div className="action-cards-container">
                         <div className="action-card" onClick={() => setResetPopupOpen(true)}>
                             <FontAwesomeIcon icon={faKey} className="action-icon" />
                             <p>Atur Ulang Password</p>
                         </div>
                         <div className="action-card">
                             <span className="data-count">{recentUploads.length}</span>
                             <p>Data Dianalisa</p>
                         </div>
                         <div className="action-card" onClick={() => setDeletePopupOpen(true)}>
                             <FontAwesomeIcon icon={faTrashAlt} className="action-icon" />
                             <p>Hapus Akun</p>
                         </div>
                     </div>
                     <div className="recent-uploads-section">
                         <div className="recent-uploads-header">
                             <h2>Recent Upload</h2>
                         </div>
                         <div className="uploads-table">
                             <div className="table-header">
                                 <span className="header-name">Nama File</span>
                                 <span className="header-time">Waktu Upload</span>
                             </div>
                             <div className="table-body">
                                 {recentUploads.length > 0 ? (
                                     recentUploads.map(upload => (
                                         <div className="table-row" key={upload.file_id}>
                                             <span className="file-name">{upload.file_name}</span>
                                             <div className="time-and-action">
                                                 <span className="upload-time">
                                                     {new Date(upload.upload_timestamp).toLocaleDateString('id-ID')}
                                                 </span>
                                                 <button className="view-button" onClick={() => handleViewUpload(upload.file_id)}>
                                                     <FontAwesomeIcon icon={faEye} />
                                                 </button>
                                             </div>
                                         </div>
                                     ))
                                 ) : (
                                     <p style={{ textAlign: 'center', padding: '20px' }}>Belum ada data yang diunggah.</p>
                                 )}
                             </div>
                         </div>
                     </div>
                </main>
            </div>

            {isResetPopupOpen && (
                <ResetPasswordPopup onClose={() => setResetPopupOpen(false)} />
            )}

            {isDeletePopupOpen && (
                <DeleteAccountPopup
                    onClose={() => setDeletePopupOpen(false)}
                    onConfirm={handleDeleteAccount}
                />
            )}
        </div>
    );
};

export default Profile;
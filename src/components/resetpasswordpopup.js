// ResetPasswordPopup.js
import React, { useState } from 'react';
import './css/profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// --- PERUBAHAN: Tambahkan import icon mata ---
import { faTimes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ResetPasswordPopup = ({ onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    
    // --- PERUBAHAN: State untuk visibilitas password ---
    const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsError(false);
        setMessage('Mengganti password...');
        const token = localStorage.getItem('token');
        if (!token) {
            setIsError(true);
            setMessage('Sesi tidak valid. Silakan login kembali.');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengganti password.');
            }
            setIsError(false);
            setMessage('Password berhasil diubah!');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            setIsError(true);
            setMessage(error.message);
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-container" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close-btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2>Atur Ulang Password</h2>
                <form onSubmit={handleSubmit} className="popup-form">
                    
                    {/* --- PERUBAHAN: Input untuk Password Lama --- */}
                    <div className="password-input-container">
                        <input
                            type={oldPasswordVisible ? 'text' : 'password'}
                            placeholder="Password Lama"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        <FontAwesomeIcon 
                            icon={oldPasswordVisible ? faEyeSlash : faEye} 
                            className="password-toggle-icon"
                            onClick={() => setOldPasswordVisible(!oldPasswordVisible)}
                        />
                    </div>

                    {/* --- PERUBAHAN: Input untuk Password Baru --- */}
                    <div className="password-input-container">
                        <input
                            type={newPasswordVisible ? 'text' : 'password'}
                            placeholder="Password Baru"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <FontAwesomeIcon 
                            icon={newPasswordVisible ? faEyeSlash : faEye} 
                            className="password-toggle-icon"
                            onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                        />
                    </div>
                    
                    <a href="/forgot-password" className="forgot-password-link">Lupa Password?</a>
                    <button type="submit" className="popup-submit-btn">
                        Save Change
                    </button>
                </form>
                {message && (
                    <p className={`popup-message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPopup;
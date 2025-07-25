// DeleteAccountPopup.js
import React from 'react';
import './css/profile.css'; // Menggunakan file CSS yang sama

const DeleteAccountPopup = ({ onClose, onConfirm }) => {
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div 
                className="popup-container delete-popup" 
                onClick={(e) => e.stopPropagation()}
            >
                <h2>Yakin ingin menghapus akun anda ?</h2>
                <p>
                    Semua data termasuk file hasil analisa anda akan hilang dari sistem
                </p>
                <div className="popup-actions">
                    <button className="popup-button cancel" onClick={onClose}>
                        Tidak
                    </button>
                    <button className="popup-button confirm" onClick={onConfirm}>
                        YA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountPopup;
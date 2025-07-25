import React, { useState, useEffect } from "react";
import "./css/login.css"; 
import loginImage from "./asset/login.png"; 

const Newpassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  // State untuk menyimpan token dari URL
  const [token, setToken] = useState(null);

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  // -- BARU: Ambil token dari URL saat komponen dimuat --
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setIsError(true);
      setMessage('Token reset tidak ditemukan. Pastikan Anda menggunakan link dari email.');
    }
  }, []);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setIsError(true);
      setMessage('Password tidak cocok. Silakan coba lagi.');
      return;
    }
    
    // Pastikan token ada sebelum mengirim
    if (!token) {
        setIsError(true);
        setMessage('Token reset tidak valid atau hilang.');
        return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // -- BARU: Kirim token bersama password baru --
        body: JSON.stringify({ 
            token: token,
            password: formData.newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        throw new Error(data.message || 'Gagal mengubah password.');
      }

      setIsError(false);
      setMessage('Password Anda telah berhasil diubah! Anda sekarang bisa login.');

    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={loginImage} alt="Reset Password Illustration" className="login-image" />
      </div>
      <div className="login-right">
        <h2>Reset Your Password 🔒</h2>
        <p>Enter and confirm your new password below.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            required
            autoComplete="new-password"
            value={formData.newPassword}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          
          <button type="submit" className="login-button" disabled={!token}>
              Update Password
          </button>
        </form>

        {message && (
          <p className={isError ? 'server-message error' : 'server-message success'}>
            {message}
          </p>
        )}

        <p className="login-footer">
          Sudah ingat password? <a href="/login">Kembali ke Login</a>
        </p>
      </div>
    </div>
  );
};

export default Newpassword;
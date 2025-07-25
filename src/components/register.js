import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./css/register.css";
import registerImage from "./asset/register.png";

const Register = () => {
  // State untuk menampung data form, disesuaikan dengan nama kolom database
  const [formData, setFormData] = useState({
    User_name: '',
    Email: '',
    Password: '',
  });
  
  // State untuk menampilkan pesan dari server
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  // State untuk visibilitas password
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Fungsi untuk mengupdate state saat input berubah
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi yang dijalankan saat form disubmit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        throw new Error(data.message || 'Gagal melakukan registrasi');
      }
      
      setIsError(false);
      setMessage('Registrasi berhasil! Anda akan diarahkan ke halaman login.');
      
      // Arahkan ke halaman login setelah 2 detik
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  const togglePassword = () => {
    setPasswordVisible(prev => !prev);
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <img src={registerImage} alt="Register" className="register-image" />
      </div>
      <div className="register-right">
        <h2>Sign Up ✨</h2>
        <p>Create your new account</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input 
            type="text" 
            name="User_name" // Disesuaikan dengan database
            placeholder="Username" 
            required 
            autoComplete="username"
            value={formData.User_name}
            onChange={handleChange}
          />

          <input 
            type="email" 
            name="Email" // Disesuaikan dengan database
            placeholder="Email" 
            required 
            autoComplete="email"
            value={formData.Email}
            onChange={handleChange}
          />

          <div className="password-container">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="Password" // Disesuaikan dengan database
              placeholder="Password"
              required
              autoComplete="new-password"
              value={formData.Password}
              onChange={handleChange}
            />
            <button 
              type="button" 
              className="toggle-password" 
              onClick={togglePassword}
              tabIndex={-1}
            >
              <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
            </button>
          </div>
          
          <button type="submit" className="register-button">Sign Up</button>
        </form>

        {/* Menampilkan pesan sukses atau error dari server */}
        {message && <p className={isError ? 'server-message error' : 'server-message success'}>{message}</p>}

        <p className="register-footer">
          Already have an account? <a href="/login">Sign in instead</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

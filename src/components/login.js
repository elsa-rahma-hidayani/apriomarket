import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./css/login.css";
import loginImage from "./asset/login.png";

const Login = () => {
  // State untuk menampung data form, disesuaikan dengan nama kolom database
  const [formData, setFormData] = useState({
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
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        throw new Error(data.message || 'Gagal melakukan login');
      }

      // Jika sukses, simpan token dan arahkan ke halaman utama
      localStorage.setItem('token', data.token);
      
      setIsError(false);
      setMessage('Login berhasil! Mengarahkan ke halaman utama...');
      
      // Arahkan ke halaman dashboard setelah 1.5 detik
      setTimeout(() => {
        // Ganti '/home' dengan halaman tujuan Anda setelah login
        window.location.href = '/'; 
      }, 1500);

    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  const togglePassword = (e) => {
    e.preventDefault();
    setPasswordVisible(prevState => !prevState);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={loginImage} alt="Login Illustration" className="login-image" />
      </div>
      <div className="login-right">
        <h2>Welcome Back 👋</h2>
        <p>Please log in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
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
              autoComplete="current-password"
              value={formData.Password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePassword}
            >
              <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
            </button>
          </div>

          <div className="remember-forgot">
            <label>
            </label>
            <a href="forgotpassword">Forgot Password?</a>
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        {/* Menampilkan pesan sukses atau error dari server */}
        {message && <p className={isError ? 'server-message error' : 'server-message success'}>{message}</p>}

        <p className="login-footer">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
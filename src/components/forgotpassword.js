import React, { useState } from "react";
import "./css/login.css";
import loginImage from "./asset/login.png";

const Forgotpassword = () => {
  // State untuk menampung email
  const [formData, setFormData] = useState({
    Email: '',
  });

  // State untuk pesan server
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.Email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        throw new Error(data.message || 'Gagal mengirim permintaan ubah password');
      }

      setIsError(false);
      setMessage('Permintaan reset password berhasil dikirim! Silakan cek email Anda.');

    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={loginImage} alt="Forgot Password Illustration" className="login-image" />
      </div>
      <div className="login-right">
        <h2>Forgot Password 🔑</h2>
        <p>Enter your email address to receive a password reset link</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="Email"
            placeholder="Email"
            required
            autoComplete="email"
            value={formData.Email}
            onChange={handleChange}
          />

          <button type="submit" className="login-button">Send Reset Link</button>
        </form>

        {message && (
          <p className={isError ? 'server-message error' : 'server-message success'}>
            {message}
          </p>
        )}

        <p className="login-footer">
          Remembered your password? <a href="/login">Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default Forgotpassword;

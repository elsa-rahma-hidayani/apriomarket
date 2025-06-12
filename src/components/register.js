import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./css/register.css";

const Register = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePassword = () => {
    setPasswordVisible(prev => !prev);
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <img src="your-image-path.png" alt="Register" className="register-image" />
      </div>
      <div className="register-right">
        <h2>Sign Up ✨</h2>
        <p>Create your new account</p>

        <form action="#" method="POST" className="register-form">
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            required 
            autoComplete="username"
          />

          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            required 
            autoComplete="email"
          />

          <div className="password-container">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
              autoComplete="new-password"
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

          <div className="agree-terms">
            <label>
              <input type="checkbox" required /> I agree to <a href="#">privacy policy & terms</a>
            </label>
          </div>

          <button type="submit" className="register-button">Sign Up</button>
        </form>

        <p className="register-footer">
          Already have an account? <a href="/login">Sign in instead</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

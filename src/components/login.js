import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./css/login.css";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePassword = (e) => {
    e.preventDefault();
    setPasswordVisible(prevState => !prevState);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="your-image-path.png" alt="Login Illustration" className="login-image" />
      </div>
      <div className="login-right">
        <h2>Welcome Back 👋</h2>
        <p>Please log in to your account</p>

        <form action="#" method="POST" className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
          />

          <div className="password-container">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              id="password"
              required
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
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        <p className="login-footer">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
